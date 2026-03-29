import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Settings, Bell, CreditCard, FileText, Plug2,
  ChevronRight, Plus, Trash2, Edit2, Shield, Check,
  Download, Filter, Search, Eye, EyeOff,
  Globe, Mail, Webhook, Key, AlertTriangle,
} from 'lucide-react';

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'rbac',           label: 'Roles & Permissions', icon: Shield },
  { id: 'platform',       label: 'Platform Config',     icon: Settings },
  { id: 'notifications',  label: 'Notifications',        icon: Bell },
  { id: 'payments-config',label: 'Payments Config',      icon: CreditCard },
  { id: 'audit',          label: 'Audit Logs',           icon: FileText },
  { id: 'integrations',   label: 'Integrations',         icon: Plug2 },
];

// ─── Mock Audit Data ──────────────────────────────────────────────────────────
const MOCK_AUDIT = [
  { id: 1, action: 'Payment released', actor: 'Admin', target: 'Emma Wilson', time: new Date(Date.now() - 2 * 60000).toISOString(), severity: 'info' },
  { id: 2, action: 'Issue escalated', actor: 'Admin', target: 'Nike Summer Splash', time: new Date(Date.now() - 15 * 60000).toISOString(), severity: 'warning' },
  { id: 3, action: 'Role updated: Support → Manager', actor: 'Admin', target: 'john@example.com', time: new Date(Date.now() - 60 * 60000).toISOString(), severity: 'warning' },
  { id: 4, action: 'Campaign approved', actor: 'Admin', target: 'Adidas Fall Collection', time: new Date(Date.now() - 3 * 3600000).toISOString(), severity: 'info' },
  { id: 5, action: 'Failed login attempt', actor: 'Unknown', target: '/admin/login', time: new Date(Date.now() - 5 * 3600000).toISOString(), severity: 'error' },
  { id: 6, action: 'Platform fee updated to 12%', actor: 'Admin', target: 'Platform Config', time: new Date(Date.now() - 8 * 3600000).toISOString(), severity: 'warning' },
  { id: 7, action: 'Webhook configured: Stripe', actor: 'Admin', target: 'Integrations', time: new Date(Date.now() - 24 * 3600000).toISOString(), severity: 'info' },
];

