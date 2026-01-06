import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Download,
    Calendar,
    DollarSign,
    Building2,
    TrendingUp,
    ChevronDown,
    Filter,
    CheckCircle,
    Clock,
    Receipt,
    FileSpreadsheet,
    AlertCircle,
    Loader2,
    PieChart
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Animated Counter Component
const CountUp = ({ value, prefix = "$" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 1000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{prefix}{count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
};

// Invoice Row Component
const InvoiceRow = ({ invoice, onDownload }) => {
    const statusColors = {
        Paid: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        Pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        Draft: "text-slate-400 bg-slate-500/10 border-slate-500/20"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-4 hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{invoice.invoiceNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[invoice.status]}`}>
                                {invoice.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {invoice.brandName}
                            </span>
                            <span>•</span>
                            <span>{invoice.campaignTitle}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">
                            ${parseFloat(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-500">
                            {new Date(invoice.paidAt).toLocaleDateString()}
                        </div>
                    </div>
                    <button
                        onClick={() => onDownload(invoice)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Main Component
const InvoiceCenter = () => {
    const [invoices, setInvoices] = useState([]);
    const [taxSummary, setTaxSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState("invoices");

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [invoicesRes, taxRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/invoices/my-invoices`, { headers }),
                axios.get(`${API_BASE_URL}/invoices/tax-summary/${selectedYear}`, { headers })
            ]);

            setInvoices(invoicesRes.data.data || []);
            setTaxSummary(taxRes.data.data || null);
        } catch (error) {
            console.error("Error fetching invoice data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (invoice) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/invoices/download/${invoice.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // For now, show the invoice data in an alert
            // TODO: Generate and download PDF
            alert(`Invoice ${invoice.invoiceNumber}\n\nBrand: ${invoice.brandName}\nCampaign: ${invoice.campaignTitle}\nAmount: $${invoice.amount}\nStatus: Paid`);
        } catch (error) {
            console.error("Error downloading invoice:", error);
        }
    };

    const totalEarnings = taxSummary?.totalEarnings || 0;
    const monthlyData = taxSummary?.monthlyBreakdown || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-indigo-500" />
                        Invoice Center
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Auto-generated invoices and tax documents
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {[2026, 2025, 2024, 2023].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Tax Summary
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Earnings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 border border-emerald-500/20 p-6"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Total Earnings ({selectedYear})
                        </span>
                        <div className="text-3xl font-bold text-white mt-2">
                            <CountUp value={totalEarnings} />
                        </div>
                        <div className="text-xs text-emerald-400/70 mt-1">
                            {invoices.length} paid invoices
                        </div>
                    </div>
                </motion.div>

                {/* Invoices Count */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-slate-900 border border-white/5 p-6"
                >
                    <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Total Invoices
                    </span>
                    <div className="text-3xl font-bold text-white mt-2">
                        {invoices.length}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {taxSummary?.campaignCount || 0} unique campaigns
                    </div>
                </motion.div>

                {/* 1099 Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-2xl border p-6 ${taxSummary?.requiresForm1099
                            ? "bg-amber-900/20 border-amber-500/20"
                            : "bg-slate-900 border-white/5"
                        }`}
                >
                    <span className={`text-sm font-medium flex items-center gap-2 ${taxSummary?.requiresForm1099 ? "text-amber-400" : "text-slate-400"
                        }`}>
                        <AlertCircle className="w-4 h-4" />
                        1099 Status
                    </span>
                    <div className={`text-lg font-bold mt-2 ${taxSummary?.requiresForm1099 ? "text-amber-400" : "text-slate-300"
                        }`}>
                        {taxSummary?.requiresForm1099 ? "Form Required" : "Under Threshold"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        1099 threshold: $600
                    </div>
                </motion.div>
            </div>

            {/* Earnings Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-slate-900 border border-white/5 p-6"
            >
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-400" />
                    Monthly Earnings
                </h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#fff' }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']}
                            />
                            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Invoice List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl bg-slate-900 border border-white/5 overflow-hidden"
            >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Invoice History
                    </h3>
                    <span className="text-xs text-slate-400">
                        {invoices.length} invoices
                    </span>
                </div>

                {invoices.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-400 mb-2">No Invoices Yet</h4>
                        <p className="text-sm text-slate-500">
                            Invoices are automatically generated when you receive payments for completed campaigns.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {invoices.map((invoice) => (
                            <InvoiceRow
                                key={invoice.id}
                                invoice={invoice}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Brand Breakdown */}
            {taxSummary?.brandBreakdown?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl bg-slate-900 border border-white/5 p-6"
                >
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        Earnings by Brand
                    </h3>
                    <div className="space-y-3">
                        {taxSummary.brandBreakdown.map((brand, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-sm font-medium text-white">{brand.brandName}</span>
                                <span className="text-sm font-bold text-emerald-400">
                                    ${brand.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default InvoiceCenter;
