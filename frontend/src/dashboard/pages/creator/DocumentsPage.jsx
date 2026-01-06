import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    FileText,
    FileCheck,
    FileClock,
    FileWarning,
    Download,
    PenTool,
    Eye,
    Plus,
    Filter,
    ChevronDown,
    Loader2,
    Calendar,
    Building2,
    Shield,
    Receipt,
    X,
    ExternalLink,
    RefreshCw
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Document type icons and colors
const DOCUMENT_CONFIG = {
    Contract: { icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    W9: { icon: Receipt, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    NEC_1099: { icon: Receipt, color: "text-amber-400", bg: "bg-amber-500/10" },
    NDA: { icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10" },
    MediaRelease: { icon: FileCheck, color: "text-pink-400", bg: "bg-pink-500/10" },
    TaxForm: { icon: Receipt, color: "text-orange-400", bg: "bg-orange-500/10" },
    Other: { icon: FileText, color: "text-slate-400", bg: "bg-slate-500/10" }
};

// Status badges
const StatusBadge = ({ status }) => {
    const config = {
        Draft: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
        Pending_Signature: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
        Signed: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
        Expired: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
        Voided: { bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/20" }
    };
    const c = config[status] || config.Draft;
    const displayStatus = status?.replace(/_/g, " ") || "Draft";

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.bg} ${c.text} ${c.border}`}>
            {displayStatus}
        </span>
    );
};

// Document Card Component
const DocumentCard = ({ document, onSign, onView, onDownload }) => {
    const typeConfig = DOCUMENT_CONFIG[document.type] || DOCUMENT_CONFIG.Other;
    const TypeIcon = typeConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-slate-900/50 hover:bg-slate-900 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all p-5"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl ${typeConfig.bg}`}>
                    <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                                {document.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {document.type?.replace(/_/g, " ")} • {new Date(document.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <StatusBadge status={document.status} />
                    </div>

                    {document.description && (
                        <p className="text-sm text-slate-400 mt-3 line-clamp-2">{document.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => onView(document)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all"
                        >
                            <Eye className="w-3.5 h-3.5" /> View
                        </button>

                        {document.status === "Pending_Signature" && (
                            <button
                                onClick={() => onSign(document)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                            >
                                <PenTool className="w-3.5 h-3.5" /> Sign
                            </button>
                        )}

                        {/* Download Signed PDF */}
                        {document.status === "Signed" && document.signedFileUrl && (
                            <button
                                onClick={() => onDownload(document)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all"
                            >
                                <Download className="w-3.5 h-3.5" /> Download
                            </button>
                        )}

                        {/* Download Draft Contract */}
                        {document.type === "Contract" && document.status !== "Signed" && (
                            <a
                                href={`${API_BASE_URL}/documents/${document.id}/download?token=${localStorage.getItem('token')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-500/20 hover:bg-slate-500/30 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all"
                            >
                                <Download className="w-3.5 h-3.5" /> Draft PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Document Viewer Modal
const DocumentViewerModal = ({ document, isOpen, onClose }) => {
    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-black text-white">{document.title}</h2>
                        <p className="text-xs text-slate-500 mt-1">{document.type?.replace(/_/g, " ")}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                            <StatusBadge status={document.status} />
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Created</p>
                            <p className="text-sm font-bold text-white">{new Date(document.createdAt).toLocaleDateString()}</p>
                        </div>
                        {document.signedAt && (
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Signed</p>
                                <p className="text-sm font-bold text-emerald-400">{new Date(document.signedAt).toLocaleDateString()}</p>
                            </div>
                        )}
                        {document.expiresAt && (
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expires</p>
                                <p className="text-sm font-bold text-white">{new Date(document.expiresAt).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>

                    {document.description && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{document.description}</p>
                        </div>
                    )}

                    {document.signedByName && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-xs text-emerald-400 font-bold">✓ Signed by {document.signedByName}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                    {document.fileUrl && (
                        <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-300 transition-all"
                        >
                            <ExternalLink className="w-4 h-4" /> View Original
                        </a>
                    )}
                    {document.signedFileUrl && (
                        <a
                            href={document.signedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all"
                        >
                            <Download className="w-4 h-4" /> Download Signed PDF
                        </a>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        if (filter === "all") return true;
        if (filter === "contracts") return doc.type === "Contract";
        if (filter === "tax") return ["W9", "NEC_1099", "TaxForm"].includes(doc.type);
        if (filter === "pending") return doc.status === "Pending_Signature";
        if (filter === "signed") return doc.status === "Signed";
        return true;
    });

    const handleView = (doc) => {
        setSelectedDocument(doc);
        setIsViewerOpen(true);
    };

    const handleSign = async (doc) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE_URL}/documents/${doc.id}/sign`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // For now show alert - in production this would open DocuSeal embed
            alert(`Signing initiated! DocuSeal integration pending.\n\nPlaceholder URL: ${response.data.data?.signingUrl}`);
            fetchDocuments(); // Refresh to show updated status
        } catch (error) {
            console.error("Failed to initiate signing:", error);
            alert("Failed to initiate document signing");
        }
    };

    const handleDownload = (doc) => {
        if (doc.signedFileUrl) {
            window.open(doc.signedFileUrl, "_blank");
        }
    };

    // Stats
    const stats = {
        total: documents.length,
        pending: documents.filter(d => d.status === "Pending_Signature").length,
        signed: documents.filter(d => d.status === "Signed").length,
        contracts: documents.filter(d => d.type === "Contract").length
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-500" />
                        DOCUMENTS
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Contracts, Tax Forms & Legal Documents
                    </p>
                </div>
                <button
                    onClick={fetchDocuments}
                    className="group bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <FileText className="w-5 h-5 text-indigo-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.total}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Documents</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <FileClock className="w-5 h-5 text-amber-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.pending}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending Signature</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <FileCheck className="w-5 h-5 text-emerald-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.signed}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Signed</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <Building2 className="w-5 h-5 text-purple-400 mb-3" />
                    <p className="text-3xl font-black text-white">{stats.contracts}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Contracts</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <Filter className="w-4 h-4 text-slate-500" />
                {["all", "contracts", "tax", "pending", "signed"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === f
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Documents List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black italic tracking-tight text-white uppercase">
                        Your Documents
                    </h2>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {filteredDocuments.length} Documents
                    </span>
                </div>

                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            {filter === "all"
                                ? "No documents yet. Contracts will appear here when you join campaigns."
                                : `No ${filter} documents found`}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredDocuments.map((doc, index) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onSign={handleSign}
                                onView={handleView}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                document={selectedDocument}
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
            />
        </div>
    );
};

export default DocumentsPage;
