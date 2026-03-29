import React, { useState } from "react";
import { CreditCard, Mail, Bell, Key, Eye, EyeOff } from "lucide-react";

const INTEGRATIONS = [
  { id: "tazapay",  name: "Tazapay",  description: "Escrow and payout gateway",      status: "connected",    icon: CreditCard, color: "bg-blue-500/15 border-blue-500/30 text-blue-400",    apiKey: "sk_live_xxx...xxxx" },
  { id: "sendgrid", name: "SendGrid", description: "Transactional email delivery",    status: "connected",    icon: Mail,       color: "bg-violet-500/15 border-violet-500/30 text-violet-400", apiKey: "SG.xxx...xxxx" },
  { id: "slack",    name: "Slack",    description: "Team notifications via webhook",  status: "disconnected", icon: Bell,       color: "bg-amber-500/15 border-amber-500/30 text-amber-400",   apiKey: null },
  { id: "stripe",   name: "Stripe",   description: "Brand payment collection",        status: "disconnected", icon: CreditCard, color: "bg-zinc-500/15 border-zinc-700 text-zinc-400",         apiKey: null },
];

const SystemIntegrationsPage = () => {
  const [showKey, setShowKey] = useState({});

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Integrations</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Connect third-party services to the platform</p>
      </div>

      <div className="space-y-4">
        {INTEGRATIONS.map((int) => {
          const Icon = int.icon;
          return (
            <div key={int.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${int.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{int.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{int.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    int.status === "connected"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-600"
                  }`}>
                    {int.status === "connected" ? "Connected" : "Not Connected"}
                  </span>
                  <button className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    int.status === "connected"
                      ? "text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}>
                    {int.status === "connected" ? "Configure" : "Connect"}
                  </button>
                </div>
              </div>
              {int.status === "connected" && int.apiKey && (
                <div className="mt-4 flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span className="text-xs font-mono text-zinc-600">
                    {showKey[int.id] ? int.apiKey : "••••••••••••"}
                  </span>
                  <button
                    onClick={() => setShowKey((prev) => ({ ...prev, [int.id]: !prev[int.id] }))}
                    className="text-zinc-700 hover:text-zinc-400 transition-colors ml-1"
                  >
                    {showKey[int.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemIntegrationsPage;
