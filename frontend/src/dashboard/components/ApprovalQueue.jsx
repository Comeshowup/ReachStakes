import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

import ApprovalQueueSidebar from './approvals/ApprovalQueueSidebar';
import ReviewWorkspace from './approvals/ReviewWorkspace';
import ConfirmationModal from './approvals/ConfirmationModal';

import api from '../../api/axios';
import brandService from '../../api/brandService';
import conciergeService from '../../api/conciergeService';

import '../../styles/approvals.css';

// ──────────────────────────────────────────────────
// Root Component — Real Data
// ──────────────────────────────────────────────────
const ApprovalQueue = () => {
    const [queue, setQueue] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [batchMode, setBatchMode] = useState(false);
    const [batchSelectedIds, setBatchSelectedIds] = useState([]);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [revisionMode, setRevisionMode] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const selectedItem = queue.find(q => q.id === selectedId) || null;

    // ── Auth helper ──
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ── Load real data from backend ──
    useEffect(() => {
        const loadApprovals = async () => {
            setIsFetching(true);
            setFetchError(null);
            try {
                // 1. Get brand profile to acquire brandId
                const profileRes = await brandService.getBrandProfile();
                const brandId = profileRes?.data?.id || profileRes?.id;
                if (!brandId) throw new Error('Could not determine brand ID');

                // 2. Fetch approvals queue
                const res = await api.get(`/collaborations/brand/${brandId}/approvals`, {
                    headers: getAuthHeaders()
                });
                const items = res.data?.data || [];
                setQueue(items);
                if (items.length > 0) setSelectedId(items[0].id);
            } catch (err) {
                console.error('[ApprovalQueue] Failed to load:', err);
                setFetchError(err.response?.data?.error || err.message || 'Failed to load approval queue');
            } finally {
                setIsFetching(false);
            }
        };
        loadApprovals();
    }, []);

    // ── Toast Helper ──
    const showToast = useCallback((message) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast(message);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
    }, []);

    // ── Keyboard Shortcuts ──
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

            switch (e.key.toLowerCase()) {
                case 'j': {
                    const currentIdx = queue.findIndex(q => q.id === selectedId);
                    if (currentIdx < queue.length - 1) {
                        setSelectedId(queue[currentIdx + 1].id);
                        setRevisionMode(false);
                        setFeedbackText('');
                    }
                    break;
                }
                case 'k': {
                    const currentIdx = queue.findIndex(q => q.id === selectedId);
                    if (currentIdx > 0) {
                        setSelectedId(queue[currentIdx - 1].id);
                        setRevisionMode(false);
                        setFeedbackText('');
                    }
                    break;
                }
                case 'a': {
                    if (!revisionMode && selectedItem) {
                        e.preventDefault();
                        setConfirmModalOpen(true);
                    }
                    break;
                }
                case 'r': {
                    if (!revisionMode && selectedItem) {
                        e.preventDefault();
                        setRevisionMode(true);
                    }
                    break;
                }
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [queue, selectedId, revisionMode, selectedItem]);

    // ── Selection ──
    const handleSelect = useCallback((id) => {
        setSelectedId(id);
        setRevisionMode(false);
        setFeedbackText('');
    }, []);

    // ── Batch Mode ──
    const handleToggleBatchMode = useCallback(() => {
        setBatchMode(prev => !prev);
        setBatchSelectedIds([]);
    }, []);

    const handleBatchToggle = useCallback((id) => {
        setBatchSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }, []);

    // ── Approve Click ──
    const handleApproveClick = useCallback(() => {
        if (batchMode && batchSelectedIds.length > 0) {
            setConfirmModalOpen(true);
        } else if (selectedItem) {
            setConfirmModalOpen(true);
        }
    }, [batchMode, batchSelectedIds, selectedItem]);

    // ── Confirm Approve (real API) ──
    const handleConfirmApprove = useCallback(async () => {
        setIsLoading(true);
        try {
            if (batchMode && batchSelectedIds.length > 0) {
                // Batch approve
                let releaseFailCount = 0;
                await Promise.all(batchSelectedIds.map(async (id) => {
                    await api.patch(`/collaborations/${id}/decision`,
                        { status: 'Approved', feedback: '' },
                        { headers: getAuthHeaders() }
                    );
                    // Release escrow for each
                    try {
                        await conciergeService.releaseEscrow(id);
                    } catch (escrowErr) {
                        releaseFailCount++;
                        console.error(`[ApprovalQueue] Escrow release failed for ${id}:`, escrowErr.message);
                    }
                }));

                const remaining = queue.filter(q => !batchSelectedIds.includes(q.id));
                setQueue(remaining);
                if (releaseFailCount > 0) {
                    showToast(`⚠ ${batchSelectedIds.length - releaseFailCount} released, ${releaseFailCount} payment(s) failed — check escrow balance`);
                } else {
                    showToast(`✓ ${batchSelectedIds.length} approvals & payments released`);
                }
                setBatchSelectedIds([]);
                setBatchMode(false);
                setSelectedId(remaining[0]?.id || null);
            } else if (selectedItem) {
                const currentIdx = queue.findIndex(q => q.id === selectedId);

                // 1. Mark collaboration as Approved
                await api.patch(`/collaborations/${selectedId}/decision`,
                    { status: 'Approved', feedback: '' },
                    { headers: getAuthHeaders() }
                );

                // 2. Release escrow — surface errors clearly so brand isn't misled
                let escrowReleased = false;
                let escrowErrMsg = null;
                try {
                    await conciergeService.releaseEscrow(selectedId);
                    escrowReleased = true;
                } catch (escrowErr) {
                    escrowErrMsg = escrowErr.response?.data?.message || escrowErr.message;
                    console.error('[ApprovalQueue] Escrow release failed:', escrowErrMsg);
                }

                const newQueue = queue.filter(q => q.id !== selectedId);
                setQueue(newQueue);

                if (escrowReleased) {
                    showToast(`✓ Approved & payment released for ${selectedItem.creator}`);
                } else {
                    showToast(`✓ Approved, but payment failed: ${escrowErrMsg || 'Check escrow balance'}`);
                }

                // Auto-advance
                const nextIdx = Math.min(currentIdx, newQueue.length - 1);
                setSelectedId(newQueue[nextIdx]?.id || null);
            }
        } catch (err) {
            console.error('[ApprovalQueue] Approve failed:', err);
            showToast(`✗ ${err.response?.data?.error || err.message || 'Approval failed'}`);
        } finally {
            setIsLoading(false);
            setConfirmModalOpen(false);
        }
    }, [batchMode, batchSelectedIds, selectedItem, selectedId, queue, showToast]);

    // ── Request Changes (real API) ──
    const handleToggleRevisionMode = useCallback(() => {
        setRevisionMode(prev => !prev);
        if (revisionMode) setFeedbackText('');
    }, [revisionMode]);

    const handleSubmitFeedback = useCallback(async () => {
        if (!feedbackText.trim() || !selectedItem) return;

        setIsLoading(true);
        try {
            await api.patch(`/collaborations/${selectedId}/decision`,
                { status: 'Revision', feedback: feedbackText },
                { headers: getAuthHeaders() }
            );

            // Optimistically update local state
            setQueue(prev => prev.map(q =>
                q.id === selectedId
                    ? {
                        ...q,
                        status: 'waiting',
                        timeline: [
                            {
                                id: `t-new-${Date.now()}`,
                                role: 'brand',
                                author: 'Brand Manager',
                                date: 'Just now',
                                type: 'message',
                                text: feedbackText
                            },
                            {
                                id: `t-status-${Date.now()}`,
                                role: 'system',
                                author: 'System',
                                date: 'Just now',
                                type: 'status',
                                text: 'Changes requested'
                            },
                            ...q.timeline
                        ]
                    }
                    : q
            ));

            setRevisionMode(false);
            setFeedbackText('');
            showToast('Changes requested sent to creator');
        } catch (err) {
            console.error('[ApprovalQueue] Revision failed:', err);
            showToast(`✗ ${err.response?.data?.error || 'Failed to send feedback'}`);
        } finally {
            setIsLoading(false);
        }
    }, [feedbackText, selectedItem, selectedId, showToast]);

    // ── Compliance Actions (local only) ──
    const handleToggleOverride = useCallback((reqId) => {
        setQueue(prev => prev.map(q =>
            q.id === selectedId
                ? {
                    ...q,
                    requirements: q.requirements.map(r =>
                        r.id === reqId ? { ...r, overridden: !r.overridden } : r
                    )
                }
                : q
        ));
    }, [selectedId]);

    const handleAddComplianceComment = useCallback((reqId, text) => {
        setQueue(prev => prev.map(q =>
            q.id === selectedId
                ? {
                    ...q,
                    requirements: q.requirements.map(r =>
                        r.id === reqId
                            ? { ...r, comments: [...(r.comments || []), { author: 'Brand Manager', text }] }
                            : r
                    )
                }
                : q
        ));
    }, [selectedId]);

    // ── Annotations (local only) ──
    const handleAddAnnotation = useCallback((annotation) => {
        setQueue(prev => prev.map(q =>
            q.id === selectedId
                ? { ...q, annotations: [...(q.annotations || []), annotation] }
                : q
        ));
    }, [selectedId]);

    // ── Loading / Error States ──
    if (isFetching) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bd-bg-primary)', gap: 16
            }}>
                <Loader2 size={32} style={{ color: 'var(--bd-primary)', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: 14, color: 'var(--bd-text-secondary)' }}>Loading approval queue…</div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bd-bg-primary)', gap: 12
            }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--bd-danger)' }}>
                    Failed to load approvals
                </div>
                <div style={{ fontSize: 13, color: 'var(--bd-text-muted)' }}>{fetchError}</div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: 8, padding: '10px 20px',
                        borderRadius: 'var(--bd-radius-lg)',
                        background: 'var(--bd-primary)', color: '#fff',
                        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="aq-layout">
                <ApprovalQueueSidebar
                    items={queue}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    batchMode={batchMode}
                    onToggleBatchMode={handleToggleBatchMode}
                    batchSelectedIds={batchSelectedIds}
                    onBatchToggle={handleBatchToggle}
                />

                <ReviewWorkspace
                    item={selectedItem}
                    onApprove={handleApproveClick}
                    onRequestChanges={handleToggleRevisionMode}
                    isLoading={isLoading}
                    batchMode={batchMode}
                    batchCount={batchSelectedIds.length}
                    onToggleOverride={handleToggleOverride}
                    onAddComplianceComment={handleAddComplianceComment}
                    onAddAnnotation={handleAddAnnotation}
                    revisionMode={revisionMode}
                    onToggleRevisionMode={handleToggleRevisionMode}
                    feedbackText={feedbackText}
                    onFeedbackChange={setFeedbackText}
                    onSubmitFeedback={handleSubmitFeedback}
                />
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmApprove}
                isLoading={isLoading}
                item={batchMode && batchSelectedIds.length > 0
                    ? {
                        campaign: `${batchSelectedIds.length} items`,
                        creator: 'Multiple creators',
                        escrow: queue
                            .filter(q => batchSelectedIds.includes(q.id))
                            .reduce((sum, q) => sum + (q.escrow || 0), 0)
                    }
                    : selectedItem
                }
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="aq-toast"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <CheckCircle2 size={16} />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ApprovalQueue;
