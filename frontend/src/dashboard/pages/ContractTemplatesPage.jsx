/**
 * ContractTemplatesPage
 * Page for brands to browse and use contract templates
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Eye, Copy, Trash2, FileSignature, Shield, Lock, Building2 } from 'lucide-react';

const ContractTemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/contracts/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setTemplates(data.data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryConfig = (category) => {
        const configs = {
            Collaboration: { icon: FileSignature, color: '#8b5cf6', label: 'Collaboration' },
            NDA: { icon: Lock, color: '#ef4444', label: 'NDA' },
            UsageRights: { icon: Shield, color: '#10b981', label: 'Usage Rights' },
            Exclusive: { icon: Building2, color: '#f59e0b', label: 'Exclusive' },
            WorkForHire: { icon: FileText, color: '#6366f1', label: 'Work for Hire' },
            Custom: { icon: FileText, color: '#6b7280', label: 'Custom' }
        };
        return configs[category] || configs.Custom;
    };

    const styles = {
        container: {
            padding: '32px',
            color: '#fff',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            margin: 0
        },
        subtitle: {
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '4px'
        },
        createBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
        },
        card: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        cardHeader: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '16px'
        },
        iconBox: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        cardTitle: {
            fontSize: '16px',
            fontWeight: '600',
            margin: 0
        },
        cardDesc: {
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
            marginBottom: '16px'
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600'
        },
        cardFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        },
        usageCount: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)'
        },
        actions: {
            display: 'flex',
            gap: '8px'
        },
        actionBtn: {
            padding: '8px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
        },
        // Preview Modal
        overlay: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modal: {
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
        },
        modalHeader: {
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        modalContent: {
            padding: '24px',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            color: 'rgba(255,255,255,0.8)'
        },
        modalFooter: {
            padding: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
        },
        closeBtn: {
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
        },
        useBtn: {
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer'
        },
        variablesList: {
            margin: '16px 0',
            padding: '16px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '12px'
        },
        variableItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 0',
            fontSize: '12px'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                    <h3>Loading templates...</h3>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>📝 Contract Templates</h1>
                    <p style={styles.subtitle}>Pre-built legal templates for brand-creator agreements</p>
                </div>
                <button style={styles.createBtn}>
                    <Plus size={18} />
                    Create Custom Template
                </button>
            </div>

            {/* Template Grid */}
            <div style={styles.grid}>
                {templates.map(template => {
                    const config = getCategoryConfig(template.category);
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={template.id}
                            style={styles.card}
                            whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                            onClick={() => {
                                setSelectedTemplate(template);
                                setShowPreview(true);
                            }}
                        >
                            <div style={styles.cardHeader}>
                                <div style={{ ...styles.iconBox, background: `${config.color}20` }}>
                                    <Icon size={24} color={config.color} />
                                </div>
                                <div>
                                    <h3 style={styles.cardTitle}>{template.name}</h3>
                                    <span style={{
                                        ...styles.badge,
                                        background: `${config.color}20`,
                                        color: config.color
                                    }}>
                                        {config.label}
                                    </span>
                                </div>
                            </div>

                            <p style={styles.cardDesc}>
                                {template.description}
                            </p>

                            {template.isSystem && (
                                <span style={{
                                    ...styles.badge,
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    marginBottom: '12px'
                                }}>
                                    ✓ System Template
                                </span>
                            )}

                            <div style={styles.cardFooter}>
                                <span style={styles.usageCount}>
                                    Used {template.usageCount || 0} times
                                </span>
                                <div style={styles.actions}>
                                    <button
                                        style={styles.actionBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTemplate(template);
                                            setShowPreview(true);
                                        }}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    {!template.isSystem && (
                                        <button style={styles.actionBtn}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {templates.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                        <h3>No templates available</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Contact admin to seed system templates
                        </p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && selectedTemplate && (
                    <motion.div
                        style={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            style={styles.modal}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={styles.modalHeader}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '20px' }}>
                                        {selectedTemplate.name}
                                    </h2>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                                        {selectedTemplate.description}
                                    </p>
                                </div>
                                <button
                                    style={styles.closeBtn}
                                    onClick={() => setShowPreview(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Variables */}
                            {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                                <div style={styles.variablesList}>
                                    <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>
                                        📋 Template Variables
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                                        {selectedTemplate.variables.map((v, i) => (
                                            <div key={i} style={styles.variableItem}>
                                                <code style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px'
                                                }}>
                                                    {`{{${v.key}}}`}
                                                </code>
                                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    {v.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Content Preview */}
                            <div style={styles.modalContent}>
                                {selectedTemplate.content}
                            </div>

                            <div style={styles.modalFooter}>
                                <button
                                    style={styles.closeBtn}
                                    onClick={() => setShowPreview(false)}
                                >
                                    Close
                                </button>
                                <button style={{
                                    ...styles.actionBtn,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <Copy size={16} />
                                    Duplicate
                                </button>
                                <button style={styles.useBtn}>
                                    Use Template
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContractTemplatesPage;
