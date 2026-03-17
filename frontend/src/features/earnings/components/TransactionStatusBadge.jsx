/**
 * TransactionStatusBadge — Shared status pill used across Overview and Transactions pages.
 */
import React from 'react';

/** @type {Record<string, { label: string; style: React.CSSProperties }>} */
const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  border: 'rgba(245,158,11,0.25)'  },
  APPROVED:   { label: 'Approved',   bg: 'rgba(99,102,241,0.12)',  color: '#818cf8',  border: 'rgba(99,102,241,0.25)'  },
  PROCESSING: { label: 'Processing', bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.25)'  },
  PAID:       { label: 'Paid',       bg: 'rgba(16,185,129,0.12)',  color: '#34d399',  border: 'rgba(16,185,129,0.25)'  },
  FAILED:     { label: 'Failed',     bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  border: 'rgba(239,68,68,0.25)'   },
};

/**
 * @param {{ status: string; size?: 'sm' | 'md' }} props
 */
const TransactionStatusBadge = ({ status, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' };
  const padding = size === 'md' ? '3px 10px' : '2px 8px';
  const fontSize = size === 'md' ? '11px' : '10px';

  return (
    <span
      style={{
        display: 'inline-block',
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
};

export default TransactionStatusBadge;
