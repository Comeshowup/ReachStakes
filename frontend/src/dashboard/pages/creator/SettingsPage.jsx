import React from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { User, Link, CreditCard, Bell, Shield } from "lucide-react";

const tabs = [
  { label: "Profile", path: "/creator/settings/profile", icon: User },
  { label: "Social Accounts", path: "/creator/settings/social", icon: Link },
  { label: "Payment Methods", path: "/creator/settings/payments", icon: CreditCard },
  { label: "Notifications", path: "/creator/settings/notifications", icon: Bell },
  { label: "Security", path: "/creator/settings/security", icon: Shield },
];

const SettingsPage = () => {
  const location = useLocation();

  // Default redirect: /creator/settings → /creator/settings/profile
  if (location.pathname === "/creator/settings") {
    return <Navigate to="/creator/settings/profile" replace />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: "var(--bd-text-primary)" }}
        >
          Settings
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--bd-text-secondary)" }}
        >
          Manage your profile, connected accounts, and preferences
        </p>
      </div>

      <nav
        className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
        style={{
          background: "var(--bd-surface-input)",
          border: "1px solid var(--bd-border-subtle)",
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
            style={({ isActive }) => ({
              background: isActive ? "var(--bd-sidebar-active)" : "transparent",
              color: isActive
                ? "var(--bd-text-primary)"
                : "var(--bd-text-secondary)",
              boxShadow: isActive ? "var(--bd-shadow-active-nav)" : "none",
            })}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
};

export default SettingsPage;
