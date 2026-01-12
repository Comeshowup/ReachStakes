import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Shield,
    Lock,
    ExternalLink,
    CheckCircle,
    Loader2,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import payoutService from "../../api/payoutService";

/**
 * SecureOnboardingModal - Initiates secure hosted onboarding via Tazapay
 * 
 * Unlike the old BankConnectModal, this component:
 * - Does NOT collect bank details directly
 * - Generates a secure redirect URL to Tazapay's hosted onboarding
 * - User enters bank/KYC info directly on Tazapay's secure servers
 * - Only receives status updates via webhooks
 */
const SecureOnboardingModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Info, 2: Redirecting, 3: Error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [onboardingUrl, setOnboardingUrl] = useState(null);

    const handleInitiateOnboarding = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await payoutService.initiateOnboarding();

            if (response.success) {
                setOnboardingUrl(response.data.onboardingUrl);
                setStep(2);

                // Redirect to Tazapay after a brief delay to show the user what's happening
                setTimeout(() => {
                    window.location.href = response.data.onboardingUrl;
                }, 1500);
            } else {
                setError(response.message || 'Failed to initiate onboarding');
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to initiate onboarding');
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setError(null);
        setOnboardingUrl(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.98), rgba(10, 10, 20, 0.99))',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        borderRadius: '24px',
                        boxShadow: '0 30px 100px -20px rgba(0, 255, 136, 0.2)',
                        backdropFilter: 'blur(20px)',
                    }}
                    className="w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-3 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 200, 100, 0.1))',
                                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)'
                                }}
                            >
                                <Shield size={24} style={{ color: '#00FF88' }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Secure Bank Setup</h2>
                                <p className="text-sm text-white/50">Protected by Tazapay</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-white/60" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Step 1: Info & Initiate */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Security Explanation */}
                                <div className="space-y-4">
                                    <p className="text-white/80 leading-relaxed">
                                        You'll be securely redirected to Tazapay's portal to complete your bank setup.
                                        Your banking details are <span className="text-emerald-400 font-medium">never stored on our servers</span>.
                                    </p>

                                    {/* Security Features */}
                                    <div className="space-y-3">
                                        {[
                                            { icon: Lock, text: 'Bank-grade encryption' },
                                            { icon: Shield, text: 'PCI DSS compliant' },
                                            { icon: CheckCircle, text: 'Identity verification included' }
                                        ].map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 rounded-lg"
                                                style={{ background: 'rgba(0, 255, 136, 0.05)' }}
                                            >
                                                <feature.icon size={18} className="text-emerald-400" />
                                                <span className="text-white/70 text-sm">{feature.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* What to Expect */}
                                <div
                                    className="p-4 rounded-xl border"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderColor: 'rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    <p className="text-white/50 text-sm mb-2">What to expect:</p>
                                    <ul className="text-white/70 text-sm space-y-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            Enter your bank account details
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            Upload ID for verification
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            Return here once complete
                                        </li>
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={handleInitiateOnboarding}
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{
                                        background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                                        color: '#000',
                                        boxShadow: '0 10px 30px -10px rgba(0, 255, 136, 0.4)'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Preparing secure link...
                                        </>
                                    ) : (
                                        <>
                                            Continue to Secure Setup
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Redirecting */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                                    style={{ background: 'rgba(0, 255, 136, 0.1)' }}
                                >
                                    <Loader2 size={36} className="text-emerald-400 animate-spin" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Redirecting to Tazapay...</h3>
                                <p className="text-white/60 mb-6">
                                    You'll be taken to Tazapay's secure portal to complete setup.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                                    <ExternalLink size={14} />
                                    <span>Opening secure page</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Error */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                >
                                    <AlertCircle size={36} className="text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                                <p className="text-white/60 mb-6">{error}</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setError(null);
                                        }}
                                        className="px-6 py-3 rounded-xl font-medium transition-colors"
                                        style={{
                                            background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                                            color: '#000'
                                        }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 flex items-center justify-center gap-2 text-white/40 text-xs">
                        <Lock size={12} />
                        <span>Your data is securely handled by Tazapay • PCI DSS Compliant</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SecureOnboardingModal;
