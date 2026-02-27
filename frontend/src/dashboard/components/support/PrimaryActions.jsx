import React from 'react';
import { MessageSquare, Calendar, FileText } from 'lucide-react';
import { SUPPORT_STATUS } from './supportStateMachine';
import { trackChatOpened } from './supportAnalytics';

/**
 * PrimaryActions — Three-button CTA hierarchy:
 * 1. Start Live Chat (primary)
 * 2. Book Strategy Call (secondary)
 * 3. Submit Ticket (ghost)
 *
 * "Start Live Chat" has explicit behavior per session state:
 *   idle → dispatch connect, initialize session
 *   active → focus chat input
 *   offline → show notice (handled via onStartChat callback)
 *   weekend → show SLA notice first
 */
const PrimaryActions = ({
    sessionStatus,
    isWeekend,
    chatInputRef,
    onStartChat,
    onBookCall,
    onSubmitTicket,
    tierLabel,
}) => {
    const handleStartChat = () => {
        if (sessionStatus === SUPPORT_STATUS.ACTIVE && chatInputRef?.current) {
            // Already active — just focus the input
            chatInputRef.current.focus();
            return;
        }

        trackChatOpened(tierLabel);
        onStartChat();
    };

    return (
        <div className="sc-actions">
            <button
                className="sc-btn-primary"
                onClick={handleStartChat}
                aria-label="Start live chat"
            >
                <MessageSquare style={{ width: 16, height: 16 }} />
                Start Live Chat
            </button>

            <button
                className="sc-btn-secondary"
                onClick={onBookCall}
                aria-label="Book strategy call"
            >
                <Calendar style={{ width: 16, height: 16 }} />
                Book Strategy Call
            </button>

            <button
                className="sc-btn-ghost"
                onClick={onSubmitTicket}
                aria-label="Submit support ticket"
            >
                <FileText style={{ width: 16, height: 16 }} />
                Submit Ticket
            </button>
        </div>
    );
};

export default React.memo(PrimaryActions);
