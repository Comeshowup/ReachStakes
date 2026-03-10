import React from "react";
import { Check, ChevronRight } from "lucide-react";

/**
 * Computes checklist items from profile data.
 * Each item: { key, label, done, tabId, hint }
 */
export const buildChecklist = (profile) => [
    {
        key: "logo",
        label: "Upload brand logo",
        done: !!profile?.logo,
        tabId: "identity",
        hint: "Required for campaign pages",
    },
    {
        key: "story",
        label: "Add brand story",
        done: !!(profile?.tagline || profile?.about),
        tabId: "identity",
        hint: "Boosts creator applications by 3×",
    },
    {
        key: "website",
        label: "Add website link",
        done: !!profile?.socials?.website,
        tabId: "identity",
        hint: "Builds creator trust",
    },
    {
        key: "social",
        label: "Add a social account",
        done: !!(profile?.socials?.instagram || profile?.socials?.linkedin || profile?.socials?.twitter),
        tabId: "identity",
        hint: "Instagram, LinkedIn, or Twitter",
    },
    {
        key: "industry",
        label: "Set industry & location",
        done: !!(profile?.industry && profile?.location),
        tabId: "identity",
        hint: "Helps creators understand your brand",
    },
    {
        key: "mediakit",
        label: "Upload media kit",
        done: !!profile?.mediaKit,
        tabId: "identity",
        hint: "Shared with creators upon campaign acceptance",
    },
    {
        key: "kyc",
        label: "Complete KYC verification",
        done: profile?.kycStatus === "verified",
        tabId: "security",
        hint: "Required to unlock escrow features",
    },
];

/**
 * ProfileCompletionChecklist — actionable profile completeness items.
 * Props:
 *   profile: object — brand profile data
 *   onNavigate: (tabId: string) => void — switch to a tab
 */
const ProfileCompletionChecklist = ({ profile, onNavigate }) => {
    const items = buildChecklist(profile);
    const done = items.filter(i => i.done).length;
    const pct = Math.round((done / items.length) * 100);

    if (pct === 100) return null;

    return (
        <div className="bp-checklist" role="complementary" aria-label="Profile completion checklist">
            <div className="bp-checklist__header">
                <div className="bp-checklist__title">
                    <span>Complete Your Profile</span>
                </div>
                <div className="bp-checklist__progress">
                    <div style={{
                        width: 80,
                        height: 4,
                        background: "var(--bd-bg-secondary)",
                        borderRadius: 9999,
                        overflow: "hidden"
                    }}>
                        <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct === 100 ? "var(--bd-success)" : "var(--bd-accent)",
                            borderRadius: 9999,
                            transition: "width 600ms ease"
                        }} />
                    </div>
                    <span className="bp-checklist__count">{done}/{items.length}</span>
                </div>
            </div>

            <div className="bp-checklist__body">
                {items.map(item => (
                    <button
                        key={item.key}
                        className="bp-checklist__item"
                        onClick={() => !item.done && onNavigate(item.tabId)}
                        aria-label={item.done ? `${item.label} — complete` : `${item.label} — ${item.hint}`}
                        tabIndex={item.done ? -1 : 0}
                        style={{ cursor: item.done ? "default" : "pointer" }}
                    >
                        <div className={`bp-checklist__dot ${item.done ? "bp-checklist__dot--done" : ""}`}>
                            {item.done && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                            <div className={`bp-checklist__item-label ${item.done ? "bp-checklist__item-label--done" : ""}`}>
                                {item.label}
                            </div>
                            {!item.done && (
                                <div style={{
                                    fontSize: "0.6875rem",
                                    color: "var(--bd-text-muted)",
                                    marginTop: 1
                                }}>
                                    {item.hint}
                                </div>
                            )}
                        </div>
                        {!item.done && (
                            <span className="bp-checklist__item-action">
                                Fix <ChevronRight style={{ width: 12, height: 12, display: "inline-block", verticalAlign: "middle" }} />
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProfileCompletionChecklist;
