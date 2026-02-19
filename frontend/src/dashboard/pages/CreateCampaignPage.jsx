import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCampaign } from '../../hooks/useCampaigns';
import {
    StepObjective,
    StepBudget,
    StepTargeting,
    StepTimeline,
    StepReview,
} from '../components/campaigns/create/WizardSteps';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Target,
    DollarSign,
    Users,
    Calendar,
    ShieldCheck,
} from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Objective', icon: Target },
    { id: 2, title: 'Budget', icon: DollarSign },
    { id: 3, title: 'Creators', icon: Users },
    { id: 4, title: 'Timeline', icon: Calendar },
    { id: 5, title: 'Review', icon: ShieldCheck },
];

const initialFormData = {
    title: '',
    objective: 'conversions',
    totalBudget: '',
    targetRoas: 3.0,
    paymentModel: 'cpa',
    creatorFilters: { tiers: [] },
    startDate: '',
    endDate: '',
    autoPauseThreshold: 80,
};

const validateStep = (step, data) => {
    const errors = {};
    switch (step) {
        case 1:
            if (!data.title || data.title.trim().length < 3) errors.title = 'Campaign name is required (min 3 characters)';
            if (!data.objective) errors.objective = 'Select an objective';
            break;
        case 2:
            if (!data.totalBudget || data.totalBudget < 1000) errors.totalBudget = 'Budget must be at least $1,000';
            if (!data.targetRoas || data.targetRoas <= 0) errors.targetRoas = 'Target ROAS must be positive';
            break;
        case 3:
            // Creator targeting is optional
            break;
        case 4:
            if (!data.startDate) errors.startDate = 'Start date is required';
            if (!data.endDate) errors.endDate = 'End date is required';
            if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
                errors.endDate = 'End date must be after start date';
            }
            break;
        default:
            break;
    }
    return errors;
};

const CreateCampaignPage = () => {
    const navigate = useNavigate();
    const createCampaign = useCreateCampaign();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    const update = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field-level error on change
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        if (currentStep < 5) {
            setCurrentStep(s => s + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(s => s - 1);
        else navigate('/brand/campaigns');
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        try {
            const result = await createCampaign.mutateAsync(formData);
            if (result?.campaignId) {
                navigate(`/brand/campaigns/${result.campaignId}`);
            }
        } catch (err) {
            setSubmitError(err?.response?.data?.message || err.message || 'Failed to create campaign');
        }
    };

    const budget = Number(formData.totalBudget) || 0;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                    onClick={() => navigate('/brand/campaigns')}
                    style={{
                        padding: 8,
                        marginLeft: -8,
                        color: 'var(--bd-text-secondary)',
                        background: 'none',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'background 150ms',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bd-surface-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--bd-text-primary)', margin: 0 }}>
                        Create Campaign
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--bd-text-secondary)', margin: '4px 0 0' }}>
                        Configure your campaign parameters and budget.
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <div style={{ marginBottom: 48, position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '50%', left: 0, width: '100%', height: 2,
                    background: 'var(--bd-border-subtle)', zIndex: 0, transform: 'translateY(-50%)',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                    {STEPS.map(step => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const Icon = step.icon;
                        return (
                            <div key={step.id} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                background: 'var(--bd-bg-primary)', padding: '0 8px',
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', border: '2px solid',
                                    transition: 'all 300ms',
                                    borderColor: isActive
                                        ? 'var(--bd-primary)' : isCompleted
                                            ? 'var(--bd-success)' : 'var(--bd-border-default)',
                                    background: isActive
                                        ? 'var(--bd-primary)' : isCompleted
                                            ? 'var(--bd-success)' : 'var(--bd-surface)',
                                    color: (isActive || isCompleted) ? '#fff' : 'var(--bd-text-secondary)',
                                    boxShadow: isActive ? 'var(--bd-shadow-primary-btn)' : 'none',
                                }}>
                                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                                </div>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 500,
                                    color: isActive ? 'var(--bd-primary)' : 'var(--bd-text-secondary)',
                                }}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
                {/* Form Area */}
                <div>
                    <div className="bd-cm-card" style={{ padding: 32, minHeight: 400 }}>
                        {currentStep === 1 && <StepObjective data={formData} update={update} errors={errors} />}
                        {currentStep === 2 && <StepBudget data={formData} update={update} errors={errors} />}
                        {currentStep === 3 && <StepTargeting data={formData} update={update} errors={errors} />}
                        {currentStep === 4 && <StepTimeline data={formData} update={update} errors={errors} />}
                        {currentStep === 5 && (
                            <StepReview
                                data={formData}
                                submit={handleSubmit}
                                isPending={createCampaign.isPending}
                                error={submitError}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16 }}>
                        <button
                            onClick={handleBack}
                            className="bd-cm-btn-secondary"
                            style={{ padding: '10px 24px' }}
                        >
                            {currentStep === 1 ? 'Cancel' : 'Back'}
                        </button>
                        {currentStep < 5 && (
                            <button
                                onClick={handleNext}
                                className="bd-cm-btn-primary"
                                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                Continue
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side Summary Panel */}
                <div style={{ position: 'sticky', top: 32 }}>
                    <div className="bd-cm-card" style={{ padding: 24 }}>
                        <h3 style={{
                            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.05em', color: 'var(--bd-text-primary)', marginBottom: 16,
                        }}>
                            Draft Summary
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-secondary)', marginBottom: 4 }}>
                                    Projected Reach
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                    {budget >= 100000 ? '2.5M - 3.0M' :
                                        budget >= 50000 ? '1.2M - 1.5M' :
                                            budget >= 10000 ? '250K - 500K' : '50K - 100K'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-secondary)', marginBottom: 4 }}>
                                    Est. ROAS
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bd-success)', fontVariantNumeric: 'tabular-nums' }}>
                                    {formData.targetRoas ? `${(formData.targetRoas * 0.8).toFixed(1)}x - ${(formData.targetRoas * 1.2).toFixed(1)}x` : '—'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-secondary)', marginBottom: 4 }}>
                                    Creator Capacity
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                    ~{Math.max(5, Math.round(budget / 2000))} Creators
                                </div>
                            </div>

                            <div style={{
                                borderTop: '1px solid var(--bd-border-subtle)', margin: '4px 0',
                                paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--bd-text-secondary)' }}>Platform Fee</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--bd-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                                        ${Math.round(budget * 0.015).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: 24, padding: 16, borderRadius: 'var(--bd-radius-2xl)',
                        background: 'var(--bd-info-muted)', border: '1px solid var(--bd-info-border)',
                    }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-info)', marginBottom: 4 }}>
                            Expert Tip
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--bd-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            Campaigns with budgets over $10K see 25% higher creator application rates. Fund your campaign after creation to go live.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaignPage;
