import { prisma } from '../config/db.js';

// ─────────────────────────────────────────────
// SUPPORT STATUS & METRICS
// ─────────────────────────────────────────────

/**
 * @desc   Get current support status (agent availability, business hours)
 * @route  GET /api/support/status
 * @access Private
 */
export const getSupportStatus = async (req, res) => {
    try {
        const now = new Date();
        const dayOfWeek = now.getUTCDay();
        const hour = now.getUTCHours();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isBusinessHours = hour >= 9 && hour < 18;

        // Find an available online agent
        const onlineAgent = await prisma.supportAgent.findFirst({
            where: { isOnline: true },
            select: { id: true, name: true, role: true },
        });

        const agentOnline = !isWeekend && isBusinessHours && !!onlineAgent;

        res.json({
            status: 'success',
            data: {
                agentOnline,
                agentName: onlineAgent?.name || 'Support Team',
                agentRole: onlineAgent?.role || 'Campaign Success Manager',
                agentInitials: onlineAgent
                    ? onlineAgent.name.split(' ').map(n => n[0]).join('')
                    : 'RS',
                agentId: onlineAgent?.id || null,
                estimatedReplyTime: isWeekend ? 'Monday morning' : agentOnline ? '~1 min' : '< 24 hrs',
                isWeekend,
                isBusinessHours,
            },
        });
    } catch (error) {
        console.error('Error fetching support status:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch support status' });
    }
};

/**
 * @desc   Get satisfaction metrics for TrustBar
 * @route  GET /api/support/metrics
 * @access Private
 */
export const getSupportMetrics = async (req, res) => {
    try {
        const onlineAgents = await prisma.supportAgent.count({ where: { isOnline: true } });

        const totalTickets = await prisma.supportTicket.count();
        const resolvedToday = await prisma.supportTicket.count({
            where: {
                status: 'RESOLVED',
                updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            },
        });

        // Calculate avg resolution time from resolved tickets (last 30 days)
        const resolvedTickets = await prisma.supportTicket.findMany({
            where: {
                status: { in: ['RESOLVED', 'CLOSED'] },
                closedAt: { not: null },
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            select: { createdAt: true, closedAt: true },
        });

        let avgResponseTime = '47 sec'; // default
        if (resolvedTickets.length > 0) {
            const totalMs = resolvedTickets.reduce((sum, t) => {
                return sum + (new Date(t.closedAt) - new Date(t.createdAt));
            }, 0);
            const avgMs = totalMs / resolvedTickets.length;
            const avgMin = Math.floor(avgMs / 60000);
            avgResponseTime = avgMin < 1 ? `${Math.floor(avgMs / 1000)} sec` : `${avgMin} min`;
        }

        res.json({
            status: 'success',
            data: {
                avgResponseTime,
                satisfactionRating: '4.9/5', // placeholder until ratings are implemented
                resolvedToday,
                onlineAgents,
                totalTickets,
            },
        });
    } catch (error) {
        console.error('Error fetching support metrics:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch support metrics' });
    }
};

// ─────────────────────────────────────────────
// SUPPORT TICKETS
// ─────────────────────────────────────────────

/**
 * @desc   Create a new support ticket
 * @route  POST /api/support/tickets
 * @access Private (Brand)
 */
export const createTicket = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { subject, category, priority, message, campaignId, escrowId } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Subject and message are required',
            });
        }

        const ticket = await prisma.$transaction(async (tx) => {
            const newTicket = await tx.supportTicket.create({
                data: {
                    brandId,
                    subject,
                    category: category || 'GENERAL',
                    priority: priority || 'NORMAL',
                    campaignId: campaignId ? parseInt(campaignId) : null,
                    escrowId: escrowId || null,
                },
            });

            // Create the initial message
            await tx.supportMessage.create({
                data: {
                    ticketId: newTicket.id,
                    senderId: brandId,
                    senderType: 'BRAND',
                    message,
                },
            });

            // Create notification for the brand
            await tx.notification.create({
                data: {
                    userId: brandId,
                    type: 'ticket_created',
                    title: 'Ticket Created',
                    message: `Your support ticket "${subject}" has been submitted. We'll respond shortly.`,
                    metadata: { ticketId: newTicket.id },
                },
            });

            return newTicket;
        });

        res.status(201).json({
            status: 'success',
            data: {
                ticketId: `TKT-${String(ticket.id).padStart(5, '0')}`,
                id: ticket.id,
                status: ticket.status,
                estimatedResponse: ticket.priority === 'URGENT' ? 'Within 30 minutes' : 'Within 24 hours',
            },
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create ticket' });
    }
};

/**
 * @desc   Get all tickets for authenticated brand
 * @route  GET /api/support/tickets
 * @access Private (Brand)
 */
