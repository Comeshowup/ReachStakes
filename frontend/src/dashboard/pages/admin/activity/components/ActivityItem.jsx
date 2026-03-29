import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, ChevronRight } from "lucide-react";
import {
  getEventConfig,
  getStatusConfig,
  ACTOR_CONFIG,
  formatRelativeTime,
  formatFullDate,
} from "../utils/activityHelpers";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy event ID"
      className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
};

const StatusDot = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium
        border ${cfg.badge}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const ActorPill = ({ actor }) => {
  const cfg = ACTOR_CONFIG[actor?.type] || ACTOR_CONFIG.system;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.badge}`}
    >
      {actor?.name || "Unknown"}
    </span>
  );
};

const ActivityItem = memo(({ event, onClick }) => {
  if (!event) return null;

  const { icon: Icon, color, bg, label } = getEventConfig(event.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onClick(event)}
      className="group flex items-start gap-3.5 px-5 py-4 border-b border-zinc-900/60 hover:bg-zinc-900/40 cursor-pointer transition-colors"
    >
      {/* Icon */}
      <div
        className={`
          mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0
          ${bg} border border-white/5
        `}
      >
        <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.75} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          {/* Event label + entity */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-zinc-100 leading-snug">
                {label}
              </span>
              {event.entity?.name && (
                <>
                  <ChevronRight className="w-3 h-3 text-zinc-700 shrink-0" />
                  <span className="text-sm text-zinc-400 truncate max-w-[180px]">
                    {event.entity.name}
                  </span>
                </>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <ActorPill actor={event.actor} />
              <StatusDot status={event.status} />
              <span className="text-[11px] text-zinc-600">
                {event.entity?.type}
              </span>
            </div>
          </div>

          {/* Right: time + actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              title={formatFullDate(event.createdAt)}
              className="text-[11px] text-zinc-600 tabular-nums whitespace-nowrap"
            >
              {formatRelativeTime(event.createdAt)}
            </span>
            <CopyButton text={event.id} />
            <button
              onClick={(e) => { e.stopPropagation(); onClick(event); }}
              className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all flex items-center gap-1"
            >
              Details
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ActivityItem.displayName = "ActivityItem";

export default ActivityItem;
