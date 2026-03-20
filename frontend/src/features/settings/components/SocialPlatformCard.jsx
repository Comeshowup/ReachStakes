import React from "react";
import { ExternalLink, Unlink, Plus, Loader2 } from "lucide-react";

/**
 * SocialPlatformCard — Renders a single social platform with connected/disconnected states.
 */
const SocialPlatformCard = ({
  platform,        // { id, name, icon: Icon, color, bg }
  accounts = [],   // [{ id, username, handle, url }]
  maxAccounts = 5,
  onConnect,
  onDisconnect,
  loading = false,
}) => {
  const { name, icon: Icon, color, bg } = platform;
  const isMaxReached = accounts.length >= maxAccounts;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--bd-surface)",
        border: "1px solid var(--bd-border-subtle)",
        boxShadow: "var(--bd-shadow-sm)",
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="text-base font-medium"
            style={{ color: "var(--bd-text-primary)" }}
          >
            {name}
          </h4>
          <p className="text-xs" style={{ color: "var(--bd-text-secondary)" }}>
            {accounts.length} of {maxAccounts} connected
          </p>
        </div>
      </div>

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <div className="space-y-2 mb-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
              style={{
                background: "var(--bd-surface-input)",
                border: "1px solid var(--bd-border-muted)",
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "var(--bd-success)" }}
                />
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--bd-text-primary)" }}
                  >
                    {account.username}
                  </p>
                  {account.handle && (
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--bd-text-muted)" }}
                    >
                      {account.handle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {account.url && (
                  <a
                    href={account.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "var(--bd-text-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--bd-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--bd-text-muted)")
                    }
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => onDisconnect?.(account.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--bd-text-muted)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--bd-danger)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--bd-text-muted)")
                  }
                  title="Disconnect"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && (
        <div
          className="flex items-center justify-center py-4 px-3 rounded-xl text-sm mb-3"
          style={{
            border: "1px dashed var(--bd-border-default)",
            color: "var(--bd-text-muted)",
          }}
        >
          No account connected
        </div>
      )}

      {/* Connect button */}
      {!isMaxReached && (
        <button
          onClick={onConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            border: "1px dashed var(--bd-border-default)",
            color: "var(--bd-text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--bd-accent)";
            e.currentTarget.style.color = "var(--bd-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--bd-border-default)";
            e.currentTarget.style.color = "var(--bd-text-secondary)";
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {loading ? "Connecting..." : `Connect ${name}`}
        </button>
      )}
    </div>
  );
};

export default SocialPlatformCard;
