import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    CreditCard,
    Building2,
    Lock,
    Key,
    Monitor,
    AlertCircle,
    Trash2,
    Upload,
    FileCheck,
    CheckCircle,
    Clock,
    XCircle,
    Smartphone,
    Info
} from "lucide-react";
import SectionCard from "./SectionCard";
import SettingsField from "./SettingsField";
import ConfirmationModal from "./ConfirmationModal";

/* ── KYC Status Map ── */
const KYC_STATUS_MAP = {
    verified: { label: "Verified", cls: "bp-badge--verified", Icon: CheckCircle },
    pending: { label: "Under Review", cls: "bp-badge--pending", Icon: Clock },
    rejected: { label: "Rejected", cls: "bp-badge--unverified", Icon: XCircle },
    none: { label: "Not Submitted", cls: "bp-badge--unverified", Icon: AlertCircle },
};

/* ── Owner-only tooltip ── */
const OwnerOnlyHint = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--bd-space-2)",
        padding: "var(--bd-space-3) var(--bd-space-4)",
        background: "var(--bd-bg-tertiary)",
        borderRadius: "var(--bd-radius-lg)",
        fontSize: "var(--bd-font-size-xs)",
        color: "var(--bd-text-secondary)",
        marginTop: "var(--bd-space-3)",
        border: "1px solid var(--bd-border-subtle)"
    }}>
        <Lock style={{ width: 13, height: 13, flexShrink: 0, color: "var(--bd-text-muted)" }} />
        Only account owners can modify billing and compliance settings.
    </div>
);

