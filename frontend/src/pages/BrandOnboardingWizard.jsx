import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Target,
    Users,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Check,
    Sparkles,
    Zap,
    Shield,
    ArrowRight
} from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Company Profile', icon: Building2 },
    { id: 2, title: 'Campaign Goals', icon: Target },
    { id: 3, title: 'Team Setup', icon: Users },
    { id: 4, title: 'Payment Setup', icon: CreditCard },
];

const INDUSTRIES = [
    'E-commerce / DTC',
    'Beauty & Cosmetics',
    'Fashion & Apparel',
    'Food & Beverage',
    'Health & Wellness',
    'Tech / SaaS',
    'Finance / Fintech',
    'Travel & Hospitality',
    'Entertainment',
    'Other'
];

const COMPANY_SIZES = [
    { label: '1-10 employees', value: 'Startup' },
    { label: '11-50 employees', value: 'Small' },
    { label: '51-200 employees', value: 'Medium' },
    { label: '201-1000 employees', value: 'Large' },
    { label: '1000+ employees', value: 'Enterprise' },
];

const GOALS = [
    { id: 'awareness', label: 'Brand Awareness', description: 'Get your brand in front of new audiences', icon: Sparkles },
    { id: 'sales', label: 'Drive Sales', description: 'Convert followers into paying customers', icon: Zap },
    { id: 'ambassador', label: 'Ambassador Program', description: 'Build long-term creator relationships', icon: Shield },
];

const BUDGET_RANGES = [
    '$1K - $5K / month',
    '$5K - $15K / month',
    '$15K - $50K / month',
    '$50K - $100K / month',
    '$100K+ / month'
];

import { updateBrandProfile } from "../api/brandService";

