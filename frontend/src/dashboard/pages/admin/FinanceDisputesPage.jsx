import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertOctagon, Search, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const MOCK_DISPUTES = [
  { id: "dsp_001", ref: "DSP-141", brand: "L'Oréal",  creator: "Priya S.", campaign: "Glow Campaign",  amount: 750,  status: "open",     priority: "high",   opened: "2026-03-18", agent: "Sarah K." },
  { id: "dsp_002", ref: "DSP-140", brand: "Zara",     creator: "Liam P.",  campaign: "Spring Edit",    amount: 950,  status: "open",     priority: "medium", opened: "2026-03-15", agent: "Mike D." },
  { id: "dsp_003", ref: "DSP-139", brand: "H&M",      creator: "Aisha B.", campaign: "Conscious Coll.", amount: 600, status: "resolved",  priority: "low",    opened: "2026-03-10", agent: "Sarah K." },
  { id: "dsp_004", ref: "DSP-138", brand: "Nike",     creator: "Jay T.",   campaign: "Winter Push",    amount: 1200, status: "escalated", priority: "critical", opened: "2026-03-05", agent: "Admin" },
  { id: "dsp_005", ref: "DSP-137", brand: "Puma",     creator: "Tracy N.", campaign: "Velocity 2025",  amount: 400,  status: "resolved",  priority: "low",    opened: "2026-02-28", agent: "Mike D." },
];

const STATUS_CFG = {
  open:      { label: "Open",      color: "text-amber-400  bg-amber-500/10   border-amber-500/20",   icon: Clock },
  escalated: { label: "Escalated", color: "text-red-400    bg-red-500/10     border-red-500/20",     icon: AlertTriangle },
  resolved:  { label: "Resolved",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
};

const PRIORITY_CFG = {
  critical: "text-red-400    bg-red-500/10     border-red-500/20",
  high:     "text-orange-400 bg-orange-500/10  border-orange-500/20",
  medium:   "text-amber-400  bg-amber-500/10   border-amber-500/20",
  low:      "text-zinc-400   bg-zinc-700/20    border-zinc-700",
};

const FinanceDisputesPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MOCK_DISPUTES.filter((d) => {
    if (filter !== "all" && d.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || d.ref.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q) || d.creator.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Disputes</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Payment disputes and resolution management</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl font-medium">
            {MOCK_DISPUTES.filter((d) => d.status === "escalated").length} escalated
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref, brand, or creator…"
            className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "open", "escalated", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === f ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 border border-zinc-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800/30">
              {["Ref", "Brand → Creator", "Campaign", "Amount", "Priority", "Agent", "Status", "Opened", "Action"].map((col) => (
                <th key={col} className="text-left py-3 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const scfg = STATUS_CFG[d.status];
              const SIcon = scfg.icon;
              return (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">{d.ref}</td>
                  <td className="py-3.5 px-4">
                    <p className="text-sm text-white">{d.brand}</p>
                    <p className="text-xs text-zinc-500">{d.creator}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-400">{d.campaign}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-white tabular-nums">{fmt(d.amount)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${PRIORITY_CFG[d.priority]}`}>
                      {d.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-500">{d.agent}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${scfg.color}`}>
                      <SIcon className="w-3 h-3" />{scfg.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">{d.opened}</td>
                  <td className="py-3.5 px-4">
                    {d.status !== "resolved" && (
                      <button className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-lg transition-colors">
                        Review
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceDisputesPage;
