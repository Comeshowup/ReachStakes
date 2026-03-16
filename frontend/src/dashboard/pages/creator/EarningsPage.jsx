import React from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { Wallet, CreditCard, Receipt, FileText } from "lucide-react";

const tabs = [
  { label: "Balance", path: "/creator/earnings", icon: Wallet, end: true },
  { label: "Payouts", path: "/creator/earnings/payouts", icon: CreditCard },
  { label: "Invoices", path: "/creator/earnings/invoices", icon: Receipt },
  { label: "Tax Documents", path: "/creator/earnings/tax", icon: FileText },
];

const EarningsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: "var(--bd-text-primary)" }}
        >
          Earnings
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--bd-text-secondary)" }}
        >
          Track your balance, payouts, and invoices
        </p>
      </div>

      <nav
        className="flex gap-1 p-1 rounded-xl mb-6"
        style={{
          background: "var(--bd-surface-input)",
          border: "1px solid var(--bd-border-subtle)",
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? "var(--bd-sidebar-active)" : "transparent",
              color: isActive
                ? "var(--bd-text-primary)"
                : "var(--bd-text-secondary)",
              boxShadow: isActive ? "var(--bd-shadow-active-nav)" : "none",
            })}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
};

export default EarningsPage;
