import React, { useState } from "react";
import { Search, Download } from "lucide-react";

const MOCK_AUDIT = [
  { id: 1,  action: "Payment released",            actor: "Admin",   target: "Emma Wilson",           time: new Date(Date.now() - 2 * 60000).toISOString(),       severity: "info" },
  { id: 2,  action: "Issue escalated",             actor: "Admin",   target: "Nike Summer Splash",    time: new Date(Date.now() - 15 * 60000).toISOString(),      severity: "warning" },
  { id: 3,  action: "Role updated: Support → Mgr", actor: "Admin",   target: "john@example.com",      time: new Date(Date.now() - 60 * 60000).toISOString(),      severity: "warning" },
  { id: 4,  action: "Campaign approved",           actor: "Admin",   target: "Adidas Fall Collection", time: new Date(Date.now() - 3 * 3600000).toISOString(),    severity: "info" },
  { id: 5,  action: "Failed login attempt",        actor: "Unknown", target: "/admin/login",           time: new Date(Date.now() - 5 * 3600000).toISOString(),    severity: "error" },
  { id: 6,  action: "Platform fee updated to 12%", actor: "Admin",   target: "Platform Config",       time: new Date(Date.now() - 8 * 3600000).toISOString(),    severity: "warning" },
  { id: 7,  action: "Webhook configured: Stripe",  actor: "Admin",   target: "Integrations",          time: new Date(Date.now() - 24 * 3600000).toISOString(),   severity: "info" },
];

const SEVERITY_COLOR = {
  info:    "text-zinc-400",
  warning: "text-amber-400",
  error:   "text-red-400",
};

const fmt = (iso) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const SystemAuditLogsPage = () => {
  const [search, setSearch]     = useState("");
  const [severity, setSeverity] = useState("");

  const filtered = MOCK_AUDIT.filter((e) => {
    if (severity && e.severity !== severity) return false;
    if (search && !e.action.toLowerCase().includes(search.toLowerCase()) && !e.actor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Immutable record of all admin actions on the platform</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs…"
            className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-300 focus:outline-none"
        >
          <option value="">All Severity</option>
          {["info", "warning", "error"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800/30">
              {["Action", "Actor", "Target", "Severity", "Time"].map((col) => (
                <th key={col} className="text-left py-3 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="py-3 px-4 text-sm text-white">{log.action}</td>
                <td className="py-3 px-4 text-xs text-zinc-400">{log.actor}</td>
                <td className="py-3 px-4 text-xs text-zinc-500">{log.target}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium capitalize ${SEVERITY_COLOR[log.severity] || "text-zinc-400"}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-zinc-600">{fmt(log.time)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-zinc-600 text-sm">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemAuditLogsPage;
