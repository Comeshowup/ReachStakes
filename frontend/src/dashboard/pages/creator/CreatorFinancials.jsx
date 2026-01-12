import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    Wallet,
    DollarSign,
    Clock,
    CheckCircle,
    ArrowUpRight,
    Download,
    ChevronRight,
    ChevronDown,
    CreditCard,
    Building,
    Building2,
    MoreHorizontal,
    Calendar,
    AlertCircle,
    TrendingUp,
    Filter,
    Rocket,
    X,
    Loader2,
    Plus
} from "lucide-react";
import payoutService from "../../../api/payoutService";
import SecureOnboardingModal from "../../components/SecureOnboardingModal";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- Components ---

const CountUp = ({ value, prefix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1500;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>{prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    );
};

const CreatorFinancials = () => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("history");
    const [expandedCampaign, setExpandedCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Real data from API
    const [stats, setStats] = useState({ totalPayouts: 0, pendingEarnings: 0, completedCampaigns: 0 });
    const [chartData, setChartData] = useState([]);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [campaignEarnings, setCampaignEarnings] = useState([]);

    // Payout bank connection status
    const [payoutStatus, setPayoutStatus] = useState(null);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log("Fetching earnings with token:", token ? "Token exists" : "No token found");

                if (!token) {
                    console.error("No token found in localStorage");
                    setError("Authentication token missing. Please log in again.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/users/me/earnings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status === "success") {
                    const data = response.data.data;
                    setStats(data.stats);
                    setChartData(data.chartData);
                    setPayoutHistory(data.payoutHistory);
                    setCampaignEarnings(data.campaignEarnings);
                }
            } catch (err) {
                console.error("Failed to fetch earnings:", err);
                if (err.response && err.response.status === 401) {
                    // Token is invalid/expired
                    localStorage.removeItem("token");
                    localStorage.removeItem("userInfo");
                    setError("Session expired. Please log in again.");
                } else {
                    setError("Failed to load earnings data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
        fetchPayoutStatus();
    }, []);

    const fetchPayoutStatus = async () => {
        try {
            const response = await payoutService.getPayoutStatus();
            if (response.success) {
                setPayoutStatus(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch payout status:", err);
        }
    };

    const handleBankConnected = (data) => {
        setPayoutStatus({
            isConnected: true,
            status: 'Active',
            bankName: data.bankName,
            bankLastFour: data.bankLastFour,
            bankCountry: data.country,
            bankCurrency: data.currency
        });
    };

    const handleDisconnectBank = async () => {
        if (!confirm('Are you sure you want to disconnect your bank account?')) return;
        try {
            const response = await payoutService.disconnectBank();
            if (response.success) {
                setPayoutStatus({ isConnected: false, status: 'Inactive' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to disconnect bank');
        }
    };

    const toggleCampaign = (id) => {
        if (expandedCampaign === id) {
            setExpandedCampaign(null);
        } else {
            setExpandedCampaign(id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                <p className="mb-4">{error}</p>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userInfo");
                        window.location.href = "/login";
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-bold"
                >
                    Log Out & Reset
                </button>
            </div>
        );
    }

    // Mini chart data from main chart
    const miniChartData = chartData.map(d => ({ value: d.value }));


    return (
        <div className="space-y-6 pb-12 text-slate-200">
            {/* Top Row Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ... (Keep existing stats cards) ... */}
                {/* Card 1: Total Payouts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0B0E14] rounded-3xl p-6 border border-slate-800 shadow-lg relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex justify-between items-end h-full">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-2">Total Payouts Received (Lifetime)</p>
                            <h3 className="text-4xl font-bold text-white mb-1">
                                <CountUp value={stats.totalPayouts} prefix="$" />
                            </h3>
                            <p className="text-slate-500 text-xs">Across {stats.completedCampaigns} completed campaigns</p>
                        </div>
                        <div className="flex items-end justify-end w-32 h-16">
                            <LineChart width={128} height={64} data={miniChartData}>
                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                            </LineChart>
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Pending Earnings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0B0E14] rounded-3xl p-6 border border-slate-800 shadow-lg relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-slate-400 text-sm font-medium mb-2">Pending Earnings (Awaiting Payout)</p>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-4xl font-bold text-orange-400">
                                <CountUp value={stats.pendingEarnings} prefix="$" />
                            </h3>
                            <Clock className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-slate-500 text-xs">From 3 approved deliverables</p>
                    </div>
                </motion.div>

                {/* Card 3: Next Payout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0B0E14] rounded-3xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between"
                >
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-2">Completed Campaigns</p>
                        <h3 className="text-4xl font-bold text-white mb-1">{stats.completedCampaigns}</h3>
                        <p className="text-slate-500 text-xs">Total paid collaborations</p>
                    </div>
                    <button className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                        <DollarSign className="w-4 h-4" /> Request Payout
                    </button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-3 bg-[#0B0E14] rounded-3xl p-8 border border-slate-800 shadow-lg relative overflow-hidden"
                >
                    {/* ... (Keep existing chart code) ... */}
                    {/* Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-center mb-8">
                        <h2 className="text-lg font-medium text-slate-300">Earnings Chart</h2>
                        <button className="text-xs text-slate-500 hover:text-white transition-colors">All last 6 months</button>
                    </div>

                    <div className="relative z-10" style={{ width: "100%", height: 300, minHeight: 300 }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                                <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#a78bfa' }}
                                    formatter={(value) => [`$${value}`, "Earnings"]}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* ... (Keep existing sidebar code) ... */}
                    {/* Payout Settings - Real Data */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#0B0E14] rounded-3xl p-6 border border-slate-800 shadow-lg"
                    >
                        <h3 className="text-sm font-medium text-slate-300 mb-4">Payout Method</h3>

                        {payoutStatus?.isConnected ? (
                            <>
                                <div className="bg-[#131823] rounded-2xl p-4 border border-emerald-500/20 mb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> CONNECTED
                                        </span>
                                        <Building2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white">{payoutStatus.bankName || 'Bank Account'}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">•••• {payoutStatus.bankLastFour}</p>
                                    <p className="text-xs text-slate-500 mt-1">{payoutStatus.bankCountry} • {payoutStatus.bankCurrency}</p>
                                </div>
                                <button
                                    onClick={handleDisconnectBank}
                                    className="w-full py-2.5 border border-red-500/30 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 transition-all"
                                >
                                    Disconnect Bank
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-[#131823] rounded-2xl p-4 border border-dashed border-slate-700 mb-4 text-center">
                                    <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 mb-1">No bank connected</p>
                                    <p className="text-xs text-slate-500">Connect your bank to receive payouts</p>
                                </div>
                                <button
                                    onClick={() => setIsBankModalOpen(true)}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Connect Bank Account
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* Creator Status */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#0B0E14] rounded-3xl p-6 border border-slate-800 shadow-lg relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-16 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-sm font-medium text-slate-300">Creator Status</h3>
                            <Rocket className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 relative z-10">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: "70%" }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-4 relative z-10">
                            <span>70% Completed</span>
                            <span className="text-white font-bold">Top Creator</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed relative z-10">
                            Boost Your Earnings. Complete 2 more campaigns to unlock 'Top Creator' status and lower fees.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Section: Tabs for History & Campaign Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-[#0B0E14] rounded-3xl border border-slate-800 shadow-lg overflow-hidden"
            >
                <div className="flex border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-8 py-4 text-sm font-bold transition-colors relative ${activeTab === "history" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        Transaction History
                        {activeTab === "history" && (
                            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("campaigns")}
                        className={`px-8 py-4 text-sm font-bold transition-colors relative ${activeTab === "campaigns" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        Campaign Earnings
                        {activeTab === "campaigns" && (
                            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                        )}
                    </button>
                </div>

                <div className="min-h-[300px]">
                    {activeTab === "history" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                                        <th className="px-8 py-5 font-bold">Date</th>
                                        <th className="px-8 py-5 font-bold">Description</th>
                                        <th className="px-8 py-5 font-bold">Campaigns</th>
                                        <th className="px-8 py-5 font-bold text-center">Status</th>
                                        <th className="px-8 py-5 font-bold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {payoutHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-12 text-center text-slate-500">
                                                No transaction history found
                                            </td>
                                        </tr>
                                    ) : (
                                        payoutHistory.map((txn) => (
                                            <tr key={txn.id} className="group hover:bg-slate-800/30 transition-colors">
                                                <td className="px-8 py-5 text-sm text-slate-300 font-medium">{txn.date}</td>
                                                <td className="px-8 py-5 text-sm text-slate-400">{txn.description}</td>
                                                <td className="px-8 py-5 text-sm text-slate-400">{txn.campaignsCovered} Campaigns</td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right text-sm font-bold text-emerald-400">
                                                    +${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "campaigns" && (
                        <div className="p-6 space-y-4">
                            {campaignEarnings.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    No active or completed campaigns yet
                                </div>
                            ) : (
                                campaignEarnings.map((campaign) => (
                                    <div key={campaign.id} className="border border-slate-800 rounded-2xl overflow-hidden bg-[#131823]">
                                        <div
                                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                                            onClick={() => toggleCampaign(campaign.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <img src={campaign.brandLogo} alt={campaign.brand} className="w-10 h-10 rounded-lg object-cover" />
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{campaign.name}</h4>
                                                    <p className="text-xs text-slate-500">{campaign.brand}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 text-sm">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Earned</p>
                                                    <p className="font-bold text-white">${campaign.earnedToDate.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                                                    <span className={`text-xs font-bold ${campaign.status === 'Completed' ? 'text-emerald-400' : 'text-indigo-400'}`}>{campaign.status}</span>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${expandedCampaign === campaign.id ? "rotate-180" : ""}`} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedCampaign === campaign.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-slate-800 bg-[#0B0E14]"
                                                >
                                                    <div className="p-4 pl-20 grid gap-2">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Campaign Details</p>
                                                        <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                                            <span className="text-slate-300 font-medium">Agreed Price</span>
                                                            <div className="flex items-center gap-6">
                                                                <span className="text-slate-500 text-xs">Total</span>
                                                                <span className="font-bold text-white w-20 text-right">${campaign.totalValue.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Mock Payment Modal */}
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0B0E14] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-white">Update Payout Method</h3>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-slate-400">Select your preferred payout method.</p>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 border border-indigo-500/50 bg-indigo-500/10 rounded-xl cursor-pointer">
                                        <input type="radio" name="payout" defaultChecked className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700" />
                                        <div className="flex-1">
                                            <span className="block font-bold text-white text-sm">PayPal</span>
                                            <span className="block text-xs text-slate-500">Instant transfer, 1% fee</span>
                                        </div>
                                        <Wallet className="w-5 h-5 text-indigo-400" />
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border border-slate-800 hover:border-slate-600 bg-slate-900 rounded-xl cursor-pointer transition-colors">
                                        <input type="radio" name="payout" className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700" />
                                        <div className="flex-1">
                                            <span className="block font-bold text-white text-sm">Bank Transfer</span>
                                            <span className="block text-xs text-slate-500">2-3 business days, no fee</span>
                                        </div>
                                        <Building className="w-5 h-5 text-slate-400" />
                                    </label>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors mt-4"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Secure Onboarding Modal (Hosted by Tazapay) */}
            <SecureOnboardingModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                onSuccess={handleBankConnected}
            />
        </div>
    );
};

export default CreatorFinancials;
