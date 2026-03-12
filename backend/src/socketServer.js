import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './config/db.js';

/**
 * Socket.io server for real-time support chat.
 *
 * Channels:
 *   support:session:{sessionId}  — Messages within a chat session
 *   support:brand:{brandId}      — Brand-specific events (agent joined, etc.)
 *
 * Events (client → server):
 *   chat:message      — Send a chat message
 *   chat:typing        — Typing indicator
 *   chat:join_session  — Join a chat session room
 *
 * Events (server → client):
 *   chat:message       — New message received
 *   chat:typing         — Agent/brand is typing
 *   chat:agent_joined   — Agent joined the session
 *   chat:session_ended  — Session was ended
 *   chat:queue_update   — Queue position changed
 */

export function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                if (
                    origin.startsWith('http://localhost') ||
                    origin.endsWith('.ngrok-free.app') ||
                    origin.endsWith('.loca.lt') ||
                    origin.endsWith('.netlify.app') ||
                    origin.endsWith('.onrender.com')
                ) {
                    return callback(null, true);
                }
                callback(new Error('CORS not allowed'), false);
            },
            credentials: true,
        },
    });

    // ── JWT Authentication Middleware ──────────────
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, name: true, email: true, role: true },
            });

            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    // ── Connection Handler ────────────────────────
    io.on('connection', (socket) => {
        const userId = socket.user.id;
        console.log(`[Socket] User ${userId} connected (${socket.user.role})`);

        // Auto-join brand's personal channel
        socket.join(`support:brand:${userId}`);

        // ── Join a chat session room ──────────────
        socket.on('chat:join_session', async ({ sessionId }) => {
            try {
                const session = await prisma.liveChatSession.findFirst({
                    where: {
                        id: parseInt(sessionId),
                        OR: [
                            { brandId: userId },
                            { agentId: userId }, // agents can also join
                        ],
                    },
                });

                if (!session) {
                    socket.emit('chat:error', { message: 'Session not found or access denied' });
                    return;
                }

                socket.join(`support:session:${sessionId}`);
                socket.emit('chat:joined', { sessionId: session.id, status: session.status });

                // Load existing messages
                const messages = await prisma.chatMessage.findMany({
                    where: { sessionId: session.id },
                    orderBy: { createdAt: 'asc' },
                });

                socket.emit('chat:history', { messages });
            } catch (err) {
                console.error('[Socket] Error joining session:', err);
                socket.emit('chat:error', { message: 'Failed to join session' });
            }
        });

        // ── Send a chat message ──────────────────
        socket.on('chat:message', async ({ sessionId, message }) => {
            try {
                if (!message?.trim()) return;

                const session = await prisma.liveChatSession.findFirst({
                    where: {
                        id: parseInt(sessionId),
                        status: { in: ['WAITING', 'ACTIVE'] },
                    },
                });

                if (!session) {
                    socket.emit('chat:error', { message: 'Session not active' });
                    return;
                }

                const senderType = socket.user.role === 'admin' ? 'AGENT' : 'BRAND';

                const chatMsg = await prisma.chatMessage.create({
                    data: {
                        sessionId: session.id,
                        senderId: userId,
                        senderType,
                        message: message.trim(),
                    },
                });

                // Broadcast to everyone in the session room
                io.to(`support:session:${sessionId}`).emit('chat:message', {
                    id: chatMsg.id,
                    sessionId: session.id,
                    senderId: chatMsg.senderId,
                    senderType: chatMsg.senderType,
                    message: chatMsg.message,
                    createdAt: chatMsg.createdAt,
                });
            } catch (err) {
                console.error('[Socket] Error sending message:', err);
                socket.emit('chat:error', { message: 'Failed to send message' });
            }
        });

        // ── Typing indicator ─────────────────────
        socket.on('chat:typing', ({ sessionId, isTyping }) => {
            socket.to(`support:session:${sessionId}`).emit('chat:typing', {
                userId,
                isTyping,
                senderType: socket.user.role === 'admin' ? 'AGENT' : 'BRAND',
            });
        });

        // ── Disconnect ──────────────────────────
        socket.on('disconnect', () => {
            console.log(`[Socket] User ${userId} disconnected`);
        });
    });

    console.log('[Socket.io] Support WebSocket server initialized');
    return io;
}
