/**
 * LiftTestCreator
 * Multi-step wizard for creating lift tests
 */

import React, { useState } from 'react';

const US_STATES = [
    { code: 'CA', name: 'California' },
    { code: 'TX', name: 'Texas' },
    { code: 'FL', name: 'Florida' },
    { code: 'NY', name: 'New York' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'IL', name: 'Illinois' },
    { code: 'OH', name: 'Ohio' },
    { code: 'GA', name: 'Georgia' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'MI', name: 'Michigan' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'IN', name: 'Indiana' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MD', name: 'Maryland' },
    { code: 'WI', name: 'Wisconsin' }
];

const LiftTestCreator = ({ campaignId, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        hypothesis: '',
        testType: 'Geographic',
        targetLiftPct: 10,
        testPercentage: 50,
        testRegions: [],
        controlRegions: []
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleRegion = (region, group) => {
        const field = group === 'test' ? 'testRegions' : 'controlRegions';
        const otherField = group === 'test' ? 'controlRegions' : 'testRegions';

        setFormData(prev => {
            const current = prev[field];
            const isSelected = current.includes(region);

            // Remove from other group if exists
            const otherUpdated = prev[otherField].filter(r => r !== region);

            return {
                ...prev,
                [field]: isSelected
                    ? current.filter(r => r !== region)
                    : [...current, region],
                [otherField]: otherUpdated
            };
        });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/lift-tests', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    campaignId,
                    ...formData
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                onSuccess?.(data.data);
                onClose?.();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to create lift test');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modal: {
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '85vh',
            overflow: 'auto',
            color: '#fff'
        },
        header: {
            padding: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        closeButton: {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '24px',
            cursor: 'pointer'
        },
        progress: {
            display: 'flex',
            gap: '8px',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        },
        progressStep: {
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.1)'
        },
        progressActive: {
            background: 'linear-gradient(90deg, #8b5cf6, #6366f1)'
        },
        body: {
            padding: '24px'
        },
        stepTitle: {
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '16px'
        },
        inputGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '14px',
            outline: 'none'
        },
        textarea: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            minHeight: '80px',
            resize: 'vertical'
        },
        typeCards: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
        },
        typeCard: {
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        typeCardSelected: {
            background: 'rgba(139, 92, 246, 0.2)',
            borderColor: '#8b5cf6'
        },
        typeIcon: {
            fontSize: '28px',
            marginBottom: '8px'
        },
        typeName: {
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '4px'
        },
        typeDesc: {
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)'
        },
        regionGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px'
        },
        regionColumn: {
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        regionTitle: {
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        regionList: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
        },
        regionChip: {
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        slider: {
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.1)',
            outline: 'none',
            appearance: 'none'
        },
        footer: {
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between'
        },
        button: {
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        buttonSecondary: {
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff'
        },
        buttonPrimary: {
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none',
            color: '#fff'
        },
        summary: {
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '16px'
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }
    };

    const renderStep1 = () => (
        <>
            <h4 style={styles.stepTitle}>📝 Name & Hypothesis</h4>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Test Name *</label>
                <input
                    style={styles.input}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Q1 Creator Campaign Lift Test"
                />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Hypothesis (Optional)</label>
                <textarea
                    style={styles.textarea}
                    value={formData.hypothesis}
                    onChange={(e) => handleChange('hypothesis', e.target.value)}
                    placeholder="e.g., We expect creators to drive 15% more conversions in the test regions compared to control..."
                />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Target Lift %: {formData.targetLiftPct}%</label>
                <input
                    type="range"
                    min="5"
                    max="50"
                    value={formData.targetLiftPct}
                    onChange={(e) => handleChange('targetLiftPct', parseInt(e.target.value))}
                    style={styles.slider}
                />
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h4 style={styles.stepTitle}>🎯 Test Type</h4>
            <div style={styles.typeCards}>
                {[
                    { type: 'Geographic', icon: '🗺️', name: 'Geographic', desc: 'Split by region' },
                    { type: 'RandomSplit', icon: '🎲', name: 'Random Split', desc: 'Random assignment' },
                    { type: 'TimeBased', icon: '🕐', name: 'Time Based', desc: 'Before/after' }
                ].map(({ type, icon, name, desc }) => (
                    <div
                        key={type}
                        style={{
                            ...styles.typeCard,
                            ...(formData.testType === type ? styles.typeCardSelected : {})
                        }}
                        onClick={() => handleChange('testType', type)}
                    >
                        <div style={styles.typeIcon}>{icon}</div>
                        <div style={styles.typeName}>{name}</div>
                        <div style={styles.typeDesc}>{desc}</div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderStep3 = () => {
        if (formData.testType === 'Geographic') {
            return (
                <>
                    <h4 style={styles.stepTitle}>🗺️ Select Regions</h4>
                    <div style={styles.regionGrid}>
                        <div style={{ ...styles.regionColumn, background: 'rgba(16, 185, 129, 0.05)' }}>
                            <div style={styles.regionTitle}>
                                <span style={{ color: '#10b981' }}>🟢</span> Test Group
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                    ({formData.testRegions.length} selected)
                                </span>
                            </div>
                            <div style={styles.regionList}>
                                {US_STATES.map(state => (
                                    <div
                                        key={`test-${state.code}`}
                                        style={{
                                            ...styles.regionChip,
                                            ...(formData.testRegions.includes(state.code)
                                                ? { background: '#10b981', borderColor: '#10b981', color: '#fff' }
                                                : {})
                                        }}
                                        onClick={() => toggleRegion(state.code, 'test')}
                                    >
                                        {state.code}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ ...styles.regionColumn, background: 'rgba(99, 102, 241, 0.05)' }}>
                            <div style={styles.regionTitle}>
                                <span style={{ color: '#6366f1' }}>🔵</span> Control Group
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                    ({formData.controlRegions.length} selected)
                                </span>
                            </div>
                            <div style={styles.regionList}>
                                {US_STATES.map(state => (
                                    <div
                                        key={`control-${state.code}`}
                                        style={{
                                            ...styles.regionChip,
                                            ...(formData.controlRegions.includes(state.code)
                                                ? { background: '#6366f1', borderColor: '#6366f1', color: '#fff' }
                                                : {})
                                        }}
                                        onClick={() => toggleRegion(state.code, 'control')}
                                    >
                                        {state.code}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (formData.testType === 'RandomSplit') {
            return (
                <>
                    <h4 style={styles.stepTitle}>🎲 Traffic Split</h4>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Test Group: {formData.testPercentage}% | Control Group: {100 - formData.testPercentage}%
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="90"
                            value={formData.testPercentage}
                            onChange={(e) => handleChange('testPercentage', parseInt(e.target.value))}
                            style={styles.slider}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '16px'
                    }}>
                        <div style={{
                            flex: formData.testPercentage,
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            height: '40px',
                            borderRadius: '8px 0 0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '500'
                        }}>
                            Test {formData.testPercentage}%
                        </div>
                        <div style={{
                            flex: 100 - formData.testPercentage,
                            background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                            height: '40px',
                            borderRadius: '0 8px 8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '500'
                        }}>
                            Control {100 - formData.testPercentage}%
                        </div>
                    </div>
                </>
            );
        }

        return (
            <>
                <h4 style={styles.stepTitle}>🕐 Time-Based Configuration</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Time-based tests compare performance before and after creator content is published.
                    Configure start and end dates after creating the test.
                </p>
            </>
        );
    };

    const renderStep4 = () => (
        <>
            <h4 style={styles.stepTitle}>📋 Review & Launch</h4>
            <div style={styles.summary}>
                <div style={styles.summaryRow}>
                    <span>Test Name</span>
                    <strong>{formData.name || '—'}</strong>
                </div>
                <div style={styles.summaryRow}>
                    <span>Test Type</span>
                    <strong>{formData.testType}</strong>
                </div>
                <div style={styles.summaryRow}>
                    <span>Target Lift</span>
                    <strong>{formData.targetLiftPct}%</strong>
                </div>
                {formData.testType === 'Geographic' && (
                    <>
                        <div style={styles.summaryRow}>
                            <span>Test Regions</span>
                            <strong>{formData.testRegions.join(', ') || 'None'}</strong>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>Control Regions</span>
                            <strong>{formData.controlRegions.join(', ') || 'None'}</strong>
                        </div>
                    </>
                )}
                {formData.testType === 'RandomSplit' && (
                    <div style={styles.summaryRow}>
                        <span>Split</span>
                        <strong>{formData.testPercentage}% Test / {100 - formData.testPercentage}% Control</strong>
                    </div>
                )}
            </div>
            {formData.hypothesis && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '8px',
                    fontSize: '14px'
                }}>
                    <strong>Hypothesis:</strong> {formData.hypothesis}
                </div>
            )}
        </>
    );

    const canProceed = () => {
        if (step === 1) return formData.name.length > 0;
        if (step === 2) return true;
        if (step === 3) {
            if (formData.testType === 'Geographic') {
                return formData.testRegions.length > 0 && formData.controlRegions.length > 0;
            }
            return true;
        }
        return true;
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={styles.title}>🧪 Create Lift Test</h3>
                    <button style={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div style={styles.progress}>
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            style={{
                                ...styles.progressStep,
                                ...(s <= step ? styles.progressActive : {})
                            }}
                        />
                    ))}
                </div>

                <div style={styles.body}>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            color: '#ef4444'
                        }}>
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </div>

                <div style={styles.footer}>
                    <button
                        style={{ ...styles.button, ...styles.buttonSecondary }}
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                    >
                        {step > 1 ? '← Back' : 'Cancel'}
                    </button>
                    <button
                        style={{
                            ...styles.button,
                            ...styles.buttonPrimary,
                            opacity: canProceed() ? 1 : 0.5,
                            cursor: canProceed() ? 'pointer' : 'not-allowed'
                        }}
                        onClick={() => {
                            if (!canProceed()) return;
                            if (step < 4) {
                                setStep(step + 1);
                            } else {
                                handleSubmit();
                            }
                        }}
                        disabled={loading || !canProceed()}
                    >
                        {loading ? 'Creating...' : step < 4 ? 'Next →' : '🚀 Create Test'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiftTestCreator;
