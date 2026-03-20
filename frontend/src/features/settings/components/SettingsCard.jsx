import React from "react";

/**
 * SettingsCard — Reusable card wrapper for settings pages.
 * Renders a titled card with optional description and action slot.
 */
const SettingsCard = ({ title, description, action, children, className = "" }) => (
  <div
    className={`rounded-2xl p-6 ${className}`}
    style={{
      background: "var(--bd-surface)",
      border: "1px solid var(--bd-border-subtle)",
      boxShadow: "var(--bd-shadow-sm)",
    }}
  >
    {(title || action) && (
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          {title && (
            <h3
              className="text-lg font-medium"
              style={{ color: "var(--bd-text-primary)" }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className="text-sm mt-1"
              style={{ color: "var(--bd-text-secondary)" }}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default SettingsCard;
