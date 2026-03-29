import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Search, Download, Filter, ArrowUpRight, ArrowDownLeft,
  Clock, CheckCircle2, XCircle, Lock,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  { id: "txn_001", ref: "TXN-7821", brand: "Nike", creator: "Emma Wilson",   campaign: "Summer Splash",    amount: 2400,  fee: 288,  net: 2112,  status: "released",  date: "2026-03-24T14:32:00Z", method: "Escrow" },
  { id: "txn_002", ref: "TXN-7820", brand: "Adidas", creator: "James K.",   campaign: "Fall Collection",  amount: 1800,  fee: 216,  net: 1584,  status: "escrowed",  date: "2026-03-23T09:15:00Z", method: "Escrow" },
  { id: "txn_003", ref: "TXN-7819", brand: "Apple",  creator: "Sofia M.",   campaign: "WWDC Media Push", amount: 5000,  fee: 600,  net: 4400,  status: "pending",   date: "2026-03-22T18:00:00Z", method: "Escrow" },
  { id: "txn_004", ref: "TXN-7818", brand: "Zara",   creator: "Liam P.",    campaign: "Spring Edit",     amount: 950,   fee: 114,  net: 836,   status: "failed",    date: "2026-03-21T11:45:00Z", method: "Card" },
  { id: "txn_005", ref: "TXN-7817", brand: "H&M",    creator: "Aisha B.",   campaign: "Conscious Coll.", amount: 1200,  fee: 144,  net: 1056,  status: "released",  date: "2026-03-20T16:20:00Z", method: "Escrow" },
  { id: "txn_006", ref: "TXN-7816", brand: "Samsung", creator: "Ryan C.",   campaign: "Galaxy S25 Drop", amount: 3500,  fee: 420,  net: 3080,  status: "escrowed",  date: "2026-03-19T08:00:00Z", method: "Escrow" },
  { id: "txn_007", ref: "TXN-7815", brand: "L'Oréal", creator: "Priya S.", campaign: "Glow Campaign",   amount: 750,   fee: 90,   net: 660,   status: "pending",   date: "2026-03-18T14:10:00Z", method: "Escrow" },
  { id: "txn_008", ref: "TXN-7814", brand: "Puma",   creator: "Marco V.",   campaign: "Velocity 2026",  amount: 2100,  fee: 252,  net: 1848,  status: "released",  date: "2026-03-17T10:55:00Z", method: "Escrow" },
];

const STATUS_CONFIG = {
  released:  { label: "Released",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  escrowed:  { label: "Escrowed",  color: "text-blue-400   bg-blue-500/10    border-blue-500/20",    icon: Lock },
  pending:   { label: "Pending",   color: "text-amber-400  bg-amber-500/10   border-amber-500/20",   icon: Clock },
  failed:    { label: "Failed",    color: "text-red-400    bg-red-500/10     border-red-500/20",     icon: XCircle },
};

const FILTERS = ["all", "pending", "escrowed", "released", "failed"];

// ─── Stat Cards ───────────────────────────────────────────────────────────────
const statCards = [
  { label: "Total Volume",       value: "$17,700",  sub: "8 transactions",       icon: CreditCard,      color: "text-zinc-400" },
  { label: "Escrowed",           value: "$5,300",   sub: "2 pending release",    icon: Lock,            color: "text-blue-400" },
  { label: "Released",           value: "$10,650",  sub: "processed this month", icon: ArrowUpRight,    color: "text-emerald-400" },
  { label: "Failed / Disputed",  value: "$950",     sub: "1 transaction",        icon: XCircle,         color: "text-red-400" },
];

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Page ─────────────────────────────────────────────────────────────────────
const FinanceTransactionsPage = () => {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || t.ref.toLowerCase().includes(q) || t.brand.toLowerCase().includes(q) || t.creator.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Full payment lifecycle — pending, escrowed, released, failed</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm transition-colors shrink-0">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500 font-medium">{card.label}</p>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-xl font-bold text-white tabular-nums">{card.value}</p>
              <p className="text-xs text-zinc-600 mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref, brand, or creator…"
            className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                {["Ref", "Brand → Creator", "Campaign", "Amount", "Fee", "Net", "Method", "Status", "Date"].map((col) => (
                  <th key={col} className="text-left py-3 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn, i) => {
                const cfg = STATUS_CONFIG[txn.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-500">{txn.ref}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm text-white font-medium">{txn.brand}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{txn.creator}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-400 max-w-[140px] truncate">{txn.campaign}</td>
                    <td className="py-3.5 px-4 text-sm text-white font-medium tabular-nums">{fmt(txn.amount)}</td>
                    <td className="py-3.5 px-4 text-xs text-zinc-500 tabular-nums">{fmt(txn.fee)}</td>
                    <td className="py-3.5 px-4 text-sm text-emerald-400 font-medium tabular-nums">{fmt(txn.net)}</td>
                    <td className="py-3.5 px-4 text-xs text-zinc-500">{txn.method}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-600 whitespace-nowrap">{fmtDate(txn.date)}</td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-zinc-600 text-sm">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceTransactionsPage;
