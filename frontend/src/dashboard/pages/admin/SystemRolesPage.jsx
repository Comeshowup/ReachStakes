import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ChevronRight, Plus, Check } from "lucide-react";

const MOCK_ROLES = [
  { id: 1, name: "Super Admin",      permissions: ["all"],                                                                          members: 1, color: "bg-red-500/15 text-red-400 border-red-500/30" },
  { id: 2, name: "Campaign Manager", permissions: ["campaigns.read", "campaigns.write", "creators.read", "payments.read"],         members: 3, color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { id: 3, name: "Finance Admin",    permissions: ["payments.read", "payments.write", "analytics.read"],                           members: 2, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { id: 4, name: "Support Agent",    permissions: ["tickets.read", "tickets.write", "conversations.read", "conversations.write"],  members: 5, color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  { id: 5, name: "Read Only",        permissions: ["*.read"],                                                                      members: 2, color: "bg-zinc-500/15 text-zinc-400 border-zinc-700/50" },
];

const ALL_PERMISSIONS = [
  "campaigns.read","campaigns.write","creators.read","creators.write",
  "brands.read","brands.write","payments.read","payments.write",
  "tickets.read","tickets.write","tasks.read","tasks.write",
  "analytics.read","settings.write","audit.read",
];

const SystemRolesPage = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Roles & Permissions</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Define access levels for admin team members</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">Access Roles</h3>
          </div>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Role
          </button>
        </div>
        <div className="p-4 space-y-2">
          {MOCK_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(selected?.id === role.id ? null : role)}
              className="w-full text-left flex items-center gap-4 px-4 py-3.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group"
            >
              <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${role.color}`}>{role.name}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500">
                  {role.permissions.slice(0, 3).join(", ")}
                  {role.permissions.length > 3 ? ` +${role.permissions.length - 3} more` : ""}
                </p>
              </div>
              <span className="text-xs text-zinc-600">{role.members} member{role.members !== 1 ? "s" : ""}</span>
              <ChevronRight className={`w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-transform ${selected?.id === role.id ? "rotate-90" : ""}`} />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white">Permissions — {selected.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Granular access controls for this role</p>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const active = selected.permissions.includes(perm) || selected.permissions.includes("all") || selected.permissions.includes("*.read");
                  return (
                    <div
                      key={perm}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                        active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-zinc-800 bg-zinc-800/30 text-zinc-600"
                      }`}
                    >
                      {active ? <Check className="w-3 h-3 shrink-0" /> : <div className="w-3 h-3 shrink-0" />}
                      {perm}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemRolesPage;
