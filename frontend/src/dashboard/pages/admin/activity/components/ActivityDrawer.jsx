import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getEventConfig,
  getStatusConfig,
  ACTOR_CONFIG,
  formatFullDate,
  formatRelativeTime,
  getEntityRoute,
} from "../utils/activityHelpers";

// ─── Sub-components ────────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div className="border-b border-zinc-800/60 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
      {title}
    </p>
    {children}
  </div>
);

const Field = ({ label, value }) => (
  <div className="flex justify-between items-start gap-3 py-1.5 text-xs">
    <span className="text-zinc-600 shrink-0">{label}</span>
    <span className="text-zinc-300 text-right break-all">{value || "—"}</span>
  </div>
);

const CopyIdButton = ({ id }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-all"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copy ID
        </>
      )}
    </button>
  );
};

const JsonViewer = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const json = JSON.stringify(data, null, 2);
  const lines = json.split("\n");
  const preview = lines.slice(0, 8).join("\n");
  const hasMore = lines.length > 8;

  return (
    <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 overflow-hidden">
      <pre className="text-[11px] text-zinc-400 font-mono p-3.5 leading-relaxed overflow-x-auto">
        {expanded ? json : preview}
        {!expanded && hasMore && (
          <span className="text-zinc-700">
            {"\n"}...
          </span>
        )}
      </pre>
      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/60 border-t border-zinc-800 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-3 h-3" />Collapse</>
          ) : (
            <><ChevronDown className="w-3 h-3" />Show all ({lines.length} lines)</>
          )}
        </button>
      )}
    </div>
  );
};

// ─── Drawer ────────────────────────────────────────────────────────────────────

const ActivityDrawer = ({ event, onClose }) => {
  const navigate = useNavigate();
  const isOpen = !!event;

  const cfg = event ? getEventConfig(event.type) : null;
  const statusCfg = event ? getStatusConfig(event.status) : null;
  const actorCfg = event ? (ACTOR_CONFIG[event.actor?.type] || ACTOR_CONFIG.system) : null;
  const entityRoute = event ? getEntityRoute(event.entity) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-[480px] bg-zinc-950 border-l border-zinc-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-5 border-b border-zinc-800/80 shrink-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg?.bg} border border-white/5`}
              >
                {cfg && <cfg.icon className={`w-5 h-5 ${cfg.color}`} strokeWidth={1.75} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 leading-snug">
                  {cfg?.label}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusCfg?.badge}`}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${statusCfg?.dot}`} />
                    {statusCfg?.label}
                  </span>
                  <CopyIdButton id={event.id} />
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-0">
              {/* Event Summary */}
              <Section title="Event">
                <Field label="ID" value={event.id} />
                <Field label="Type" value={event.type} />
                <Field label="Timestamp" value={formatFullDate(event.createdAt)} />
                <Field label="Relative" value={formatRelativeTime(event.createdAt)} />
              </Section>

              {/* Actor */}
              <Section title="Actor">
                <div className="flex items-center gap-2 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {event.actor?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{event.actor?.name}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${actorCfg?.badge}`}
                    >
                      {actorCfg?.label}
                    </span>
                  </div>
                </div>
                <Field label="ID" value={event.actor?.id} />
              </Section>

              {/* Entity */}
              <Section title="Entity">
                <Field label="Name" value={event.entity?.name || "—"} />
                <Field label="Type" value={event.entity?.type} />
                <Field label="ID" value={event.entity?.id} />
                {entityRoute && (
                  <button
                    onClick={() => { navigate(entityRoute); onClose(); }}
                    className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors group"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View {event.entity?.type}
                    <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                )}
              </Section>

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <Section title="Metadata">
                  <JsonViewer data={event.metadata} />
                </Section>
              )}

              {/* Timeline placeholder */}
              <Section title="Related Events">
                <div className="rounded-lg border border-dashed border-zinc-800 py-6 text-center">
                  <p className="text-xs text-zinc-700">
                    Timeline view coming soon
                  </p>
                </div>
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityDrawer;