const SecurityBillingTab = ({ profile, onDeleteAccount, onSave }) => {
    /* ── Password ── */
    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [pwErrors, setPwErrors] = useState({});
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);

    /* ── 2FA ── */
    const [twoFa, setTwoFa] = useState(false);
    const [show2faModal, setShow2faModal] = useState(false);

    /* ── Billing ── */
    const isOwner = (profile?.role || "owner") === "owner";
    const [escrow, setEscrow] = useState(String(profile?.defaultEscrowPercent ?? "100"));
    const [autoTopup, setAutoTopup] = useState(false);
    const [taxId, setTaxId] = useState(profile?.taxId || "");
    const [billingDirty, setBillingDirty] = useState(false);
    const [showBillingConfirm, setShowBillingConfirm] = useState(false);
    const [billingSaving, setBillingSaving] = useState(false);

    /* ── KYC ── */
    const kycStatus = profile?.kycStatus || "none";
    const kyc = KYC_STATUS_MAP[kycStatus] || KYC_STATUS_MAP.none;
    const [companyReg, setCompanyReg] = useState(profile?.companyRegistration || "");
    const [gstNum, setGstNum] = useState(profile?.gstNumber || "");

    /* ── Delete ── */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    /* ── Password handler ── */
    const handleUpdatePassword = async () => {
        const errs = {};
        if (!pwForm.current) errs.current = "Required";
        if (!pwForm.next || pwForm.next.length < 8) errs.next = "Minimum 8 characters";
        if (pwForm.next !== pwForm.confirm) errs.confirm = "Passwords don't match";
        if (Object.keys(errs).length) { setPwErrors(errs); return; }
        setPwSaving(true);
        setPwErrors({});
        await new Promise(r => setTimeout(r, 1200));
        setPwSaving(false);
        setPwSuccess(true);
        setPwForm({ current: "", next: "", confirm: "" });
        setTimeout(() => setPwSuccess(false), 3000);
    };

    /* ── Billing save ── */
    const handleBillingSave = async () => {
        setBillingSaving(true);
        try {
            await onSave({ defaultEscrowPercent: Number(escrow), taxId, autoTopup });
            setBillingDirty(false);
        } catch (e) {
            console.error(e);
        } finally {
            setBillingSaving(false);
            setShowBillingConfirm(false);
        }
    };

    /* ── Delete handler ── */
    const handleDelete = async () => {
        setDeleteLoading(true);
        try { await onDeleteAccount(); } finally { setDeleteLoading(false); }
    };

    return (
        <div className="bp-tab-content" role="tabpanel" id="panel-security" aria-labelledby="tab-security">

            {/* ── 1. Account Security ── */}
            <SectionCard
                icon={Shield}
                title="Account Security"
                subtitle="Login credentials and access control"
            >
                {/* Email — read-only */}
                <SettingsField
                    label="Email Address"
                    hint="Primary login — contact support to change"
                    type="display"
                    value={profile?.contact?.email || profile?.email || "—"}
                />

                {/* Password change */}
                <div style={{ borderTop: "1px solid var(--bd-border-muted)", marginTop: "var(--bd-space-4)", paddingTop: "var(--bd-space-4)" }}>
                    <p style={{ fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-4)" }}>
                        Change Password
                    </p>
                    <SettingsField
                        label="Current Password"
                        type="password"
                        value={pwForm.current}
                        onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                        placeholder="Enter current password"
                        error={pwErrors.current}
                    />
                    <SettingsField
                        label="New Password"
                        type="password"
                        value={pwForm.next}
                        onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                        placeholder="Minimum 8 characters"
                        error={pwErrors.next}
                        hint="At least 8 characters"
                    />
                    <SettingsField
                        label="Confirm Password"
                        type="password"
                        value={pwForm.confirm}
                        onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                        placeholder="Re-enter new password"
                        error={pwErrors.confirm}
                    />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--bd-space-3)", paddingTop: "var(--bd-space-3)" }}>
                        {pwSuccess && (
                            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--bd-font-size-xs)", color: "var(--bd-success)" }}>
                                <CheckCircle style={{ width: 14, height: 14 }} /> Password updated
                            </span>
                        )}
                        <button className="bp-btn bp-btn--primary bp-btn--sm" onClick={handleUpdatePassword} disabled={pwSaving}>
                            <Key style={{ width: 13, height: 13 }} />
                            {pwSaving ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </div>

                {/* 2FA */}
                <div style={{ borderTop: "1px solid var(--bd-border-muted)", marginTop: "var(--bd-space-4)", paddingTop: "var(--bd-space-4)" }}>
                    <SettingsField
                        label="Two-Factor Authentication"
                        hint={twoFa ? "2FA is active — your account is protected" : "Strongly recommended for financial accounts"}
                        type="toggle"
                        checked={twoFa}
                        onToggle={() => setShow2faModal(true)}
                    />
                </div>

                {/* Sessions */}
                <div style={{ borderTop: "1px solid var(--bd-border-muted)", marginTop: "var(--bd-space-4)", paddingTop: "var(--bd-space-4)" }}>
                    <p style={{ fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-3)" }}>
                        Active Sessions
                    </p>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--bd-space-3)",
                        padding: "var(--bd-space-3) var(--bd-space-4)",
                        background: "var(--bd-bg-tertiary)",
                        borderRadius: "var(--bd-radius-lg)",
                        border: "1px solid var(--bd-border-subtle)"
                    }}>
                        <Monitor style={{ width: 16, height: 16, color: "var(--bd-text-secondary)", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-medium)", color: "var(--bd-text-primary)" }}>
                                Current device
                            </div>
                            <div style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)" }}>
                                Active now
                            </div>
                        </div>
                        <span className="bp-badge bp-badge--verified" style={{ fontSize: "0.625rem" }}>
                            <CheckCircle style={{ width: 10, height: 10 }} /> Current
                        </span>
                    </div>
                </div>
            </SectionCard>

            {/* ── 2. Payment & Escrow ── */}
            <SectionCard
                icon={CreditCard}
                title="Payment & Escrow"
                subtitle="Funding settings and payment methods"
            >
                <SettingsField
                    label="Default Escrow %"
                    hint="Applied automatically to all new campaigns"
                    type={isOwner ? "text" : "display"}
                    value={escrow}
                    onChange={e => { setEscrow(e.target.value.replace(/[^0-9]/g, "")); setBillingDirty(true); }}
                    disabled={!isOwner}
                    placeholder="100"
                />
                <SettingsField
                    label="Payment Method"
                    type="display"
                    value={profile?.paymentMethod || "No payment method on file"}
                    hint="Manage via Stripe billing portal"
                />
                <SettingsField
                    label="Auto Top-up"
                    hint="Automatically refill escrow when balance drops below threshold"
                    type="toggle"
                    checked={autoTopup}
                    onToggle={isOwner ? () => { setAutoTopup(v => !v); setBillingDirty(true); } : undefined}
                    disabled={!isOwner}
                />
                <SettingsField
                    label="Tax ID / GST"
                    hint="Appears on tax invoices"
                    type={isOwner ? "text" : "display"}
                    value={taxId}
                    onChange={e => { setTaxId(e.target.value); setBillingDirty(true); }}
                    disabled={!isOwner}
                    placeholder="Enter GST or Tax ID"
                />

                {isOwner && billingDirty && (
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "var(--bd-space-3)" }}>
                        <button
                            className="bp-btn bp-btn--primary bp-btn--sm"
                            onClick={() => setShowBillingConfirm(true)}
                            disabled={billingSaving}
                        >
                            Save Billing Settings
                        </button>
                    </div>
                )}

                {!isOwner && <OwnerOnlyHint />}
            </SectionCard>

            {/* ── 3. Compliance / KYC ── */}
            <SectionCard
                icon={Building2}
                title="Compliance"
                subtitle="KYC verification and business documents"
                action={
                    <span className={`bp-badge ${kyc.cls}`}>
                        <kyc.Icon style={{ width: 11, height: 11 }} />
                        {kyc.label}
                    </span>
                }
            >
                <SettingsField
                    label="Company Registration"
                    hint="CIN / business registration number"
                    type="text"
                    value={companyReg}
                    onChange={e => setCompanyReg(e.target.value)}
                    placeholder="Enter registration number"
                    disabled={kycStatus === "verified" || !isOwner}
                />
                <SettingsField
                    label="GST Number"
                    hint="Goods and Services Tax identification"
                    type="text"
                    value={gstNum}
                    onChange={e => setGstNum(e.target.value)}
                    placeholder="Enter GST number"
                    disabled={kycStatus === "verified" || !isOwner}
                />
                <SettingsField
                    label="Verification Documents"
                    hint="Supporting business identity documents"
                    type="custom"
                >
                    {kycStatus === "verified" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--bd-space-2)", fontSize: "var(--bd-font-size-sm)", color: "var(--bd-success)" }}>
                            <FileCheck style={{ width: 16, height: 16 }} />
                            Identity verified
                        </div>
                    ) : kycStatus === "pending" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--bd-space-2)", fontSize: "var(--bd-font-size-sm)", color: "var(--bd-warning)" }}>
                            <Clock style={{ width: 16, height: 16 }} />
                            Documents under review — usually 1–2 business days
                        </div>
                    ) : (
                        <label className="bp-upload" style={{ padding: "var(--bd-space-4)" }}>
                            <Upload style={{ width: 20, height: 20, color: "var(--bd-text-muted)" }} />
                            <span className="bp-upload__text">Upload Documents</span>
                            <span className="bp-upload__hint">PDF, JPG, PNG — up to 5MB each</span>
                            <input type="file" accept=".pdf,image/jpeg,image/png" multiple hidden />
                        </label>
                    )}
                </SettingsField>

                {!isOwner && <OwnerOnlyHint />}
            </SectionCard>

            {/* ── Danger Zone ── */}
            <div className="bp-danger-zone">
                <div className="bp-danger-zone__title">
                    <AlertCircle style={{ width: 15, height: 15 }} />
                    Danger Zone
                </div>
                <p className="bp-danger-zone__text">
                    Permanently deletes your account, all profile data, campaigns, and posts. This cannot be undone.
                </p>
                <button className="bp-btn bp-btn--danger bp-btn--sm" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 style={{ width: 13, height: 13 }} />
                    Delete Account
                </button>
            </div>

            {/* ── 2FA Confirmation Modal ── */}
            <ConfirmationModal
                isOpen={show2faModal}
                icon={Smartphone}
                title={twoFa ? "Disable Two-Factor Auth?" : "Enable Two-Factor Auth?"}
                description={
                    twoFa
                        ? "Disabling 2FA reduces your account security. Billing and escrow operations will only be protected by your password."
                        : "You'll receive a verification code on your phone each time you log in. Highly recommended for accounts with active escrow."
                }
                confirmLabel={twoFa ? "Yes, Disable 2FA" : "Enable 2FA"}
                onConfirm={() => { setTwoFa(v => !v); setShow2faModal(false); }}
                onCancel={() => setShow2faModal(false)}
                variant={twoFa ? "danger" : "default"}
            />

            {/* ── Billing Confirmation Modal ── */}
            <ConfirmationModal
                isOpen={showBillingConfirm}
                icon={CreditCard}
                title="Save Billing Settings?"
                description="These changes will apply to all future campaigns. Existing campaigns will not be affected."
                confirmLabel="Save Changes"
                onConfirm={handleBillingSave}
                onCancel={() => setShowBillingConfirm(false)}
                isLoading={billingSaving}
            />

            {/* ── Delete Account Modal ── */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                icon={Trash2}
                title="Delete Account?"
                description="This will permanently remove your account, all campaigns, posts, and profile data. Escrow funds will be returned. This action cannot be undone."
                confirmLabel="Delete My Account"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                isLoading={deleteLoading}
                variant="danger"
            />
        </div>
    );
};

export default SecurityBillingTab;
