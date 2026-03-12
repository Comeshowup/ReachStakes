import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Send, Paperclip, RefreshCw, WifiOff, MessageSquare, Clock, AlertTriangle, Hash, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORT_STATUS } from './supportStateMachine';
import { trackMessageSent, trackTicketSubmitted } from './supportAnalytics';
import { submitTicket } from './supportApi';

/**
 * LiveChatPanel — The primary chat experience.
 *
 * Features:
 *   - Agent header with online pulse animation
 *   - Real-time socket-based messaging OR ticket fallback
 *   - Optimistic local message display
 *   - Typing indicator from socket events
 *   - Queue position display when WAITING
 *   - File attachment support
 *   - Offline → auto-creates ticket
 */

/* ── Message Item (memoized) ────────────────── */
const ChatMessage = React.memo(({ msg }) => {
    if (msg.type === 'system' || msg.senderType === 'SYSTEM') {
        return (
            <div className="sc-message sc-message--system">
                <div className="sc-message__bubble">{msg.content || msg.message}</div>
            </div>
        );
    }

    const isUser = msg.sender === 'user' || msg.senderType === 'BRAND';

    return (
        <motion.div
            className={`sc-message ${isUser ? 'sc-message--user' : 'sc-message--agent'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
        >
            <div>
                <div className="sc-message__bubble">
                    {msg.content || msg.message}
                    {msg.attachments?.length > 0 && (
                        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {msg.attachments.map((file, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 11, opacity: 0.8,
                                    padding: '4px 8px', borderRadius: 6,
                                    background: 'rgba(255,255,255,0.08)',
                                }}>
                                    <FileText style={{ width: 12, height: 12 }} />
                                    {file.name || file}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="sc-message__time">{msg.time || formatTime(msg.createdAt)}</div>
            </div>
        </motion.div>
    );
});

ChatMessage.displayName = 'ChatMessage';

function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ── Typing Indicator ───────────────────────── */
const TypingIndicator = () => (
    <div className="sc-typing">
        <div className="sc-typing__dots">
            <span className="sc-typing__dot" />
            <span className="sc-typing__dot" />
            <span className="sc-typing__dot" />
        </div>
    </div>
);

/* ── Queue Indicator ────────────────────────── */
const QueueIndicator = ({ position }) => (
    <div className="sc-empty-state">
        <Hash className="sc-empty-state__icon" style={{ color: 'var(--bd-accent)' }} />
        <p className="sc-empty-state__title">In Queue — Position {position}</p>
        <p className="sc-empty-state__desc">
            An agent will be with you shortly. You can start typing your message now.
        </p>
    </div>
);

/* ── Empty State ────────────────────────────── */
const EmptyChat = ({ agentName }) => (
    <div className="sc-empty-state">
        <MessageSquare className="sc-empty-state__icon" />
        <p className="sc-empty-state__title">Start a conversation</p>
        <p className="sc-empty-state__desc">
            {agentName
                ? `${agentName} is ready to help with your campaigns, payments, and performance questions.`
                : 'Our team is ready to assist you with any questions.'}
        </p>
    </div>
);

/* ── Offline State ──────────────────────────── */
const OfflineState = ({ isWeekend }) => (
    <div className="sc-empty-state">
        <WifiOff className="sc-empty-state__icon" />
        <p className="sc-empty-state__title">
            {isWeekend ? 'Weekend Hours' : 'Team is currently offline'}
        </p>
        <p className="sc-empty-state__desc">
            {isWeekend
                ? 'Our team returns Monday morning. Send a message below and it will be submitted as a support ticket.'
                : 'Leave a message below — it will be submitted as a support ticket and we\'ll respond as soon as we\'re back.'}
        </p>
    </div>
);

/* ── Error State ────────────────────────────── */
const ErrorState = ({ error, onRetry }) => (
    <div className="sc-empty-state">
        <AlertTriangle className="sc-empty-state__icon" style={{ color: 'var(--bd-danger)' }} />
        <p className="sc-empty-state__title">Connection lost</p>
        <p className="sc-empty-state__desc">{error || 'Unable to reach support. Please check your connection.'}</p>
        <button className="sc-btn-secondary" onClick={onRetry} style={{ marginTop: 'var(--bd-space-2)' }}>
            <RefreshCw style={{ width: 14, height: 14 }} />
            Retry
        </button>
    </div>
);

/* ── Escalated State ────────────────────────── */
const EscalatedState = ({ ticketId }) => (
    <div className="sc-empty-state">
        <AlertTriangle className="sc-empty-state__icon" style={{ color: 'var(--bd-warning)' }} />
        <p className="sc-empty-state__title">Escalation in progress</p>
        <p className="sc-empty-state__desc">
            {ticketId
                ? `Your request (${ticketId}) has been escalated to a senior strategist. You'll hear back within 30 minutes.`
                : 'Your request has been escalated. A senior strategist will reach out shortly.'}
        </p>
    </div>
);

/* ── Main Component ─────────────────────────── */
const LiveChatPanel = ({
    sessionStatus,
    agentInfo,
    isWeekend,
    escalationTicketId,
    error,
    onRetry,
    tierConfig,
    chatInputRef: externalInputRef,
    socketMessages = [],
    socketTyping = null,
    onSendMessage,
    onTyping,
    queuePosition = 0,
    hasActiveSession = false,
    isTicketMode = false,
}) => {
    const [localMessages, setLocalMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const internalInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = externalInputRef || internalInputRef;
    const typingTimeoutRef = useRef(null);

    // Combine socket messages with local messages (deduped)
    const allMessages = useMemo(() => {
        const socketIds = new Set(socketMessages.map(m => m.id));
        const deduped = localMessages.filter(m => !socketIds.has(m.id));
        return [...socketMessages, ...deduped].sort((a, b) => {
            const tA = new Date(a.createdAt || a.time || 0).getTime();
            const tB = new Date(b.createdAt || b.time || 0).getTime();
            return tA - tB;
        });
    }, [socketMessages, localMessages]);

    // Format for display
    const displayMessages = useMemo(() => {
        return allMessages.map(msg => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            sender: msg.senderType === 'BRAND' || msg.sender === 'user' ? 'user'
                : msg.senderType === 'SYSTEM' ? 'system'
                    : 'agent',
            type: msg.senderType === 'SYSTEM' || msg.type === 'system' ? 'system' : 'text',
            content: msg.message || msg.content,
            time: msg.time || formatTime(msg.createdAt),
            senderType: msg.senderType,
            attachments: msg.attachments,
        }));
    }, [allMessages]);

    // Is agent typing?
    const isAgentTyping = socketTyping?.senderType === 'AGENT' && socketTyping?.isTyping;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayMessages, isAgentTyping]);

    // Handle file selection
    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setAttachedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    }, []);

    const removeFile = useCallback((index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Handle send
    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || isSending) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgId = `msg_${Date.now()}`;

        // Build the optimistic message
        const userMsg = {
            id: msgId,
            sender: 'user',
            senderType: 'BRAND',
            type: 'text',
            content: text,
            message: text,
            time: timeStr,
            createdAt: now.toISOString(),
            attachments: attachedFiles.length > 0
                ? attachedFiles.map(f => ({ name: f.name, size: f.size }))
                : undefined,
        };

        // Show message optimistically
        setLocalMessages(prev => [...prev, userMsg]);
        setInputText('');
        setAttachedFiles([]);

        trackMessageSent(tierConfig?.label, text.length);

        // If we have an active socket session, send via socket
        if (hasActiveSession && onSendMessage) {
            onSendMessage(text);
            // Clear typing indicator
            if (onTyping) onTyping(false);
        } else {
            // No active session (offline / no session started) → create a ticket
            setIsSending(true);
            try {
                const result = await submitTicket({
                    subject: text.length > 60 ? text.substring(0, 60) + '...' : text,
                    description: text,
                    priority: 'NORMAL',
                    category: 'GENERAL',
                });

                trackTicketSubmitted(tierConfig?.label, 'GENERAL');

                // Show system confirmation
                setLocalMessages(prev => [...prev, {
                    id: `sys_${Date.now()}`,
                    sender: 'system',
                    senderType: 'SYSTEM',
                    type: 'system',
                    content: `✅ Ticket ${result.ticketId} created — ${result.estimatedResponse}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    createdAt: new Date().toISOString(),
                }]);
            } catch (err) {
                console.error('Failed to create ticket:', err);
                setLocalMessages(prev => [...prev, {
                    id: `err_${Date.now()}`,
                    sender: 'system',
                    senderType: 'SYSTEM',
                    type: 'system',
                    content: '❌ Failed to submit ticket. Please try again.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    createdAt: new Date().toISOString(),
                }]);
            } finally {
                setIsSending(false);
            }
        }
    }, [inputText, isSending, tierConfig, hasActiveSession, onSendMessage, onTyping, attachedFiles]);

    // Keyboard handler: Enter to send, Shift+Enter for newline
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // Resize textarea to content + handle typing indicator
    const handleInput = useCallback((e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        setInputText(textarea.value);

        // Send typing indicator (only if we have a socket session)
        if (onTyping && hasActiveSession && textarea.value.trim()) {
            onTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2000);
        }
    }, [onTyping, hasActiveSession]);

    // Determine agent display info
    const displayAgent = useMemo(() => ({
        name: agentInfo?.name || tierConfig?.managerName || 'Support Team',
        role: agentInfo?.role || tierConfig?.managerRole || 'Campaign Success Manager',
        initials: agentInfo?.avatarInitials ||
            (tierConfig?.managerName ? tierConfig.managerName.split(' ').map(n => n[0]).join('') : 'RS'),
        isOnline: agentInfo?.isOnline ?? false,
        replyTime: agentInfo?.estimatedReplyTime || tierConfig?.responseTime || '~1 min',
    }), [agentInfo, tierConfig]);

    // Determine if chat input should be disabled
    const isInputDisabled = sessionStatus === SUPPORT_STATUS.ERROR ||
        sessionStatus === SUPPORT_STATUS.ESCALATED;

    // Determine placeholder based on mode
    const placeholder = isInputDisabled
        ? 'Chat unavailable'
        : isTicketMode
            ? 'Describe your issue — this will be submitted as a support ticket...'
            : !hasActiveSession && (sessionStatus === SUPPORT_STATUS.OFFLINE || sessionStatus === SUPPORT_STATUS.IDLE)
                ? 'Type a message to create a support ticket...'
                : 'Type your message...';

    return (
        <div className="sc-chat-panel">
            {/* Agent Header */}
            <div className="sc-chat-panel__header">
                <div className="sc-agent-avatar">
                    <span className="sc-agent-avatar__initials">{displayAgent.initials}</span>
                    <span
                        className={`sc-agent-avatar__status ${displayAgent.isOnline
                            ? 'sc-agent-avatar__status--online'
                            : 'sc-agent-avatar__status--offline'}`}
                        aria-label={displayAgent.isOnline ? 'Online' : 'Offline'}
                    />
                </div>
                <div>
                    <div className="sc-agent-info__name">{displayAgent.name}</div>
                    <div className="sc-agent-info__role">{displayAgent.role}</div>
                </div>
                <div className="sc-chat-panel__reply-time">
                    <Clock style={{ width: 12, height: 12 }} />
                    {displayAgent.replyTime}
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="sc-messages"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {/* Edge States — only show if no messages yet */}
                {displayMessages.length === 0 && (
                    <>
                        {sessionStatus === SUPPORT_STATUS.ERROR ? (
                            <ErrorState error={error} onRetry={onRetry} />
                        ) : sessionStatus === SUPPORT_STATUS.ESCALATED ? (
                            <EscalatedState ticketId={escalationTicketId} />
                        ) : sessionStatus === SUPPORT_STATUS.CONNECTING && queuePosition > 0 ? (
                            <QueueIndicator position={queuePosition} />
                        ) : sessionStatus === SUPPORT_STATUS.OFFLINE || (sessionStatus === SUPPORT_STATUS.IDLE && !displayAgent.isOnline) ? (
                            <OfflineState isWeekend={isWeekend} />
                        ) : (
                            <EmptyChat agentName={displayAgent.name} />
                        )}
                    </>
                )}

                {/* Message List */}
                {displayMessages.length > 0 && (
                    <>
                        {displayMessages.map((msg) => (
                            <ChatMessage key={msg.id} msg={msg} />
                        ))}
                        {isAgentTyping && <TypingIndicator />}
                    </>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
                <div style={{
                    display: 'flex', gap: 8, flexWrap: 'wrap',
                    padding: '8px 16px 0',
                    borderTop: '1px solid var(--bd-border-subtle)',
                    background: 'var(--bd-sc-surface)',
                }}>
                    {attachedFiles.map((file, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '4px 8px 4px 10px', borderRadius: 8,
                            background: 'var(--bd-surface-elevated, rgba(255,255,255,0.06))',
                            border: '1px solid var(--bd-border-default, rgba(255,255,255,0.1))',
                            fontSize: 12, color: 'var(--bd-text-secondary)',
                        }}>
                            <FileText style={{ width: 12, height: 12, flexShrink: 0 }} />
                            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.name}
                            </span>
                            <button
                                onClick={() => removeFile(i)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 16, height: 16, borderRadius: '50%',
                                    border: 'none', background: 'transparent',
                                    color: 'var(--bd-text-muted)', cursor: 'pointer', padding: 0,
                                }}
                                aria-label={`Remove ${file.name}`}
                            >
                                <X style={{ width: 12, height: 12 }} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.doc,.docx,.csv,.xlsx"
                style={{ display: 'none' }}
            />

            {/* Input Bar */}
            <div className="sc-input-bar">
                <button
                    className="sc-input-bar__btn sc-input-bar__attach"
                    aria-label="Attach file"
                    disabled={isInputDisabled}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip style={{ width: 18, height: 18 }} />
                </button>

                <textarea
                    ref={inputRef}
                    className="sc-input-bar__textarea"
                    value={inputText}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isInputDisabled}
                    rows={1}
                    aria-label="Message input"
                />

                <button
                    className="sc-input-bar__btn sc-input-bar__send"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isSending || isInputDisabled}
                    aria-label="Send message"
                    type="button"
                >
                    {isSending ? (
                        <RefreshCw style={{ width: 16, height: 16 }} className="sc-send-loading" />
                    ) : (
                        <Send style={{ width: 16, height: 16 }} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default React.memo(LiveChatPanel);
