import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    AlertCircle,
    X,
    Check,
    Loader2,
    ChevronRight,
    Info,
    History,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink
} from 'lucide-react';
import * as brandService from '../../api/brandService';
import paymentService from '../../api/paymentService';

// Fee Constants
const PLATFORM_FEE_PERCENT = 5;
const PROCESSING_FEE_PERCENT = 2.9;

const FundingModal = ({ isOpen, onClose, campaign, onSuccess, navigate }) => {
    const [amount, setAmount] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fees, setFees] = useState(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        if (campaign && !amount) {
            // Pre-fill with remaining amount needed
            const remaining = Math.max(0, (campaign.targetBudget || 0) - (campaign.escrowBalance || 0));
            setAmount(remaining.toString());
        }
    }, [campaign]);

    useEffect(() => {
        if (amount && parseFloat(amount) > 0) {
            setIsCalculating(true);
            const timer = setTimeout(() => {
                const amountNum = parseFloat(amount);
                const platformFee = amountNum * (PLATFORM_FEE_PERCENT / 100);
                const processingFee = amountNum * (PROCESSING_FEE_PERCENT / 100);
                setFees({
                    amount: amountNum,
                    platformFee: platformFee.toFixed(2),
                    processingFee: processingFee.toFixed(2),
                    total: (amountNum + platformFee + processingFee).toFixed(2)
                });
                setIsCalculating(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setFees(null);
        }
    }, [amount]);

    const handleSubmit = async () => {
        if (!fees || !agreedToTerms) return;
        setIsSubmitting(true);
        try {
            const response = await paymentService.initiateCampaignPayment(campaign.id, fees.amount);
            if (response.url) {
                // Store transaction ID for status tracking
                if (response.transactionId) {
                    sessionStorage.setItem('pendingTransactionId', response.transactionId);
                }
                window.location.href = response.url;
            } else if (response.transactionId) {
                // No redirect URL, navigate to status page
                navigate(`/brand/payment-status/${response.transactionId}`);
                onSuccess?.(response.transactionId);
                onClose();
            } else {
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !campaign) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fund Campaign</h2>
                            <p className="text-sm text-slate-500 mt-1">{campaign.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Campaign Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Target Budget</span>
                            <span className="font-bold text-gray-900 dark:text-white">${campaign.targetBudget?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Currently Funded</span>
                            <span className="font-bold text-emerald-500">${campaign.escrowBalance?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Remaining</span>
                            <span className="font-bold text-amber-500">
                                ${Math.max(0, (campaign.targetBudget || 0) - (campaign.escrowBalance || 0)).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Amount to Fund
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-4 text-2xl font-mono font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Fee Breakdown */}
                    {fees && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Fee Breakdown</div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Funding Amount</span>
                                    <span className="font-mono font-bold text-gray-900 dark:text-white">${fees.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                                    <span className="font-mono text-slate-500">${fees.platformFee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Processing Fee ({PROCESSING_FEE_PERCENT}%)</span>
                                    <span className="font-mono text-slate-500">${fees.processingFee}</span>
                                </div>
                                <div className="h-px bg-slate-300 dark:bg-slate-600 my-2" />
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-900 dark:text-white">Total Charge</span>
                                    <span className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">${fees.total}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Escrow Info */}
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl mb-6 text-sm">
                        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <p className="text-indigo-700 dark:text-indigo-300">
                            Funds are held in secure escrow until you approve creator deliverables.
                        </p>
                    </div>

                    {/* Terms Checkbox */}
                    <label className="flex items-center gap-3 mb-6 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                            {agreedToTerms && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="sr-only"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            I agree to the <a href="#" className="text-indigo-600 hover:underline">escrow terms</a>
                        </span>
                    </label>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!fees || !agreedToTerms || isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Proceed to Payment
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const EscrowVault = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedCampaignId = searchParams.get('campaign');

    const [campaigns, setCampaigns] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch campaigns and transactions in parallel
                const [campaignsResponse, transactionsData] = await Promise.all([
                    brandService.getBrandCampaigns(),
                    paymentService.getTransactionHistory().catch(() => [])
                ]);

                if (campaignsResponse.status === 'success') {
                    setCampaigns(campaignsResponse.data);

                    // If campaign ID is in URL, open funding modal for it
                    if (selectedCampaignId) {
                        const campaign = campaignsResponse.data.find(c => c.id === parseInt(selectedCampaignId));
                        if (campaign) {
                            setSelectedCampaign(campaign);
                            setIsFundingModalOpen(true);
                        }
                    }
                }

                setTransactions(transactionsData || []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedCampaignId]);

    // Calculate totals
    const totals = campaigns.reduce((acc, c) => ({
        totalFunded: acc.totalFunded + (c.totalFunded || 0),
        totalReleased: acc.totalReleased + (c.totalReleased || 0),
        available: acc.available + (c.escrowBalance || 0)
    }), { totalFunded: 0, totalReleased: 0, available: 0 });

    const handleFundCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setIsFundingModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-indigo-500" />
                        Escrow Vault
                    </h1>
                    <p className="text-slate-500 mt-1">Manage campaign funding and track escrow balances.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white"
                >
                    <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                        <ArrowUpRight className="w-4 h-4" />
                        Total Funded
                    </div>
                    <p className="text-4xl font-bold font-mono">${totals.totalFunded.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white"
                >
                    <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                        <ArrowDownRight className="w-4 h-4" />
                        Released to Creators
                    </div>
                    <p className="text-4xl font-bold font-mono">${totals.totalReleased.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white"
                >
                    <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                        <TrendingUp className="w-4 h-4" />
                        Available in Escrow
                    </div>
                    <p className="text-4xl font-bold font-mono">${totals.available.toLocaleString()}</p>
                </motion.div>
            </div>

            {/* Campaign Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Breakdown</h2>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {campaigns.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{campaign.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                        {campaign.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-slate-500">
                                    <span>Target: <strong className="text-gray-900 dark:text-white">${campaign.targetBudget?.toLocaleString()}</strong></span>
                                    <span>Funded: <strong className="text-emerald-600">${campaign.escrowBalance?.toLocaleString()}</strong></span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 w-full max-w-sm bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${campaign.fundingProgress >= 100
                                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                            : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                            }`}
                                        style={{ width: `${Math.min(campaign.fundingProgress || 0, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                                    {campaign.fundingProgress >= 100 ? (
                                        <span className="text-emerald-500 flex items-center gap-1">
                                            <Check className="w-5 h-5" /> Fully Funded
                                        </span>
                                    ) : (
                                        `${campaign.fundingProgress || 0}%`
                                    )}
                                </span>

                                {campaign.fundingProgress < 100 && (
                                    <button
                                        onClick={() => handleFundCampaign(campaign)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                                    >
                                        Fund
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {campaigns.length === 0 && (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Campaigns Yet</h3>
                            <p className="text-slate-500">Create a campaign to start funding.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-400" />
                            Recent Transactions
                        </h2>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.slice(0, 10).map((txn, index) => {
                            const statusConfig = {
                                'Pending': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                'Completed': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                'Failed': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                                'Processing': { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10' }
                            };
                            const config = statusConfig[txn.status] || statusConfig['Pending'];
                            const StatusIcon = config.icon;

                            return (
                                <motion.div
                                    key={txn.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${config.bg}`}>
                                            <StatusIcon className={`w-5 h-5 ${config.color} ${txn.status === 'Processing' ? 'animate-spin' : ''}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {txn.campaign?.title || txn.description || 'Campaign Funding'}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {new Date(txn.transactionDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-gray-900 dark:text-white">
                                                ${parseFloat(txn.amount).toLocaleString()}
                                            </p>
                                            <p className={`text-xs font-bold ${config.color}`}>
                                                {txn.status}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/brand/payment-status/${txn.id}`}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                            title="View Details"
                                        >
                                            <ExternalLink className="w-4 h-4 text-slate-400" />
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Funding Modal */}
            <FundingModal
                isOpen={isFundingModalOpen}
                onClose={() => {
                    setIsFundingModalOpen(false);
                    setSelectedCampaign(null);
                    // Clear URL param
                    if (selectedCampaignId) {
                        navigate('/brand/escrow', { replace: true });
                    }
                }}
                campaign={selectedCampaign}
                navigate={navigate}
                onSuccess={() => {
                    // Refresh data
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default EscrowVault;
