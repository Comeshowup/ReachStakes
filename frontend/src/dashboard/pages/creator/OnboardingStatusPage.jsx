import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    ArrowLeft,
    RefreshCw,
    Shield,
    Building2,
    ExternalLink,
    Loader2
} from "lucide-react";
import payoutService from "../../../api/payoutService";

/**
 * OnboardingStatusPage - Shows the status of Tazapay beneficiary onboarding
 * 
 * Creators are redirected here after completing (or abandoning) onboarding on Tazapay.
 * This page polls for status updates from the backend (which receives webhooks from Tazapay).
 */
const OnboardingStatusPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [polling, setPolling] = useState(false);

    // Check for query params from Tazapay redirect
    const success = searchParams.get('success');
    const tazapayStatus = searchParams.get('status');

    useEffect(() => {
        fetchOnboardingStatus();

        // Poll for updates every 5 seconds if not complete
        const interval = setInterval(() => {
            if (!status?.isComplete) {
                fetchOnboardingStatus(true);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchOnboardingStatus = async (isPolling = false) => {
        if (isPolling) setPolling(true);
        else setLoading(true);

        try {
            const response = await payoutService.getOnboardingStatus();
            if (response.success) {
                setStatus(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch status');
        } finally {
            setLoading(false);
            setPolling(false);
        }
    };

    const handleContinueOnboarding = async () => {
        if (status?.onboardingLink) {
            window.location.href = status.onboardingLink;
        } else if (status?.linkExpired) {
            try {
                setLoading(true);
                const response = await payoutService.regenerateOnboardingLink();
                if (response.success) {
                    window.location.href = response.data.onboardingUrl;
                }
            } catch (err) {
                setError(err.message || 'Failed to generate new link');
            } finally {
                setLoading(false);
            }
        }
    };

    const getStatusConfig = () => {
        if (!status) return null;

        if (status.isComplete && status.isActive) {
            return {
                icon: CheckCircle,
                iconColor: '#00FF88',
                iconBg: 'rgba(0, 255, 136, 0.1)',
                title: 'Bank Account Connected!',
                subtitle: 'You\'re all set to receive payouts',
                status: 'success'
            };
        }

        switch (status.onboardingStatus) {
            case 'NotStarted':
                return {
                    icon: Building2,
                    iconColor: '#9CA3AF',
                    iconBg: 'rgba(156, 163, 175, 0.1)',
                    title: 'Setup Not Started',
                    subtitle: 'Connect your bank account to receive payouts',
                    status: 'not_started'
                };
            case 'LinkGenerated':
                return {
                    icon: ExternalLink,
                    iconColor: '#3B82F6',
                    iconBg: 'rgba(59, 130, 246, 0.1)',
                    title: 'Setup In Progress',
                    subtitle: 'Complete your setup on Tazapay\'s secure portal',
                    status: 'pending'
                };
            case 'InProgress':
            case 'PendingApproval':
                return {
                    icon: Clock,
                    iconColor: '#F59E0B',
                    iconBg: 'rgba(245, 158, 11, 0.1)',
                    title: 'Pending Verification',
                    subtitle: 'Your information is being reviewed by Tazapay',
                    status: 'pending'
                };
            case 'Approved':
                return {
                    icon: CheckCircle,
                    iconColor: '#00FF88',
                    iconBg: 'rgba(0, 255, 136, 0.1)',
                    title: 'Approved!',
                    subtitle: 'Your bank account has been verified',
                    status: 'success'
                };
            case 'Rejected':
                return {
                    icon: XCircle,
                    iconColor: '#EF4444',
                    iconBg: 'rgba(239, 68, 68, 0.1)',
                    title: 'Verification Failed',
                    subtitle: 'Please contact support or try again with correct information',
                    status: 'error'
                };
            default:
                return {
                    icon: AlertCircle,
                    iconColor: '#9CA3AF',
                    iconBg: 'rgba(156, 163, 175, 0.1)',
                    title: 'Status Unknown',
                    subtitle: 'Please refresh or contact support',
                    status: 'unknown'
                };
        }
    };

    const statusConfig = getStatusConfig();

    if (loading && !status) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
                <div className="text-center">
                    <Loader2 size={40} className="text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading onboarding status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
            {/* Header */}
            <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/creator/financials')}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Bank Setup Status</h1>
                        <p className="text-sm text-white/50">Secure payout onboarding</p>
                    </div>
                    {polling && (
                        <div className="ml-auto flex items-center gap-2 text-white/40 text-sm">
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Checking...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Status Card */}
                    {statusConfig && (
                        <div
                            className="p-8 rounded-2xl border text-center"
                            style={{
                                background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.8), rgba(10, 10, 20, 0.9))',
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {/* Status Icon */}
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: statusConfig.iconBg }}
                            >
                                <statusConfig.icon size={48} style={{ color: statusConfig.iconColor }} />
                            </div>

                            {/* Status Text */}
                            <h2 className="text-2xl font-bold text-white mb-2">{statusConfig.title}</h2>
                            <p className="text-white/60 mb-6">{statusConfig.subtitle}</p>

                            {/* Bank Details (if connected) */}
                            {status?.bankDetails && (
                                <div
                                    className="p-4 rounded-xl mx-auto max-w-xs"
                                    style={{ background: 'rgba(0, 255, 136, 0.05)' }}
                                >
                                    <p className="text-emerald-400 font-medium">
                                        {status.bankDetails.bankName || 'Bank Account'}
                                    </p>
                                    <p className="text-white/60 text-sm">
                                        ****{status.bankDetails.lastFour} • {status.bankDetails.currency}
                                    </p>
                                    {status.bankDetails.connectedAt && (
                                        <p className="text-white/40 text-xs mt-2">
                                            Connected {new Date(status.bankDetails.connectedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions based on status */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                {/* Not started or has valid link */}
                                {(status?.onboardingStatus === 'LinkGenerated' && status?.onboardingLink) && (
                                    <button
                                        onClick={handleContinueOnboarding}
                                        className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                                            color: '#000'
                                        }}
                                    >
                                        <ExternalLink size={18} />
                                        Continue Setup
                                    </button>
                                )}

                                {/* Link expired */}
                                {status?.linkExpired && (
                                    <button
                                        onClick={handleContinueOnboarding}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                            color: '#000'
                                        }}
                                    >
                                        {loading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <RefreshCw size={18} />
                                        )}
                                        Get New Link
                                    </button>
                                )}

                                {/* Already complete - go to financials */}
                                {status?.isComplete && (
                                    <button
                                        onClick={() => navigate('/creator/financials')}
                                        className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                                            color: '#000'
                                        }}
                                    >
                                        Go to Financials
                                    </button>
                                )}

                                {/* Back button */}
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-6 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Timeline / Details */}
                    {status && (
                        <div
                            className="p-6 rounded-xl border"
                            style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-emerald-400" />
                                Onboarding Details
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/50">Status</span>
                                    <span className="text-white">{status.onboardingStatus || 'Not Started'}</span>
                                </div>
                                {status.entityId && (
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Entity ID</span>
                                        <span className="text-white/70 font-mono text-xs">{status.entityId}</span>
                                    </div>
                                )}
                                {status.beneficiaryId && (
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Beneficiary ID</span>
                                        <span className="text-white/70 font-mono text-xs">{status.beneficiaryId}</span>
                                    </div>
                                )}
                                {status.tazapayStatus && (
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Tazapay Status</span>
                                        <span className="text-white">{status.tazapayStatus}</span>
                                    </div>
                                )}
                                {status.expiresAt && !status.isComplete && (
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Link Expires</span>
                                        <span className={status.linkExpired ? 'text-red-400' : 'text-white'}>
                                            {status.linkExpired ? 'Expired' : new Date(status.expiresAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div
                            className="p-4 rounded-xl border flex items-center gap-3"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderColor: 'rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <AlertCircle size={20} className="text-red-400" />
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="text-center text-white/40 text-sm">
                        <p>
                            Having trouble? Contact our support team at{' '}
                            <a href="mailto:support@reachstakes.com" className="text-emerald-400 hover:underline">
                                support@reachstakes.com
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OnboardingStatusPage;
