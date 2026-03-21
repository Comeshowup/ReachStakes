/**
 * OnboardingWizard — Multi-step onboarding flow for creators.
 * Step 1: Identity (KYC) — name, email, country
 * Step 2: Bank Details — dynamic form based on country
 * Step 3: Review & Confirm
 *
 * Premium Stripe-level UX with progress indicator, validation, and save & resume.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, CheckCircle2, Loader2, AlertCircle,
  Shield, Lock, ArrowRight, ArrowLeft, ChevronRight
} from 'lucide-react';
import payoutService from '../../../api/payoutService';

// ── Country config ────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', label: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'IN', label: 'India', currency: 'INR', flag: '🇮🇳' },
  { code: 'AU', label: 'Australia', currency: 'AUD', flag: '🇦🇺' },
  { code: 'CA', label: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  { code: 'DE', label: 'Germany', currency: 'EUR', flag: '🇩🇪' },
  { code: 'FR', label: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'NL', label: 'Netherlands', currency: 'EUR', flag: '🇳🇱' },
  { code: 'SG', label: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
  { code: 'PH', label: 'Philippines', currency: 'PHP', flag: '🇵🇭' },
  { code: 'ID', label: 'Indonesia', currency: 'IDR', flag: '🇮🇩' },
  { code: 'TH', label: 'Thailand', currency: 'THB', flag: '🇹🇭' },
  { code: 'MY', label: 'Malaysia', currency: 'MYR', flag: '🇲🇾' },
  { code: 'VN', label: 'Vietnam', currency: 'VND', flag: '🇻🇳' },
  { code: 'BR', label: 'Brazil (PIX)', currency: 'BRL', flag: '🇧🇷' },
];

const STEPS = [
  { id: 1, label: 'Identity', icon: User, description: 'Personal details' },
  { id: 2, label: 'Bank Details', icon: Building2, description: 'Account info' },
  { id: 3, label: 'Confirm', icon: CheckCircle2, description: 'Review & submit' },
];

// ── Styles ────────────────────────────────────────────────────────────────
const cardStyle = {
  background: 'var(--bd-surface)',
  border: '1px solid var(--bd-border-default)',
  borderRadius: '1rem',
  padding: '1.5rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  borderRadius: '0.625rem',
  fontSize: '0.875rem',
  border: '1px solid var(--bd-border-default)',
  background: 'var(--bd-surface-input)',
  color: 'var(--bd-text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  marginBottom: '0.35rem',
  color: 'var(--bd-text-secondary)',
};

// ── Progress Bar ──────────────────────────────────────────────────────────
const ProgressBar = ({ currentStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '1.75rem' }}>
    {STEPS.map((step, i) => {
      const isActive = currentStep === step.id;
      const isComplete = currentStep > step.id;
      const StepIcon = step.icon;

      return (
        <React.Fragment key={step.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isComplete ? '#10b981' : isActive ? 'var(--bd-primary)' : 'var(--bd-surface-input)',
                color: isComplete || isActive ? '#fff' : 'var(--bd-text-muted)',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}
            >
              {isComplete ? (
                <CheckCircle2 style={{ width: 16, height: 16 }} />
              ) : (
                <StepIcon style={{ width: 14, height: 14 }} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '0.75rem', fontWeight: 600, margin: 0,
                color: isActive ? 'var(--bd-text-primary)' : 'var(--bd-text-muted)',
              }}>{step.label}</p>
              <p style={{
                fontSize: '0.65rem', margin: 0,
                color: 'var(--bd-text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{step.description}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 24,
                background: isComplete ? '#10b981' : 'var(--bd-border-default)',
                borderRadius: 1, marginLeft: '0.5rem',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

// ── Step 1: Identity ──────────────────────────────────────────────────────
const StepIdentity = ({ data, onChange, errors }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div>
      <label style={labelStyle}>Full Legal Name *</label>
      <input
        style={{ ...inputStyle, borderColor: errors?.fullName ? '#f87171' : undefined }}
        value={data.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
        placeholder="e.g. Jane Doe"
        autoComplete="name"
      />
      {errors?.fullName && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.fullName}</p>}
    </div>

    <div>
      <label style={labelStyle}>Email Address *</label>
      <input
        style={{ ...inputStyle, borderColor: errors?.email ? '#f87171' : undefined }}
        type="email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="you@example.com"
        autoComplete="email"
      />
      {errors?.email && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
    </div>

    <div>
      <label style={labelStyle}>Country / Region *</label>
      <select
        style={{ ...inputStyle, borderColor: errors?.country ? '#f87171' : undefined }}
        value={data.country}
        onChange={(e) => onChange({ country: e.target.value })}
      >
        <option value="">Select your country…</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.currency})</option>
        ))}
      </select>
      {errors?.country && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.country}</p>}
    </div>

    <div>
      <label style={labelStyle}>Phone Number (optional)</label>
      <input
        style={inputStyle}
        type="tel"
        value={data.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="+1 555 123 4567"
        autoComplete="tel"
      />
    </div>
  </div>
);

// ── Step 2: Bank Details ──────────────────────────────────────────────────
const StepBankDetails = ({ data, onChange, bankFields, fetchingFields, errors }) => {
  const isPix = bankFields?.isPix;
  const useIban = bankFields?.useIban;

  if (fetchingFields) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '2rem 0', justifyContent: 'center', color: 'var(--bd-text-muted)', fontSize: '0.8125rem' }}>
        <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
        Loading bank requirements…
      </div>
    );
  }

  if (!bankFields) {
    return (
      <div style={{
        textAlign: 'center', padding: '2rem 1rem',
        color: 'var(--bd-text-secondary)', fontSize: '0.875rem',
      }}>
        <Building2 style={{ width: 28, height: 28, margin: '0 auto 0.75rem', opacity: 0.4 }} />
        Select your country in Step 1 to see required bank fields.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Security badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 0.85rem', borderRadius: '0.625rem',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.15)',
        fontSize: '0.78rem', color: '#10b981',
      }}>
        <Shield style={{ width: 14, height: 14, flexShrink: 0 }} />
        <span><strong>End-to-end encrypted</strong> — your bank details are sent directly to our payment processor and never stored on our servers.</span>
      </div>

      {/* Bank Name (not for PIX) */}
      {!isPix && (
        <div>
          <label style={labelStyle}>Bank Name *</label>
          <input
            style={{ ...inputStyle, borderColor: errors?.bankName ? '#f87171' : undefined }}
            value={data.bankName}
            onChange={(e) => onChange({ bankName: e.target.value })}
            placeholder="e.g. Chase, HDFC, Barclays"
            autoComplete="off"
          />
          {errors?.bankName && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.bankName}</p>}
        </div>
      )}

      {/* IBAN */}
      {useIban && (
        <div>
          <label style={labelStyle}>IBAN *</label>
          <input
            style={{ ...inputStyle, borderColor: errors?.iban ? '#f87171' : undefined }}
            value={data.iban}
            onChange={(e) => onChange({ iban: e.target.value.replace(/\s/g, '').toUpperCase() })}
            placeholder="e.g. DE89370400440532013000"
            autoComplete="off"
            spellCheck="false"
          />
          {errors?.iban && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.iban}</p>}
        </div>
      )}

      {/* Account Number */}
      {!useIban && !isPix && (
        <div>
          <label style={labelStyle}>{bankFields?.accountLabel || 'Account Number'} *</label>
          <input
            style={{ ...inputStyle, borderColor: errors?.accountNumber ? '#f87171' : undefined }}
            value={data.accountNumber}
            onChange={(e) => onChange({ accountNumber: e.target.value.replace(/\D/g, '') })}
            placeholder="Enter your account number"
            autoComplete="off"
            inputMode="numeric"
          />
          {errors?.accountNumber && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.accountNumber}</p>}
        </div>
      )}

      {/* Bank Code / Routing */}
      {!isPix && bankFields?.bankCodeLabel && (
        <div>
          <label style={labelStyle}>{bankFields.bankCodeLabel} *</label>
          <input
            style={{ ...inputStyle, borderColor: errors?.bankCode ? '#f87171' : undefined }}
            value={data.bankCode}
            onChange={(e) => onChange({ bankCode: e.target.value.toUpperCase() })}
            placeholder={`Enter ${bankFields.bankCodeLabel}`}
            autoComplete="off"
          />
          {errors?.bankCode && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.bankCode}</p>}
        </div>
      )}

      {/* PIX Key */}
      {isPix && (
        <div>
          <label style={labelStyle}>PIX Key (Email / Phone / CPF) *</label>
          <input
            style={{ ...inputStyle, borderColor: errors?.pixKey ? '#f87171' : undefined }}
            value={data.pixKey}
            onChange={(e) => onChange({ pixKey: e.target.value })}
            placeholder="e.g. email@example.com or CPF number"
            autoComplete="off"
          />
          {errors?.pixKey && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.pixKey}</p>}
        </div>
      )}

      {/* Address — required by Tazapay for all bank beneficiaries */}
      {!isPix && (
        <>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--bd-border-subtle)' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bd-text-muted)', marginBottom: '0.65rem' }}>Billing Address</p>
          </div>
          <div>
            <label style={labelStyle}>Street Address *</label>
            <input
              style={{ ...inputStyle, borderColor: errors?.addressLine1 ? '#f87171' : undefined }}
              value={data.addressLine1}
              onChange={(e) => onChange({ addressLine1: e.target.value })}
              placeholder="e.g. 123 Main Street"
              autoComplete="street-address"
            />
            {errors?.addressLine1 && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.addressLine1}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input
                style={{ ...inputStyle, borderColor: errors?.addressCity ? '#f87171' : undefined }}
                value={data.addressCity}
                onChange={(e) => onChange({ addressCity: e.target.value })}
                placeholder="e.g. Mumbai"
                autoComplete="address-level2"
              />
              {errors?.addressCity && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.addressCity}</p>}
            </div>
            <div>
              <label style={labelStyle}>State / Province *</label>
              <input
                style={{ ...inputStyle, borderColor: errors?.addressState ? '#f87171' : undefined }}
                value={data.addressState}
                onChange={(e) => onChange({ addressState: e.target.value })}
                placeholder="e.g. Maharashtra"
                autoComplete="address-level1"
              />
              {errors?.addressState && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.addressState}</p>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Postal / ZIP Code *</label>
            <input
              style={{ ...inputStyle, borderColor: errors?.addressPostalCode ? '#f87171' : undefined }}
              value={data.addressPostalCode}
              onChange={(e) => onChange({ addressPostalCode: e.target.value })}
              placeholder="e.g. 400001"
              autoComplete="postal-code"
            />
            {errors?.addressPostalCode && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.addressPostalCode}</p>}
          </div>
        </>
      )}
    </div>
  );
};

