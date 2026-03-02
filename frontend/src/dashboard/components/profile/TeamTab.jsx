import React, { useState } from "react";
import {
    Users,
    UserPlus,
    Mail,
    Trash2,
    Shield,
    Crown,
    Eye,
    BarChart3,
    CreditCard
} from "lucide-react";
import SectionCard from "./SectionCard";
import EmptyState from "./EmptyState";

const ROLES = [
    { value: "owner", label: "Owner", Icon: Crown },
    { value: "admin", label: "Admin", Icon: Shield },
    { value: "campaign_manager", label: "Campaign Manager", Icon: BarChart3 },
    { value: "finance", label: "Finance", Icon: CreditCard },
    { value: "viewer", label: "Viewer", Icon: Eye },
];

const MOCK_MEMBERS = [
    { id: 1, name: "You", email: "you@company.com", role: "owner", isCurrentUser: true },
];

const TeamTab = ({ profile }) => {
    const [members, setMembers] = useState(MOCK_MEMBERS);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("viewer");
    const [inviteError, setInviteError] = useState("");

    const currentUserRole = "owner";
    const canManage = currentUserRole === "owner" || currentUserRole === "admin";

    const handleInvite = () => {
        if (!inviteEmail.trim()) {
            setInviteError("Email is required");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
            setInviteError("Enter a valid email");
            return;
        }
        if (members.some(m => m.email === inviteEmail)) {
            setInviteError("Already a team member");
            return;
        }
        setMembers(prev => [
            ...prev,
            {
                id: Date.now(),
                name: inviteEmail.split("@")[0],
                email: inviteEmail,
                role: inviteRole,
                isCurrentUser: false
            }
        ]);
        setInviteEmail("");
        setInviteRole("viewer");
        setInviteError("");
    };

    const handleRoleChange = (id, newRole) => {
        setMembers(prev =>
            prev.map(m => m.id === id ? { ...m, role: newRole } : m)
        );
    };

    const handleRemove = (id) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="bp-tab-content" role="tabpanel" id="panel-team" aria-labelledby="tab-team">
            <SectionCard
                icon={Users}
                title="Team Members"
                subtitle={`${members.length} member${members.length !== 1 ? "s" : ""}`}
            >
                {/* Invite Form */}
                {canManage && (
                    <div className="bp-invite-form" style={{ marginBottom: "var(--bd-space-5)" }}>
                        <div className="bp-invite-form__input" style={{ flex: 1 }}>
                            <input
                                className={`bp-field__input ${inviteError ? "bp-field__input--error" : ""}`}
                                type="email"
                                value={inviteEmail}
                                onChange={e => { setInviteEmail(e.target.value); setInviteError(""); }}
                                placeholder="colleague@company.com"
                                aria-label="Invite email"
                                onKeyDown={e => e.key === "Enter" && handleInvite()}
                            />
                            {inviteError && <div className="bp-field__error">{inviteError}</div>}
                        </div>
                        <select
                            className="bp-select"
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                            aria-label="Select role"
                        >
                            {ROLES.filter(r => r.value !== "owner").map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <button className="bp-btn bp-btn--primary bp-btn--sm" onClick={handleInvite}>
                            <UserPlus style={{ width: 14, height: 14 }} />
                            Invite
                        </button>
                    </div>
                )}

                {/* Member List */}
                {members.length > 0 ? (
                    <div className="bp-team-list">
                        {members.map(member => {
                            const roleInfo = ROLES.find(r => r.value === member.role) || ROLES[4];
                            return (
                                <div key={member.id} className="bp-team-row">
                                    <div className="bp-team-row__avatar">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="bp-team-row__info">
                                        <div className="bp-team-row__name">
                                            {member.name}
                                            {member.isCurrentUser && (
                                                <span style={{
                                                    fontSize: "var(--bd-font-size-xs)",
                                                    color: "var(--bd-text-muted)",
                                                    marginLeft: "var(--bd-space-2)"
                                                }}>(you)</span>
                                            )}
                                        </div>
                                        <div className="bp-team-row__email">{member.email}</div>
                                    </div>
                                    <div className="bp-team-row__role">
                                        {member.isCurrentUser || !canManage ? (
                                            <span className="bp-badge bp-badge--verified" style={{ fontSize: "0.625rem" }}>
                                                <roleInfo.Icon style={{ width: 10, height: 10 }} />
                                                {roleInfo.label}
                                            </span>
                                        ) : (
                                            <select
                                                className="bp-select"
                                                value={member.role}
                                                onChange={e => handleRoleChange(member.id, e.target.value)}
                                                aria-label={`Role for ${member.name}`}
                                            >
                                                {ROLES.filter(r => r.value !== "owner").map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div className="bp-team-row__actions">
                                        {!member.isCurrentUser && canManage && (
                                            <button
                                                className="bp-btn bp-btn--ghost bp-btn--sm"
                                                onClick={() => handleRemove(member.id)}
                                                aria-label={`Remove ${member.name}`}
                                                style={{ color: "var(--bd-danger)" }}
                                            >
                                                <Trash2 style={{ width: 14, height: 14 }} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon={Users}
                        title="No team members yet"
                        description="Invite your team to collaborate on campaigns and manage your brand."
                    />
                )}
            </SectionCard>

            {/* Role Permissions Info */}
            <SectionCard icon={Shield} title="Role Permissions" subtitle="What each role can access">
                <div style={{ display: "grid", gap: "var(--bd-space-3)" }}>
                    {ROLES.map(({ value, label, Icon }) => (
                        <div key={value} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--bd-space-3)",
                            padding: "var(--bd-space-3)",
                            background: "var(--bd-bg-tertiary)",
                            borderRadius: "var(--bd-radius-lg)"
                        }}>
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: "var(--bd-radius-md)",
                                background: "var(--bd-bg-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Icon style={{ width: 14, height: 14, color: "var(--bd-text-secondary)" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-primary)" }}>
                                    {label}
                                </div>
                                <div style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)" }}>
                                    {value === "owner" && "Full access to all settings, billing, and team management"}
                                    {value === "admin" && "All access except billing and account deletion"}
                                    {value === "campaign_manager" && "Create and manage campaigns, view analytics"}
                                    {value === "finance" && "View billing, invoices, and escrow settings"}
                                    {value === "viewer" && "View-only access to campaigns and analytics"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default TeamTab;
