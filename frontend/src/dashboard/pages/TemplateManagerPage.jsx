import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Trash2,
    Edit3,
    FileText,
    Check,
    X,
    Loader2,
    Sparkles,
    Youtube,
    Instagram,
    PlusCircle,
    Info,
} from 'lucide-react';
import * as brandService from '../../api/brandService';

const PLATFORM_ICONS = {
    YouTube: <Youtube size={16} className="text-red-500" />,
    Instagram: <Instagram size={16} className="text-pink-500" />,
    TikTok: <span className="font-bold text-xs text-cyan-400">TT</span>,
    default: <FileText size={16} className="text-slate-400" />
};

export default function TemplateManagerPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [contentType, setContentType] = useState('Video');
    const [platform, setPlatform] = useState('Instagram');
    const [guidelines, setGuidelines] = useState('');
    const [requireScript, setRequireScript] = useState(false);
    const [requireMockDraft, setRequireMockDraft] = useState(false);
    
    // Checklist state
    const [checklistItems, setChecklistItems] = useState([
        { id: '1', label: '15-second hook included', required: true },
        { id: '2', label: 'Clear Call to Action at the end', required: true }
    ]);
    const [newItemLabel, setNewItemLabel] = useState('');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const res = await brandService.getTemplates();
            if (res.status === 'success') {
                setTemplates(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingTemplate(null);
        setName('');
        setContentType('Video');
        setPlatform('Instagram');
        setGuidelines('');
        setRequireScript(false);
        setRequireMockDraft(false);
        setChecklistItems([
            { id: '1', label: '15-second hook included', required: true },
            { id: '2', label: 'Clear Call to Action at the end', required: true }
        ]);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (t) => {
        setEditingTemplate(t);
        setName(t.name);
        setContentType(t.contentType || 'Video');
        setPlatform(t.platform || 'Instagram');
        setGuidelines(t.guidelines ? (typeof t.guidelines === 'string' ? t.guidelines : JSON.stringify(t.guidelines)) : '');
        setRequireScript(t.requireScript || false);
        setRequireMockDraft(t.requireMockDraft || false);
        
        let checklistData = [];
        if (t.checklist) {
            try {
                checklistData = typeof t.checklist === 'string' ? JSON.parse(t.checklist) : t.checklist;
            } catch {
                checklistData = [];
            }
        }
        setChecklistItems(Array.isArray(checklistData) ? checklistData : []);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            const res = await brandService.deleteTemplate(id);
            if (res.status === 'success') {
                setTemplates(prev => prev.filter(t => t.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete template:', err);
        }
    };

    const handleAddChecklistItem = () => {
        if (!newItemLabel.trim()) return;
        const newItem = {
            id: Date.now().toString(),
            label: newItemLabel.trim(),
            required: true
        };
        setChecklistItems(prev => [...prev, newItem]);
        setNewItemLabel('');
    };

    const handleRemoveChecklistItem = (id) => {
        setChecklistItems(prev => prev.filter(item => item.id !== id));
    };

    const handleToggleChecklistItemRequired = (id) => {
        setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, required: !item.required } : item));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name,
            contentType,
            platform,
            guidelines,
            checklist: checklistItems,
            requireScript,
            requireMockDraft
        };

        try {
            if (editingTemplate) {
                const res = await brandService.updateTemplate(editingTemplate.id, payload);
                if (res.status === 'success') {
                    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? res.data : t));
                }
            } else {
                const res = await brandService.createTemplate(payload);
                if (res.status === 'success') {
                    setTemplates(prev => [res.data, ...prev]);
                }
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving template:', err);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.platform && t.platform.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.contentType && t.contentType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Sparkles className="text-indigo-400 w-6 h-6 animate-pulse" /> Deliverable Templates
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Define reusable templates with platforms, requirements, scripts, drafts, and compliance checklists.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bd-cm-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl"
                >
                    <Plus size={16} /> Create Template
                </button>
            </div>

            {/* Filter Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                <input
                    type="text"
                    placeholder="Search templates by name, platform, content type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bd-cm-input-field w-full pl-10 pr-4 py-2 text-sm"
                />
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="bd-cm-card p-12 text-center flex flex-col items-center">
                    <div className="p-4 rounded-full bg-slate-800/50 text-slate-500 mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-base font-semibold text-white">No templates found</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm">
                        {searchQuery ? "No templates match your search filters." : "Create your first deliverable template to easily standardize requirements for creator invitations."}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(t => (
                        <div
                            key={t.id}
                            className="bd-cm-card p-5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        {t.contentType || 'Any Content'}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        {PLATFORM_ICONS[t.platform] || PLATFORM_ICONS.default}
                                        <span className="font-semibold">{t.platform || 'Any Platform'}</span>
                                    </div>
                                </div>

                                <h3 className="text-base font-semibold text-white truncate mb-1">
                                    {t.name}
                                </h3>

                                <div className="space-y-1.5 mt-4">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Workflow Steps:</span>
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <span className={t.requireScript ? 'text-indigo-400' : 'text-slate-600'}>Script</span>
                                            <span className="text-slate-700">•</span>
                                            <span className={t.requireMockDraft ? 'text-indigo-400' : 'text-slate-600'}>Draft</span>
                                            <span className="text-slate-700">•</span>
                                            <span className="text-indigo-400">Publish</span>
                                        </div>
                                    </div>

                                    {t.checklist && (
                                        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                                            <span>Checklist Tasks:</span>
                                            <span className="font-semibold text-slate-200">
                                                {(typeof t.checklist === 'string' ? JSON.parse(t.checklist) : t.checklist).length} items
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800/80">
                                <button
                                    onClick={() => handleOpenEdit(t)}
                                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                                    title="Edit Template"
                                >
                                    <Edit3 size={15} />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                    title="Delete Template"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Template Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'var(--bd-overlay)' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bd-cm-card p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {editingTemplate ? 'Edit Template' : 'Create Template'}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Define details to auto-populate invitations.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Template Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Standard YouTube Sponsor Video"
                                        className="bd-cm-input-field w-full px-4 py-2"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-300">Content Type</label>
                                        <select
                                            value={contentType}
                                            onChange={(e) => setContentType(e.target.value)}
                                            className="bd-cm-input-field w-full px-3 py-2"
                                        >
                                            <option value="Video">Video</option>
                                            <option value="Image">Image</option>
                                            <option value="Story">Story</option>
                                            <option value="Post">Post</option>
                                            <option value="UGC">UGC (Raw Content)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-300">Platform</label>
                                        <select
                                            value={platform}
                                            onChange={(e) => setPlatform(e.target.value)}
                                            className="bd-cm-input-field w-full px-3 py-2"
                                        >
                                            <option value="Instagram">Instagram</option>
                                            <option value="TikTok">TikTok</option>
                                            <option value="YouTube">YouTube</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={requireScript}
                                            onChange={(e) => setRequireScript(e.target.checked)}
                                            className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold text-white">Require Script Stage</p>
                                            <p className="text-[10px] text-slate-400">Creator submits storyboard first</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={requireMockDraft}
                                            onChange={(e) => setRequireMockDraft(e.target.checked)}
                                            className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold text-white">Require Draft/Mock Stage</p>
                                            <p className="text-[10px] text-slate-400">Creator submits draft for review</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Guidelines & Briefing</label>
                                    <textarea
                                        value={guidelines}
                                        onChange={(e) => setGuidelines(e.target.value)}
                                        placeholder="Add instructions, hooks to mention, or visual aesthetic requirements..."
                                        rows={3}
                                        className="bd-cm-input-field w-full p-3 resize-none"
                                    />
                                </div>

                                {/* Checklist builder */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-300 block">Compliance Checklist</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {checklistItems.map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between gap-3 p-2 bg-slate-900/30 border border-slate-800/80 rounded-lg"
                                            >
                                                <span className="text-xs text-white truncate flex-1">{item.label}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleChecklistItemRequired(item.id)}
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                                                            item.required
                                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                                        }`}
                                                    >
                                                        {item.required ? 'Required' : 'Optional'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveChecklistItem(item.id)}
                                                        className="text-slate-500 hover:text-red-400 p-1"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add custom checklist requirement..."
                                            value={newItemLabel}
                                            onChange={(e) => setNewItemLabel(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                                            className="bd-cm-input-field flex-1 px-3 py-1.5 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddChecklistItem}
                                            className="bd-cm-btn-secondary px-3 text-xs flex items-center gap-1 shrink-0"
                                        >
                                            <PlusCircle size={13} /> Add
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bd-cm-btn-secondary px-5 py-2 text-sm font-semibold rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bd-cm-btn-primary px-5 py-2 text-sm font-semibold rounded-xl"
                                    >
                                        {editingTemplate ? 'Update Template' : 'Save Template'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