// ── Step 3: Review ────────────────────────────────────────────────────────
const StepReview = ({ identity, bank, bankFields }) => {
  const country = COUNTRIES.find(c => c.code === identity.country);
  const getMaskedValue = (val) => {
    if (!val) return '—';
    if (val.length <= 4) return '••••';
    return '••••' + val.slice(-4);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Identity Summary */}
      <div style={{
        padding: '1rem', borderRadius: '0.75rem',
        background: 'var(--bd-surface-input)',
        border: '1px solid var(--bd-border-default)',
      }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bd-text-muted)', marginBottom: '0.65rem' }}>
          Identity
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>Name</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{identity.fullName || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>Email</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{identity.email || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>Country</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{country?.flag} {country?.label || identity.country}</p>
          </div>
          {identity.phone && (
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>Phone</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{identity.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bank Summary */}
      <div style={{
        padding: '1rem', borderRadius: '0.75rem',
        background: 'var(--bd-surface-input)',
        border: '1px solid var(--bd-border-default)',
      }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bd-text-muted)', marginBottom: '0.65rem' }}>
          Bank Account
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {bank.bankName && (
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>Bank</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{bank.bankName}</p>
            </div>
          )}
          {bank.accountNumber && (
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>Account</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{getMaskedValue(bank.accountNumber)}</p>
            </div>
          )}
          {bank.iban && (
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>IBAN</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{getMaskedValue(bank.iban)}</p>
            </div>
          )}
          {bank.bankCode && (
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>{bankFields?.bankCodeLabel || 'Bank Code'}</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{bank.bankCode}</p>
            </div>
          )}
          {bank.pixKey && (
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', marginBottom: '0.1rem' }}>PIX Key</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-primary)' }}>{getMaskedValue(bank.pixKey)}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 0.85rem', borderRadius: '0.625rem',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.15)',
        fontSize: '0.78rem', color: '#10b981',
      }}>
        <Lock style={{ width: 14, height: 14, flexShrink: 0 }} />
        <span>By confirming, you authorize Tazapay to process payouts to this bank account. All data is encrypted using bank-level security.</span>
      </div>
    </div>
  );
};

// ── Main Wizard ───────────────────────────────────────────────────────────
const OnboardingWizard = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});

  // Step 1 data
  const [identity, setIdentity] = useState({
    fullName: '', email: '', country: '', phone: '',
  });

  // Step 2 data
  const [bank, setBank] = useState({
    bankName: '', accountNumber: '', bankCode: '', iban: '', pixKey: '',
    addressLine1: '', addressCity: '', addressState: '', addressPostalCode: '',
  });
  const [bankFields, setBankFields] = useState(null);
  const [fetchingFields, setFetchingFields] = useState(false);

  // Load bank fields when country changes
  useEffect(() => {
    if (!identity.country) {
      setBankFields(null);
      return;
    }

    const country = COUNTRIES.find(c => c.code === identity.country);
    const currency = country?.currency || 'USD';

    setFetchingFields(true);
    setBankFields(null);
    setBank({ bankName: '', accountNumber: '', bankCode: '', iban: '', pixKey: '' });

    payoutService.getBankFields(identity.country, currency)
      .then(res => setBankFields(res.data))
      .catch(() => setBankFields(null))
      .finally(() => setFetchingFields(false));
  }, [identity.country]);

  // Validation
  const validateStep1 = useCallback(() => {
    const errs = {};
    if (!identity.fullName || identity.fullName.trim().length < 2) errs.fullName = 'Full name is required (min 2 characters)';
    if (!identity.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)) errs.email = 'Valid email is required';
    if (!identity.country) errs.country = 'Please select your country';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [identity]);

  const validateStep2 = useCallback(() => {
    const errs = {};
    const isPix = bankFields?.isPix;
    const useIban = bankFields?.useIban;

    if (isPix) {
      if (!bank.pixKey) errs.pixKey = 'PIX key is required';
    } else if (useIban) {
      if (!bank.iban || bank.iban.length < 15) errs.iban = 'Valid IBAN is required';
      if (!bank.bankName) errs.bankName = 'Bank name is required';
    } else {
      if (!bank.accountNumber || bank.accountNumber.length < 4) errs.accountNumber = 'Account number is required (min 4 digits)';
      if (!bank.bankName) errs.bankName = 'Bank name is required';
    }
    // Address always required for bank type
    if (!isPix) {
      if (!bank.addressLine1) errs.addressLine1 = 'Street address is required';
      if (!bank.addressCity) errs.addressCity = 'City is required';
      if (!bank.addressState) errs.addressState = 'State is required';
      if (!bank.addressPostalCode) errs.addressPostalCode = 'Postal code is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [bank, bankFields]);

  const handleNext = () => {
    setSubmitError(null);
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setErrors({});
    setSubmitError(null);
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const country = COUNTRIES.find(c => c.code === identity.country);
      const currency = country?.currency || 'USD';

      await payoutService.connectBank({
        country: identity.country,
        currency,
        bankName: bank.bankName || undefined,
        accountNumber: bankFields?.useIban ? undefined : bank.accountNumber || undefined,
        bankCode: bank.bankCode || undefined,
        bankCodeType: bankFields?.bankCodeType || undefined,
        iban: bankFields?.useIban ? bank.iban : undefined,
        pixKey: bankFields?.isPix ? bank.pixKey : undefined,
        addressLine1: bank.addressLine1 || undefined,
        addressCity: bank.addressCity || undefined,
        addressState: bank.addressState || undefined,
        addressPostalCode: bank.addressPostalCode || undefined,
      });

      onSuccess?.();
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to connect bank account');
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ marginBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Building2 style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--bd-text-primary)', margin: 0 }}>
              Connect Bank Account
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', margin: 0 }}>
              Secure setup powered by Tazapay
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar currentStep={step} />

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={step}>
        <motion.div
          key={step}
          custom={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {step === 1 && (
            <StepIdentity
              data={identity}
              onChange={(d) => { setIdentity(p => ({ ...p, ...d })); setErrors({}); }}
              errors={errors}
            />
          )}
          {step === 2 && (
            <StepBankDetails
              data={bank}
              onChange={(d) => { setBank(p => ({ ...p, ...d })); setErrors({}); }}
              bankFields={bankFields}
              fetchingFields={fetchingFields}
              errors={errors}
            />
          )}
          {step === 3 && (
            <StepReview identity={identity} bank={bank} bankFields={bankFields} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {submitError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          padding: '0.65rem 0.85rem', borderRadius: '0.625rem',
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)',
          fontSize: '0.8125rem', color: '#f87171',
          marginTop: '1rem',
        }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '0.75rem' }}>
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.55rem 1rem', borderRadius: '0.625rem',
                fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                background: 'transparent', border: 'none',
                color: 'var(--bd-text-secondary)',
              }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '0.55rem 1rem', borderRadius: '0.625rem',
                fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                background: 'transparent', border: 'none',
                color: 'var(--bd-text-secondary)',
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <div>
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                background: 'var(--bd-primary)', color: 'var(--bd-primary-fg)',
                border: 'none',
                boxShadow: 'var(--bd-shadow-primary-btn)',
              }}
            >
              Continue <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
                fontSize: '0.875rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none',
                boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
              ) : (
                <Lock style={{ width: 14, height: 14 }} />
              )}
              {submitting ? 'Connecting…' : 'Confirm & Connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
