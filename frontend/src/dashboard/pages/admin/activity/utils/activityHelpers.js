import {
  Megaphone,
  Wallet,
  AlertCircle,
  Activity,
  UserPlus,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CreditCard,
  FileText,
  Users,
  Zap,
  Bell,
  Settings,
  RefreshCw,
} from "lucide-react";

// ─── Event Type → label + icon + accent color ────────────────────────────────
export const EVENT_TYPE_MAP = {
  "campaign.created": {
    label: "Campaign Created",
    icon: Megaphone,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  "campaign.approved": {
    label: "Campaign Approved",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  "campaign.paused": {
    label: "Campaign Paused",
    icon: Megaphone,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  "campaign.completed": {
    label: "Campaign Completed",
    icon: CheckCircle2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  "campaign.rejected": {
    label: "Campaign Rejected",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  "creator.invited": {
    label: "Creator Invited",
    icon: UserPlus,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  "creator.joined": {
    label: "Creator Joined",
    icon: Users,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  "payout.completed": {
    label: "Payout Completed",
    icon: Wallet,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  "payout.failed": {
    label: "Payout Failed",
    icon: Wallet,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  "payout.initiated": {
    label: "Payout Initiated",
    icon: CreditCard,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  "system.error": {
    label: "System Error",
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  "system.maintenance": {
    label: "System Maintenance",
    icon: Settings,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
  },
  "system.sync": {
    label: "System Sync",
    icon: RefreshCw,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  "admin.action": {
    label: "Admin Action",
    icon: ShieldCheck,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  "admin.ban": {
    label: "User Banned",
    icon: ShieldCheck,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  "invoice.generated": {
    label: "Invoice Generated",
    icon: FileText,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  "notification.sent": {
    label: "Notification Sent",
    icon: Bell,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
  },
};

// Fallback for unknown event types
export const getFallbackType = () => ({
  label: "Unknown Event",
  icon: Activity,
  color: "text-zinc-500",
  bg: "bg-zinc-800",
});

export const getEventConfig = (type) =>
  EVENT_TYPE_MAP[type] || getFallbackType();

// ─── Status config ────────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  success: {
    label: "Success",
    dot: "bg-emerald-500",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    ring: "ring-emerald-500/30",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    ring: "ring-amber-400/30",
  },
  failed: {
    label: "Failed",
    dot: "bg-red-500",
    badge: "text-red-400 bg-red-500/10 border-red-500/20",
    ring: "ring-red-500/30",
  },
  info: {
    label: "Info",
    dot: "bg-zinc-500",
    badge: "text-zinc-400 bg-zinc-700/50 border-zinc-700",
    ring: "ring-zinc-600/30",
  },
};

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.info;

// ─── Actor type labels ────────────────────────────────────────────────────────
export const ACTOR_CONFIG = {
  admin: { label: "Admin", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
  creator: { label: "Creator", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  system: { label: "System", badge: "bg-zinc-500/10 text-zinc-400 border-zinc-700" },
};

// ─── Entity → admin route ─────────────────────────────────────────────────────
export const getEntityRoute = (entity) => {
  if (!entity) return null;
  switch (entity.type) {
    case "campaign":
      return `/admin/campaigns/${entity.id}`;
    case "user":
      return `/admin/network/creators`;
    case "transaction":
      return `/admin/finance/transactions`;
    default:
      return null;
  }
};

// ─── Time formatting ──────────────────────────────────────────────────────────
export const formatRelativeTime = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatFullDate = (isoString) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ─── Date group label for feed ────────────────────────────────────────────────
export const getDateGroupLabel = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

// ─── Filter type options ──────────────────────────────────────────────────────
export const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "campaign.created", label: "Campaign Created" },
  { value: "campaign.approved", label: "Campaign Approved" },
  { value: "campaign.rejected", label: "Campaign Rejected" },
  { value: "campaign.completed", label: "Campaign Completed" },
  { value: "creator.invited", label: "Creator Invited" },
  { value: "creator.joined", label: "Creator Joined" },
  { value: "payout.completed", label: "Payout Completed" },
  { value: "payout.failed", label: "Payout Failed" },
  { value: "payout.initiated", label: "Payout Initiated" },
  { value: "system.error", label: "System Error" },
  { value: "admin.action", label: "Admin Action" },
  { value: "invoice.generated", label: "Invoice Generated" },
];

export const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "All Entities" },
  { value: "campaign", label: "Campaign" },
  { value: "user", label: "User" },
  { value: "transaction", label: "Transaction" },
];

export const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "info", label: "Info" },
];

export const TIME_RANGE_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];
