/**
 * LiveActivity.jsx — §6 Real-time activity feed with type filters.
 * Deprioritized in layout (right column / bottom). Real-time-ready via useActivityFeed.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, DollarSign, Target, Users, CheckCircle, AlertTriangle, Zap, Shield,
} from 'lucide-react';
import { SectionCard, CardHeader, Elapsed } from './primitives';

const EVENT_ICON = {
  payment_released:      { icon: DollarSign,    color: 'bg-emerald-500/15 text-emerald-400' },
  dispute_opened:        { icon: AlertTriangle,  color: 'bg-red-500/15 text-red-400' },
  campaign_created:      { icon: Target,         color: 'bg-blue-500/15 text-blue-400' },
  payout_failed:         { icon: Zap,            color: 'bg-red-500/15 text-red-400' },
  creator_joined:        { icon: Users,          color: 'bg-violet-500/15 text-violet-400' },
  approval_granted:      { icon: CheckCircle,    color: 'bg-emerald-500/15 text-emerald-400' },
  escrow_locked:         { icon: Shield,         color: 'bg-blue-500/15 text-blue-400' },
  deliverable_submitted: { icon: CheckCircle,    color: 'bg-zinc-700/50 text-zinc-400' },
  default:               { icon: Activity,       color: 'bg-zinc-700/50 text-zinc-400' },
};

const ACTOR_TYPE_FILTER = {
  all:       () => true,
  payments:  (e) => ['payment_released','payout_failed','escrow_locked'].includes(e.eventType),
  campaigns: (e) => ['campaign_created','deliverable_submitted','approval_granted'].includes(e.eventType),
  creators:  (e) => e.actorType === 'creator',
};

const FILTERS = ['all', 'payments', 'campaigns', 'creators'];

const ACTOR_DOT = {
  system:  'bg-blue-500',
  admin:   'bg-red-500',
  brand:   'bg-violet-500',
  creator: 'bg-emerald-500',
};

const EventRow = ({ event }) => {
  const schema = EVENT_ICON[event.eventType || event.type] || EVENT_ICON.default;
  const Icon = schema.icon;
  // Normalize: mockData uses epoch ms (`timestamp`), useActivityFeed uses ISO string (`time`)
  const ts = event.timestamp ?? (event.time ? new Date(event.time).getTime() : Date.now());

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 py-3 border-b border-zinc-800/50 last:border-b-0"
    >
      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${schema.color}`}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-300 leading-snug">{event.description || event.message}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ACTOR_DOT[event.actorType] || 'bg-zinc-600'}`} />
          <span className="text-[10px] text-zinc-600">{event.actor}</span>
        </div>
      </div>
      <Elapsed ts={ts} />
    </motion.div>
  );
};

const LiveActivity = ({ events = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = events.filter(ACTOR_TYPE_FILTER[activeFilter] || ACTOR_TYPE_FILTER.all);

  return (
    <SectionCard className="flex flex-col">
      <CardHeader
        title="Live Activity"
        pulse
        right="Real-time"
      />

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-1 shrink-0">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg capitalize transition-colors duration-150 ${
              activeFilter === f
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto max-h-[400px] px-4 pb-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {filtered.slice(0, 20).map(event => (
            <EventRow key={event.id} event={event} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-xs text-zinc-700">No events in this category</p>
        )}
      </div>
    </SectionCard>
  );
};

export default LiveActivity;
