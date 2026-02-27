/**
 * Support Session State Machine
 *
 * States: idle → connecting → active → offline | escalated | error
 * Transitions are explicit — no ad-hoc state mutations.
 *
 * Usage:
 *   const { status, agentInfo, dispatch } = useSupportSession();
 *   dispatch({ type: 'CONNECT' });
 */

import { useReducer, useCallback } from 'react';

/* ── Status Constants ───────────────────────── */
export const SUPPORT_STATUS = {
    IDLE: 'idle',
    CONNECTING: 'connecting',
    ACTIVE: 'active',
    OFFLINE: 'offline',
    ESCALATED: 'escalated',
    ERROR: 'error',
};

/* ── Action Types ───────────────────────────── */
export const ACTIONS = {
    CONNECT: 'CONNECT',
    CONNECTED: 'CONNECTED',
    AGENT_OFFLINE: 'AGENT_OFFLINE',
    ESCALATE: 'ESCALATE',
    ESCALATION_CONFIRMED: 'ESCALATION_CONFIRMED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    RESET: 'RESET',
    SET_AGENT_INFO: 'SET_AGENT_INFO',
    SET_WEEKEND: 'SET_WEEKEND',
};

/* ── Initial State ──────────────────────────── */
const initialState = {
    status: SUPPORT_STATUS.IDLE,
    agentInfo: {
        name: null,
        role: null,
        avatarInitials: null,
        isOnline: false,
        estimatedReplyTime: null,
    },
    isWeekend: false,
    escalationTicketId: null,
    error: null,
};

/* ── Reducer ────────────────────────────────── */
function supportReducer(state, action) {
    switch (action.type) {
        case ACTIONS.CONNECT:
            return {
                ...state,
                status: SUPPORT_STATUS.CONNECTING,
                error: null,
            };

        case ACTIONS.CONNECTED:
            return {
                ...state,
                status: SUPPORT_STATUS.ACTIVE,
                agentInfo: {
                    ...state.agentInfo,
                    ...action.payload,
                    isOnline: true,
                },
            };

        case ACTIONS.AGENT_OFFLINE:
            return {
                ...state,
                status: SUPPORT_STATUS.OFFLINE,
                agentInfo: {
                    ...state.agentInfo,
                    isOnline: false,
                },
            };

        case ACTIONS.ESCALATE:
            return {
                ...state,
                status: SUPPORT_STATUS.ESCALATED,
            };

        case ACTIONS.ESCALATION_CONFIRMED:
            return {
                ...state,
                status: SUPPORT_STATUS.ESCALATED,
                escalationTicketId: action.payload?.ticketId || null,
            };

        case ACTIONS.NETWORK_ERROR:
            return {
                ...state,
                status: SUPPORT_STATUS.ERROR,
                error: action.payload?.message || 'Connection lost. Please try again.',
            };

        case ACTIONS.SET_AGENT_INFO:
            return {
                ...state,
                agentInfo: {
                    ...state.agentInfo,
                    ...action.payload,
                },
            };

        case ACTIONS.SET_WEEKEND:
            return {
                ...state,
                isWeekend: action.payload,
            };

        case ACTIONS.RESET:
            return {
                ...initialState,
                isWeekend: state.isWeekend,
            };

        default:
            return state;
    }
}

/* ── Hook ───────────────────────────────────── */
export function useSupportSession() {
    const [state, dispatch] = useReducer(supportReducer, initialState);

    const connect = useCallback(() => dispatch({ type: ACTIONS.CONNECT }), []);
    const setConnected = useCallback((agentData) =>
        dispatch({ type: ACTIONS.CONNECTED, payload: agentData }), []);
    const setOffline = useCallback(() => dispatch({ type: ACTIONS.AGENT_OFFLINE }), []);
    const escalate = useCallback(() => dispatch({ type: ACTIONS.ESCALATE }), []);
    const confirmEscalation = useCallback((data) =>
        dispatch({ type: ACTIONS.ESCALATION_CONFIRMED, payload: data }), []);
    const setError = useCallback((msg) =>
        dispatch({ type: ACTIONS.NETWORK_ERROR, payload: { message: msg } }), []);
    const reset = useCallback(() => dispatch({ type: ACTIONS.RESET }), []);
    const setAgentInfo = useCallback((info) =>
        dispatch({ type: ACTIONS.SET_AGENT_INFO, payload: info }), []);
    const setWeekend = useCallback((val) =>
        dispatch({ type: ACTIONS.SET_WEEKEND, payload: val }), []);

    return {
        ...state,
        dispatch,
        connect,
        setConnected,
        setOffline,
        escalate,
        confirmEscalation,
        setError,
        reset,
        setAgentInfo,
        setWeekend,
    };
}
