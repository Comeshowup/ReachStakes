/**
 * Support API — Placeholder Contracts
 *
 * Returns mock data. Ready to be swapped for real API calls.
 * Each function follows the same contract:
 *   - Returns a Promise
 *   - Simulates network delay
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get current support status (agent availability, weekend flag, etc.)
 * @returns {Promise<object>}
 */
export async function getSupportStatus() {
    await delay(600);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hour = now.getHours();
    const isBusinessHours = hour >= 9 && hour < 18;

    return {
        agentOnline: !isWeekend && isBusinessHours,
        agentName: 'Sarah Mitchell',
        agentRole: 'Campaign Success Manager',
        agentInitials: 'SM',
        estimatedReplyTime: isWeekend ? 'Monday morning' : '~1 min',
        isWeekend,
        isBusinessHours,
    };
}

/**
 * Send a chat message.
 * @param {string} content - message text
 * @param {File[]} [attachments] - optional file attachments
 * @returns {Promise<object>}
 */
export async function sendMessage(content, attachments = []) {
    await delay(300);

    return {
        id: `msg_${Date.now()}`,
        status: 'delivered',
        timestamp: new Date().toISOString(),
        attachmentCount: attachments.length,
    };
}

/**
 * Escalate support request to senior strategist.
 * @param {string} reason - escalation context
 * @returns {Promise<object>}
 */
export async function escalateSupport(reason) {
    await delay(800);

    return {
        ticketId: `ESC-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'submitted',
        estimatedResponse: 'Within 30 minutes',
        reason,
    };
}

/**
 * Submit a support ticket (offline fallback).
 * @param {object} data - { subject, description, priority, category }
 * @returns {Promise<object>}
 */
export async function submitTicket(data) {
    await delay(500);

    return {
        ticketId: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'created',
        estimatedResponse: 'Within 24 hours',
        ...data,
    };
}

/**
 * Get support satisfaction metrics for trust bar.
 * @returns {Promise<object>}
 */
export async function getSatisfactionMetrics() {
    await delay(400);

    return {
        avgResponseTime: '47 sec',
        satisfactionRating: '4.9/5',
        resolvedToday: 12,
        onlineAgents: 3,
    };
}
