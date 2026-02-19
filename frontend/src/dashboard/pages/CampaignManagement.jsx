import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as brandService from '../../api/brandService';
import {
    Plus,
    X,
    Loader2,
    AlertCircle,
} from 'lucide-react';

// Campaign Management Console Components
import PageHeader from '../components/brand/campaigns/PageHeader';
import FilterBar from '../components/brand/campaigns/FilterBar';
import CampaignGrid from '../components/brand/campaigns/CampaignGrid';
import CampaignTable from '../components/brand/campaigns/CampaignTable';
import EmptyState from '../components/brand/campaigns/EmptyState';
import { useCampaignFilters } from '../components/brand/campaigns/useCampaignFilters';
import { mapApiCampaign } from '../components/brand/campaigns/campaignUtils';

// =====================
// ANIMATION TOKENS
// =====================
const VIEW_TRANSITION = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.15, ease: 'easeOut' },
};

// =====================
// SKELETON LOADER
// =====================
const SkeletonCard = () => (
    <div className="bd-cm-card p-6">
        <div className="flex items-start justify-between mb-5">
            <div>
                <div className="bd-cm-skeleton h-4 w-14 mb-2.5" />
                <div className="bd-cm-skeleton h-5 w-44" />
            </div>
            <div className="bd-cm-skeleton h-8 w-8 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
            {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                    <div className="bd-cm-skeleton h-3 w-16 mb-2" />
                    <div className="bd-cm-skeleton h-5 w-20" />
                </div>
            ))}
        </div>
        <div className="bd-cm-skeleton h-1.5 w-full rounded-full mb-5" />
        <div className="bd-cm-skeleton h-9 w-full rounded-lg" />
    </div>
);

const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

// =====================
// ERROR STATE
// =====================
const ErrorState = ({ onRetry }) => (
    <motion.div {...VIEW_TRANSITION} className="bd-cm-empty flex flex-col items-center justify-center py-16 text-center">
        <div
            className="p-3 rounded-full mb-4"
            style={{ background: 'var(--bd-danger-muted)' }}
        >
            <AlertCircle className="w-5 h-5" style={{ color: 'var(--bd-danger)' }} />
        </div>
        <h3
            className="text-base font-medium"
            style={{ color: 'var(--bd-text-primary)' }}
        >
            Failed to load campaigns
        </h3>
        <p
            className="mt-1 mb-5 max-w-sm text-sm"
            style={{ color: 'var(--bd-text-secondary)' }}
        >
            Something went wrong. Please try again.
        </p>
        <button
            onClick={onRetry}
            className="bd-cm-btn-secondary bd-cm-focus-ring text-sm"
            aria-label="Retry loading campaigns"
        >
            Try Again
        </button>
    </motion.div>
);

