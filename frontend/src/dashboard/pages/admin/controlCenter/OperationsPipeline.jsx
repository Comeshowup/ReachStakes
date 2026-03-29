/**
 * OperationsPipeline.jsx — §4 Mini system view: deliverables, approvals, payouts.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileImage, CheckCircle, Banknote, ChevronRight, Settings2 } from 'lucide-react';
import { SectionCard, CardHeader, Skeleton } from './primitives';

const ICON_MAP = {
  del: FileImage,
  app: CheckCircle,
  pay: Banknote,
};

const PipelineItem = ({ item, loading }) => {
  const navigate = useNavigate();
  const Icon = ICON_MAP[item.id] || Settings2;

  return (
    <button
      onClick={() => navigate(item.path)}
      className={`w-full flex items-center gap-3.5 px-5 py-4 border-b border-zinc-800/60 last:border-b-0 transition-all duration-150 text-left group
        ${item.slaBreached
          ? 'hover:bg-amber-900/10 border-l-2 border-l-amber-500/60'
          : 'hover:bg-zinc-800/30'}
      `}
    >
      <div className={`p-2 rounded-xl shrink-0 ${item.slaBreached ? 'bg-amber-500/10' : 'bg-zinc-800'}`}>
        <Icon className={`w-4 h-4 ${item.slaBreached ? 'text-amber-400' : 'text-zinc-400'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{item.label}</p>
        {item.slaBreached && (
          <p className="text-[11px] text-amber-500 mt-0.5 font-medium">SLA breached</p>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-7 w-10 rounded-xl" />
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xl font-bold tabular-nums ${
              item.slaBreached ? 'text-amber-400' : item.count > 10 ? 'text-white' : 'text-zinc-300'
            }`}
          >
            {item.count}
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
        </div>
      )}
    </button>
  );
};

const OperationsPipeline = ({ pipeline = [], loading = false }) => {
  return (
    <SectionCard>
      <CardHeader
        icon={Settings2}
        iconColor="text-zinc-400"
        title="Operations Pipeline"
      />
      <div>
        {pipeline.map((item) => (
          <PipelineItem key={item.id} item={item} loading={loading} />
        ))}
      </div>
    </SectionCard>
  );
};

export default OperationsPipeline;
