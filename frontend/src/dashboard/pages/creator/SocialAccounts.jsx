import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Twitter, ExternalLink, Unlink, Plus, BadgeCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../../api/axios'; // Adjust if path is different

const SocialAccounts = () => {
    // We'll manage state for the accounts loaded from DB
    const [socialData, setSocialData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get current user info from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    // Fetch accounts on mount
    const fetchAccounts = async () => {
        if (!userId) return;
        try {
            const res = await api.get(`/social/${userId}`);
            setSocialData(res.data.data);
        } catch (err) {
            console.error("Failed to fetch social accounts", err);
        }
    };
    useEffect(() => {
        fetchAccounts();

        // Check for Instagram Code in URL
        const params = new URLSearchParams(window.location.search);
        const igCode = params.get('code');

        if (igCode) {
            if (!userId) {
                return;
            }

            // Removing 'code' from URL without refresh to avoid re-runs
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({ path: newUrl }, '', newUrl);

            const linkInstagram = async () => {
                setLoading(true);
                try {
                    const currentRedirectUri = `${window.location.origin}/creator/social-accounts`;

                    const response = await api.post('/social/instagram/link', {
                        code: igCode,
                        userId: userId,
                        redirectUri: currentRedirectUri
                    });

                    alert("Instagram account connected successfully!");
                    fetchAccounts();
                } catch (err) {
                    console.error("Instagram Link Error:", err);
                    const msg = err.response?.data?.message || err.message;
                    alert("Failed to link Instagram: " + msg);
                } finally {
                    setLoading(false);
                }
            };
            linkInstagram();
        }

    }, [userId]);

    const handleDisconnect = async (accountId) => {
        if (!confirm("Are you sure you want to disconnect this account?")) return;
        try {
            await api.delete(`/social/${accountId}`);
            fetchAccounts();
        } catch (err) {
            alert("Failed to disconnect account");
        }
    };

    // --- Google / YouTube Auth Flow ---
    const linkYoutube = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setLoading(true);
            try {
                await api.post('/social/youtube/link', {
                    code: codeResponse.code,
                    userId: userId
                });
                alert("YouTube account connected successfully!");
                fetchAccounts();
            } catch (err) {
                console.error("YouTube Link Error:", err);
                alert("Failed to link YouTube account. " + (err.response?.data?.message || ""));
            } finally {
                setLoading(false);
            }
        },
        onError: () => alert('YouTube connection failed'),
        flow: 'auth-code',
        scope: 'https://www.googleapis.com/auth/youtube.readonly'
    });

    const getAccountsFor = (platformName) => {
        return socialData.filter(acc => acc.platform.toLowerCase() === platformName.toLowerCase())
            .map(acc => ({
                id: acc.id,
                username: acc.username,
                handle: acc.handle,
                url: acc.profileUrl
            }));
    };

    const platforms = [
        {
            id: 'instagram',
            name: 'Instagram',
            icon: Instagram,
            color: 'text-pink-600',
            bg: 'bg-pink-50 dark:bg-pink-900/20',
            maxAccounts: 5,
            connectAction: () => {
                const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || 'YOUR_INSTAGRAM_CLIENT_ID';
                const redirectUri = `${window.location.origin}/creator/social-accounts`;
                const scope = 'instagram_business_basic,instagram_business_manage_insights';
                const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;

                window.location.href = authUrl;
            },
        },
        {
            id: 'twitter',
            name: 'Twitter',
            icon: Twitter,
            color: 'text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            maxAccounts: 5,
            connectAction: () => alert("Twitter linking coming soon!"),
        },
        {
            id: 'youtube',
            name: 'YouTube',
            icon: Youtube,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
            maxAccounts: 5,
            connectAction: linkYoutube,
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Social Accounts</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1">Connect up to 5 accounts per platform to showcase your reach and analytics.</p>

                {/* DEBUG SECTION */}
                <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">DEBUG DIAL:</h4>
                    <div className="text-xs space-y-1 font-mono">
                        <p><span className="text-slate-500">API URL:</span> {import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}</p>
                        <p><span className="text-slate-500">User ID:</span> {userId || 'NOT LOGGED IN'}</p>
                        <p><span className="text-slate-500">Origin:</span> {window.location.origin}</p>
                        <button
                            onClick={async () => {
                                try {
                                    // Strip /api from end of baseURL
                                    const fullBaseUrl = api.defaults.baseURL;
                                    const rootUrl = fullBaseUrl.endsWith('/api') ? fullBaseUrl.slice(0, -4) : fullBaseUrl;

                                    const res = await axios.get(rootUrl + '/', {
                                        headers: { 'ngrok-skip-browser-warning': 'true' }
                                    });
                                    alert('Backend Linked! Response: ' + res.data.message);
                                } catch (err) {
                                    alert('Backend UNREACHABLE: ' + (err.response?.status || err.message));
                                }
                            }}
                            className="mt-2 px-2 py-1 bg-indigo-600 text-white rounded text-[10px] hover:bg-indigo-700 transition-colors"
                        >
                            Test API Connection
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {platforms.map((platform, index) => {
                    const connectedAccounts = getAccountsFor(platform.name);
                    const isMaxReached = connectedAccounts.length >= platform.maxAccounts;

                    return (
                        <motion.div
                            key={platform.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className={`p-4 rounded-xl ${platform.bg}`}>
                                        <platform.icon className={`w-8 h-8 ${platform.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{platform.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                            {connectedAccounts.length} / {platform.maxAccounts} Connected
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 w-full space-y-3">
                                    {connectedAccounts.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {connectedAccounts.map((account) => (
                                                <div key={account.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`w-2 h-2 rounded-full ${platform.color.replace('text-', 'bg-')}`}></div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1">
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{account.username}</p>
                                                                <BadgeCheck className="w-4 h-4 text-blue-500" fill="currentColor" color="white" />
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{account.handle}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <a href={account.url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDisconnect(account.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            title="Disconnect"
                                                        >
                                                            <Unlink className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 text-center text-gray-500 dark:text-slate-400 text-sm">
                                            No account connected yet.
                                        </div>
                                    )}

                                    {!isMaxReached && (
                                        <div className="md:w-1/2">
                                            <button
                                                onClick={platform.connectAction}
                                                disabled={loading}
                                                className="w-full py-2 px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <div className="p-1 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">
                                                    {loading ? 'Connecting...' : `Connect ${platform.name} Account`}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Why connect accounts?</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm">
                            Connecting your verified social media accounts allows you to showcase your real-time analytics, audience demographics, and engagement rates directly to brands, increasing your chances of getting hired.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default SocialAccounts;
