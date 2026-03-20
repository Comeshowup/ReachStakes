import React from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";

/**
 * SettingsLayout — Wrapper layout for all settings pages.
 * Renders header, Stripe-style tab navigation, and child content.
 */
const TABS = [
  { label: "Profile", path: "/creator/settings/profile" },
  { label: "Social Accounts", path: "/creator/settings/social" },
  { label: "Payouts", path: "/creator/settings/payouts" },
];

const SettingsLayout = () => {
  const location = useLocation();

  // Redirect /creator/settings → /creator/settings/profile
  if (location.pathname === "/creator/settings") {
    return <Navigate to="/creator/settings/profile" replace />;
  }

  return (
    <div className="w-full max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-xl font-semibold tracking-tight"
          style={{ color: "var(--bd-text-primary)" }}
        >
          Settings
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--bd-text-secondary)" }}
        >
          Manage your account and creator profile.
        </p>
      </div>

      {/* Tab Navigation — Stripe-style underline tabs */}
      <nav
        className="flex gap-0 mb-8 overflow-x-auto"
        style={{
          borderBottom: "1px solid var(--bd-border-subtle)",
        }}
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
            style={({ isActive }) => ({
              color: isActive
                ? "var(--bd-text-primary)"
                : "var(--bd-text-secondary)",
            })}
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                    style={{ background: "var(--bd-accent)" }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <Outlet />
    </div>
  );
};

export default SettingsLayout;