export const getTickets = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;

        const where = { brandId };
        if (status) where.status = status;

        const [tickets, total] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                include: {
                    assignedAgent: { select: { name: true, role: true } },
                    _count: { select: { messages: true } },
                },
            }),
            prisma.supportTicket.count({ where }),
        ]);

        res.json({
            status: 'success',
            data: {
                tickets: tickets.map(t => ({
                    ...t,
                    ticketId: `TKT-${String(t.id).padStart(5, '0')}`,
                })),
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch tickets' });
    }
};

/**
 * @desc   Get single ticket with messages
 * @route  GET /api/support/tickets/:id
 * @access Private (Brand — own tickets only)
 */
export const getTicketById = async (req, res) => {
    try {
        const brandId = req.user.id;
        const ticketId = parseInt(req.params.id);

        const ticket = await prisma.supportTicket.findFirst({
            where: { id: ticketId, brandId },
            include: {
                assignedAgent: { select: { name: true, role: true } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!ticket) {
            return res.status(404).json({ status: 'error', message: 'Ticket not found' });
        }

        res.json({
            status: 'success',
            data: {
                ...ticket,
                ticketId: `TKT-${String(ticket.id).padStart(5, '0')}`,
            },
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch ticket' });
    }
};

/**
 * @desc   Reply to a ticket
 * @route  POST /api/support/tickets/:id/messages
 * @access Private (Brand — own tickets only)
 */
export const replyToTicket = async (req, res) => {
    try {
        const brandId = req.user.id;
        const ticketId = parseInt(req.params.id);
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ status: 'error', message: 'Message is required' });
        }

        // Verify the ticket belongs to this brand
        const ticket = await prisma.supportTicket.findFirst({
            where: { id: ticketId, brandId },
        });

        if (!ticket) {
            return res.status(404).json({ status: 'error', message: 'Ticket not found' });
        }

        const newMessage = await prisma.$transaction(async (tx) => {
            const msg = await tx.supportMessage.create({
                data: {
                    ticketId,
                    senderId: brandId,
                    senderType: 'BRAND',
                    message,
                },
            });

            // Update ticket status if it was waiting on the brand
            if (ticket.status === 'WAITING_BRAND') {
                await tx.supportTicket.update({
                    where: { id: ticketId },
                    data: { status: 'IN_PROGRESS' },
                });
            }

            return msg;
        });

        res.status(201).json({
            status: 'success',
            data: newMessage,
        });
    } catch (error) {
        console.error('Error replying to ticket:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send reply' });
    }
};

// ─────────────────────────────────────────────
// LIVE CHAT
// ─────────────────────────────────────────────

/**
 * @desc   Start a live chat session
 * @route  POST /api/support/live-chat/start
 * @access Private (Brand)
 */
export const startLiveChat = async (req, res) => {
    try {
        const brandId = req.user.id;

        // Check if brand already has an active session
        const existingSession = await prisma.liveChatSession.findFirst({
            where: {
                brandId,
                status: { in: ['WAITING', 'ACTIVE'] },
            },
        });

        if (existingSession) {
            return res.json({
                status: 'success',
                data: {
                    sessionId: existingSession.id,
                    status: existingSession.status,
                    message: 'Resuming existing session',
                },
            });
        }

        // Find an available online agent (least active)
        const availableAgent = await prisma.supportAgent.findFirst({
            where: {
                isOnline: true,
                chatSessions: {
                    every: {
                        status: { not: 'ACTIVE' },
                    },
                },
            },
            include: {
                _count: {
                    select: {
                        chatSessions: { where: { status: 'ACTIVE' } },
                    },
                },
            },
            orderBy: {
                chatSessions: { _count: 'asc' },
            },
        });

        // Check agent capacity
        let assignedAgent = null;
        if (availableAgent) {
            const activeCount = await prisma.liveChatSession.count({
                where: { agentId: availableAgent.id, status: 'ACTIVE' },
            });
            if (activeCount < availableAgent.maxConcurrentChats) {
                assignedAgent = availableAgent;
            }
        }

        const session = await prisma.liveChatSession.create({
            data: {
                brandId,
                agentId: assignedAgent?.id || null,
                status: assignedAgent ? 'ACTIVE' : 'WAITING',
            },
        });

        // Create a system message if agent was assigned
        if (assignedAgent) {
            await prisma.chatMessage.create({
                data: {
                    sessionId: session.id,
                    senderId: assignedAgent.id,
                    senderType: 'SYSTEM',
                    message: `${assignedAgent.name} has joined the chat.`,
                },
            });
        }

        res.status(201).json({
            status: 'success',
            data: {
                sessionId: session.id,
                status: session.status,
                agentName: assignedAgent?.name || null,
                agentRole: assignedAgent?.role || null,
                queuePosition: assignedAgent ? 0 : await getQueuePosition(session.id),
            },
        });
    } catch (error) {
        console.error('Error starting live chat:', error);
        res.status(500).json({ status: 'error', message: 'Failed to start chat session' });
    }
};

/**
 * @desc   End a live chat session (optionally convert to ticket)
 * @route  POST /api/support/live-chat/end
 * @access Private (Brand)
 */
export const endLiveChat = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { sessionId, convertToTicket, subject } = req.body;

        const session = await prisma.liveChatSession.findFirst({
            where: { id: parseInt(sessionId), brandId },
        });

        if (!session) {
            return res.status(404).json({ status: 'error', message: 'Session not found' });
        }

        let ticketId = null;

        await prisma.$transaction(async (tx) => {
            // End the session
            await tx.liveChatSession.update({
                where: { id: session.id },
                data: { status: 'ENDED', endedAt: new Date() },
            });

            // Convert to ticket if requested
            if (convertToTicket) {
                // Get chat messages for context
                const chatMessages = await tx.chatMessage.findMany({
                    where: { sessionId: session.id },
                    orderBy: { createdAt: 'asc' },
                });

                const ticketSubject = subject || 'Chat conversation follow-up';
                const conversationText = chatMessages
                    .map(m => `[${m.senderType}] ${m.message}`)
                    .join('\n');

                const ticket = await tx.supportTicket.create({
                    data: {
                        brandId,
                        subject: ticketSubject,
                        category: 'GENERAL',
                        priority: 'NORMAL',
                    },
                });

                await tx.supportMessage.create({
                    data: {
                        ticketId: ticket.id,
                        senderId: brandId,
                        senderType: 'SYSTEM',
                        message: `Converted from live chat session #${session.id}:\n\n${conversationText}`,
                    },
                });

                // Link the ticket to the session
                await tx.liveChatSession.update({
                    where: { id: session.id },
                    data: { convertedTicketId: ticket.id },
                });

                ticketId = ticket.id;
            }
        });

        res.json({
            status: 'success',
            data: {
                sessionId: session.id,
                status: 'ENDED',
                convertedTicketId: ticketId ? `TKT-${String(ticketId).padStart(5, '0')}` : null,
            },
        });
    } catch (error) {
        console.error('Error ending live chat:', error);
        res.status(500).json({ status: 'error', message: 'Failed to end chat session' });
    }
};

