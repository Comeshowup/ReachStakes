import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    User,
    Link as LinkIcon,
    Tag,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Check,
    Camera,
    Instagram,
    Youtube,
    ArrowRight,
    Loader2,
    DollarSign,
    Target
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const STEPS = [
    { id: 1, title: 'Profile Setup', icon: User },
    { id: 2, title: 'Social Accounts', icon: LinkIcon },
    { id: 3, title: 'Niche & Rates', icon: Tag },
    { id: 4, title: 'First Match', icon: Sparkles },
];

const NICHES = [
    'Beauty & Makeup',
    'Fashion & Style',
    'Fitness & Health',
    'Gaming',
    'Tech & Gadgets',
    'Food & Cooking',
    'Travel & Lifestyle',
    'Music & Entertainment',
    'Business & Finance',
    'Parenting & Family',
    'DIY & Crafts',
    'Other'
];

const PLATFORMS = [
    { id: 'YouTube', icon: Youtube, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'Instagram', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
    { id: 'TikTok', icon: Sparkles, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
];

const CreatorOnboardingWizard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matchedCampaigns, setMatchedCampaigns] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Profile
        fullName: '',
        handle: '',
        tagline: '',
        avatarUrl: '',

        // Step 2: Social - display only, linking happens on separate page
        selectedPlatforms: [],

        // Step 3: Niche & Rates
        niches: [],
        basePrice: '',
        location: '',
    });

    useEffect(() => {
        // Pre-fill from existing profile if available
        fetchExistingProfile();
    }, []);

    useEffect(() => {
        // Fetch matched campaigns when reaching step 4
        if (currentStep === 4) {
            fetchMatchedCampaigns();
        }
    }, [currentStep]);

    const fetchExistingProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/users/me/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success' && response.data.data) {
                const profile = response.data.data;
                setFormData(prev => ({
                    ...prev,
                    fullName: profile.fullName || prev.fullName,
                    handle: profile.handle || prev.handle,
                    tagline: profile.tagline || prev.tagline,
                    avatarUrl: profile.avatarUrl || prev.avatarUrl,
                    niches: profile.nicheTags || prev.niches,
                    basePrice: profile.basePrice || prev.basePrice,
                    location: profile.location || prev.location,
                }));
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const fetchMatchedCampaigns = async () => {
        setLoadingMatches(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/campaigns`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: 'Active', limit: 3 }
            });
            if (response.data.status === 'success') {
                setMatchedCampaigns(response.data.data?.slice(0, 3) || []);
            }
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
        } finally {
            setLoadingMatches(false);
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleNiche = (niche) => {
        setFormData(prev => ({
            ...prev,
            niches: prev.niches.includes(niche)
                ? prev.niches.filter(n => n !== niche)
                : [...prev.niches, niche].slice(0, 3) // Max 3 niches
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.fullName && formData.handle;
            case 2:
                return true; // Social linking is optional in wizard
            case 3:
                return formData.niches.length > 0;
            case 4:
                return true;
            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (currentStep < 4) {
            // Save progress to backend
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE_URL}/users/me/onboarding`, {
                    step: currentStep
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Failed to save progress:', err);
            }
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
            const token = localStorage.getItem('token');

            // Update creator profile
            await axios.put(`${API_BASE_URL}/creators/profile`, {
                fullName: formData.fullName,
                handle: formData.handle,
                tagline: formData.tagline,
                avatarUrl: formData.avatarUrl,
                nicheTags: formData.niches,
                basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
                location: formData.location,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Mark onboarding as complete
            await axios.put(`${API_BASE_URL}/users/me/onboarding`, {
                step: 4,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Redirect to dashboard
            setTimeout(() => {
                navigate('/creator');
            }, 1000);
        } catch (error) {
            console.error('Onboarding error:', error);
            alert("Failed to save profile. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/users/me/onboarding`, {
                step: 4,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Failed to skip:', err);
        }
        navigate('/creator');
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
                        {/* Step 1: Profile Setup */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Set up your profile</h2>
                                <p className="text-white/50 mb-8">This is how brands will see you.</p>

                                <div className="space-y-6">
                                    {/* Avatar Preview */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                                                {formData.avatarUrl ? (
                                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                            <button className="absolute -bottom-1 -right-1 p-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-400 transition-colors">
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white/70 text-sm">Profile photo</p>
                                            <p className="text-white/40 text-xs">You can upload this later in Settings</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => updateFormData('fullName', e.target.value)}
                                            placeholder="Alex Johnson"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Username / Handle *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                                            <input
                                                type="text"
                                                value={formData.handle}
                                                onChange={(e) => updateFormData('handle', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                placeholder="alexcreates"
                                                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Tagline (optional)</label>
                                        <input
                                            type="text"
                                            value={formData.tagline}
                                            onChange={(e) => updateFormData('tagline', e.target.value)}
                                            placeholder="Tech reviewer & lifestyle vlogger"
                                            maxLength={100}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                        <p className="text-right text-xs text-white/30 mt-1">{formData.tagline.length}/100</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Social Accounts */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Connect your platforms</h2>
                                <p className="text-white/50 mb-8">Link your social accounts to unlock campaign matching.</p>

                                <div className="space-y-4">
                                    {PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => navigate('/creator/social-accounts')}
                                            className="w-full flex items-center gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group"
                                        >
                                            <div className={`p-3 rounded-lg ${platform.bgColor}`}>
                                                <platform.icon className={`w-6 h-6 ${platform.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white">{platform.id}</h3>
                                                <p className="text-sm text-white/50">Click to connect</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <p className="text-sm text-white/70">
                                        <span className="font-semibold text-white">💡 Pro tip:</span> Connecting accounts helps us verify your stats and match you with better-paying campaigns.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Niche & Rates */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Your expertise</h2>
                                <p className="text-white/50 mb-8">Select your content niches and set your rates.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-3">
                                            Content Niches (select up to 3) *
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {NICHES.map(niche => (
                                                <button
                                                    key={niche}
                                                    onClick={() => toggleNiche(niche)}
                                                    disabled={formData.niches.length >= 3 && !formData.niches.includes(niche)}
                                                    className={`px-4 py-3 rounded-lg text-sm text-left transition-all ${formData.niches.includes(niche)
                                                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                                        : formData.niches.length >= 3
                                                            ? 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                                                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                        } border`}
                                                >
                                                    {formData.niches.includes(niche) && <Check className="w-4 h-4 inline mr-2" />}
                                                    {niche}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Base Rate per Campaign (optional)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <input
                                                type="number"
                                                value={formData.basePrice}
                                                onChange={(e) => updateFormData('basePrice', e.target.value)}
                                                placeholder="500"
                                                min="0"
                                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">Brands will see this as your starting rate</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Location (optional)</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => updateFormData('location', e.target.value)}
                                            placeholder="Los Angeles, CA"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: First Match */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">🎉 You're all set!</h2>
                                <p className="text-white/50 mb-8">Here are some campaigns that match your profile.</p>

                                {loadingMatches ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    </div>
                                ) : matchedCampaigns.length > 0 ? (
                                    <div className="space-y-4">
                                        {matchedCampaigns.map((campaign, index) => (
                                            <div
                                                key={campaign.id}
                                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate">{campaign.title}</h3>
                                                    <p className="text-sm text-white/50">{campaign.platformRequired || 'Multiple Platforms'}</p>
                                                </div>
                                                <span className="text-emerald-400 font-bold">
                                                    ${campaign.targetBudget ? parseFloat(campaign.targetBudget).toLocaleString() : 'TBD'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <p className="text-white/70">No campaigns available yet, but you'll be notified when matches arrive!</p>
                                    </div>
                                )}

                                <div className="mt-8 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg">
                                    <p className="text-sm text-white/70">
                                        <span className="font-semibold text-emerald-400">✓ Profile Ready</span> —
                                        You can now apply to campaigns and start earning!
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
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${!isSubmitting
                                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Setting up...
                                        </>
                                    ) : (
                                        <>
                                            Go to Dashboard
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
                        🔒 Your information is encrypted and only shared with brands you apply to.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreatorOnboardingWizard;
