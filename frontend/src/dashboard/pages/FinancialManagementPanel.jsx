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
                className="table-polished__row"
                style={{ cursor: 'pointer' }}
            >
                <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            padding: 8, borderRadius: '50%',
                            background: txn.type === 'Deposit' ? 'var(--bd-success-muted)' : 'var(--bd-bg-tertiary)',
                            color: txn.type === 'Deposit' ? 'var(--bd-success)' : 'var(--bd-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {txn.type === 'Deposit' ? <ArrowDownLeft style={{ width: 16, height: 16 }} /> : <ArrowUpRight style={{ width: 16, height: 16 }} />}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--bd-text-primary)' }}>{txn.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', marginTop: 2 }}>{txn.id}</div>
                        </div>
                    </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-secondary)', fontWeight: 500 }}>
                    {txn.date}
                </td>
                <td style={{ padding: '16px 24px' }}>
                    <span className="financial-amount" style={{ color: txn.amount > 0 ? 'var(--bd-success)' : 'var(--bd-text-primary)' }}>
                        {txn.amount > 0 ? "+" : ""}{txn.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                    <span className={`status-pill ${txn.status === 'Completed' ? 'status-pill--success' : txn.status === 'Pending' ? 'status-pill--warning' : 'status-pill--danger'}`}>
                        {txn.status === "Completed" && <Check style={{ width: 12, height: 12 }} />}
                        {txn.status === "Pending" && <AlertCircle style={{ width: 12, height: 12 }} />}
                        {txn.status}
                    </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <ChevronDown style={{ width: 16, height: 16, color: 'var(--bd-text-muted)', transition: 'transform 200ms', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                </td>
            </tr>
            <AnimatePresence>
                {isExpanded && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ background: 'var(--bd-bg-secondary)', overflow: 'hidden' }}
                    >
                        <td colSpan={5} style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, fontSize: 'var(--bd-font-size-sm)' }}>
                                <div>
                                    <p className="kpi-card-polished__label" style={{ marginBottom: 8 }}>Payment Method</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--bd-text-primary)' }}>
                                        <CreditCard style={{ width: 16, height: 16 }} />
                                        {txn.method}
                                    </div>
                                </div>
                                <div>
                                    <p className="kpi-card-polished__label" style={{ marginBottom: 8 }}>Details</p>
                                    <p style={{ color: 'var(--bd-text-secondary)', lineHeight: 1.5 }}>{txn.details}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                    <button style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                                        background: 'var(--bd-surface)', border: '1px solid var(--bd-border-default)',
                                        borderRadius: 'var(--bd-radius-lg)', fontSize: 'var(--bd-font-size-sm)',
                                        fontWeight: 500, color: 'var(--bd-text-primary)', cursor: 'pointer',
                                        transition: 'all 150ms ease', boxShadow: 'var(--bd-shadow-sm)'
                                    }}>
                                        <FileText style={{ width: 16, height: 16 }} />
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
        <div style={{ minHeight: '100vh', paddingBottom: 'var(--bd-space-12)' }} className="space-y-8">
            {/* 1. Header Strip — Clean, institutional */}
            <div className="surface-card" style={{ padding: 'var(--bd-space-8)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--bd-space-6)' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: 'var(--bd-space-2)' }}>Financial Management</h1>
                        <p style={{ fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-secondary)' }}>Fund campaigns and manage payouts securely.</p>
                    </div>
                    <button
                        onClick={() => setIsAddFundsOpen(true)}
                        style={{
                            padding: '12px 28px', borderRadius: 'var(--bd-radius-lg)',
                            background: 'var(--bd-primary)', color: 'var(--bd-primary-fg)',
                            fontWeight: 700, fontSize: 'var(--bd-font-size-md)',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: 'var(--bd-shadow-primary-btn)', transition: 'all 150ms ease'
                        }}
                    >
                        <Plus style={{ width: 20, height: 20 }} />
                        Add Funds
                    </button>
                </div>

                {/* KPIs */}
                <div className="trust-strip" style={{ marginTop: 'var(--bd-space-6)' }}>
                    <div className="trust-strip__card">
                        <p className="trust-strip__label">Current Balance</p>
                        <p className="trust-strip__value"><CountUp value="12450.00" prefix="$" /></p>
                        <span className="kpi-card-polished__delta kpi-card-polished__delta--up" style={{ marginTop: 6, display: 'inline-flex' }}>
                            <ArrowUpRight style={{ width: 12, height: 12 }} /> +3.2% Today
                        </span>
                    </div>
                    <div className="trust-strip__card">
                        <p className="trust-strip__label">Pending Payouts</p>
                        <p className="trust-strip__value">$850.00</p>
                    </div>
                    <div className="trust-strip__card">
                        <p className="trust-strip__label">This Month</p>
                        <p className="trust-strip__value">$8,200</p>
                        <p className="trust-strip__sub">Across 3 campaigns</p>
                    </div>
                    <div className="trust-strip__card">
                        <p className="trust-strip__label">Total Funded</p>
                        <p className="trust-strip__value">$48,500</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Financial Performance Chart */}
                <div className="lg:col-span-2 surface-card" style={{ padding: 'var(--bd-space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--bd-space-6)' }}>
                        <h2 className="section-header__title">Financial Performance</h2>
                        <div style={{ position: 'relative' }}>
                            <select style={{
                                appearance: 'none', background: 'var(--bd-bg-secondary)',
                                border: '1px solid var(--bd-border-default)', borderRadius: 'var(--bd-radius-lg)',
                                fontSize: 'var(--bd-font-size-sm)', fontWeight: 500, padding: '8px 36px 8px 16px',
                                color: 'var(--bd-text-primary)', cursor: 'pointer', outline: 'none'
                            }}>
                                <option>Last 30 Days</option>
                                <option>Last Quarter</option>
                                <option>Year to Date</option>
                            </select>
                            <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--bd-text-muted)', pointerEvents: 'none' }} />
                        </div>
                    </div>
                    <div style={{ height: 300, width: '100%' }}>
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
                                    contentStyle={{ backgroundColor: 'var(--bd-surface-elevated)', border: '1px solid var(--bd-border-default)', borderRadius: 12, boxShadow: 'var(--bd-shadow-lg)' }}
                                    itemStyle={{ fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                <Area type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" name="Spend" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1 surface-card" style={{ padding: 'var(--bd-space-6)' }}>
                    <h2 className="section-header__title" style={{ marginBottom: 'var(--bd-space-5)' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bd-space-3)' }}>
                        {[
                            { icon: Globe, name: 'Meet Portal', desc: 'Manage meetings', onClick: null },
                            { icon: CreditCard, name: 'Visa & PayPal', desc: 'Manage cards', onClick: () => setIsAddFundsOpen(true) },
                            { icon: Building, name: 'Bank Transfer', desc: 'Direct deposit', onClick: () => setIsAddFundsOpen(true) },
                        ].map((action) => (
                            <button
                                key={action.name}
                                onClick={action.onClick}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                                    padding: 'var(--bd-space-4)', borderRadius: 'var(--bd-radius-xl)',
                                    background: 'var(--bd-bg-secondary)', border: '1px solid transparent',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 150ms ease'
                                }}
                            >
                                <div style={{
                                    padding: 10, background: 'var(--bd-surface)', borderRadius: 'var(--bd-radius-lg)',
                                    boxShadow: 'var(--bd-shadow-sm)', color: 'var(--bd-accent)', display: 'flex'
                                }}>
                                    <action.icon style={{ width: 20, height: 20 }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, color: 'var(--bd-text-primary)', fontSize: 'var(--bd-font-size-sm)' }}>{action.name}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)' }}>{action.desc}</p>
                                </div>
                            </button>
                        ))}

                        <div style={{ paddingTop: 'var(--bd-space-4)', marginTop: 'var(--bd-space-2)', borderTop: '1px solid var(--bd-border-muted)' }}>
                            <button style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: 'var(--bd-space-4)', borderRadius: 'var(--bd-radius-xl)',
                                background: 'var(--bd-success-muted)', border: '1px solid var(--bd-success-border)',
                                cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ padding: 8, background: 'var(--bd-success-muted)', borderRadius: 'var(--bd-radius-lg)', color: 'var(--bd-success)', display: 'flex' }}>
                                        <Wallet style={{ width: 16, height: 16 }} />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-success)' }}>Payment Methods</span>
                                </div>
                                <CheckCircle style={{ width: 20, height: 20, color: 'var(--bd-success)' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Transaction History */}
            <div className="surface-card" style={{ padding: 'var(--bd-space-6)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--bd-space-4)', marginBottom: 'var(--bd-space-6)' }}>
                    <h2 className="section-header__title">Transaction History</h2>
                    <div style={{ display: 'flex', background: 'var(--bd-bg-secondary)', padding: 3, borderRadius: 'var(--bd-radius-lg)', border: '1px solid var(--bd-border-subtle)' }}>
                        {["All", "Deposit", "Payment"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    position: 'relative', padding: '8px 20px', borderRadius: 'var(--bd-radius-md)',
                                    fontSize: 'var(--bd-font-size-sm)', fontWeight: 700, border: 'none', cursor: 'pointer',
                                    transition: 'all 200ms', zIndex: 1,
                                    background: activeTab === tab ? 'var(--bd-surface)' : 'transparent',
                                    color: activeTab === tab ? 'var(--bd-text-primary)' : 'var(--bd-text-muted)',
                                    boxShadow: activeTab === tab ? 'var(--bd-shadow-sm)' : 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table-polished">
                        <thead>
                            <tr className="table-polished__header">
                                <th className="table-polished__th" style={{ paddingLeft: 24 }}>Description</th>
                                <th className="table-polished__th">Date</th>
                                <th className="table-polished__th">Amount</th>
                                <th className="table-polished__th">Status</th>
                                <th className="table-polished__th" style={{ width: 48 }}></th>
                            </tr>
                        </thead>
                        <tbody>
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
