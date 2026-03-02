import React, { useState } from "react";
import {
    Plug,
    ShoppingBag,
    Megaphone,
    BarChart3,
    Webhook,
    ExternalLink,
    CheckCircle,
    XCircle,
    RefreshCw,
    Copy,
    Check
} from "lucide-react";
import SectionCard from "./SectionCard";

const INTEGRATIONS = [
    {
        id: "meta",
        name: "Meta Ads",
        description: "Facebook & Instagram advertising",
        Icon: Megaphone,
        color: "#1877F2",
        bgColor: "rgba(24, 119, 242, 0.08)",
    },
    {
        id: "google",
        name: "Google Ads",
        description: "Search & display advertising",
        Icon: BarChart3,
        color: "#4285F4",
        bgColor: "rgba(66, 133, 244, 0.08)",
    },
    {
        id: "shopify",
        name: "Shopify",
        description: "E-commerce & product data",
        Icon: ShoppingBag,
        color: "#96BF48",
        bgColor: "rgba(150, 191, 72, 0.08)",
    },
    {
        id: "webhook",
        name: "Webhook",
        description: "Custom event notifications",
        Icon: Webhook,
        color: "var(--bd-text-secondary)",
        bgColor: "var(--bd-bg-secondary)",
    },
];

const IntegrationsTab = () => {
    const [connections, setConnections] = useState({
        meta: { connected: false, lastSync: null },
        google: { connected: false, lastSync: null },
        shopify: { connected: false, lastSync: null },
        webhook: { connected: false, lastSync: null, endpoint: "" },
    });
    const [webhookEndpoint, setWebhookEndpoint] = useState("");
    const [copied, setCopied] = useState(false);

    const toggleConnection = (id) => {
        setConnections(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                connected: !prev[id].connected,
                lastSync: !prev[id].connected ? new Date().toISOString() : null,
            }
        }));
    };

    const formatLastSync = (iso) => {
        if (!iso) return null;
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleCopyEndpoint = () => {
        const endpoint = "https://api.reachstakes.com/webhooks/brand/inbound";
        navigator.clipboard.writeText(endpoint);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bp-tab-content" role="tabpanel" id="panel-integrations" aria-labelledby="tab-integrations">
            <SectionCard icon={Plug} title="Connected Services" subtitle="Manage your third-party integrations">
                <div className="bp-integrations-grid">
                    {INTEGRATIONS.map(({ id, name, description, Icon, color, bgColor }) => {
                        const conn = connections[id];
                        return (
                            <div key={id} className="bp-integration">
                                <div
                                    className="bp-integration__logo"
                                    style={{ background: bgColor, color }}
                                >
                                    <Icon style={{ width: 20, height: 20 }} />
                                </div>
                                <div className="bp-integration__info">
                                    <div className="bp-integration__name">{name}</div>
                                    <div className="bp-integration__status">
                                        {conn.connected ? (
                                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--bd-success)", fontSize: "var(--bd-font-size-xs)" }}>
                                                <CheckCircle style={{ width: 12, height: 12 }} />
                                                Connected
                                                {conn.lastSync && (
                                                    <span style={{ color: "var(--bd-text-muted)", marginLeft: 4 }}>
                                                        • {formatLastSync(conn.lastSync)}
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--bd-font-size-xs)" }}>
                                                {description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bp-integration__action">
                                    <button
                                        className={`bp-btn bp-btn--sm ${conn.connected ? "bp-btn--ghost" : "bp-btn--secondary"}`}
                                        onClick={() => toggleConnection(id)}
                                    >
                                        {conn.connected ? (
                                            <>
                                                <XCircle style={{ width: 14, height: 14 }} />
                                                Disconnect
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink style={{ width: 14, height: 14 }} />
                                                Connect
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Webhook Endpoint */}
            <SectionCard icon={Webhook} title="Webhook Endpoint" subtitle="Receive real-time event notifications">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--bd-space-3)" }}>
                    <div style={{
                        fontSize: "var(--bd-font-size-xs)",
                        fontWeight: "var(--bd-font-weight-medium)",
                        color: "var(--bd-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em"
                    }}>
                        Your Inbound Endpoint
                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--bd-space-2)",
                        padding: "var(--bd-space-3) var(--bd-space-4)",
                        background: "var(--bd-bg-tertiary)",
                        borderRadius: "var(--bd-radius-lg)",
                        border: "1px solid var(--bd-border-subtle)"
                    }}>
                        <code style={{
                            flex: 1,
                            fontSize: "var(--bd-font-size-xs)",
                            fontFamily: "var(--bd-font-mono)",
                            color: "var(--bd-text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}>
                            https://api.reachstakes.com/webhooks/brand/inbound
                        </code>
                        <button
                            className="bp-btn bp-btn--ghost bp-btn--sm"
                            onClick={handleCopyEndpoint}
                            aria-label="Copy endpoint"
                        >
                            {copied ? (
                                <Check style={{ width: 14, height: 14, color: "var(--bd-success)" }} />
                            ) : (
                                <Copy style={{ width: 14, height: 14 }} />
                            )}
                        </button>
                    </div>
                    <p style={{
                        fontSize: "var(--bd-font-size-xs)",
                        color: "var(--bd-text-muted)",
                        lineHeight: 1.5
                    }}>
                        Events include: campaign.created, campaign.funded, submission.received, payment.completed
                    </p>
                </div>
            </SectionCard>
        </div>
    );
};

export default IntegrationsTab;
