import React from "react";
import { Activity } from "lucide-react";

const PageShell = ({ icon: Icon, title, description }) => (
  <div className="space-y-6 max-w-[1280px]">
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      <p className="text-zinc-500 text-sm mt-0.5">{description}</p>
    </div>
    <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
        <Icon className="w-5 h-5 text-zinc-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <p className="text-xs text-zinc-600 mt-1">This section is under construction.</p>
      </div>
    </div>
  </div>
);

const ActivityPage = () => (
  <PageShell
    icon={Activity}
    title="Activity"
    description="Platform-wide activity feed — recent actions, events, and changes"
  />
);

export default ActivityPage;