// =====================
// REQUEST CAMPAIGN MODAL (preserved from original)
// =====================
const RequestCampaignModal = ({ isOpen, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        platformRequired: 'Instagram',
        campaignType: 'UGC',
        targetBudget: '',
        deadline: '',
        usageRights: '30 Days',
        isWhitelistingRequired: false
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                platformRequired: formData.platformRequired,
                campaignType: formData.campaignType,
                targetBudget: formData.targetBudget,
                deadline: formData.deadline,
                usageRights: formData.usageRights,
                isWhitelistingRequired: formData.isWhitelistingRequired
            };

            const response = await brandService.createCampaign(payload);
            if (response.status === 'success') {
                onClose();
                if (onSuccess) onSuccess();
                navigate('/brand/contact?tab=meeting');
            }
        } catch (error) {
            console.error("Failed to create campaign:", error);
            alert("Failed to create campaign. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'var(--bd-overlay)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onClick={(e) => e.stopPropagation()}
                    className="bd-cm-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    style={{ borderRadius: 'var(--bd-radius-3xl)' }}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-0.5">
                            <h2
                                className="text-xl font-semibold"
                                style={{ color: 'var(--bd-text-primary)' }}
                            >
                                Create New Campaign
                            </h2>
                            <p
                                className="text-sm"
                                style={{ color: 'var(--bd-text-secondary)' }}
                            >
                                Launch your next influencer initiative.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bd-cm-icon-btn bd-cm-focus-ring"
                            aria-label="Close modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Title */}
                        <FieldGroup label="Campaign Title">
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Summer Collection Launch 2026"
                                className="bd-cm-input-field bd-cm-focus-ring w-full px-4"
                                required
                            />
                        </FieldGroup>

                        {/* Goal/Description */}
                        <FieldGroup label="Campaign Goal & Description">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your campaign goals, requirements, and deliverables..."
                                className="bd-cm-input-field bd-cm-focus-ring w-full p-4 h-28 resize-none"
                                style={{ height: 'auto', minHeight: '112px' }}
                                required
                            />
                        </FieldGroup>

                        {/* Platform & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FieldGroup label="Platform">
                                <select
                                    name="platformRequired"
                                    value={formData.platformRequired}
                                    onChange={handleChange}
                                    className="bd-cm-input-field bd-cm-focus-ring w-full px-4 cursor-pointer"
                                >
                                    <option value="Instagram">Instagram</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="UGC">Multi-Platform / UGC</option>
                                </select>
                            </FieldGroup>
                            <FieldGroup label="Campaign Type">
                                <select
                                    name="campaignType"
                                    value={formData.campaignType}
                                    onChange={handleChange}
                                    className="bd-cm-input-field bd-cm-focus-ring w-full px-4 cursor-pointer"
                                >
                                    <option value="UGC">UGC (Content Only)</option>
                                    <option value="Influencer">Influencer Post</option>
                                    <option value="Affiliate">Affiliate / Performance</option>
                                </select>
                            </FieldGroup>
                        </div>

                        {/* Budget & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FieldGroup label="Target Budget">
                                <div className="relative">
                                    <span
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                                        style={{ color: 'var(--bd-text-muted)' }}
                                    >
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="targetBudget"
                                        value={formData.targetBudget}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        className="bd-cm-input-field bd-cm-focus-ring w-full pl-8 pr-4"
                                        required
                                    />
                                </div>
                            </FieldGroup>
                            <FieldGroup label="Launch Deadline">
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="bd-cm-input-field bd-cm-focus-ring w-full px-4"
                                    required
                                />
                            </FieldGroup>
                        </div>

                        {/* Usage & Rights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <FieldGroup label="Usage Rights">
                                <select
                                    name="usageRights"
                                    value={formData.usageRights}
                                    onChange={handleChange}
                                    className="bd-cm-input-field bd-cm-focus-ring w-full px-4 cursor-pointer"
                                >
                                    <option value="30 Days">30 Days</option>
                                    <option value="90 Days">90 Days</option>
                                    <option value="Perpetual">Perpetual (Forever)</option>
                                    <option value="Organic Only">Organic Repost Only</option>
                                </select>
                            </FieldGroup>
                            <div className="flex items-center h-10">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="isWhitelistingRequired"
                                            checked={formData.isWhitelistingRequired}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div
                                            className="w-10 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                                            style={{
                                                background: formData.isWhitelistingRequired
                                                    ? 'var(--bd-accent)'
                                                    : 'var(--bd-muted)',
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: 'var(--bd-text-primary)' }}
                                    >
                                        Require Whitelisting
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bd-cm-btn-primary bd-cm-focus-ring w-full py-3 text-sm"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Launch Campaign"}
                            </button>
                            <p
                                className="text-center text-xs mt-3"
                                style={{ color: 'var(--bd-text-muted)' }}
                            >
                                Campaign will be created immediately.
                            </p>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

/** Form field group — consistent label styling */
const FieldGroup = ({ label, children }) => (
    <div>
        <label
            className="bd-cm-label block mb-2"
            style={{ fontSize: '13px', letterSpacing: '0.01em', textTransform: 'none', color: 'var(--bd-text-primary)', fontWeight: 600 }}
        >
            {label}
        </label>
        {children}
    </div>
);

// =====================
// MAIN CAMPAIGN MANAGEMENT PAGE
// =====================
const CampaignManagement = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaigns = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await brandService.getBrandCampaigns();
            if (response.status === 'success') {
                const mapped = (response.data || []).map(mapApiCampaign);
                setCampaigns(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch campaigns:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        filteredCampaigns,
    } = useCampaignFilters(campaigns);

    const handleViewCampaign = (id) => {
        navigate(`/brand/campaigns/${id}`);
    };

    const handleFundCampaign = (id) => {
        navigate(`/brand/escrow?campaign=${id}`);
    };

    const handleCreateCampaign = () => {
        navigate('/brand/campaigns/create');
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('All');
    };

    const isFiltered = searchQuery !== '' || statusFilter !== 'All';

    return (
        <div className="p-6 min-h-screen">
            <div className="max-w-[1440px] mx-auto space-y-6">
                {/* Page Header */}
                <PageHeader onCreate={handleCreateCampaign} />

                {/* Content Area */}
                {isLoading ? (
                    <LoadingGrid />
                ) : error ? (
                    <ErrorState onRetry={fetchCampaigns} />
                ) : campaigns.length === 0 ? (
                    <EmptyState onCreate={handleCreateCampaign} />
                ) : (
                    <div className="space-y-5">
                        {/* Filter Bar */}
                        <FilterBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            viewMode={viewMode}
                            onViewChange={setViewMode}
                        />

                        {/* Campaign List */}
                        <AnimatePresence mode="wait">
                            {filteredCampaigns.length > 0 ? (
                                <motion.div key={viewMode} {...VIEW_TRANSITION}>
                                    {viewMode === 'grid' ? (
                                        <CampaignGrid
                                            campaigns={filteredCampaigns}
                                            onView={handleViewCampaign}
                                            onFund={handleFundCampaign}
                                        />
                                    ) : (
                                        <CampaignTable
                                            campaigns={filteredCampaigns}
                                            onView={handleViewCampaign}
                                        />
                                    )}
                                </motion.div>
                            ) : (
                                <EmptyState
                                    isFiltered
                                    onClearFilters={handleClearFilters}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Create Campaign Modal */}
            <RequestCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCampaigns}
            />
        </div>
    );
};

export default CampaignManagement;
