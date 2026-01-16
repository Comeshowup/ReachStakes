import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderOpen,
    Download,
    Search,
    Filter,
    Grid,
    List,
    Play,
    Image,
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    Instagram,
    Youtube,
    MoreVertical,
    X
} from 'lucide-react';

// Mock content data
const CONTENT_ASSETS = [
    {
        id: 1,
        type: 'video',
        title: 'Summer Collection Reel',
        creator: 'Sarah Chen',
        campaign: 'Summer 2026',
        thumbnail: null,
        duration: '0:45',
        platform: 'Instagram',
        usageRights: 'active',
        expiresAt: '2026-07-15',
        formats: ['instagram', 'tiktok', 'display'],
    },
    {
        id: 2,
        type: 'image',
        title: 'Product Flat Lay',
        creator: 'Mike Torres',
        campaign: 'Summer 2026',
        thumbnail: null,
        platform: 'TikTok',
        usageRights: 'active',
        expiresAt: '2026-08-01',
        formats: ['instagram', 'display', 'email'],
    },
    {
        id: 3,
        type: 'video',
        title: 'Unboxing Experience',
        creator: 'Emma Davis',
        campaign: 'Q1 Launch',
        thumbnail: null,
        duration: '2:30',
        platform: 'YouTube',
        usageRights: 'expiring',
        expiresAt: '2026-02-01',
        formats: ['youtube', 'tiktok'],
    },
    {
        id: 4,
        type: 'image',
        title: 'Lifestyle Shot',
        creator: 'Jay Park',
        campaign: 'Q1 Launch',
        thumbnail: null,
        platform: 'Instagram',
        usageRights: 'expired',
        expiresAt: '2025-12-15',
        formats: ['instagram'],
    },
    {
        id: 5,
        type: 'video',
        title: 'Tutorial Video',
        creator: 'Lisa Wong',
        campaign: 'Summer 2026',
        thumbnail: null,
        duration: '5:12',
        platform: 'YouTube',
        usageRights: 'active',
        expiresAt: '2026-09-30',
        formats: ['youtube', 'display'],
    },
    {
        id: 6,
        type: 'image',
        title: 'Before/After',
        creator: 'Sarah Chen',
        campaign: 'Q1 Launch',
        thumbnail: null,
        platform: 'Instagram',
        usageRights: 'active',
        expiresAt: '2026-06-15',
        formats: ['instagram', 'email'],
    },
];

const CAMPAIGNS = ['All Campaigns', 'Summer 2026', 'Q1 Launch', 'Holiday 2025'];
const FORMATS = ['All Formats', 'Instagram', 'TikTok', 'YouTube', 'Display Ad', 'Email'];

const getTypeIcon = (type) => {
    return type === 'video' ? <Play className="w-4 h-4" /> : <Image className="w-4 h-4" />;
};

const getPlatformIcon = (platform) => {
    if (platform === 'Instagram') return <Instagram className="w-3 h-3" />;
    if (platform === 'YouTube') return <Youtube className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
};

const getRightsStatus = (status) => {
    if (status === 'active') return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' };
    if (status === 'expiring') return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Expiring Soon' };
    return { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Expired' };
};

const AssetCard = ({ asset, isSelected, onSelect, delay }) => {
    const rights = getRightsStatus(asset.usageRights);
    const RightsIcon = rights.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${isSelected
                    ? 'border-brand-sky ring-2 ring-brand-sky/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
            onClick={onSelect}
        >
            {/* Thumbnail */}
            <div className="aspect-video bg-white/5 relative">
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                    {getTypeIcon(asset.type)}
                </div>
                {asset.duration && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-medium">
                        {asset.duration}
                    </span>
                )}
                {isSelected && (
                    <div className="absolute top-2 left-2">
                        <CheckCircle className="w-5 h-5 text-brand-sky" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{asset.title}</p>
                        <p className="text-xs text-white/50">by {asset.creator}</p>
                    </div>
                    <button className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white/40">
                        {getPlatformIcon(asset.platform)}
                        <span className="text-xs">{asset.platform}</span>
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${rights.bg}`}>
                        <RightsIcon className={`w-3 h-3 ${rights.color}`} />
                        <span className={`text-[10px] font-medium ${rights.color}`}>{rights.label}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const DownloadModal = ({ assets, onClose }) => {
    const [selectedFormat, setSelectedFormat] = useState('instagram');

    const formats = [
        { id: 'instagram', label: 'Instagram', specs: '1080x1080 / 1080x1920' },
        { id: 'tiktok', label: 'TikTok', specs: '1080x1920' },
        { id: 'display', label: 'Display Ad', specs: '300x250 / 728x90' },
        { id: 'email', label: 'Email', specs: '600px wide' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-[#0a0a0b] border border-white/10 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white">Download {assets.length} Assets</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
                        <X className="w-4 h-4 text-white/50" />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-medium text-white/50 mb-3 block">Select Format</label>
                    <div className="space-y-2">
                        {formats.map((format) => (
                            <button
                                key={format.id}
                                onClick={() => setSelectedFormat(format.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedFormat === format.id
                                        ? 'bg-brand-sky/10 border-brand-sky/30'
                                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <span className="text-sm font-medium text-white">{format.label}</span>
                                <span className="text-xs text-white/40">{format.specs}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-sky hover:bg-brand-sky/90 text-black font-semibold transition-colors">
                    <Download className="w-4 h-4" />
                    Download All
                </button>
            </motion.div>
        </motion.div>
    );
};

const ContentHub = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState('All Campaigns');
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const filteredAssets = CONTENT_ASSETS.filter((asset) => {
        const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.creator.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCampaign = selectedCampaign === 'All Campaigns' || asset.campaign === selectedCampaign;
        return matchesSearch && matchesCampaign;
    });

    const toggleAssetSelection = (id) => {
        setSelectedAssets((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedAssets.length === filteredAssets.length) {
            setSelectedAssets([]);
        } else {
            setSelectedAssets(filteredAssets.map((a) => a.id));
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] text-slate-200 font-sans p-8 lg:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="w-5 h-5 text-brand-sky" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-sky/80">Content Hub</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                        Campaign Assets
                    </h1>
                    <p className="text-sm text-white/50 mt-1">
                        {CONTENT_ASSETS.length} assets • {CONTENT_ASSETS.filter(a => a.usageRights === 'active').length} with active rights
                    </p>
                </div>

                {selectedAssets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <span className="text-sm text-white/50">{selectedAssets.length} selected</span>
                        <button
                            onClick={() => setShowDownloadModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-sky text-black font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Download Selected
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assets..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-sky/50"
                    />
                </div>

                {/* Campaign Filter */}
                <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer"
                >
                    {CAMPAIGNS.map((c) => (
                        <option key={c} value={c} className="bg-[#0a0a0b]">{c}</option>
                    ))}
                </select>

                {/* View Toggle */}
                <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Select All */}
                <button
                    onClick={selectAll}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
                >
                    {selectedAssets.length === filteredAssets.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>

            {/* Asset Grid */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {filteredAssets.map((asset, i) => (
                    <AssetCard
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedAssets.includes(asset.id)}
                        onSelect={() => toggleAssetSelection(asset.id)}
                        delay={i * 0.05}
                    />
                ))}
            </div>

            {filteredAssets.length === 0 && (
                <div className="text-center py-20">
                    <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No assets found</p>
                </div>
            )}

            {/* Download Modal */}
            <AnimatePresence>
                {showDownloadModal && (
                    <DownloadModal
                        assets={selectedAssets}
                        onClose={() => setShowDownloadModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContentHub;
