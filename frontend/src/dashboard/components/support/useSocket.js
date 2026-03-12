import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

/**
 * useSocket — React hook for Socket.io support chat.
 *
 * Usage:
 *   const { socket, isConnected, messages, sendMessage, joinSession, sendTyping } = useSocket();
 *
 * Auto-connects on mount with JWT from localStorage.
 * Auto-disconnects on unmount.
 */
export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [typingState, setTypingState] = useState(null); // { userId, senderType, isTyping }
    const [sessionId, setSessionId] = useState(null);

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
            setIsConnected(false);
        });

        // Chat events
        socket.on('chat:message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('chat:typing', (data) => {
            setTypingState(data.isTyping ? data : null);
        });

        socket.on('chat:history', ({ messages: history }) => {
            setMessages(history);
        });

        socket.on('chat:joined', ({ sessionId: sid, status }) => {
            setSessionId(sid);
        });

        socket.on('chat:agent_joined', ({ agentName }) => {
            setMessages(prev => [
                ...prev,
                {
                    id: `sys_${Date.now()}`,
                    senderType: 'SYSTEM',
                    message: `${agentName} has joined the chat.`,
                    createdAt: new Date().toISOString(),
                },
            ]);
        });

        socket.on('chat:error', ({ message }) => {
            console.error('[Socket] Error:', message);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // Join a specific chat session
    const joinSession = useCallback((sid) => {
        if (socketRef.current?.connected) {
            setSessionId(sid);
            setMessages([]); // Clear messages for new session
            socketRef.current.emit('chat:join_session', { sessionId: sid });
        }
    }, []);

    // Send a chat message
    const sendMessage = useCallback((message) => {
        if (socketRef.current?.connected && sessionId) {
            socketRef.current.emit('chat:message', {
                sessionId,
                message,
            });
        }
    }, [sessionId]);

    // Send typing indicator
    const sendTyping = useCallback((isTyping) => {
        if (socketRef.current?.connected && sessionId) {
            socketRef.current.emit('chat:typing', {
                sessionId,
                isTyping,
            });
        }
    }, [sessionId]);

    return {
        socket: socketRef.current,
        isConnected,
        messages,
        typingState,
        sessionId,
        joinSession,
        sendMessage,
        sendTyping,
        setMessages,
    };
}
