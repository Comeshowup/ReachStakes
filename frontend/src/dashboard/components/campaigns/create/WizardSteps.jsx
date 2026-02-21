import React from 'react';
import { TrendingUp, ShoppingCart, UserPlus, Megaphone, ShieldCheck, AlertCircle, Info, Loader2 } from 'lucide-react';

/* ===========================================================
   Shared Styles
   =========================================================== */
const styles = {
    fieldLabel: {
        display: 'block', fontSize: '0.875rem', fontWeight: 500,
        color: 'var(--bd-text-primary)', marginBottom: 6,
    },
    fieldInput: {
        width: '100%', padding: '10px 14px', borderRadius: 'var(--bd-radius-lg)',
        border: '1px solid var(--bd-border-default)', background: 'var(--bd-surface-input)',
        color: 'var(--bd-text-primary)', fontSize: '0.875rem', outline: 'none',
        transition: 'border-color 200ms, box-shadow 200ms',
        boxSizing: 'border-box',
    },
    fieldError: {
        fontSize: '0.75rem', color: 'var(--bd-danger)', marginTop: 4, display: 'flex',
        alignItems: 'center', gap: 4,
    },
    sectionTitle: {
        fontSize: '1.25rem', fontWeight: 700, color: 'var(--bd-text-primary)', marginBottom: 4,
    },
    sectionSub: {
        fontSize: '0.875rem', color: 'var(--bd-text-secondary)', marginBottom: 24, lineHeight: 1.5,
    },
};

const FieldError = ({ message }) => (
    message ? <div style={styles.fieldError}><AlertCircle size={12} /> {message}</div> : null
);

/* ===========================================================
   Step 1: Objective
   =========================================================== */
const objectives = [
    { id: 'conversions', label: 'Conversions', desc: 'Drive direct purchases', icon: ShoppingCart },
    { id: 'awareness', label: 'Brand Awareness', desc: 'Maximize reach & impressions', icon: Megaphone },
    { id: 'growth', label: 'Audience Growth', desc: 'Grow followers & subscribers', icon: UserPlus },
    { id: 'roas', label: 'ROAS Optimization', desc: 'Maximize return on ad spend', icon: TrendingUp },
];

export const StepObjective = ({ data, update, errors }) => (
    <div>
        <h2 style={styles.sectionTitle}>Campaign Objective</h2>
        <p style={styles.sectionSub}>Choose the primary goal that defines how success is measured.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {objectives.map(obj => {
                const Icon = obj.icon;
                const isActive = data.objective === obj.id;
                return (
                    <button
                        key={obj.id}
                        onClick={() => update('objective', obj.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: 16,
                            borderRadius: 'var(--bd-radius-xl)', background: 'var(--bd-cm-surface)',
                            border: `2px solid ${isActive ? 'var(--bd-primary)' : 'var(--bd-border-default)'}`,
                            cursor: 'pointer', textAlign: 'left',
                            boxShadow: isActive ? '0 0 0 3px var(--bd-cm-gradient-shadow)' : 'none',
                            transition: 'border-color 200ms, box-shadow 200ms',
                        }}
                    >
                        <div style={{
                            width: 40, height: 40, borderRadius: 'var(--bd-radius-lg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isActive ? 'var(--bd-primary)' : 'var(--bd-muted)',
                            color: isActive ? '#fff' : 'var(--bd-text-secondary)',
                            transition: 'all 200ms', flexShrink: 0,
                        }}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--bd-text-primary)', fontSize: '0.875rem' }}>{obj.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-secondary)', marginTop: 2 }}>{obj.desc}</div>
                        </div>
                    </button>
                );
            })}
        </div>

        <div>
            <label style={styles.fieldLabel}>Campaign Name</label>
            <input
                style={styles.fieldInput}
                placeholder="e.g. Summer Product Launch 2026"
                value={data.title}
                onChange={e => update('title', e.target.value)}
                onFocus={e => {
                    e.target.style.borderColor = 'var(--bd-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--bd-cm-gradient-shadow)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = 'var(--bd-border-default)';
                    e.target.style.boxShadow = 'none';
                }}
            />
            <FieldError message={errors?.title} />
        </div>
    </div>
);

/* ===========================================================
   Step 2: Budget & Payment
   =========================================================== */
