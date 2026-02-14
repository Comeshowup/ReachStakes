import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
    FileText, FileCheck, FileClock, Download, PenTool, Eye, Loader2, Shield, Receipt, X, ExternalLink
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const DOC_CONFIG = {
    Contract: { icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    NDA: { icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10" },
    W9: { icon: Receipt, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    Other: { icon: FileText, color: "text-slate-400", bg: "bg-slate-500/10" }
};

const StatusBadge = ({ status }) => {
    const config = {
        Draft: { bg: "bg-slate-500/10", text: "text-slate-400" },
        Pending_Signature: { bg: "bg-amber-500/10", text: "text-amber-400" },
        Signed: { bg: "bg-emerald-500/10", text: "text-emerald-400" }
    };
    const c = config[status] || config.Draft;
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.bg} ${c.text}`}>{status?.replace(/_/g, " ")}</span>;
};

const DocumentCard = ({ document, onView }) => {
    const typeConfig = DOC_CONFIG[document.type] || DOC_CONFIG.Other;
    const TypeIcon = typeConfig.icon;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl p-5 transition-all">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${typeConfig.bg}`}><TypeIcon className={`w-5 h-5 ${typeConfig.color}`} /></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="font-bold text-white truncate">{document.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{document.type?.replace(/_/g, " ")} • {new Date(document.createdAt).toLocaleDateString()}</p>
                        </div>
                        <StatusBadge status={document.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => onView(document)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300">
                            <Eye className="w-3.5 h-3.5" />View
                        </button>
                        {document.signedFileUrl && (
                            <a href={document.signedFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400">
                                <Download className="w-3.5 h-3.5" />Download
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CampaignDocumentsTab = ({ collaborationId, campaign }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => { fetchDocuments(); }, [collaborationId]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/documents`, { headers: { Authorization: `Bearer ${token}` } });
            // Filter by collaboration if possible
            const allDocs = response.data.data || [];
            const filtered = allDocs.filter(d => d.collaborationId === parseInt(collaborationId) || !d.collaborationId);
            setDocuments(filtered);
        } catch (error) { console.error("Failed:", error); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-6">
            <div><h2 className="text-xl font-black text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400" />Campaign Documents</h2><p className="text-sm text-slate-500 mt-1">{documents.length} document(s)</p></div>

            {documents.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-2xl"><FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" /><p className="text-slate-500 text-xs uppercase">No documents yet</p></div>
            ) : (
                <div className="space-y-4">{documents.map((doc, i) => <DocumentCard key={doc.id || i} document={doc} onView={setSelectedDoc} />)}</div>
            )}

            {/* Document Viewer Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white">{selectedDoc.title}</h2>
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl"><p className="text-xs text-slate-500 mb-1">Status</p><StatusBadge status={selectedDoc.status} /></div>
                                <div className="p-4 bg-white/5 rounded-xl"><p className="text-xs text-slate-500 mb-1">Created</p><p className="font-bold text-white">{new Date(selectedDoc.createdAt).toLocaleDateString()}</p></div>
                            </div>
                            {selectedDoc.description && <p className="text-sm text-slate-400">{selectedDoc.description}</p>}
                        </div>
                        <div className="p-6 border-t border-white/5 flex gap-3">
                            {selectedDoc.signedFileUrl && <a href={selectedDoc.signedFileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white text-center flex items-center justify-center gap-2"><Download className="w-4 h-4" />Download</a>}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CampaignDocumentsTab;
