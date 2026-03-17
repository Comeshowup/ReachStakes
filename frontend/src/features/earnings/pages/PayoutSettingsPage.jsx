/**
 * PayoutSettingsPage — Bank account management and payout schedule display.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useEarnings, EARNINGS_KEYS } from '../hooks/useEarnings';
import { useQueryClient } from '@tanstack/react-query';
import BankAccountCard from '../components/BankAccountCard';
import PayoutScheduleCard from '../components/PayoutScheduleCard';

const PayoutSettingsPage = () => {
  const { data, isLoading } = useEarnings();
  const queryClient = useQueryClient();

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: EARNINGS_KEYS.summary });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10"
    >
      <div className="flex items-center gap-2 mb-5">
        <Settings size={14} style={{ color: 'var(--bd-text-secondary)' }} />
        <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
          Manage your payout bank account and schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
        <BankAccountCard
          bankConnected={data?.bankConnected ?? false}
          bankName={data?.bankName}
          bankLastFour={data?.bankLastFour}
          loading={isLoading}
          onUpdate={handleUpdate}
        />
        <PayoutScheduleCard
          schedule={data?.payoutSchedule ?? 'on_request'}
          nextPayoutDate={data?.nextPayoutDate}
          loading={isLoading}
        />
      </div>
    </motion.div>
  );
};

export default PayoutSettingsPage;