const MOCK_ROLES = [
  { id: 1, name: 'Super Admin', permissions: ['all'], members: 1, color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  { id: 2, name: 'Campaign Manager', permissions: ['campaigns.read', 'campaigns.write', 'creators.read', 'payments.read'], members: 3, color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { id: 3, name: 'Finance Admin', permissions: ['payments.read', 'payments.write', 'analytics.read'], members: 2, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { id: 4, name: 'Support Agent', permissions: ['issues.read', 'issues.write', 'inbox.read', 'inbox.write'], members: 5, color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  { id: 5, name: 'Read Only', permissions: ['*.read'], members: 2, color: 'bg-zinc-500/15 text-zinc-400 border-zinc-700/50' },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Section = ({ title, description, children }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
    <div className="px-6 py-4 border-b border-zinc-800">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Toggle2 = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
    <div>
      <p className="text-sm text-white">{label}</p>
      {description && <p className="text-xs text-zinc-600 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${enabled ? 'bg-red-600' : 'bg-zinc-700'}`}
      style={{ height: 22, width: 40 }}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-[18px]' : ''}`} />
    </button>
  </div>
);

const Field = ({ label, value, type = 'text', hint, unit, onChange }) => {
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
      <div>
        <p className="text-sm text-white">{label}</p>
        {hint && <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={v}
          onChange={e => setV(e.target.value)}
          className="w-28 bg-zinc-800 border border-zinc-700 text-sm text-white rounded-lg px-3 py-1.5 text-right focus:outline-none focus:border-zinc-500 transition-colors"
        />
        {unit && <span className="text-xs text-zinc-600">{unit}</span>}
      </div>
    </div>
  );
};

// ─── RBAC Tab ─────────────────────────────────────────────────────────────────
const RBACTab = () => {
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-5">
      <Section title="Roles" description="Define access levels for admin team members">
        <div className="space-y-2">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelected(selected?.id === role.id ? null : role)}
              className="w-full text-left flex items-center gap-4 px-4 py-3.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group"
            >
              <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${role.color}`}>{role.name}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500">{role.permissions.slice(0, 3).join(', ')}{role.permissions.length > 3 ? ` +${role.permissions.length - 3} more` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-600">{role.members} member{role.members !== 1 ? 's' : ''}</span>
                <ChevronRight className={`w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-transform ${selected?.id === role.id ? 'rotate-90' : ''} transition-all`} />
              </div>
            </button>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>
      </Section>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <Section title={`Permissions: ${selected.name}`} description="Granular access controls for this role">
              <div className="grid grid-cols-2 gap-2">
                {['campaigns.read','campaigns.write','creators.read','creators.write','brands.read','brands.write','payments.read','payments.write','issues.read','issues.write','tasks.read','tasks.write','analytics.read','settings.write','audit.read'].map(perm => {
                  const active = selected.permissions.includes(perm) || selected.permissions.includes('all') || selected.permissions.includes('*.read');
                  return (
                    <div key={perm} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 bg-zinc-800/30 text-zinc-600'}`}>
                      {active ? <Check className="w-3 h-3" /> : <div className="w-3 h-3" />}
                      {perm}
                    </div>
                  );
                })}
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Platform Config Tab ──────────────────────────────────────────────────────
const PlatformTab = () => {
  const [notifs, setNotifs] = useState({
    requireKYC: true, autoEscrow: true, manualReview: false, maintenanceMode: false,
  });

  return (
    <div className="space-y-5">
      <Section title="Fee Structure" description="Platform fee and limits configuration">
        <Field label="Platform Fee" value="12" unit="%" hint="Applied to all campaign payments" />
        <Field label="Creator Payout Fee" value="2.5" unit="%" hint="Tazapay transaction fee" />
        <Field label="Min Campaign Budget" value="500" unit="USD" hint="Minimum campaign escrow amount" />
        <Field label="Max Campaign Budget" value="500000" unit="USD" hint="Hard cap per campaign" />
        <Field label="Escrow Hold Period" value="7" unit="days" hint="Days before auto-release" />
        <Field label="SLA Window (Critical)" value="4" unit="hours" hint="Response time for critical issues" />
      </Section>
      <Section title="Platform Toggles" description="Global feature flags">
        <Toggle2 enabled={notifs.requireKYC} onChange={v => setNotifs(n => ({...n, requireKYC: v}))} label="Require Creator KYC" description="Creators must complete identity verification before payouts" />
        <Toggle2 enabled={notifs.autoEscrow} onChange={v => setNotifs(n => ({...n, autoEscrow: v}))} label="Auto-lock Escrow on Campaign Start" description="Funds locked immediately when campaign goes live" />
        <Toggle2 enabled={notifs.manualReview} onChange={v => setNotifs(n => ({...n, manualReview: v}))} label="Manual Campaign Review" description="All new campaigns require admin approval before launch" />
        <Toggle2 enabled={notifs.maintenanceMode} onChange={v => setNotifs(n => ({...n, maintenanceMode: v}))} label="Maintenance Mode" description="Take platform offline for maintenance (admins only)" />
      </Section>
      <div className="flex justify-end">
        <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors">Save Changes</button>
      </div>
    </div>
  );
};

// ─── Notifications Config ─────────────────────────────────────────────────────
const NotificationsTab = () => {
  const [email, setEmail] = useState({
    newCampaign: true, paymentAlert: true, issueEscalated: true, creatorJoined: false, dailyDigest: true,
  });
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: 'https://hooks.slack.com/services/xxx', event: 'payment.released', active: true },
    { id: 2, url: 'https://api.zapier.com/hooks/catch/xxx', event: 'issue.escalated', active: true },
  ]);

  return (
    <div className="space-y-5">
      <Section title="Email Notifications" description="Admin email alerts configuration">
        <Toggle2 enabled={email.newCampaign} onChange={v => setEmail(e => ({...e, newCampaign: v}))} label="New Campaign Created" description="Alert when a brand creates a new campaign" />
        <Toggle2 enabled={email.paymentAlert} onChange={v => setEmail(e => ({...e, paymentAlert: v}))} label="Payment Alerts" description="Notify on failed or disputed payments" />
        <Toggle2 enabled={email.issueEscalated} onChange={v => setEmail(e => ({...e, issueEscalated: v}))} label="Issue Escalated" description="Immediate alert when an issue is escalated" />
        <Toggle2 enabled={email.creatorJoined} onChange={v => setEmail(e => ({...e, creatorJoined: v}))} label="Creator Joined Campaign" description="Alert when a creator accepts a campaign invite" />
        <Toggle2 enabled={email.dailyDigest} onChange={v => setEmail(e => ({...e, dailyDigest: v}))} label="Daily Platform Digest" description="Summary email every morning at 8am" />
      </Section>
      <Section title="Webhooks" description="POST events to external endpoints">
        <div className="space-y-3">
          {webhooks.map(wh => (
            <div key={wh.id} className="flex items-center gap-3 px-4 py-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
              <Webhook className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-zinc-300 truncate">{wh.url}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{wh.event}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wh.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-600'}`}>
                {wh.active ? 'Active' : 'Paused'}
              </span>
              <button className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Webhook
          </button>
        </div>
      </Section>
    </div>
  );
};

// ─── Payments Config ──────────────────────────────────────────────────────────
const PaymentsConfigTab = () => {
  const [settings, setSettings] = useState({
    autoRelease: true, requireBothSides: true, allowRefund: true, requireReceipt: false,
  });

  return (
    <div className="space-y-5">
      <Section title="Escrow Rules" description="Configure when funds are locked, released, or refunded">
        <Toggle2 enabled={settings.autoRelease} onChange={v => setSettings(s => ({...s, autoRelease: v}))} label="Auto-release After Approval" description="Funds released 24h after content is approved by brand" />
        <Toggle2 enabled={settings.requireBothSides} onChange={v => setSettings(s => ({...s, requireBothSides: v}))} label="Require Dual Confirmation" description="Both creator and brand must confirm completion" />
        <Toggle2 enabled={settings.allowRefund} onChange={v => setSettings(s => ({...s, allowRefund: v}))} label="Allow Brand Refund Requests" description="Brands can request refunds within 7 days of payment" />
        <Toggle2 enabled={settings.requireReceipt} onChange={v => setSettings(s => ({...s, requireReceipt: v}))} label="Require Payment Receipt" description="Generate and send receipt on every transaction" />
      </Section>
      <Section title="Tazapay Settings" description="Payment gateway configuration">
        <Field label="Settlement Currency" value="USD" hint="Primary settlement currency" />
        <Field label="Auto-release Delay" value="24" unit="hours" hint="Hours after approval before auto-release" />
        <Field label="Refund Window" value="7" unit="days" hint="Days brands can request refunds" />
      </Section>
    </div>
  );
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
const AuditTab = () => {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');

  const SEVERITY_COLORS = {
    info:    'text-zinc-400',
    warning: 'text-amber-400',
    error:   'text-red-400',
  };

  const filtered = MOCK_AUDIT.filter(e => {
    if (severity && e.severity !== severity) return false;
    if (search && !e.action.toLowerCase().includes(search.toLowerCase()) && !e.actor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatTime = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors" />
        </div>
        <select value={severity} onChange={e => setSeverity(e.target.value)} className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 focus:outline-none">
          <option value="">All Severity</option>
          {['info', 'warning', 'error'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm transition-colors">
          <Download className="w-4 h-4" />Export
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800/30">
              {['Action', 'Actor', 'Target', 'Severity', 'Time'].map(col => (
                <th key={col} className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="py-3 px-4 text-sm text-white">{log.action}</td>
                <td className="py-3 px-4 text-xs text-zinc-400">{log.actor}</td>
                <td className="py-3 px-4 text-xs text-zinc-500">{log.target}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium capitalize ${SEVERITY_COLORS[log.severity] || 'text-zinc-400'}`}>{log.severity}</span>
                </td>
                <td className="py-3 px-4 text-xs text-zinc-600">{formatTime(log.time)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-zinc-600 text-sm">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Integrations ─────────────────────────────────────────────────────────────
const IntegrationsTab = () => {
  const [showKey, setShowKey] = useState({});

  const INTEGRATIONS = [
    { id: 'tazapay', name: 'Tazapay', description: 'Escrow and payout gateway', status: 'connected', icon: CreditCard, color: 'bg-blue-500/15 border-blue-500/30 text-blue-400', apiKey: 'sk_live_xxx...xxxx' },
    { id: 'sendgrid', name: 'SendGrid', description: 'Transactional email delivery', status: 'connected', icon: Mail, color: 'bg-violet-500/15 border-violet-500/30 text-violet-400', apiKey: 'SG.xxx...xxxx' },
    { id: 'slack', name: 'Slack', description: 'Team notifications via webhook', status: 'disconnected', icon: Bell, color: 'bg-amber-500/15 border-amber-500/30 text-amber-400', apiKey: null },
    { id: 'stripe', name: 'Stripe', description: 'Brand payment collection', status: 'disconnected', icon: CreditCard, color: 'bg-zinc-500/15 border-zinc-700 text-zinc-400', apiKey: null },
  ];

  return (
    <div className="space-y-4">
      {INTEGRATIONS.map(int => {
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
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${int.status === 'connected' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-zinc-700 bg-zinc-800/50 text-zinc-600'}`}>
                  {int.status === 'connected' ? 'Connected' : 'Not Connected'}
                </span>
                <button className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${int.status === 'connected' ? 'text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {int.status === 'connected' ? 'Configure' : 'Connect'}
                </button>
              </div>
            </div>
            {int.status === 'connected' && int.apiKey && (
              <div className="mt-4 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span className="text-xs font-mono text-zinc-600">
                  {showKey[int.id] ? int.apiKey : '••••••••••••'}
                </span>
                <button onClick={() => setShowKey(prev => ({...prev, [int.id]: !prev[int.id]}))} className="text-zinc-700 hover:text-zinc-400 transition-colors ml-1">
                  {showKey[int.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const TAB_MAP = {
  rbac:            RBACTab,
  platform:        PlatformTab,
  notifications:   NotificationsTab,
  'payments-config': PaymentsConfigTab,
  audit:           AuditTab,
  integrations:    IntegrationsTab,
};

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('rbac');
  const ActiveComponent = TAB_MAP[activeTab];

  return (
    <div className="space-y-5 max-w-[1280px]">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Platform configuration, access control, and integrations</p>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminSettingsPage;
