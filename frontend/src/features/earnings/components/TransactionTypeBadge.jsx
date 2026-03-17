/**
 * TransactionTypeBadge — Shared type pill used across Overview and Transactions pages.
 */
import React from 'react';
import { TrendingUp, ArrowDownCircle, RotateCcw, Gift, Sliders } from 'lucide-react';

const TYPE_CONFIG = {
  CAMPAIGN_EARNING: { label: 'Earnings',   Icon: TrendingUp,       color: '#34d399', bg: 'rgba(16,185,129,0.10)'  },
  PAYOUT:           { label: 'Payout',     Icon: ArrowDownCircle,  color: '#60a5fa', bg: 'rgba(59,130,246,0.10)'  },
  REFUND:           { label: 'Refund',     Icon: RotateCcw,        color: '#f87171', bg: 'rgba(239,68,68,0.10)'   },
  BONUS:            { label: 'Bonus',      Icon: Gift,             color: '#a78bfa', bg: 'rgba(139,92,246,0.10)'  },
  ADJUSTMENT:       { label: 'Adjustment', Icon: Sliders,          color: '#94a3b8', bg: 'rgba(100,116,139,0.10)' },
};

/**
 * @param {{ type: string }} props
 */
const TransactionTypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] ?? { label: type, Icon: Sliders, color: '#94a3b8', bg: 'rgba(100,116,139,0.10)' };
  const { Icon } = cfg;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

export default TransactionTypeBadge;
