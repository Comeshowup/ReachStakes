/**
 * Support Analytics — Instrumentation Hooks
 *
 * Stub implementation (console.log).
 * Replace internals with real analytics provider (Segment, Amplitude, etc.)
 * without changing the call sites.
 */

const log = (event, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Support Analytics] ${event}`, data);
    }
};

export const trackChatOpened = (tier) => log('chat_opened', { tier });
export const trackMessageSent = (tier, messageLength) => log('message_sent', { tier, messageLength });
export const trackEscalationTriggered = (tier, reason) => log('escalation_triggered', { tier, reason });
export const trackStrategyCallOpened = (tier) => log('strategy_call_opened', { tier });
export const trackTicketSubmitted = (tier, category) => log('ticket_submitted', { tier, category });
export const trackHelpArticleViewed = (category) => log('help_article_viewed', { category });
export const trackSupportPageViewed = (tier) => log('support_page_viewed', { tier });