export const StepBudget = ({ data, update, errors }) => {
    const handleBudgetChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        update('totalBudget', Number(raw) || 0);
    };

    return (
        <div>
            <h2 style={styles.sectionTitle}>Budget & Payment</h2>
            <p style={styles.sectionSub}>Set your campaign budget and payment model. You can fund the campaign after creation.</p>

            {/* Budget Input */}
            <div style={{ marginBottom: 28 }}>
                <label style={styles.fieldLabel}>Campaign Budget</label>
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                        fontSize: '1rem', fontWeight: 600, color: 'var(--bd-text-muted)', pointerEvents: 'none',
                    }}>$</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={data.totalBudget > 0 ? data.totalBudget.toLocaleString() : ''}
                        onChange={handleBudgetChange}
                        placeholder="50,000"
                        style={{
                            ...styles.fieldInput,
                            paddingLeft: 30,
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = 'var(--bd-primary)';
                            e.target.style.boxShadow = '0 0 0 3px var(--bd-cm-gradient-shadow)';
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = 'var(--bd-border-default)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <FieldError message={errors?.totalBudget} />
            </div>

            {/* Target ROAS & Payment Model */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <label style={styles.fieldLabel}>Target ROAS</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={data.targetRoas}
                        onChange={e => update('targetRoas', parseFloat(e.target.value) || 0)}
                        style={styles.fieldInput}
                    />
                    <FieldError message={errors?.targetRoas} />
                </div>
                <div>
                    <label style={styles.fieldLabel}>Payment Model</label>
                    <select
                        value={data.paymentModel}
                        onChange={e => update('paymentModel', e.target.value)}
                        style={{ ...styles.fieldInput, cursor: 'pointer' }}
                    >
                        <option value="cpa">CPA (Cost Per Action)</option>
                        <option value="flat_rate">Flat Rate</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

/* ===========================================================
   Step 3: Creator Targeting
   =========================================================== */
const creatorTiers = [
    { id: 'nano', label: 'Nano (1K–10K)', cpa: '$5–$12' },
    { id: 'micro', label: 'Micro (10K–50K)', cpa: '$12–$25' },
    { id: 'mid', label: 'Mid-Tier (50K–250K)', cpa: '$25–$60' },
    { id: 'macro', label: 'Macro (250K–1M)', cpa: '$60–$150' },
    { id: 'mega', label: 'Mega (1M+)', cpa: '$150+' },
];

export const StepTargeting = ({ data, update }) => {
    const tiers = data.creatorFilters?.tiers || [];

    const toggleTier = (id) => {
        const next = tiers.includes(id) ? tiers.filter(t => t !== id) : [...tiers, id];
        update('creatorFilters', { ...data.creatorFilters, tiers: next });
    };

    return (
        <div>
            <h2 style={styles.sectionTitle}>Creator Targeting</h2>
            <p style={styles.sectionSub}>Select creator tiers and targeting criteria. Leave empty to accept all tiers.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {creatorTiers.map(tier => {
                    const isActive = tiers.includes(tier.id);
                    return (
                        <label
                            key={tier.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                                borderRadius: 'var(--bd-radius-xl)', cursor: 'pointer',
                                border: `1px solid ${isActive ? 'var(--bd-primary)' : 'var(--bd-border-default)'}`,
                                background: isActive ? 'var(--bd-info-muted)' : 'var(--bd-cm-surface)',
                                transition: 'all 200ms',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => toggleTier(tier.id)}
                                style={{ width: 18, height: 18, accentColor: 'var(--bd-primary)', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: 'var(--bd-text-primary)', fontSize: '0.875rem' }}>{tier.label}</div>
                            </div>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 500, color: 'var(--bd-text-secondary)',
                                background: 'var(--bd-muted)', padding: '4px 10px', borderRadius: 'var(--bd-radius-md)',
                            }}>
                                Est. CPA: {tier.cpa}
                            </span>
                        </label>
                    );
                })}
            </div>

            <div style={{ marginTop: 24 }}>
                <label style={styles.fieldLabel}>Auto-Pause Threshold (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                        type="range"
                        min={50}
                        max={100}
                        step={5}
                        value={data.autoPauseThreshold}
                        onChange={e => update('autoPauseThreshold', Number(e.target.value))}
                        style={{
                            flex: 1, height: 6, appearance: 'none', borderRadius: 999,
                            background: `linear-gradient(to right, var(--bd-warning) ${(data.autoPauseThreshold - 50) * 2}%, var(--bd-cm-progress-track) ${(data.autoPauseThreshold - 50) * 2}%)`,
                            cursor: 'pointer', outline: 'none',
                        }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--bd-text-primary)', width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {data.autoPauseThreshold}%
                    </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Info size={12} /> Automatically pauses campaign when budget utilization exceeds this threshold.
                </p>
            </div>
        </div>
    );
};

/* ===========================================================
   Step 4: Timeline
   =========================================================== */
export const StepTimeline = ({ data, update, errors }) => (
    <div>
        <h2 style={styles.sectionTitle}>Campaign Timeline</h2>
        <p style={styles.sectionSub}>Set the start and end dates for your campaign delivery window.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
                <label style={styles.fieldLabel}>Start Date</label>
                <input
                    type="date"
                    value={data.startDate}
                    onChange={e => update('startDate', e.target.value)}
                    style={styles.fieldInput}
                />
                <FieldError message={errors?.startDate} />
            </div>
            <div>
                <label style={styles.fieldLabel}>End Date</label>
                <input
                    type="date"
                    value={data.endDate}
                    onChange={e => update('endDate', e.target.value)}
                    style={styles.fieldInput}
                />
                <FieldError message={errors?.endDate} />
            </div>
        </div>

        {data.startDate && data.endDate && (
            <div style={{
                padding: 16, borderRadius: 'var(--bd-radius-xl)', background: 'var(--bd-info-muted)',
                border: '1px solid var(--bd-info-border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Info size={14} style={{ color: 'var(--bd-info)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--bd-info)' }}>Duration</span>
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--bd-text-secondary)' }}>
                    {Math.max(0, Math.ceil((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)))} days
                    {' '}({new Date(data.startDate).toLocaleDateString()} → {new Date(data.endDate).toLocaleDateString()})
                </span>
            </div>
        )}
    </div>
);

/* ===========================================================
   Step 5: Review & Launch
   =========================================================== */
export const StepReview = ({ data, submit, isPending, error }) => {
    const budget = Number(data.totalBudget) || 0;

    const rows = [
        ['Campaign Name', data.title],
        ['Objective', data.objective],
        ['Campaign Budget', `$${budget.toLocaleString()}`],
        ['Target ROAS', `${data.targetRoas}x`],
        ['Payment Model', data.paymentModel?.toUpperCase()],
        ['Creator Tiers', data.creatorFilters?.tiers?.length > 0 ? data.creatorFilters.tiers.join(', ') : 'All Tiers'],
        ['Timeline', data.startDate && data.endDate ? `${data.startDate} → ${data.endDate}` : 'Not set'],
        ['Auto-Pause', `${data.autoPauseThreshold}%`],
    ];

    return (
        <div>
            <h2 style={styles.sectionTitle}>Review & Launch</h2>
            <p style={styles.sectionSub}>Review your campaign configuration before launching.</p>

            {/* Shield Badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                borderRadius: 'var(--bd-radius-xl)', background: 'var(--bd-success-muted)',
                border: '1px solid var(--bd-success-border)', marginBottom: 24,
            }}>
                <ShieldCheck size={24} style={{ color: 'var(--bd-success)' }} />
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--bd-success)' }}>Ready to Fund</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-secondary)' }}>
                        Fund your campaign after creation to activate creator matching.
                    </div>
                </div>
            </div>

            {/* Summary Table */}
            <div style={{ borderRadius: 'var(--bd-radius-xl)', overflow: 'hidden', border: '1px solid var(--bd-border-default)' }}>
                {rows.map(([label, value], i) => (
                    <div
                        key={label}
                        style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: i < rows.length - 1 ? '1px solid var(--bd-border-subtle)' : 'none',
                            background: i % 2 === 0 ? 'var(--bd-cm-surface)' : 'var(--bd-bg-tertiary)',
                        }}
                    >
                        <span style={{ fontSize: '0.875rem', color: 'var(--bd-text-secondary)' }}>{label}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--bd-text-primary)' }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    marginTop: 16, padding: 12, borderRadius: 'var(--bd-radius-lg)',
                    background: 'var(--bd-danger-muted)', border: '1px solid var(--bd-danger-border)',
                    color: 'var(--bd-danger)', fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Launch Button */}
            <button
                onClick={submit}
                disabled={isPending}
                className="bd-cm-btn-primary"
                style={{
                    width: '100%', padding: '14px 24px', marginTop: 24,
                    fontSize: '1rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
            >
                {isPending ? (
                    <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Launching…
                    </>
                ) : (
                    <>
                        <ShieldCheck size={18} />
                        Launch Campaign
                    </>
                )}
            </button>
        </div>
    );
};
