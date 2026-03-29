import cron from 'node-cron';
import { prisma } from '../config/db.js';

/**
 * Job 1: Expire pending invitations that are past their TTL.
 * Runs every hour.
 */
export const startInvitationExpiryJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const { count } = await prisma.campaignInvitation.updateMany({
        where: { status: 'Pending', expiresAt: { lte: new Date() } },
        data: { status: 'Expired' },
      });
      if (count > 0) console.log(`[InvitationExpiry] Expired ${count} invitation(s)`);
    } catch (err) {
      console.error('[InvitationExpiry] Error:', err.message);
    }
  });
  console.log('[InvitationExpiry] Cron job started (every hour)');
};

/**
 * Job 2: Monitor SLA deadlines and escalate breached issues.
 * Runs every 15 minutes.
 */
export const startSLAMonitorJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const { count } = await prisma.campaignIssue.updateMany({
        where: {
          status: { in: ['Open', 'InProgress'] },
          slaDeadline: { lte: new Date() },
        },
        data: { status: 'Escalated', priority: 'Critical' },
      });
      if (count > 0) console.log(`[SLAMonitor] Escalated ${count} issue(s) for SLA breach`);
    } catch (err) {
      console.error('[SLAMonitor] Error:', err.message);
    }
  });
  console.log('[SLAMonitor] Cron job started (every 15 minutes)');
};
