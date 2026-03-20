import React from "react";
import { Building2, MoreVertical, Pencil, Trash2 } from "lucide-react";

/**
 * PayoutMethodCard — Displays a configured payout method (Stripe-style).
 */
const PayoutMethodCard = ({ method, onEdit, onRemove, isDefault = false }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div
      className="rounded-2xl p-5 relative"
      style={{
        background: "var(--bd-surface)",
        border: isDefault
          ? "1px solid var(--bd-accent)"
          : "1px solid var(--bd-border-subtle)",
        boxShadow: "var(--bd-shadow-sm)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--bd-surface-input)",
              border: "1px solid var(--bd-border-muted)",
            }}
          >
            <Building2
              className="w-5 h-5"
              style={{ color: "var(--bd-text-secondary)" }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--bd-text-primary)" }}
              >
                {method.bankName}
              </p>
              {isDefault && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bd-success-muted)",
                    color: "var(--bd-success)",
                    border: "1px solid var(--bd-success-border)",
                  }}
                >
                  Default
                </span>
              )}
            </div>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--bd-text-secondary)" }}
            >
              •••• {method.accountEnding}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--bd-text-muted)" }}
            >
              {method.country}
            </p>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--bd-text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bd-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded-xl py-1 z-20"
                style={{
                  background: "var(--bd-surface)",
                  border: "1px solid var(--bd-border-subtle)",
                  boxShadow: "var(--bd-shadow-lg)",
                }}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(method);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors"
                  style={{ color: "var(--bd-text-primary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--bd-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove?.(method.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors"
                  style={{ color: "var(--bd-danger)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--bd-danger-muted)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayoutMethodCard;
