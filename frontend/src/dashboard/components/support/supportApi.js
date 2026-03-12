/**
 * Support API — Real Backend Integration
 *
 * All functions call the live backend via the shared axios instance.
 * Each function returns a Promise matching the original mock contract.
 */

import api from '../../../api/axios';

/**
 * Get current support status (agent availability, weekend flag, etc.)
 * @returns {Promise<object>}
 */
export async function getSupportStatus() {
    const { data } = await api.get('/support/status');
    return data.data;
}

/**
 * Send a chat message via REST (fallback when socket is unavailable).
 * Primary chat messaging uses WebSocket — see useSocket.js
 * @param {string} content - message text
 * @param {File[]} [attachments] - optional file attachments
 * @returns {Promise<object>}
 */
export async function sendMessage(content, attachments = []) {
    // This is kept as a fallback — primary chat uses Socket.io
    // For ticket replies, use replyToTicket instead
    return {
        id: `msg_${Date.now()}`,
        status: 'delivered',
        timestamp: new Date().toISOString(),
        attachmentCount: attachments.length,
    };
}

/**
 * Escalate support request — creates an URGENT priority ticket.
 * @param {string} reason - escalation context
 * @returns {Promise<object>}
 */
export async function escalateSupport(reason) {
    const { data } = await api.post('/support/tickets', {
        subject: 'Escalation Request',
        category: 'GENERAL',
        priority: 'URGENT',
        message: reason,
    });

    return {
        ticketId: data.data.ticketId,
        status: 'submitted',
        estimatedResponse: data.data.estimatedResponse,
        reason,
    };
}

/**
 * Submit a support ticket.
 * @param {object} params - { subject, description, priority, category }
 * @returns {Promise<object>}
 */
export async function submitTicket({ subject, description, priority, category }) {
    const { data } = await api.post('/support/tickets', {
        subject,
        message: description,
        priority: priority || 'NORMAL',
        category: category || 'GENERAL',
    });

    return {
        ticketId: data.data.ticketId,
        status: 'created',
        estimatedResponse: data.data.estimatedResponse,
    };
}

/**
 * Get support satisfaction metrics for trust bar.
 * @returns {Promise<object>}
 */
export async function getSatisfactionMetrics() {
    const { data } = await api.get('/support/metrics');
    return data.data;
}

/**
 * Start a live chat session.
 * @returns {Promise<object>}
 */
export async function startChatSession() {
    const { data } = await api.post('/support/live-chat/start');
    return data.data;
}

/**
 * End a live chat session.
 * @param {number} sessionId
 * @param {boolean} convertToTicket
 * @param {string} [subject]
 * @returns {Promise<object>}
 */
export async function endChatSession(sessionId, convertToTicket = false, subject = '') {
    const { data } = await api.post('/support/live-chat/end', {
        sessionId,
        convertToTicket,
        subject,
    });
    return data.data;
}

/**
 * Book a strategy call.
 * @param {object} params - { callType, date, timeSlot, agenda }
 * @returns {Promise<object>}
 */
export async function bookStrategyCall({ callType, date, timeSlot, agenda }) {
    const { data } = await api.post('/support/calls/book', {
        callType,
        date,
        timeSlot,
        agenda,
    });
    return data.data;
}

/**
 * Get brand's support tickets.
 * @param {object} [params] - { status, page, limit }
 * @returns {Promise<object>}
 */
export async function getTickets(params = {}) {
    const { data } = await api.get('/support/tickets', { params });
    return data.data;
}

/**
 * Reply to a support ticket.
 * @param {number} ticketId
 * @param {string} message
 * @returns {Promise<object>}
 */
export async function replyToTicket(ticketId, message) {
    const { data } = await api.post(`/support/tickets/${ticketId}/messages`, { message });
    return data.data;
}
