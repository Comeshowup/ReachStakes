import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link as LinkIcon,
    Zap,
    Check,
    AlertCircle,
    Loader2,
    Copy,
    ExternalLink,
    Users
} from 'lucide-react';
import api from '../../../api/axios';

/**
 * TrackingBundleGenerator - Component for brands to generate tracking bundles
 * Can be used for individual collaborations or bulk generation for a campaign
 */
const TrackingBundleGenerator = ({
    collaborationId,
    campaignId,
    onSuccess,
    variant = 'button' // 'button' | 'card' | 'inline'
}) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Generate single bundle
    const generateBundle = async () => {
        if (!collaborationId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await api.post(`/attribution/generate/${collaborationId}`);
            setResult(response.data.data);

            if (onSuccess) {
                onSuccess(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Generate all bundles for campaign
    const generateAllBundles = async () => {
        if (!campaignId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await api.post(`/attribution/campaign/${campaignId}/generate-all`);
            setResult(response.data.data);

            if (onSuccess) {
                onSuccess(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = collaborationId ? generateBundle : generateAllBundles;

    // Copy to clipboard helper
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Button variant
    if (variant === 'button') {
        return (
            <div className="inline-flex flex-col items-start gap-2">
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${result
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : result ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <LinkIcon className="w-4 h-4" />
                    )}
                    {loading ? 'Generating...' : result ? 'Generated!' : 'Generate Tracking'}
                </button>

                {error && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </p>
                )}

                {result && result.shortLinkUrl && (
                    <button
                        onClick={() => copyToClipboard(result.shortLinkUrl)}
                        className="text-sm text-slate-400 hover:text-white transition flex items-center gap-1"
                    >
                        <Copy className="w-3 h-3" />
                        {result.shortLinkUrl}
                    </button>
                )}
            </div>
        );
    }

    // Card variant (for bulk generation)
    if (variant === 'card') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-violet-400" />
                            Generate Tracking Links
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            {campaignId
                                ? 'Generate tracking bundles for all approved creators'
                                : 'Generate tracking links for this creator'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Users className="w-5 h-5" />
                            {campaignId ? 'Generate All Tracking Links' : 'Generate Tracking Link'}
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                        >
                            <p className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                        >
                            <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
                                <Check className="w-5 h-5" />
                                Tracking Generated Successfully!
                            </div>

                            {/* Show results for bulk generation */}
                            {result.generated !== undefined && (
                                <div className="text-sm text-slate-300">
                                    <p>✓ {result.generated} tracking bundles created</p>
                                    {result.errors > 0 && (
                                        <p className="text-amber-400">⚠️ {result.errors} errors occurred</p>
                                    )}
                                </div>
                            )}

                            {/* Show result for single generation */}
                            {result.shortLinkUrl && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                        <code className="text-sm text-white">{result.shortLinkUrl}</code>
                                        <button
                                            onClick={() => copyToClipboard(result.shortLinkUrl)}
                                            className="p-1.5 rounded hover:bg-white/10 transition"
                                        >
                                            <Copy className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                        <span className="text-sm text-slate-400">Affiliate Code:</span>
                                        <code className="text-sm text-white">{result.affiliateCode}</code>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    // Inline variant
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="p-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition disabled:opacity-50"
                title="Generate tracking link"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : result ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                    <LinkIcon className="w-4 h-4" />
                )}
            </button>

            {result?.shortLinkUrl && (
                <a
                    href={result.shortLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white transition"
                >
                    <ExternalLink className="w-3 h-3" />
                </a>
            )}
        </div>
    );
};

export default TrackingBundleGenerator;
