import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    ArrowLeft,
    RefreshCw,
    CreditCard,
    Receipt,
    Calendar,
    Hash,
    FileText,
    ExternalLink,
    AlertCircle,
    Wallet
} from 'lucide-react';
import paymentService from '../../api/paymentService';

const STATUS_CONFIG = {
    Pending: {
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        label: 'Payment Pending',
        description: 'Waiting for payment to be completed'
    },
    Processing: {
        icon: Loader2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        label: 'Processing',
        description: 'Payment is being processed'
    },
    Completed: {
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        label: 'Payment Successful',
        description: 'Funds have been added to escrow'
    },
    Failed: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        label: 'Payment Failed',
        description: 'Transaction could not be completed'
    }
};

const PaymentStatus = () => {
    const { transactionId } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchTransaction = async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        try {
            const data = await paymentService.getTransactionStatus(transactionId);
            setTransaction(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch transaction:', err);
            setError('Failed to load transaction details');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransaction();

        // Poll for status updates if pending
        const interval = setInterval(() => {
            if (transaction?.status === 'Pending' || transaction?.status === 'Processing') {
                fetchTransaction();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [transactionId]);

    // Auto-refresh when transaction is pending
    useEffect(() => {
        if (transaction?.status === 'Pending') {
            const interval = setInterval(() => fetchTransaction(), 10000);
            return () => clearInterval(interval);
        }
    }, [transaction?.status]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="p-6">
                <div className="max-w-lg mx-auto text-center py-12">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Transaction Not Found
                    </h2>
                    <p className="text-slate-500 mb-6">{error || 'Unable to load transaction details'}</p>
                    <Link
                        to="/brand/escrow"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Escrow Vault
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.Pending;
    const StatusIcon = statusConfig.icon;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate('/brand/escrow')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Escrow Vault
            </button>

            {/* Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-8 mb-6 border-2 ${statusConfig.bgColor} ${statusConfig.borderColor}`}
            >
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        <StatusIcon className={`w-20 h-20 ${statusConfig.color} ${transaction.status === 'Processing' ? 'animate-spin' : ''}`} />
                    </motion.div>
                    <h1 className={`text-3xl font-bold mt-4 ${statusConfig.color}`}>
                        {statusConfig.label}
                    </h1>
                    <p className="text-slate-500 mt-2">{statusConfig.description}</p>

                    {/* Amount */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500 mb-1">Amount</p>
                        <p className="text-4xl font-bold font-mono text-gray-900 dark:text-white">
                            ${parseFloat(transaction.amount).toLocaleString()}
                        </p>
                    </div>

                    {/* Refresh Button for Pending */}
                    {(transaction.status === 'Pending' || transaction.status === 'Processing') && (
                        <button
                            onClick={() => fetchTransaction(true)}
                            disabled={isRefreshing}
                            className="mt-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
                        </button>
                    )}

                    {/* Continue to Payment Button for Pending */}
                    {transaction.status === 'Pending' && transaction.checkoutUrl && (
                        <a
                            href={transaction.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                        >
                            <CreditCard className="w-5 h-5" />
                            Continue to Payment
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </motion.div>

            {/* Transaction Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-slate-400" />
                        Transaction Details
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    {/* Transaction ID */}
                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Hash className="w-5 h-5" />
                            Transaction ID
                        </div>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                            #{transaction.id}
                        </span>
                    </div>

                    {/* Reference ID */}
                    {transaction.tazapayReferenceId && (
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-slate-500">
                                <FileText className="w-5 h-5" />
                                Reference ID
                            </div>
                            <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                                {transaction.tazapayReferenceId}
                            </span>
                        </div>
                    )}

                    {/* Campaign */}
                    {transaction.campaign && (
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Wallet className="w-5 h-5" />
                                Campaign
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {transaction.campaign.title}
                            </span>
                        </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Calendar className="w-5 h-5" />
                            Created
                        </div>
                        <span className="text-gray-900 dark:text-white">
                            {formatDate(transaction.transactionDate)}
                        </span>
                    </div>

                    {/* Processed At */}
                    {transaction.processedAt && (
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-slate-500">
                                <CheckCircle2 className="w-5 h-5" />
                                Processed
                            </div>
                            <span className="text-gray-900 dark:text-white">
                                {formatDate(transaction.processedAt)}
                            </span>
                        </div>
                    )}

                    {/* Fee Breakdown */}
                    <div className="pt-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                            Fee Breakdown
                        </h3>
                        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Funding Amount</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">
                                    ${parseFloat(transaction.netAmount || transaction.amount).toLocaleString()}
                                </span>
                            </div>
                            {transaction.platformFee && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Platform Fee</span>
                                    <span className="font-mono text-slate-500">
                                        ${parseFloat(transaction.platformFee).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            {transaction.processingFee && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Processing Fee</span>
                                    <span className="font-mono text-slate-500">
                                        ${parseFloat(transaction.processingFee).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="h-px bg-slate-300 dark:bg-slate-600 my-2" />
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-900 dark:text-white">Total Charged</span>
                                <span className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                    ${parseFloat(transaction.amount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                    to="/brand/escrow"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <Wallet className="w-5 h-5" />
                    View Escrow Vault
                </Link>

                {transaction.status === 'Completed' && transaction.campaign && (
                    <Link
                        to={`/brand/campaigns/${transaction.campaign.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors"
                    >
                        View Campaign
                        <ExternalLink className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
