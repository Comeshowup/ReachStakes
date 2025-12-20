import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Wallet,
    CreditCard,
    Building,
    CheckCircle,
    ChevronDown,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Globe,
    DollarSign,
    X,
    AlertCircle,
    Check,
    Download,
    ChevronRight,
    FileText
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// --- Mock Data ---

const TRANSACTION_HISTORY = [
    {
        id: "TXN-1001",
        date: "Today, 14:30",
        description: "Wallet Top-up via PayPal",
        status: "Completed",
        amount: 5000.00,
        type: "Deposit",
        method: "PayPal",
        details: "Funds added to main wallet balance."
    },
    {
        id: "TXN-1002",
        date: "Yesterday, 09:15",
        description: "Campaign Launch: Summer 2025",
        status: "Completed",
        amount: -2500.00,
        type: "Payment",
        method: "Wallet Balance",
        details: "Initial budget allocation for Summer 2025 campaign."
    },
    {
        id: "TXN-1003",
        date: "Nov 26, 16:45",
        description: "Creator Payment: @alex_runs",
        status: "Pending",
        amount: -450.00,
        type: "Payment",
        method: "Escrow",
        details: "Payment held in escrow pending deliverable approval."
    },
    {
        id: "TXN-1004",
        date: "Nov 25, 11:20",
        description: "Bank Transfer: Chase ****8892",
        status: "Completed",
        amount: 10000.00,
        type: "Deposit",
        method: "Bank Transfer",
        details: "Direct deposit from linked business account."
    },
    {
        id: "TXN-1005",
        date: "Nov 24, 13:00",
        description: "Creator Payment: @sarah.glows",
        status: "Completed",
        amount: -300.00,
        type: "Payment",
        method: "Escrow",
        details: "Release of funds for completed video submission."
    }
];

const CHART_DATA = [
    { name: 'Week 1', spend: 500, revenue: 1200 },
    { name: 'Week 2', spend: 800, revenue: 1500 },
    { name: 'Week 3', spend: 600, revenue: 1800 },
    { name: 'Week 4', spend: 1200, revenue: 2400 },
    { name: 'Week 5', spend: 900, revenue: 2100 },
    { name: 'Week 6', spend: 1500, revenue: 3200 },
];

// --- Components ---

