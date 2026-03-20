import React from "react";

/**
 * FormField — Reusable form field with label, input/textarea/select, and hint text.
 */

const inputBaseStyles = {
  background: "var(--bd-surface-input)",
  border: "1px solid var(--bd-border-subtle)",
  color: "var(--bd-text-primary)",
};

const focusClass =
  "outline-none focus:ring-2 focus:ring-[var(--bd-accent)]/20 focus:border-[var(--bd-accent)]";

export const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${focusClass} ${className}`}
    style={inputBaseStyles}
    {...props}
  />
);

export const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea
    rows={rows}
    className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all resize-none ${focusClass} ${className}`}
    style={inputBaseStyles}
    {...props}
  />
);

export const Select = ({ children, className = "", ...props }) => (
  <select
    className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all appearance-none ${focusClass} ${className}`}
    style={inputBaseStyles}
    {...props}
  >
    {children}
  </select>
);

const FormField = ({ label, hint, children, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label
        className="block text-sm font-medium"
        style={{ color: "var(--bd-text-primary)" }}
      >
        {label}
      </label>
    )}
    {children}
    {hint && (
      <p className="text-xs" style={{ color: "var(--bd-text-muted)" }}>
        {hint}
      </p>
    )}
  </div>
);

export default FormField;
