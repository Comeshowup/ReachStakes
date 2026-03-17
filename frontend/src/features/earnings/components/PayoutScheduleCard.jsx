/**
 * PayoutScheduleCard — Shows and describes the creator's payout schedule.
 * MVP: display only. Future: allow schedule changes.
 */
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Info } from 'lucide-react';

const SCHEDULE_INFO = {
  weekly:     { label: 'Weekly',     description: 'Approved earnings are paid out every Friday.' },
  biweekly:   { label: 'Bi-Weekly',  description: 'Approved earnings are paid out every other Friday.' },
  monthly:    { label: 'Monthly',    description: 'Approved earnings are paid out on the 1st of each month.' },
  on_request: { label: 'On Request', description: 'You manually initiate withdrawals from the Earnings page.' },
};

/**
 * @param {{
 *   schedule?: 'weekly' | 'biweekly' | 'monthly' | 'on_request';
 *   nextPayoutDate?: string | null;
 *   loading?: boolean;
 * }} props
 */
const PayoutScheduleCard = memo(({ schedule = 'on_request', nextPayoutDate = null, loading = false }) => {
  const info = SCHEDULE_INFO[schedule] ?? SCHEDULE_INFO.on_request;

  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}>
        <div className="h-3 w-28 rounded mb-4" style={{ background: 'var(--bd-surface-input)' }} />
        <div className="h-12 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl p-5"
      style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={14} style={{ color: '#818cf8' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>Payout Schedule</h3>
      </div>

      <div
        className="p-3.5 rounded-xl mb-3"
        style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}
      >
        <p className="text-base font-bold mb-1" style={{ color: 'var(--bd-text-primary)' }}>{info.label}</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--bd-text-secondary)' }}>{info.description}</p>
      </div>

      {nextPayoutDate && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
          <Info size={11} />
          <span>
            Next payout:{' '}
            <span className="font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
              {new Date(nextPayoutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </span>
        </div>
      )}
    </motion.div>
  );
});

PayoutScheduleCard.displayName = 'PayoutScheduleCard';
export default PayoutScheduleCard;
