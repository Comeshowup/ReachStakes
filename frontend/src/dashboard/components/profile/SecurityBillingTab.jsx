import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    CreditCard,
    Building2,
    Lock,
    Mail,
    Key,
    Smartphone,
    Monitor,
    AlertCircle,
    Trash2,
    Upload,
    FileCheck,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import SectionCard from "./SectionCard";
import SettingsField from "./SettingsField";

const KYC_STATUS_MAP = {
    verified: { label: "Verified", className: "bp-badge--verified", Icon: CheckCircle },
    pending: { label: "Under Review", className: "bp-badge--pending", Icon: Clock },
    rejected: { label: "Rejected", className: "status-pill--danger", Icon: XCircle },
    none: { label: "Not Submitted", className: "bp-badge--unverified", Icon: AlertCircle },
};

const SecurityBillingTab = ({ profile, onDeleteAccount, onSave }) => {
    const [twoFaEnabled, setTwoFaEnabled] = useState(false);
    const [autoTopup, setAutoTopup] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [savingPassword, setSavingPassword] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [escrowPercent, setEscrowPercent] = useState(profile?.defaultEscrowPercent || "100");
    const [taxId, setTaxId] = useState(profile?.taxId || "");

    const userRole = profile?.role || "owner";
    const isOwner = userRole === "owner";

    const kycStatus = profile?.kycStatus || "none";
    const kycState = KYC_STATUS_MAP[kycStatus] || KYC_STATUS_MAP.none;

    const handlePasswordChange = async () => {
        const errors = {};
        if (!passwordForm.current) errors.current = "Current password required";
        if (!passwordForm.new || passwordForm.new.length < 8) errors.new = "Minimum 8 characters";
        if (passwordForm.new !== passwordForm.confirm) errors.confirm = "Passwords don't match";
        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }
        setSavingPassword(true);
        setPasswordErrors({});
        setTimeout(() => {
            setSavingPassword(false);
            setPasswordForm({ current: "", new: "", confirm: "" });
        }, 1500);
    };

    return (
        <div className="bp-tab-content" role="tabpanel" id="panel-security" aria-labelledby="tab-security">
            {/* Account Security */}
            <SectionCard icon={Shield} title="Account Security" subtitle="Manage your login credentials">
                <SettingsField
                    label="Email Address"
                    hint="Primary login email"
                    type="display"
                    value={profile?.contact?.email || profile?.email || "—"}
                />
                <SettingsField
                    label="Current Password"
                    type="password"
                    value={passwordForm.current}
                    onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                    placeholder="Enter current password"
                    error={passwordErrors.current}
                />
                <SettingsField
                    label="New Password"
                    type="password"
                    value={passwordForm.new}
                    onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                    placeholder="Enter new password"
                    error={passwordErrors.new}
                    hint="Minimum 8 characters"
                />
                <SettingsField
                    label="Confirm Password"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Re-enter new password"
                    error={passwordErrors.confirm}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "var(--bd-space-3)" }}>
                    <button
                        className="bp-btn bp-btn--primary bp-btn--sm"
                        onClick={handlePasswordChange}
                        disabled={savingPassword}
                    >
                        <Key style={{ width: 14, height: 14 }} />
                        {savingPassword ? "Updating..." : "Update Password"}
                    </button>
                </div>

                <div style={{ borderTop: "1px solid var(--bd-border-muted)", marginTop: "var(--bd-space-4)", paddingTop: "var(--bd-space-4)" }}>
                    <SettingsField
                        label="Two-Factor Authentication"
                        hint="Add an extra layer of security"
                        type="toggle"
                        checked={twoFaEnabled}
                        onToggle={() => setTwoFaEnabled(!twoFaEnabled)}
                    />
                </div>

                <div style={{ borderTop: "1px solid var(--bd-border-muted)", marginTop: "var(--bd-space-4)", paddingTop: "var(--bd-space-4)" }}>
                    <div style={{
                        fontSize: "var(--bd-font-size-xs)",
                        fontWeight: "var(--bd-font-weight-medium)",
                        color: "var(--bd-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "var(--bd-space-3)"
                    }}>
                        Active Sessions
                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--bd-space-3)",
                        padding: "var(--bd-space-3) var(--bd-space-4)",
                        background: "var(--bd-bg-tertiary)",
                        borderRadius: "var(--bd-radius-lg)"
                    }}>
                        <Monitor style={{ width: 16, height: 16, color: "var(--bd-text-secondary)" }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-medium)", color: "var(--bd-text-primary)" }}>
                                Current Session
                            </div>
                            <div style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)" }}>
                                This device • Active now
                            </div>
                        </div>
                        <span className="bp-badge bp-badge--verified" style={{ fontSize: "0.625rem" }}>
                            <CheckCircle style={{ width: 10, height: 10 }} /> Current
                        </span>
                    </div>
                </div>
            </SectionCard>

            {/* Billing & Escrow */}
            <SectionCard icon={CreditCard} title="Billing & Escrow" subtitle="Payment methods and escrow settings">
                <SettingsField
                    label="Default Escrow %"
                    hint="Applied to new campaigns"
                    type={isOwner ? "text" : "display"}
                    value={escrowPercent}
                    onChange={e => setEscrowPercent(e.target.value.replace(/[^0-9]/g, ""))}
                    disabled={!isOwner}
                    placeholder="100"
                />
                <SettingsField
                    label="Payment Method"
                    type="display"
                    value={profile?.paymentMethod || "No payment method added"}
                    hint="Manage in Stripe portal"
                />
                <SettingsField
                    label="Auto Top-up"
                    hint="Automatically fund escrow when balance is low"
                    type="toggle"
                    checked={autoTopup}
                    onToggle={isOwner ? () => setAutoTopup(!autoTopup) : undefined}
                    disabled={!isOwner}
                />
                <SettingsField
                    label="GST / Tax ID"
                    hint="For invoice generation"
                    type={isOwner ? "text" : "display"}
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    disabled={!isOwner}
                    placeholder="Enter Tax ID"
                />
                {!isOwner && (
                    <div style={{
                        marginTop: "var(--bd-space-3)",
                        padding: "var(--bd-space-3) var(--bd-space-4)",
                        background: "var(--bd-info-muted)",
                        borderRadius: "var(--bd-radius-lg)",
                        fontSize: "var(--bd-font-size-xs)",
                        color: "var(--bd-info)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--bd-space-2)"
                    }}>
                        <Lock style={{ width: 14, height: 14 }} />
                        Only account owners can modify billing settings.
                    </div>
                )}
            </SectionCard>

            {/* KYC Verification */}
            <SectionCard
                icon={Building2}
                title="KYC Verification"
                subtitle="Business verification documents"
                action={
                    <span className={`bp-badge ${kycState.className}`}>
                        <kycState.Icon style={{ width: 11, height: 11 }} />
                        {kycState.label}
                    </span>
                }
            >
                <SettingsField
                    label="Company Registration"
                    hint="CIN or registration number"
                    type="text"
                    value={profile?.companyRegistration || ""}
                    placeholder="Enter registration number"
                    disabled={kycStatus === "verified"}
                />
                <SettingsField
                    label="GST Number"
                    hint="Goods and Services Tax ID"
                    type="text"
                    value={profile?.gstNumber || ""}
                    placeholder="Enter GST number"
                    disabled={kycStatus === "verified"}
                />
                <SettingsField
                    label="Verification Documents"
                    hint="Upload supporting documents"
                    type="custom"
                >
                    {kycStatus === "verified" ? (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--bd-space-2)",
                            fontSize: "var(--bd-font-size-sm)",
                            color: "var(--bd-success)"
                        }}>
                            <FileCheck style={{ width: 16, height: 16 }} />
                            Documents verified
                        </div>
                    ) : (
                        <label className="bp-upload" style={{ padding: "var(--bd-space-4)" }}>
                            <Upload style={{ width: 20, height: 20, color: "var(--bd-text-muted)" }} />
                            <span className="bp-upload__text">Upload Documents</span>
                            <span className="bp-upload__hint">PDF, JPG up to 5MB each</span>
                            <input type="file" accept=".pdf,image/jpeg,image/png" multiple hidden />
                        </label>
                    )}
                </SettingsField>
            </SectionCard>

            {/* Danger Zone */}
            <div className="bp-danger-zone">
                <div className="bp-danger-zone__title">
                    <AlertCircle style={{ width: 16, height: 16 }} />
                    Danger Zone
                </div>
                <p className="bp-danger-zone__text">
                    Once you delete your account, there is no going back. All your data including profile information, campaigns, and posts will be permanently removed.
                </p>
                <button className="bp-btn bp-btn--danger" onClick={onDeleteAccount}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                    Delete Account
                </button>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        className="bp-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <motion.div
                            className="bp-modal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bp-modal__header">
                                <h3 className="bp-modal__title">Confirm Changes</h3>
                            </div>
                            <div className="bp-modal__body">
                                Are you sure you want to update your billing settings? This will affect all future campaigns.
                            </div>
                            <div className="bp-modal__footer">
                                <button className="bp-btn bp-btn--ghost" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                                <button className="bp-btn bp-btn--primary" onClick={() => setShowConfirmModal(false)}>Confirm</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SecurityBillingTab;
