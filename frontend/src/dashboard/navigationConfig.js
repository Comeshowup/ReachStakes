import {
  Home,
  Briefcase,
  BarChart3,
  DollarSign,
  Settings,
  Headphones,
  Compass,
  FolderOpen,
  Send,
  CheckCircle,
  Wallet,
  CreditCard,
  FileText,
  Receipt,
  User,
  Link,
  Bell,
  Shield,
} from "lucide-react";

// Data-driven navigation config for the Creator Dashboard.
// The sidebar component renders this directly — no hardcoded nav items.

export const CREATOR_NAV_SECTIONS = [
  {
    id: "main",
    title: null,
    items: [
      { label: "Overview", path: "/creator", icon: Home, end: true },
    ],
  },
  {
    id: "work",
    title: "Work",
    items: [
      {
        label: "Campaigns",
        path: "/creator/campaigns",
        icon: Briefcase,
        children: [
          { label: "Discover", path: "/creator/campaigns/discover", icon: Compass },
          { label: "Active", path: "/creator/campaigns/active", icon: FolderOpen },
          { label: "Submitted", path: "/creator/campaigns/submitted", icon: Send },
          { label: "Completed", path: "/creator/campaigns/completed", icon: CheckCircle },
        ],
      },
      { label: "Analytics", path: "/creator/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    items: [
      {
        label: "Earnings",
        path: "/creator/earnings",
        icon: DollarSign,
        children: [
          { label: "Balance", path: "/creator/earnings", icon: Wallet },
          { label: "Payouts", path: "/creator/earnings/payouts", icon: CreditCard },
          { label: "Invoices", path: "/creator/earnings/invoices", icon: Receipt },
          { label: "Tax Documents", path: "/creator/earnings/tax", icon: FileText },
        ],
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      {
        label: "Settings",
        path: "/creator/settings",
        icon: Settings,
        children: [
          { label: "Profile", path: "/creator/settings/profile", icon: User },
          { label: "Social Accounts", path: "/creator/settings/social", icon: Link },
          { label: "Payment Methods", path: "/creator/settings/payments", icon: CreditCard },
          { label: "Notifications", path: "/creator/settings/notifications", icon: Bell },
          { label: "Security", path: "/creator/settings/security", icon: Shield },
        ],
      },
    ],
  },
];

export const CREATOR_NAV_FOOTER = [
  { label: "Support Center", path: "/creator/support", icon: Headphones },
];

// Legacy route redirects — old path → new path
export const CREATOR_ROUTE_REDIRECTS = {
  "/creator/explore": "/creator/campaigns/discover",
  "/creator/submissions": "/creator/campaigns/active",
  "/creator/video-stats": "/creator/analytics",
  "/creator/profile": "/creator/settings/profile",
  "/creator/social-accounts": "/creator/settings/social",
  "/creator/financials": "/creator/earnings",
  "/creator/invoices": "/creator/earnings/invoices",
  "/creator/documents": "/creator/campaigns",
};