const BrandOnboardingWizard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Company Profile
        industry: '',
        companySize: '',
        website: '',

        // Step 2: Campaign Goals
        primaryGoal: '',
        budgetRange: '',
        launchTimeline: '',

        // Step 3: Team Setup
        teamEmails: [''],

        // Step 4: Payment acknowledged
        paymentAcknowledged: false,
    });

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTeamEmail = () => {
        setFormData(prev => ({
            ...prev,
            teamEmails: [...prev.teamEmails, '']
        }));
    };

    const updateTeamEmail = (index, value) => {
        const newEmails = [...formData.teamEmails];
        newEmails[index] = value;
        setFormData(prev => ({ ...prev, teamEmails: newEmails }));
    };

    const removeTeamEmail = (index) => {
        if (formData.teamEmails.length > 1) {
            const newEmails = formData.teamEmails.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, teamEmails: newEmails }));
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.industry && formData.companySize;
            case 2:
                return formData.primaryGoal && formData.budgetRange;
            case 3:
                return true; // Team setup is optional
            case 4:
                return formData.paymentAcknowledged;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);

        try {
            // Prepare payload for backend
            const payload = {
                industry: formData.industry,
                companySize: formData.companySize,
                website: formData.website,
                primaryGoal: formData.primaryGoal,
                budgetRange: formData.budgetRange,
                launchTimeline: formData.launchTimeline,
                teamEmails: formData.teamEmails.filter(e => e.trim() !== ''),
                onboardingCompleted: true
            };

            // Call API to update profile
            await updateBrandProfile(payload);

            // Also save flags to localStorage for quick client-side checks
            localStorage.setItem('onboardingComplete', 'true');

            // Redirect to dashboard
            setTimeout(() => {
                navigate('/brand');
            }, 1000);
        } catch (error) {
            console.error('Onboarding error:', error);
            alert("Failed to save onboarding data. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('onboardingSkipped', 'true');
        navigate('/brand');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0B] via-[#0F0F12] to-[#0A0A0B] flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep > step.id
                                            ? 'bg-emerald-500 text-white'
                                            : currentStep === step.id
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-white/5 text-white/40'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 transition-colors ${currentStep >= step.id ? 'text-white/70' : 'text-white/30'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`flex-1 h-px mx-4 transition-colors ${currentStep > step.id ? 'bg-emerald-500' : 'bg-white/10'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <motion.div
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <AnimatePresence mode="wait">
                        {/* Step 1: Company Profile */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Tell us about your company</h2>
                                <p className="text-white/50 mb-8">This helps us match you with the right creators.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-3">Industry</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {INDUSTRIES.map(industry => (
                                                <button
                                                    key={industry}
                                                    onClick={() => updateFormData('industry', industry)}
                                                    className={`px-4 py-3 rounded-lg text-sm text-left transition-all ${formData.industry === industry
                                                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                        } border`}
                                                >
                                                    {industry}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-3">Company Size</label>
                                        <div className="space-y-2">
                                            {COMPANY_SIZES.map(size => (
                                                <button
                                                    key={size.value}
                                                    onClick={() => updateFormData('companySize', size.value)}
                                                    className={`w-full px-4 py-3 rounded-lg text-sm text-left transition-all ${formData.companySize === size.value
                                                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                        } border`}
                                                >
                                                    {size.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Website (optional)</label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => updateFormData('website', e.target.value)}
                                            placeholder="https://yourcompany.com"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Campaign Goals */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">What's your primary goal?</h2>
                                <p className="text-white/50 mb-8">We'll optimize your campaigns accordingly.</p>

                                <div className="space-y-6">
                                    <div className="grid gap-4">
                                        {GOALS.map(goal => (
                                            <button
                                                key={goal.id}
                                                onClick={() => updateFormData('primaryGoal', goal.id)}
                                                className={`flex items-start gap-4 p-5 rounded-xl text-left transition-all ${formData.primaryGoal === goal.id
                                                    ? 'bg-indigo-500/20 border-indigo-500'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    } border`}
                                            >
                                                <div className={`p-2 rounded-lg ${formData.primaryGoal === goal.id ? 'bg-indigo-500' : 'bg-white/10'
                                                    }`}>
                                                    <goal.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{goal.label}</h3>
                                                    <p className="text-sm text-white/50 mt-1">{goal.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-3">Monthly Budget Range</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {BUDGET_RANGES.map(range => (
                                                <button
                                                    key={range}
                                                    onClick={() => updateFormData('budgetRange', range)}
                                                    className={`px-4 py-3 rounded-lg text-sm transition-all ${formData.budgetRange === range
                                                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                        } border`}
                                                >
                                                    {range}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">When do you want to launch?</label>
                                        <select
                                            value={formData.launchTimeline}
                                            onChange={(e) => updateFormData('launchTimeline', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="" className="bg-gray-900">Select timeline</option>
                                            <option value="asap" className="bg-gray-900">As soon as possible</option>
                                            <option value="1week" className="bg-gray-900">Within 1 week</option>
                                            <option value="2weeks" className="bg-gray-900">Within 2 weeks</option>
                                            <option value="1month" className="bg-gray-900">Within 1 month</option>
                                            <option value="exploring" className="bg-gray-900">Just exploring</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Team Setup */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Invite your team</h2>
                                <p className="text-white/50 mb-8">Collaborate with your marketing team. You can skip this for now.</p>

                                <div className="space-y-4">
                                    {formData.teamEmails.map((email, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => updateTeamEmail(index, e.target.value)}
                                                placeholder="team@company.com"
                                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                            {formData.teamEmails.length > 1 && (
                                                <button
                                                    onClick={() => removeTeamEmail(index)}
                                                    className="px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-red-400 hover:border-red-400/50 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={addTeamEmail}
                                        className="w-full px-4 py-3 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 transition-colors"
                                    >
                                        + Add another email
                                    </button>
                                </div>

                                <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <p className="text-sm text-white/70">
                                        <span className="font-semibold text-white">💡 Pro tip:</span> Having multiple team members speeds up approvals and keeps campaigns moving.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Payment Setup */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Secure Payment Setup</h2>
                                <p className="text-white/50 mb-8">Understand how ReachSecure protects your investment.</p>

                                <div className="space-y-6">
                                    <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                <Shield className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <h3 className="font-semibold text-white text-lg">ReachSecure Escrow</h3>
                                        </div>
                                        <ul className="space-y-3 text-white/70">
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>Your funds are held securely until content is approved</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>If a creator doesn't deliver, you're refunded automatically</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>Pay 100+ creators with a single click</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>Bank-grade encryption & SOC 2 compliant</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.paymentAcknowledged}
                                                onChange={(e) => updateFormData('paymentAcknowledged', e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                                            />
                                            <span className="text-white/70 text-sm">
                                                I understand that ReachStakes uses escrow to protect my payments and that funds are only released upon verified content delivery.
                                            </span>
                                        </label>
                                    </div>

                                    <p className="text-center text-white/40 text-sm">
                                        You can add payment methods after launching your first campaign.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                        <div>
                            {currentStep > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                            ) : (
                                <button
                                    onClick={handleSkip}
                                    className="text-white/40 hover:text-white/60 text-sm transition-colors"
                                >
                                    Skip for now
                                </button>
                            )}
                        </div>

                        <div>
                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${canProceed()
                                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    Continue
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={!canProceed() || isSubmitting}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${canProceed() && !isSubmitting
                                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Setting up...
                                        </>
                                    ) : (
                                        <>
                                            Launch Dashboard
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Trust Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-white/30">
                        🔒 Your information is encrypted and never shared with third parties.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BrandOnboardingWizard;
