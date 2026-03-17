/**
 * TransactionsPage — Full transaction ledger with filters and pagination.
 * Replaces the Invoices tab.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
import TransactionLedgerTable from '../components/TransactionLedgerTable';

const TransactionsPage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-4 pb-10"
  >
    <div className="flex items-center gap-2 mb-1">
      <Receipt size={15} style={{ color: 'var(--bd-text-secondary)' }} />
      <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
        All earnings, payouts, adjustments, and refunds in one unified ledger.
      </p>
    </div>
    <TransactionLedgerTable />
  </motion.div>
);

export default TransactionsPage;
