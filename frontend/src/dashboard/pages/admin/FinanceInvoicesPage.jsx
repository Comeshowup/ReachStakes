import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const MOCK_INVOICES = [
  { id: "inv_001", ref: "INV-2024", brand: "Nike",     campaign: "Summer Splash",    amount: 2688, status: "paid",    due: "2026-03-24", issued: "2026-03-10" },
  { id: "inv_002", ref: "INV-2025", brand: "Adidas",   campaign: "Fall Collection",  amount: 2016, status: "paid",    due: "2026-03-23", issued: "2026-03-09" },
  { id: "inv_003", ref: "INV-2026", brand: "Apple",    campaign: "WWDC Media Push", amount: 5600, status: "unpaid",  due: "2026-03-29", issued: "2026-03-22" },
  { id: "inv_004", ref: "INV-2027", brand: "Samsung",  campaign: "Galaxy S25 Drop", amount: 3920, status: "unpaid",  due: "2026-03-26", issued: "2026-03-19" },
  { id: "inv_005", ref: "INV-2028", brand: "L'Oréal",  campaign: "Glow Campaign",   amount: 840,  status: "overdue", due: "2026-03-15", issued: "2026-03-01" },
  { id: "inv_006", ref: "INV-2029", brand: "Zara",     campaign: "Spring Edit",     amount: 1064, status: "overdue", due: "2026-03-10", issued: "2026-02-24" },
];

const STATUS_CFG = {
  paid:    { label: "Paid",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  unpaid:  { label: "Unpaid",  color: "text-amber-400  bg-amber-500/10   border-amber-500/20",   icon: Clock },
  overdue: { label: "Overdue", color: "text-red-400    bg-red-500/10     border-red-500/20",     icon: AlertTriangle },
};

const FinanceInvoicesPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MOCK_INVOICES.filter((inv) => {
    if (filter !== "all" && inv.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || inv.ref.toLowerCase().includes(q) || inv.brand.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Invoices</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Campaign invoices — paid, unpaid, and overdue</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm transition-colors shrink-0">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref or brand…"
            className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "paid", "unpaid", "overdue"].map((f) => (
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
              {["Invoice", "Brand", "Campaign", "Amount", "Issued", "Due", "Status", ""].map((col) => (
                <th key={col} className="text-left py-3 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const cfg = STATUS_CFG[inv.status];
              const Icon = cfg.icon;
              return (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">{inv.ref}</td>
                  <td className="py-3.5 px-4 text-sm text-white font-medium">{inv.brand}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-500">{inv.campaign}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-white tabular-nums">{fmt(inv.amount)}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">{inv.issued}</td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">{inv.due}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                      <FileText className="w-3.5 h-3.5" /> View
                    </button>
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

export default FinanceInvoicesPage;
