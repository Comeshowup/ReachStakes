import React from "react";
import { motion } from "framer-motion";
import { Vault, Lock, ArrowUpRight, AlertOctagon, Clock } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const ESCROW_RECORDS = [
  { id: "esc_001", brand: "Adidas",   creator: "James K.", campaign: "Fall Collection",  amount: 1800, status: "locked",   lockedAt: "2026-03-23", releaseAt: "2026-03-30" },
  { id: "esc_002", brand: "Apple",    creator: "Sofia M.", campaign: "WWDC Media Push", amount: 5000, status: "locked",   lockedAt: "2026-03-22", releaseAt: "2026-03-29" },
  { id: "esc_003", brand: "Samsung",  creator: "Ryan C.",  campaign: "Galaxy S25 Drop", amount: 3500, status: "locked",   lockedAt: "2026-03-19", releaseAt: "2026-03-26" },
  { id: "esc_004", brand: "Nike",     creator: "Emma W.",  campaign: "Summer Splash",   amount: 2400, status: "released", lockedAt: "2026-03-10", releaseAt: "2026-03-24" },
  { id: "esc_005", brand: "Puma",     creator: "Marco V.", campaign: "Velocity 2026",   amount: 2100, status: "released", lockedAt: "2026-03-05", releaseAt: "2026-03-17" },
  { id: "esc_006", brand: "L'Oréal",  creator: "Priya S.", campaign: "Glow Campaign",   amount: 750,  status: "disputed", lockedAt: "2026-03-01", releaseAt: "—" },
];

const STATUS_CFG = {
  locked:   { label: "Locked",   color: "text-blue-400   bg-blue-500/10    border-blue-500/20",    icon: Lock },
  released: { label: "Released", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: ArrowUpRight },
  disputed: { label: "Disputed", color: "text-red-400    bg-red-500/10     border-red-500/20",     icon: AlertOctagon },
};

const FinanceEscrowPage = () => {
  const locked   = ESCROW_RECORDS.filter((r) => r.status === "locked").reduce((s, r) => s + r.amount, 0);
  const released = ESCROW_RECORDS.filter((r) => r.status === "released").reduce((s, r) => s + r.amount, 0);
  const disputed = ESCROW_RECORDS.filter((r) => r.status === "disputed").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Escrow</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Funds held in escrow by campaign — lock, release, and dispute tracking</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Escrowed",    value: fmt(locked),   icon: Lock,         color: "text-blue-400" },
          { label: "Pending Release",   value: fmt(released), icon: Clock,        color: "text-amber-400" },
          { label: "In Dispute",        value: fmt(disputed), icon: AlertOctagon, color: "text-red-400" },
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

      {/* Escrow table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold text-white">Escrow Records</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800/30">
              {["Campaign", "Brand", "Creator", "Amount", "Locked On", "Release By", "Status", "Action"].map((col) => (
                <th key={col} className="text-left py-3 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ESCROW_RECORDS.map((r) => {
              const cfg = STATUS_CFG[r.status];
              const Icon = cfg.icon;
              return (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-3.5 px-4 text-sm text-white font-medium">{r.campaign}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-400">{r.brand}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-400">{r.creator}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-white tabular-nums">{fmt(r.amount)}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">{r.lockedAt}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">{r.releaseAt}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.status === "locked" && (
                      <button className="text-xs px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 rounded-lg font-medium transition-colors">
                        Release
                      </button>
                    )}
                    {r.status === "disputed" && (
                      <button className="text-xs px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg font-medium transition-colors">
                        Resolve
                      </button>
                    )}
                    {r.status === "released" && <span className="text-xs text-zinc-700">—</span>}
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

export default FinanceEscrowPage;
