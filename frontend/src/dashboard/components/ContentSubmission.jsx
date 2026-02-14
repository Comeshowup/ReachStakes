import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Link as LinkIcon,
    FileText,
    Upload,
    CheckCircle,
    Loader2,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

/**
 * ContentSubmission Component
 * 
 * Modal for creators to submit content links for campaigns.
 * Based on design reference: dark header modal, underline-style inputs, pill submit button.
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when modal is closed
 * @param {object} campaign - Campaign data for context
 * @param {function} onSubmit - Callback with submission data
 */

const CONTENT_TYPES = [
    { id: 'video', label: 'Video Content' },
    { id: 'post', label: 'Social Post' },
    { id: 'story', label: 'Story' },
    { id: 'reel', label: 'Reel/Short' },
    { id: 'other', label: 'Other' },
];

export default function ContentSubmission({
    isOpen,
    onClose,
    campaign,
    onSubmit,
    isLoading = false
}) {
    const [formData, setFormData] = useState({
        contentUrl: '',
        contentType: 'video',
        notes: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.contentUrl.trim()) {
            setError('Please provide a content link');
            return;
        }

        // Basic URL validation
        try {
            new URL(formData.contentUrl);
        } catch {
            setError('Please enter a valid URL');
            return;
        }

        try {
            await onSubmit?.(formData);
            setSubmitted(true);

            // Reset and close after showing success
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ contentUrl: '', contentType: 'video', notes: '' });
                onClose?.();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to submit. Please try again.');
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setFormData({ contentUrl: '', contentType: 'video', notes: '' });
            setError(null);
            setSubmitted(false);
            onClose?.();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    {/* Header - Dark banner style per design reference */}
                    <div className="bg-indigo-600 dark:bg-indigo-700 p-6 relative">
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white">Submit Content</h2>
                        <p className="text-indigo-200 text-sm mt-1">
                            {campaign?.title || 'Campaign'}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Submitted for Approval
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    The brand will review your content shortly.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Content URL - Underline style input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Content Link *
                                    </label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            value={formData.contentUrl}
                                            onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                            placeholder="https://www.instagram.com/p/..."
                                            className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Content Type Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Content Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.contentType}
                                            onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                                            className="w-full px-4 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 dark:text-white appearance-none cursor-pointer"
                                        >
                                            {CONTENT_TYPES.map((type) => (
                                                <option key={type.id} value={type.id} className="dark:bg-slate-800">
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Notes - Optional */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Notes (optional)
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Any additional context for the brand..."
                                            rows={3}
                                            maxLength={500}
                                            className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 focus:outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                                        />
                                    </div>
                                    <p className="text-right text-xs text-slate-400 mt-1">
                                        {formData.notes.length}/500
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button - Pill shaped per design reference */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Submit for Approval
                                        </>
                                    )}
                                </button>

                                {/* Trust Footer */}
                                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                                    🔒 Content is reviewed within 24-48 hours
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