const CountUp = ({ value, prefix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = parseFloat(value);

    useEffect(() => {
        let start = 0;
        const end = numericValue;
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
    }, [numericValue]);

    return (
        <span>{prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    );
};

const AddFundsWizard = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState(null);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && !amount) return;
        if (step === 2 && !method) return;
        if (step === 3) {
            // Simulate API call
            setTimeout(() => {
                onClose();
                setStep(1);
                setAmount("");
                setMethod(null);
            }, 500);
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Funds</h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Step {step} of 3</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Enter Amount</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">How much would you like to deposit?</p>
                                    </div>
                                    <div className="relative max-w-xs mx-auto">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-light">$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-4 bg-transparent border-b-2 border-gray-200 dark:border-slate-700 text-4xl font-bold text-center text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors placeholder-gray-300 dark:placeholder-slate-700"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        {[100, 500, 1000, 5000].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => setAmount(val.toString())}
                                                className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                +${val}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select Payment Method</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">Choose how you want to pay</p>
                                    </div>
                                    {[
                                        { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, desc: 'Instant deposit' },
                                        { id: 'paypal', name: 'PayPal', icon: DollarSign, desc: 'Connect your account' },
                                        { id: 'bank', name: 'Bank Transfer', icon: Building, desc: '3-5 business days' }
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setMethod(m.id)}
                                            className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${method === m.id
                                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800"
                                                }`}
                                        >
                                            <div className={`p-3 rounded-full mr-4 ${method === m.id ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                                                <m.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className={`font-bold ${method === m.id ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}>{m.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">{m.desc}</p>
                                            </div>
                                            {method === m.id && <CheckCircle className="w-6 h-6 text-indigo-600 ml-auto" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Review & Confirm</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">Please verify the details below</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-slate-400">Amount</span>
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">${parseFloat(amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-slate-400">Fee</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">$0.00</span>
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-slate-700 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Total</span>
                                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${parseFloat(amount).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-700 dark:text-blue-400 text-xs">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>By confirming, you agree to authorize the transaction from your selected payment method.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between">
                        {step > 1 ? (
                            <button onClick={handleBack} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Back</button>
                        ) : <div></div>}
                        <button onClick={handleNext} disabled={!amount || (step === 2 && !method)} className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2">
                            {step === 3 ? "Confirm Deposit" : "Next"}
                            {step < 3 && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const TransactionRow = ({ txn }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <tr
                onClick={() => setIsExpanded(!isExpanded)}
                className="group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800/50 last:border-0"
            >
                <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${txn.type === 'Deposit' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                            }`}>
                            {txn.type === 'Deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">{txn.description}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">{txn.id}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-500 dark:text-slate-400 font-medium">
                    {txn.date}
                </td>
                <td className={`px-6 py-5 font-bold text-sm ${txn.amount > 0 ? "text-green-500" : "text-gray-900 dark:text-white"}`}>
                    {txn.amount > 0 ? "+" : ""}{txn.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${txn.status === "Completed" ? "bg-green-500/10 text-green-500" :
                            txn.status === "Pending" ? "bg-yellow-500/10 text-yellow-500" :
                                "bg-red-500/10 text-red-500"
                        }`}>
                        {txn.status === "Completed" && <Check className="w-3 h-3" />}
                        {txn.status === "Pending" && <AlertCircle className="w-3 h-3" />}
                        {txn.status}
                    </span>
                </td>
                <td className="px-6 py-5 text-right">
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </td>
            </tr>
            <AnimatePresence>
                {isExpanded && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50/50 dark:bg-slate-800/30 overflow-hidden"
                    >
                        <td colSpan={5} className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Payment Method</p>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                                        <CreditCard className="w-4 h-4" />
                                        {txn.method}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Details</p>
                                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{txn.details}</p>
                                </div>
                                <div className="flex items-end justify-end">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                        <FileText className="w-4 h-4" />
                                        Download Receipt PDF
                                    </button>
                                </div>
                            </div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
};

const FinancialManagementPanel = () => {
    const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All");

    return (
        <div className="min-h-screen pb-12 space-y-8">
            {/* 1. Hero Card */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {/* Background with subtle gradient */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-50"></div>
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Left Side */}
                    <div className="space-y-6 max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                            Secure Your Campaigns.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Add Funds Instantly</span>
                        </h1>
                        <button
                            onClick={() => setIsAddFundsOpen(true)}
                            className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/50 flex items-center gap-3"
                        >
                            <Plus className="w-6 h-6" />
                            Add Funds Now
                            <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                        </button>
                    </div>

                    {/* Right Side - Wallet Stats */}
                    <div className="flex gap-6 md:gap-12 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Current Balance</p>
                            <div className="text-3xl font-bold text-white flex items-end gap-2">
                                <CountUp value="12450.00" prefix="$" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-green-400 mt-2 bg-green-400/10 px-2 py-1 rounded-full w-fit">
                                <ArrowUpRight className="w-3 h-3" />
                                +3.2% Today
                            </div>
                        </div>
                        <div className="w-px bg-white/10"></div>
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Pending Payouts</p>
                            <div className="text-3xl font-bold text-white/80">
                                $850.00
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Financial Performance Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Performance</h2>
                        <div className="relative">
                            <select className="appearance-none bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium px-4 py-2 pr-10 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
                                <option>Last 30 Days</option>
                                <option>Last Quarter</option>
                                <option>Year to Date</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" opacity={0.1} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                <Area type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" name="Spend" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Quick Actions */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                    <div className="space-y-4">
                        <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group text-left">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Meet portal</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Manage meetings</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setIsAddFundsOpen(true)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group text-left"
                        >
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Visa & PayPal</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Manage cards</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setIsAddFundsOpen(true)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group text-left"
                        >
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                <Building className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Bank Transfer</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400">Direct deposit</p>
                            </div>
                        </button>

                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm text-green-700 dark:text-green-400">Payment Methods</span>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Transaction History */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
                    <div className="flex bg-gray-100 dark:bg-slate-800/50 p-1 rounded-xl">
                        {["All", "Deposit", "Payment"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-colors z-10 ${activeTab === tab ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"}`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-lg -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-slate-800 text-xs uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                <th className="px-6 py-4 font-bold">Description</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {TRANSACTION_HISTORY.filter(t => activeTab === "All" || t.type === activeTab).map((txn) => (
                                <TransactionRow key={txn.id} txn={txn} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddFundsWizard isOpen={isAddFundsOpen} onClose={() => setIsAddFundsOpen(false)} />
        </div>
    );
};

export default FinancialManagementPanel;
