import React, { useState } from "react";
import {
  Wallet,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Unlink,
  Shield,
  Lock,
} from "lucide-react";
import usePayoutMethods from "../hooks/usePayoutMethods";
import payoutService from "../../../api/payoutService";
import OnboardingWizard from "../components/OnboardingWizard";

// ── Country config ───────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "US", label: "United States", currency: "USD" },
  { code: "GB", label: "United Kingdom", currency: "GBP" },
  { code: "IN", label: "India", currency: "INR" },
  { code: "AU", label: "Australia", currency: "AUD" },
  { code: "CA", label: "Canada", currency: "CAD" },
  { code: "DE", label: "Germany", currency: "EUR" },
  { code: "FR", label: "France", currency: "EUR" },
  { code: "NL", label: "Netherlands", currency: "EUR" },
  { code: "SG", label: "Singapore", currency: "SGD" },
  { code: "PH", label: "Philippines", currency: "PHP" },
  { code: "ID", label: "Indonesia", currency: "IDR" },
  { code: "TH", label: "Thailand", currency: "THB" },
  { code: "MY", label: "Malaysia", currency: "MYR" },
  { code: "VN", label: "Vietnam", currency: "VND" },
  { code: "BR", label: "Brazil (PIX)", currency: "BRL" },
];

// ── Shared styles ────────────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.85rem",
  borderRadius: "0.625rem",
  fontSize: "0.875rem",
  border: "1px solid var(--bd-border-default)",
  background: "var(--bd-surface-input)",
  color: "var(--bd-text-primary)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  marginBottom: "0.35rem",
  color: "var(--bd-text-secondary)",
};

const cardBase = {
  background: "var(--bd-surface)",
  border: "1px solid var(--bd-border-default)",
  borderRadius: "1rem",
  padding: "1.25rem 1.5rem",
};

const btnPrimary = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.6rem 1.25rem",
  borderRadius: "0.75rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "var(--bd-primary)",
  color: "var(--bd-primary-fg)",
  border: "none",
  boxShadow: "var(--bd-shadow-primary-btn)",
};

// ── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ label, variant = "default" }) => {
  const colors = {
    success: { bg: "var(--bd-success-muted)", fg: "var(--bd-success)" },
    warning: { bg: "var(--bd-warning-muted)", fg: "var(--bd-warning)" },
    default: { bg: "var(--bd-surface-input)", fg: "var(--bd-text-muted)" },
  };
  const { bg, fg } = colors[variant] || colors.default;
  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.15rem 0.55rem",
        borderRadius: "999px",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
};

// ── Manual bank form ─────────────────────────────────────────────────────────

