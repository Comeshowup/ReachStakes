import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    BarChart3,
    Facebook,
    Link as LinkIcon,
    Check,
    X,
    AlertCircle,
    Loader2,
    RefreshCw,
    ExternalLink,
    Settings,
    Zap,
    Clock
} from 'lucide-react';
import api from '../../../api/axios';

// Integration Card Component
const IntegrationCard = ({
    type,
    icon: Icon,
    name,
    description,
    status,
    externalName,
    lastSyncAt,
    onConnect,
    onDisconnect,
    onTest,
    onConfigure,
    color
}) => {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const isConnected = status === 'Connected';
    const isError = status === 'Error';
    const isPending = status === 'Pending';

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const result = await onTest();
            setTestResult(result);
        } finally {
            setTesting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        const d = new Date(date);
        const now = new Date();
        const diffMins = Math.floor((now - d) / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg">{name}</h3>
                        <p className="text-slate-400 text-sm">{description}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${isConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isError
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                    {isConnected ? <Check className="w-3 h-3" /> :
                        isError ? <AlertCircle className="w-3 h-3" /> :
                            isPending ? <Clock className="w-3 h-3" /> :
                                <X className="w-3 h-3" />}
                    {status || 'Disconnected'}
                </div>
            </div>

            {/* Connected Info */}
            {isConnected && (
                <div className="mb-4 py-3 px-4 bg-black/20 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Connected to:</span>
                        <span className="text-white font-medium">{externalName || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-slate-400">Last sync:</span>
                        <span className="text-slate-300">{formatDate(lastSyncAt)}</span>
                    </div>
                </div>
            )}

            {/* Test Result */}
            <AnimatePresence>
                {testResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-4 p-3 rounded-lg text-sm ${testResult.success
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                            }`}
                    >
                        {testResult.message || (testResult.success ? 'Connection successful!' : 'Connection failed')}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
                {isConnected ? (
                    <>
                        <button
                            onClick={handleTest}
                            disabled={testing}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium disabled:opacity-50"
                        >
                            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Test
                        </button>
                        {onConfigure && (
                            <button
                                onClick={onConfigure}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        )}
                        <button
                            onClick={onDisconnect}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition text-sm font-medium ml-auto"
                        >
                            <X className="w-4 h-4" />
                            Disconnect
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onConnect}
                        className={`flex items-center gap-2 px-5 py-2.5 ${color} hover:opacity-90 text-white rounded-lg transition text-sm font-medium`}
                    >
                        <LinkIcon className="w-4 h-4" />
                        Connect
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// Shopify Connect Modal
const ShopifyModal = ({ isOpen, onClose, onConnect }) => {
    const [shop, setShop] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shop) {
            setError('Please enter your store URL');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onConnect(shop);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
                <h3 className="text-xl font-bold text-white mb-2">Connect Shopify Store</h3>
                <p className="text-slate-400 text-sm mb-6">
                    Enter your Shopify store URL to connect and track orders automatically.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm text-slate-400 mb-2">Store URL</label>
                        <div className="flex">
                            <input
                                type="text"
                                value={shop}
                                onChange={(e) => setShop(e.target.value)}
                                placeholder="my-store"
                                className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                            />
                            <span className="bg-white/10 border border-l-0 border-white/10 rounded-r-lg px-3 py-3 text-slate-400 text-sm">
                                .myshopify.com
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Connect
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// GA4/Meta Config Modal
const ConfigModal = ({ isOpen, onClose, type, onSave }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fields = type === 'GA4' ? [
        { key: 'measurementId', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX' },
        { key: 'apiSecret', label: 'API Secret', placeholder: 'Your GA4 API Secret', type: 'password' }
    ] : [
        { key: 'pixelId', label: 'Pixel ID', placeholder: '123456789012345' },
        { key: 'accessToken', label: 'Access Token', placeholder: 'Your Meta access token', type: 'password' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
                <h3 className="text-xl font-bold text-white mb-2">
                    Configure {type === 'GA4' ? 'Google Analytics 4' : 'Meta Conversion API'}
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    {type === 'GA4'
                        ? 'Enter your GA4 Measurement ID and API Secret to send conversion events.'
                        : 'Enter your Meta Pixel ID and Access Token for server-side tracking.'}
                </p>

                <form onSubmit={handleSubmit}>
                    {fields.map(field => (
                        <div key={field.key} className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">{field.label}</label>
                            <input
                                type={field.type || 'text'}
                                value={formData[field.key] || ''}
                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    ))}

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// Shopify Discount Code Modal
const DiscountCodeModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        usageLimit: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code) {
            setError('Please enter a discount code');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/integrations/shopify/discount', {
                ...formData,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
            });
            setSuccess(`Discount code "${formData.code.toUpperCase()}" created successfully!`);
            setFormData({ code: '', discountType: 'percentage', discountValue: 10, usageLimit: '' });
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
                <h3 className="text-xl font-bold text-white mb-2">Create Shopify Discount Code</h3>
                <p className="text-slate-400 text-sm mb-6">
                    Generate a discount code in your Shopify store for tracking conversions.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm text-slate-400 mb-2">Discount Code</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., CREATOR20"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 uppercase"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Type</label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed_amount">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Value</label>
                            <input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                                placeholder="10"
                                min="0"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm text-slate-400 mb-2">Usage Limit (optional)</label>
                        <input
                            type="number"
                            value={formData.usageLimit}
                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                            placeholder="Leave empty for unlimited"
                            min="1"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                            {success}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Create Code
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// Main Integrations Page
const IntegrationsPage = () => {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
    const [configModal, setConfigModal] = useState({ open: false, type: null });
    const [discountModalOpen, setDiscountModalOpen] = useState(false);

    // Fetch integrations on mount
    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const response = await api.get('/integrations');
            setIntegrations(response.data.data);
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle URL params from OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const integration = params.get('integration');
        const status = params.get('status');
        const error = params.get('error');

        if (integration || error) {
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
            // Refresh integrations
            fetchIntegrations();
        }
    }, []);

    // Handlers
    const handleShopifyConnect = async (shop) => {
        const response = await api.post('/integrations/shopify/auth', { shop });
        if (response.data.authUrl) {
            window.location.href = response.data.authUrl;
        }
    };

    const handleGA4Save = async (config) => {
        await api.post('/integrations/ga4', config);
        await fetchIntegrations();
    };

    const handleMetaSave = async (config) => {
        await api.post('/integrations/meta', config);
        await fetchIntegrations();
    };

    const handleDisconnect = async (type) => {
        if (!confirm(`Are you sure you want to disconnect ${type}?`)) return;
        await api.delete(`/integrations/${type}/disconnect`);
        await fetchIntegrations();
    };

    const handleTest = async (type) => {
        const response = await api.get(`/integrations/${type}/test`);
        return response.data;
    };

    const getIntegration = (type) => integrations.find(i => i.type === type) || { status: 'Disconnected' };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Integrations</h1>
                <p className="text-slate-400">
                    Connect your e-commerce and analytics platforms to track conversions automatically.
                </p>
            </div>

            {/* Integration Cards */}
            <div className="space-y-4">
                <IntegrationCard
                    type="Shopify"
                    icon={ShoppingBag}
                    name="Shopify"
                    description="Track orders and create affiliate codes automatically"
                    color="bg-emerald-600"
                    {...getIntegration('Shopify')}
                    onConnect={() => setShopifyModalOpen(true)}
                    onDisconnect={() => handleDisconnect('Shopify')}
                    onTest={() => handleTest('Shopify')}
                />

                <IntegrationCard
                    type="GA4"
                    icon={BarChart3}
                    name="Google Analytics 4"
                    description="Import conversion events and send purchase data"
                    color="bg-amber-600"
                    {...getIntegration('GA4')}
                    onConnect={() => setConfigModal({ open: true, type: 'GA4' })}
                    onDisconnect={() => handleDisconnect('GA4')}
                    onTest={() => handleTest('GA4')}
                    onConfigure={() => setConfigModal({ open: true, type: 'GA4' })}
                />

                <IntegrationCard
                    type="MetaCAPI"
                    icon={Facebook}
                    name="Meta Conversion API"
                    description="Server-side tracking for Facebook & Instagram ads"
                    color="bg-blue-600"
                    {...getIntegration('MetaCAPI')}
                    onConnect={() => setConfigModal({ open: true, type: 'MetaCAPI' })}
                    onDisconnect={() => handleDisconnect('MetaCAPI')}
                    onTest={() => handleTest('MetaCAPI')}
                    onConfigure={() => setConfigModal({ open: true, type: 'MetaCAPI' })}
                />
            </div>

            {/* Quick Actions - Only show when Shopify is connected */}
            {getIntegration('Shopify').status === 'Connected' && (
                <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500/10 to-violet-500/10 border border-white/10 rounded-2xl">
                    <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setDiscountModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm font-medium"
                        >
                            <Zap className="w-4 h-4" />
                            Generate Discount Code
                        </button>
                    </div>
                </div>
            )}

            {/* Coming Soon */}
            <div className="mt-8 p-6 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                <h3 className="text-white font-medium mb-2">Coming Soon</h3>
                <p className="text-slate-400 text-sm">
                    TikTok Pixel, Stripe, WooCommerce, and more integrations are on the roadmap.
                </p>
            </div>

            {/* Modals */}
            <ShopifyModal
                isOpen={shopifyModalOpen}
                onClose={() => setShopifyModalOpen(false)}
                onConnect={handleShopifyConnect}
            />

            <ConfigModal
                isOpen={configModal.open}
                type={configModal.type}
                onClose={() => setConfigModal({ open: false, type: null })}
                onSave={configModal.type === 'GA4' ? handleGA4Save : handleMetaSave}
            />

            <DiscountCodeModal
                isOpen={discountModalOpen}
                onClose={() => setDiscountModalOpen(false)}
            />
        </div>
    );
};

export default IntegrationsPage;
