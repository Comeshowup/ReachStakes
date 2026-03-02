import React from "react";
import { motion } from "framer-motion";
import {
    Fingerprint,
    BarChart3,
    ShieldCheck,
    Users,
    Plug
} from "lucide-react";

const TABS = [
    { id: "identity", label: "Identity", Icon: Fingerprint },
    { id: "performance", label: "Performance", Icon: BarChart3 },
    { id: "security", label: "Security & Billing", Icon: ShieldCheck },
    { id: "team", label: "Team Access", Icon: Users },
    { id: "integrations", label: "Integrations", Icon: Plug },
];

const ProfileTabs = ({ activeTab, onTabChange }) => (
    <nav className="bp-tabs" role="tablist" aria-label="Profile sections">
        {TABS.map(({ id, label, Icon }) => (
            <button
                key={id}
                className={`bp-tab ${activeTab === id ? "bp-tab--active" : ""}`}
                onClick={() => onTabChange(id)}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
            >
                <Icon className="bp-tab__icon" />
                {label}
            </button>
        ))}
    </nav>
);

export default ProfileTabs;