const ManualBankForm = ({ onSuccess, onCancel, connectBank, actionLoading }) => {
  const [form, setForm] = useState({
    country: "",
    currency: "",
    bankName: "",
    accountNumber: "",
    bankCode: "",
    iban: "",
    pixKey: "",
  });
  const [bankFields, setBankFields] = useState(null);
  const [fetchingFields, setFetchingFields] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // When country changes → load bank field config from backend
  const handleCountryChange = async (code) => {
    const country = COUNTRIES.find((c) => c.code === code);
    const currency = country?.currency || "USD";
    setForm({
      country: code,
      currency,
      bankName: "",
      accountNumber: "",
      bankCode: "",
      iban: "",
      pixKey: "",
    });
    setBankFields(null);
    setSubmitError(null);

    if (!code) return;

    setFetchingFields(true);
    try {
      const res = await payoutService.getBankFields(code, currency);
      setBankFields(res.data);
    } catch {
      setBankFields(null);
    } finally {
      setFetchingFields(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      await connectBank({
        country: form.country,
        currency: form.currency,
        bankName: form.bankName || undefined,
        accountNumber: bankFields?.useIban ? undefined : form.accountNumber || undefined,
        bankCode: form.bankCode || undefined,
        bankCodeType: bankFields?.bankCodeType || undefined,
        iban: bankFields?.useIban ? form.iban : undefined,
        pixKey: bankFields?.isPix ? form.pixKey : undefined,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const isPix = bankFields?.isPix;
  const useIban = bankFields?.useIban;
  const countrySelected = !!form.country;

  return (
    <div style={cardBase}>
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
          <Building2 className="w-5 h-5" style={{ color: "var(--bd-primary)" }} />
          <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--bd-text-primary)", margin: 0 }}>
            Connect Bank Account
          </h3>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--bd-text-secondary)", margin: 0 }}>
          Enter your bank details securely. Account numbers are sent directly
          to our payment processor and never stored on our servers.
        </p>
      </div>

      {/* Security notice */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 0.85rem",
          borderRadius: "0.625rem",
          background: "var(--bd-success-muted)",
          border: "1px solid var(--bd-success-border)",
          marginBottom: "1.25rem",
          fontSize: "0.8rem",
          color: "var(--bd-success)",
        }}
      >
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>Secured by Tazapay</strong> — Bank-level encryption.
          Your data is transmitted over TLS and processed securely.
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Country */}
        <div>
          <label style={labelStyle}>Country / Region</label>
          <select
            value={form.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Select your country…</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} ({c.currency})
              </option>
            ))}
          </select>
        </div>

        {/* Loading fields */}
        {fetchingFields && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--bd-text-muted)",
              fontSize: "0.8125rem",
              padding: "0.5rem 0",
            }}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading bank fields…
          </div>
        )}

        {/* Dynamic fields appear after country is selected */}
        {countrySelected && !fetchingFields && (
          <>
            {/* Bank name (not for PIX) */}
            {!isPix && (
              <div>
                <label style={labelStyle}>Bank Name</label>
                <input
                  style={inputStyle}
                  value={form.bankName}
                  onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                  placeholder="e.g. Chase, HDFC, Barclays"
                  required
                  autoComplete="off"
                />
              </div>
            )}

            {/* IBAN for SEPA countries */}
            {useIban && (
              <div>
                <label style={labelStyle}>IBAN</label>
                <input
                  style={inputStyle}
                  value={form.iban}
                  onChange={(e) => setForm((p) => ({ ...p, iban: e.target.value.replace(/\s/g, "").toUpperCase() }))}
                  placeholder="e.g. DE89370400440532013000"
                  required
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            )}

            {/* Regular account number */}
            {!useIban && !isPix && (
              <div>
                <label style={labelStyle}>{bankFields?.accountLabel || "Account Number"}</label>
                <input
                  style={inputStyle}
                  value={form.accountNumber}
                  onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Enter your account number"
                  required
                  autoComplete="off"
                  inputMode="numeric"
                />
              </div>
            )}

            {/* Routing / IFSC / Sort / SWIFT */}
            {!isPix && bankFields?.bankCodeLabel && (
              <div>
                <label style={labelStyle}>{bankFields.bankCodeLabel}</label>
                <input
                  style={inputStyle}
                  value={form.bankCode}
                  onChange={(e) => setForm((p) => ({ ...p, bankCode: e.target.value.toUpperCase() }))}
                  placeholder={`Enter ${bankFields.bankCodeLabel}`}
                  required
                  autoComplete="off"
                />
              </div>
            )}

            {/* PIX key */}
            {isPix && (
              <div>
                <label style={labelStyle}>PIX Key (Email / Phone / CPF)</label>
                <input
                  style={inputStyle}
                  value={form.pixKey}
                  onChange={(e) => setForm((p) => ({ ...p, pixKey: e.target.value }))}
                  placeholder="e.g. email@example.com or CPF number"
                  required
                  autoComplete="off"
                />
              </div>
            )}

            {/* Error */}
            {submitError && (
              <div
                style={{
                  background: "var(--bd-danger-muted)",
                  border: "1px solid var(--bd-danger-border)",
                  borderRadius: "0.625rem",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.8125rem",
                  color: "var(--bd-danger)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  ...btnPrimary,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {actionLoading ? "Connecting…" : "Connect Securely"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={actionLoading}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  color: "var(--bd-text-secondary)",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

// ── PayoutsPage ──────────────────────────────────────────────────────────────

const PayoutsPage = () => {
  const {
    status,
    loading,
    actionLoading,
    error,
    fetchStatus,
    connectBank,
    disconnectBank,
  } = usePayoutMethods();

  const [showForm, setShowForm] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnectError, setDisconnectError] = useState(null);

  const isConnected = !!(status?.isComplete || status?.isConnected) && (status?.isActive || status?.status === "Active");

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "3rem 0", justifyContent: "center", color: "var(--bd-text-muted)" }}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span style={{ fontSize: "0.875rem" }}>Loading payout status…</span>
      </div>
    );
  }

  // ── Fetch error ─────────────────────────────────────────────────────────────

  if (error && !status) {
    return (
      <div
        style={{
          ...cardBase,
          borderColor: "var(--bd-danger-border)",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--bd-danger)", marginTop: 2 }} />
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--bd-text-primary)", marginBottom: "0.25rem" }}>
            Could not load payout status
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--bd-text-secondary)", marginBottom: "0.5rem" }}>{error}</p>
          <button
            onClick={fetchStatus}
            style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--bd-primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDisconnect = async () => {
    setDisconnectError(null);
    try {
      await disconnectBank();
      setConfirmDisconnect(false);
    } catch (err) {
      setDisconnectError(err.message);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Connected state ───────────────────────────────────────────────── */}
      {isConnected && !showForm && (
        <div style={cardBase}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "0.75rem",
                  background: "var(--bd-success-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Building2 className="w-5 h-5" style={{ color: "var(--bd-success)" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--bd-text-primary)" }}>
                    {status?.bankDetails?.bankName || status?.bankName || "Bank Account"}
                  </span>
                  {(status?.bankDetails?.lastFour || status?.bankLastFour) && (
                    <span style={{ fontSize: "0.8125rem", color: "var(--bd-text-muted)" }}>
                      ••••{status?.bankDetails?.lastFour || status?.bankLastFour}
                    </span>
                  )}
                  <StatusBadge label="Active" variant="success" />
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--bd-text-secondary)", margin: 0 }}>
                  {(status?.bankDetails?.country || status?.bankCountry) &&
                    `${status?.bankDetails?.country || status?.bankCountry} · `}
                  {status?.bankDetails?.currency || status?.bankCurrency || ""}
                  {(status?.bankDetails?.connectedAt || status?.connectedAt) &&
                    ` · Connected ${new Date(status?.bankDetails?.connectedAt || status?.connectedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setConfirmDisconnect(true)}
              disabled={actionLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.9rem",
                borderRadius: "0.625rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                background: "transparent",
                border: "1px solid var(--bd-border-default)",
                color: "var(--bd-text-secondary)",
                transition: "all 0.15s",
              }}
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>

          {/* Disconnect confirmation */}
          {confirmDisconnect && (
            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--bd-border-muted)",
              }}
            >
              <p style={{ fontSize: "0.8125rem", color: "var(--bd-text-secondary)", marginBottom: "0.75rem" }}>
                Are you sure? You won't be able to receive payouts until you reconnect.
              </p>
              {disconnectError && (
                <p style={{ fontSize: "0.8125rem", color: "var(--bd-danger)", marginBottom: "0.5rem" }}>
                  {disconnectError}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleDisconnect}
                  disabled={actionLoading}
                  style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: "0.625rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "var(--bd-danger)",
                    color: "#fff",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Yes, disconnect
                </button>
                <button
                  onClick={() => setConfirmDisconnect(false)}
                  disabled={actionLoading}
                  style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: "0.625rem",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    color: "var(--bd-text-secondary)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty / not connected ─────────────────────────────────────────── */}
      {!isConnected && !showForm && (
        <div
          style={{
            ...cardBase,
            textAlign: "center",
            padding: "3rem 2rem",
            borderStyle: "dashed",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "1rem",
              background: "var(--bd-surface-input)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <Wallet className="w-7 h-7" style={{ color: "var(--bd-text-muted)" }} />
          </div>
          <h4 style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--bd-text-primary)", marginBottom: "0.35rem" }}>
            No payout method connected
          </h4>
          <p style={{ fontSize: "0.8125rem", color: "var(--bd-text-secondary)", maxWidth: 360, margin: "0 auto 1.5rem" }}>
            Connect a bank account to receive campaign payouts. Your details are
            encrypted and processed securely by Tazapay.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={btnPrimary}
          >
            <Building2 className="w-4 h-4" />
            Connect Bank Account
          </button>
        </div>
      )}

      {/* ── Onboarding wizard ────────────────────────────────────────── */}
      {showForm && (
        <OnboardingWizard
          onSuccess={() => {
            setShowForm(false);
            fetchStatus();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Info footer ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "0.875rem",
          background: "var(--bd-info-muted)",
          border: "1px solid var(--bd-info-border)",
        }}
      >
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--bd-text-primary)", marginBottom: "0.2rem" }}>
          Payout schedule
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--bd-text-secondary)", margin: 0 }}>
          Payouts are processed within 7 business days after a campaign is marked
          complete. Minimum payout threshold is $25.
        </p>
      </div>
    </div>
  );
};

export default PayoutsPage;
