/**
 * AttentionRequired.jsx — §1 Highest-priority section.
 * Groups items by severity: Critical → Time-Sensitive → Operational
 * Each item has SLA countdown, primary CTA, hover-reveal dismiss.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ExternalLink } from 'lucide-react';
import {
  SectionCard, CardHeader, SLATimer, PrimaryBtn, SecondaryBtn,
  SeverityDot, Badge, Skeleton,
} from './primitives';

const SEVERITY_ORDER = ['critical', 'time_sensitive', 'operational'];

const SEVERITY_META = {
  critical:       { label: 'Critical',       badgeVariant: 'critical',       rowBg: 'hover:bg-red-500/5    border border-transparent hover:border-red-500/15' },
  time_sensitive: { label: 'Time-Sensitive', badgeVariant: 'time_sensitive', rowBg: 'hover:bg-amber-500/5  border border-transparent hover:border-amber-500/15' },
  operational:    { label: 'Operational',    badgeVariant: 'operational',    rowBg: 'hover:bg-blue-500/5   border border-transparent hover:border-blue-500/15' },
};

const AttentionItem = ({ item, onDismiss }) => {
  const navigate = useNavigate();
  const meta = SEVERITY_META[item.severity] || SEVERITY_META.operational;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.18 }}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-default ${meta.rowBg}`}
    >
      <SeverityDot severity={item.severity} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white leading-snug truncate">{item.title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">{item.context}</p>
      </div>

      {/* SLA + actions */}
      <div className="flex items-center gap-2 shrink-0">
        <SLATimer deadline={item.slaDeadline} />

        {/* Actions — always visible on mobile, hover-reveal on desktop */}
        <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
          <PrimaryBtn
            id={`cta-${item.id}`}
            severity={item.severity}
            onClick={() => navigate(item.ctaPath)}
          >
            {item.cta}
          </PrimaryBtn>
          <SecondaryBtn onClick={() => navigate(item.secondaryPath)}>
            <ExternalLink className="w-3.5 h-3.5" />
          </SecondaryBtn>
          <button
            onClick={() => onDismiss(item.id)}
            className="p-1 text-zinc-600 hover:text-zinc-400 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SeverityGroup = ({ severity, items, onDismiss }) => {
  const meta = SEVERITY_META[severity];
  if (!items.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
        <Badge variant={severity}>{meta.label}</Badge>
        <span className="text-[10px] text-zinc-600 font-medium">{items.length} item{items.length > 1 ? 's' : ''}</span>
      </div>
      <AnimatePresence mode="popLayout">
        {items.map(item => (
          <AttentionItem key={item.id} item={item} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const AttentionRequired = ({ items = [], loading = false }) => {
  const [dismissed, setDismissed] = useState(new Set());
  const visible = items.filter(i => !dismissed.has(i.id));
  const total = visible.length;

  const dismiss = (id) => setDismissed(prev => new Set([...prev, id]));

  const grouped = SEVERITY_ORDER.reduce((acc, s) => {
    acc[s] = visible.filter(i => i.severity === s);
    return acc;
  }, {});

  return (
    <SectionCard>
      <CardHeader
        icon={Zap}
        iconColor="text-amber-400"
        title="Attention Required"
        badge={total}
        right="Auto-sorted by priority"
      />

      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-2 h-2 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-zinc-500 font-medium">Queue is clear</p>
          <p className="text-xs text-zinc-700 mt-1">No items require attention right now</p>
        </div>
      ) : (
        <div className="pb-3">
          {SEVERITY_ORDER.map(s => (
            <SeverityGroup key={s} severity={s} items={grouped[s]} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default AttentionRequired;
