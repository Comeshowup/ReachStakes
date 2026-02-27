import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Send, Paperclip, RefreshCw, WifiOff, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORT_STATUS } from './supportStateMachine';
import { trackMessageSent } from './supportAnalytics';

/**
 * LiveChatPanel — The primary chat experience.
 *
 * Features:
 *   - Agent header with online pulse animation
 *   - Memoized message list with stable keys
 *   - Textarea (Enter to send, Shift+Enter newline)
 *   - Typing indicator, send-loading spinner
 *   - Edge states: offline, weekend, error, empty, first-message, escalated
 *   - ARIA: role="log", aria-live="polite"
 *   - Messages persist in state until page refresh
 */

/* ── Message Item (memoized) ────────────────── */
const ChatMessage = React.memo(({ msg }) => {
    if (msg.type === 'system') {
        return (
            <div className="sc-message sc-message--system">
                <div className="sc-message__bubble">{msg.content}</div>
            </div>
        );
    }

    const isUser = msg.sender === 'user';

    return (
        <motion.div
            className={`sc-message ${isUser ? 'sc-message--user' : 'sc-message--agent'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
        >
            <div>
                <div className="sc-message__bubble">{msg.content}</div>
                <div className="sc-message__time">{msg.time}</div>
            </div>
        </motion.div>
    );
});

ChatMessage.displayName = 'ChatMessage';

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
                ? 'Our team returns Monday morning. Messages sent now will be answered first thing.'
                : 'Leave a message and we\'ll respond as soon as we\'re back online.'}
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
}) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const internalInputRef = useRef(null);
    const inputRef = externalInputRef || internalInputRef;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Handle send
    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text || isSending) return;

        const userMsg = {
            id: `msg_${Date.now()}`,
            sender: 'user',
            type: 'text',
            content: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsSending(true);

        trackMessageSent(tierConfig?.label, text.length);

        // Simulate agent typing then reply
        setIsTyping(true);
        setTimeout(() => {
            const agentMsg = {
                id: `msg_${Date.now() + 1}`,
                sender: 'agent',
                type: 'text',
                content: 'Thanks for reaching out! I\'ve logged your request and our team will follow up shortly. Is there anything else I can help with?',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, agentMsg]);
            setIsTyping(false);
            setIsSending(false);
        }, 1800);
    }, [inputText, isSending, tierConfig]);

    // Keyboard handler: Enter to send, Shift+Enter for newline
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // Resize textarea to content
    const handleInput = useCallback((e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        setInputText(textarea.value);
    }, []);

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

    // Memoize message list
    const messageList = useMemo(() => messages, [messages]);

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
                {/* Edge States */}
                {sessionStatus === SUPPORT_STATUS.ERROR ? (
                    <ErrorState error={error} onRetry={onRetry} />
                ) : sessionStatus === SUPPORT_STATUS.ESCALATED ? (
                    <EscalatedState ticketId={escalationTicketId} />
                ) : sessionStatus === SUPPORT_STATUS.OFFLINE || (sessionStatus === SUPPORT_STATUS.IDLE && !displayAgent.isOnline) ? (
                    <OfflineState isWeekend={isWeekend} />
                ) : messageList.length === 0 ? (
                    <EmptyChat agentName={displayAgent.name} />
                ) : (
                    <>
                        {messageList.map((msg) => (
                            <ChatMessage key={msg.id} msg={msg} />
                        ))}
                        {isTyping && <TypingIndicator />}
                    </>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="sc-input-bar">
                <button
                    className="sc-input-bar__btn sc-input-bar__attach"
                    aria-label="Attach file"
                    disabled={isInputDisabled}
                    type="button"
                >
                    <Paperclip style={{ width: 18, height: 18 }} />
                </button>

                <textarea
                    ref={inputRef}
                    className="sc-input-bar__textarea"
                    value={inputText}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={isInputDisabled
                        ? 'Chat unavailable'
                        : 'Type your message...'}
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