// ─────────────────────────────────────────────
// STRATEGY CALLS
// ─────────────────────────────────────────────

/**
 * @desc   Book a strategy call
 * @route  POST /api/support/calls/book
 * @access Private (Brand)
 */
export const bookStrategyCall = async (req, res) => {
    try {
        const userId = req.user.id;
        const { callType, date, timeSlot, agenda } = req.body;

        if (!callType || !date || !timeSlot) {
            return res.status(400).json({
                status: 'error',
                message: 'Call type, date, and time slot are required',
            });
        }

        const meeting = await prisma.meeting.create({
            data: {
                userId,
                name: req.user.name || req.user.brandProfile?.companyName || 'Brand',
                email: req.user.email,
                role: 'brand',
                date: new Date(date),
                timeSlot,
                agenda: agenda || `Strategy call — ${callType}`,
                status: 'Scheduled',
            },
        });

        // Create a notification
        await prisma.notification.create({
            data: {
                userId,
                type: 'call_scheduled',
                title: 'Strategy Call Scheduled',
                message: `Your ${callType} call has been scheduled for ${date} at ${timeSlot}.`,
                metadata: { meetingId: meeting.id, callType },
            },
        });

        res.status(201).json({
            status: 'success',
            data: {
                meetingId: meeting.id,
                callType,
                date,
                timeSlot,
                status: 'Scheduled',
            },
            message: 'Strategy call scheduled successfully!',
        });
    } catch (error) {
        console.error('Error booking strategy call:', error);
        res.status(500).json({ status: 'error', message: 'Failed to schedule call' });
    }
};

/**
 * @desc   Get scheduled strategy calls for brand
 * @route  GET /api/support/calls
 * @access Private (Brand)
 */
export const getStrategyCalls = async (req, res) => {
    try {
        const userId = req.user.id;

        const calls = await prisma.meeting.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });

        res.json({
            status: 'success',
            data: { calls },
        });
    } catch (error) {
        console.error('Error fetching strategy calls:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch calls' });
    }
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

async function getQueuePosition(sessionId) {
    const waitingSessions = await prisma.liveChatSession.findMany({
        where: { status: 'WAITING' },
        orderBy: { startedAt: 'asc' },
        select: { id: true },
    });
    const position = waitingSessions.findIndex(s => s.id === sessionId);
    return position >= 0 ? position + 1 : 1;
}
