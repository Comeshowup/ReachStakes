/**
 * adminNavigationConfig.js
 *
 * Single source of truth for the Admin sidebar.
 * Config-driven — the sidebar component renders this purely declaratively.
 * RBAC-ready: each item can carry a `requiredPermission` field.
 *
 * Shape:
 *   SidebarGroup { id, title, items: SidebarItem[] }
 *   SidebarItem  { label, path, icon, badgeKey?, requiredPermission? }
 */

import {
  LayoutGrid,
  Activity,
  Users,
  Briefcase,
  Target,
  Send,
  FileImage,
  CheckCircle,
  MessageSquare,
  Calendar,
  CheckSquare,
  CreditCard,
  Banknote,
  Vault,
  FileText,
  AlertOctagon,
  Ticket,
  BarChart3,
  Settings,
  ShieldCheck,
  Plug2,
  ScrollText,
} from "lucide-react";

/**
 * @type {Array<{
 *   id: string,
 *   title: string,
 *   items: Array<{
 *     label: string,
 *     path: string,
 *     icon: React.ComponentType,
 *     badgeKey?: string,
 *     requiredPermission?: string,
 *   }>
 * }>}
 */
export const ADMIN_NAV_GROUPS = [
  // ─── OVERVIEW ───────────────────────────────────────────────────────────────
  {
    id: "overview",
    title: "Overview",
    items: [
      { label: "Dashboard",  path: "/admin",          icon: LayoutGrid, end: true },
      { label: "Activity",   path: "/admin/activity", icon: Activity },
    ],
  },

  // ─── NETWORK ────────────────────────────────────────────────────────────────
  {
    id: "network",
    title: "Network",
    items: [
      { label: "Creators", path: "/admin/network/creators", icon: Users },
      { label: "Brands",   path: "/admin/network/brands",   icon: Briefcase },
    ],
  },

  // ─── CAMPAIGNS ──────────────────────────────────────────────────────────────
  {
    id: "campaigns",
    title: "Campaigns",
    items: [
      { label: "Campaigns",    path: "/admin/campaigns",              icon: Target },
      { label: "Invitations",  path: "/admin/campaigns/invitations",  icon: Send },
      { label: "Deliverables", path: "/admin/campaigns/deliverables", icon: FileImage },
      { label: "Approvals",    path: "/admin/campaigns/approvals",    icon: CheckCircle },
    ],
  },

  // ─── OPERATIONS ─────────────────────────────────────────────────────────────
  {
    id: "operations",
    title: "Operations",
    items: [
      { label: "Conversations", path: "/admin/operations/conversations", icon: MessageSquare, badgeKey: "conversations" },
      { label: "Calendar",      path: "/admin/operations/calendar",      icon: Calendar },
      { label: "Tasks",         path: "/admin/operations/tasks",         icon: CheckSquare,   badgeKey: "tasks" },
    ],
  },

  // ─── FINANCE ────────────────────────────────────────────────────────────────
  {
    id: "finance",
    title: "Finance",
    items: [
      { label: "Transactions", path: "/admin/finance/transactions", icon: CreditCard,    requiredPermission: "payments.read" },
      { label: "Payouts",      path: "/admin/finance/payouts",      icon: Banknote,      requiredPermission: "payments.read" },
      { label: "Escrow",       path: "/admin/finance/escrow",       icon: Vault,         requiredPermission: "payments.read" },
      { label: "Invoices",     path: "/admin/finance/invoices",     icon: FileText,      requiredPermission: "payments.read" },
      { label: "Disputes",     path: "/admin/finance/disputes",     icon: AlertOctagon,  requiredPermission: "payments.write" },
    ],
  },

  // ─── RESOLUTION ─────────────────────────────────────────────────────────────
  {
    id: "resolution",
    title: "Resolution",
    items: [
      { label: "Support Tickets", path: "/admin/resolution/tickets", icon: Ticket, badgeKey: "tickets" },
    ],
  },

  // ─── INSIGHTS ───────────────────────────────────────────────────────────────
  {
    id: "insights",
    title: "Insights",
    items: [
      { label: "Analytics", path: "/admin/insights/analytics", icon: BarChart3 },
    ],
  },

  // ─── SYSTEM ─────────────────────────────────────────────────────────────────
  {
    id: "system",
    title: "System",
    items: [
      { label: "Settings",           path: "/admin/system/settings",      icon: Settings,    requiredPermission: "settings.write" },
      { label: "Roles & Permissions", path: "/admin/system/roles",         icon: ShieldCheck, requiredPermission: "settings.write" },
      { label: "Integrations",       path: "/admin/system/integrations",  icon: Plug2,       requiredPermission: "settings.write" },
      { label: "Audit Logs",         path: "/admin/system/audit-logs",    icon: ScrollText,  requiredPermission: "audit.read" },
    ],
  },
];

/**
 * Maps badge keys to their display in the sidebar.
 * The AdminLayout fetches live badge counts from the server and
 * distributes them using these keys.
 *
 * badgeKey → property in the fetchNavBadges() response
 */
export const ADMIN_BADGE_KEY_MAP = {
  conversations: "unreadMessages",
  tasks:         "pendingTasks",
  tickets:       "openTickets",
};
