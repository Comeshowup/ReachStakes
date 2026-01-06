import React from "react";
import {
    FileSignature,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    ChevronRight,
    Shield
} from "lucide-react";

const MOCK_CONTRACTS = [
    { id: 1, creator: "@SarahJ", status: "Signed", date: "Oct 24, 2025", rights: "Perpetual", rightsType: "Digital Only", expires: "Never" },
    { id: 2, creator: "@MikeTech", status: "Pending", date: "Sent 2 days ago", rights: "30 Days", rightsType: "Paid Social", expires: "Nov 24, 2025" },
    { id: 3, creator: "@BeautyGuru", status: "Signed", date: "Oct 22, 2025", rights: "1 Year", rightsType: "All Media", expires: "Oct 22, 2026" },
];

const ContractStatus = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#18181B] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div>
                        <p className="text-sm text-slate-400 font-medium font-sans">Contracts Signed</p>
                        <h3 className="text-3xl font-bold text-white mt-1 font-sans">2 <span className="text-sm text-slate-600 font-normal">/ 3</span></h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                        <FileSignature className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#18181B] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div>
                        <p className="text-sm text-slate-400 font-medium font-sans">Pending Signatures</p>
                        <h3 className="text-3xl font-bold text-white mt-1 font-sans">1</h3>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#18181B] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-rose-500/30 transition-all">
                    <div>
                        <p className="text-sm text-slate-400 font-medium font-sans">Rights Expiring Soon</p>
                        <h3 className="text-3xl font-bold text-white mt-1 font-sans">0</h3>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all">
                        <Shield className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="bg-[#18181B] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-[#18181B]">
                    <h3 className="font-bold text-lg text-white">Contract List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/[0.02] text-slate-400">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Creator</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Rights Scope</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Expiration</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {MOCK_CONTRACTS.map((contract) => (
                                <tr key={contract.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10"></div>
                                            <span className="font-bold text-sm text-white">{contract.creator}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${contract.status === "Signed"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }`}>
                                            {contract.status === "Signed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">{contract.rights}</span>
                                            <span className="text-xs text-slate-500">{contract.rightsType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-400 font-mono">{contract.expires}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 text-xs font-bold flex items-center gap-2 justify-end ml-auto transition-all">
                                            <Download className="w-3 h-3" />
                                            PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContractStatus;
