import React, { useState } from "react";
import { motion } from "framer-motion";
import { Banknote, Clock, CheckCircle2, Send, Download, Search } from "lucide-react";

const MOCK_PAYOUTS = [
  { id: "po_001", creator: "Emma Wilson",  avatar: "EW", amount: 2112,  status: "paid",       scheduled: "2026-03-24", campaign: "Summer Splash" },
  { id: "po_002", creator: "James K.",     avatar: "JK", amount: 1584,  status: "processing", scheduled: "2026-03-26", campaign: "Fall Collection" },
  { id: "po_003", creator: "Sofia M.",     avatar: "SM", amount: 4400,  status: "scheduled",  scheduled: "2026-03-28", campaign: "WWDC Media Push" },
  { id: "po_004", creator: "Aisha B.",     avatar: "AB", amount: 1056,  status: "paid",       scheduled: "2026-03-20", campaign: "Conscious Coll." },
  { id: "po_005", creator: "Ryan C.",      avatar: "RC", amount: 3080,  status: "scheduled",  scheduled: "2026-03-30", campaign: "Galaxy S25 Drop" },
  { id: "po_006", creator: "Priya S.",     avatar: "PS", amount: 660,   status: "processing", scheduled: "2026-03-27", campaign: "Glow Campaign" },
  { id: "po_007", creator: "Marco V.",     avatar: "MV", amount: 1848,  status: "paid",       scheduled: "2026-03-17", campaign: "Velocity 2026" },
];

const STATUS = {
  paid:       { label: "Paid",       color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  processing: { label: "Processing", color: "text-blue-400   bg-blue-500/10    border-blue-500/20",    icon: Send },
  scheduled:  { label: "Scheduled",  color: "text-amber-400  bg-amber-500/10   border-amber-500/20",   icon: Clock },
};

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const FinancePayoutsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MOCK_PAYOUTS.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || p.creator.toLowerCase().includes(q) || p.campaign.toLowerCase().includes(q);
  });

  const totalScheduled = MOCK_PAYOUTS.filter((p) => p.status === "scheduled").reduce((s, p) => s + p.amount, 0);
  const totalProcessing = MOCK_PAYOUTS.filter((p) => p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const totalPaid = MOCK_PAYOUTS.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payouts</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Creator payout queue — scheduled, processing, and completed</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm transition-colors shrink-0">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Scheduled",  value: fmt(totalScheduled),  color: "text-amber-400",   icon: Clock },
          { label: "Processing", value: fmt(totalProcessing), color: "text-blue-400",    icon: Send },
          { label: "Paid Out",   value: fmt(totalPaid),       color: "text-emerald-400", icon: Banknote },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">{card.label}</p>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-xl font-bold text-white tabular-nums">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creator or campaign…"
            className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "scheduled", "processing", "paid"].map((f) => (
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
              {["Creator", "Campaign", "Amount", "Scheduled", "Status", "Action"].map((col) => (
                <th key={col} className="text-left py-3 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const cfg = STATUS[p.status];
              const Icon = cfg.icon;
              return (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {p.avatar}
                      </div>
                      <span className="text-sm text-white">{p.creator}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-400">{p.campaign}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-white tabular-nums">{fmt(p.amount)}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">{p.scheduled}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.status === "scheduled" && (
                      <button className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                        Release Now
                      </button>
                    )}
                    {p.status !== "scheduled" && (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancePayoutsPage;
