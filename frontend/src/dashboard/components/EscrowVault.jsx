import React from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck,
    Lock,
    History,
    CreditCard,
    Building2,
    FileCheck,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const TRANSACTIONS = [
    { id: 1, type: "deposit", amount: "$50,000.00", date: "Today, 10:42 AM", status: "Completed", desc: "Wire Transfer - Citi" },
    { id: 2, type: "payout", amount: "-$2,500.00", date: "Yesterday", status: "Released", desc: "Creator Payout: Sarah Jenkins" },
    { id: 3, type: "payout", amount: "-$1,200.00", date: "Oct 24", status: "Released", desc: "Creator Payout: Mike Tech" },
    { id: 4, type: "deposit", amount: "$25,000.00", date: "Oct 20", status: "Completed", desc: "Top-up: Q4 Budget" },
];

const CAMPAIGN_WALLETS = [
    { id: 12, name: "Summer Launch Campaign", balance: "$24,500.00", allocated: "$50,000.00", status: "Active" },
    { id: 13, name: "Back to School Push", balance: "$85,000.00", allocated: "$100,000.00", status: "Locked" },
    { id: 14, name: "Micro-Influencer Test", balance: "$3,250.00", allocated: "$5,000.00", status: "Low Balance" },
];

const EscrowVault = () => {
    return (
        <div className="h-full overflow-y-auto p-6 space-y-6 bg-[#09090B] font-sans text-slate-200">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500 w-6 h-6" />
                        Smart Escrow Vault
                    </h1>
                    <p className="text-slate-400 text-sm">Secure budget management and automated payouts</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-slate-300 transition-colors flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Statements
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                        <ArrowDownLeft className="w-4 h-4" />
                        Deposit Funds
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Balance Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/10 p-8 shadow-2xl">
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <span className="text-slate-400 text-sm font-medium tracking-wider uppercase flex items-center gap-2 mb-2">
                                <Wallet className="w-4 h-4" />
                                Total Vault Balance
                            </span>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-bold text-white tracking-tight">$112,750.00</span>
                                <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-sm">+5.2%</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <span className="block text-xs text-slate-400 mb-1">Locked in Escrow</span>
                                    <span className="text-xl font-bold text-slate-200 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-amber-500" />
                                        $42,500.00
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <span className="block text-xs text-slate-400 mb-1">Available for Payout</span>
                                    <span className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        $70,250.00
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Allocations */}
                    <div className="bg-[#18181B] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-white">Campaign Allocations</h3>
                            <button className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
                        </div>

                        <div className="divide-y divide-white/5">
                            {CAMPAIGN_WALLETS.map((wallet) => (
                                <div key={wallet.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">{wallet.name}</h4>
                                            <p className="text-xs text-slate-500">{wallet.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">{wallet.balance}</div>
                                        <div className="text-xs text-slate-500">of {wallet.allocated}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transaction History Sidebar */}
                <div className="bg-[#18181B] rounded-2xl border border-white/5 p-6 h-fit">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" />
                        Recent Activity
                    </h3>

                    <div className="relative border-l border-white/10 pl-6 space-y-8">
                        {TRANSACTIONS.map((tx) => (
                            <div key={tx.id} className="relative">
                                <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-[#18181B] ${tx.type === 'deposit' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`} />

                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold text-slate-200">{tx.desc}</span>
                                    <span className={`text-sm font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-400'
                                        }`}>
                                        {tx.amount}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span>{tx.date}</span>
                                    <span className={`px-1.5 py-0.5 rounded bg-white/5 ${tx.status === 'Completed' || tx.status === 'Released' ? 'text-emerald-500/80' : 'text-amber-500'
                                        }`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-colors border border-white/5 flex items-center justify-center gap-2">
                            <FileCheck className="w-4 h-4" />
                            Download Monthly Report
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EscrowVault;
