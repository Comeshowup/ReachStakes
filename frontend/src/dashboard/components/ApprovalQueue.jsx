import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import ApprovalQueueSidebar from './approvals/ApprovalQueueSidebar';
import ReviewWorkspace from './approvals/ReviewWorkspace';
import ConfirmationModal from './approvals/ConfirmationModal';

import '../../styles/approvals.css';

// ──────────────────────────────────────────────────
// Enriched Mock Data
// ──────────────────────────────────────────────────
const MOCK_QUEUE = [
    {
        id: 'apr-001',
        campaign: 'Summer Skincare Launch',
        creator: 'Priya Sharma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        version: 2,
        submittedAt: '2h ago',
        status: 'needs_review',
        type: 'video',
        videoSrc: '',
        sponsorTimestamp: 34,
        ctaTimestamp: 82,
        escrow: 18000,
        creatorFee: 15000,
        budgetRemaining: 245000,
        roas: 3.2,
        requirements: [
            {
                id: 'req-1', label: 'Sponsor mention in first 30 seconds',
                isMet: true, overridden: false,
                proof: { type: 'timestamp', value: '0:18' },
                comments: []
            },
            {
                id: 'req-2', label: 'Product shown for minimum 5 seconds',
                isMet: true, overridden: false,
                proof: { type: 'timestamp', value: '0:22 – 0:29' },
                comments: []
            },
            {
                id: 'req-3', label: 'CTA with promo code mentioned',
                isMet: false, overridden: false,
                proof: null,
                comments: []
            },
        ],
        timeline: [
            { id: 't1', role: 'creator', author: 'Priya Sharma', date: 'Feb 18, 10:30 AM', type: 'message', text: 'Uploaded v2 with updated lighting and extended sponsor segment.' },
            { id: 't2', role: 'system', author: 'System', date: 'Feb 18, 10:30 AM', type: 'status', text: 'Status changed to Needs Review' },
            { id: 't3', role: 'brand', author: 'Brand Manager', date: 'Feb 17, 4:15 PM', type: 'message', text: 'Please improve the lighting in the product close-up shot and extend the sponsor segment by 5 seconds.' },
            { id: 't4', role: 'system', author: 'System', date: 'Feb 17, 4:15 PM', type: 'status', text: 'Changes requested on v1' },
            { id: 't5', role: 'creator', author: 'Priya Sharma', date: 'Feb 16, 2:00 PM', type: 'message', text: 'Initial upload — first draft of the skincare review video.' },
        ],
        insights: [
            { type: 'detected', text: 'Sponsor mention detected at 0:18' },
            { type: 'detected', text: 'Improved lighting vs. v1 (+40% brightness in product shots)' },
            { type: 'missing', text: 'Promo code not mentioned in audio transcript' },
        ],
        annotations: [],
        scriptContent: '',
    },
    {
        id: 'apr-002',
        campaign: 'Fitness App Integration',
        creator: 'Rahul Verma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
        version: 1,
        submittedAt: '5h ago',
        status: 'needs_review',
        type: 'script',
        videoSrc: '',
        sponsorTimestamp: null,
        ctaTimestamp: null,
        escrow: 12000,
        creatorFee: 10000,
        budgetRemaining: 180000,
        roas: null,
        requirements: [
            {
                id: 'req-4', label: 'App name mentioned minimum 3 times',
                isMet: true, overridden: false,
                proof: { type: 'transcript', value: '...FitTrack Pro helps me stay consistent... I love FitTrack Pro because... Download FitTrack Pro today...' },
                comments: []
            },
            {
                id: 'req-5', label: 'Unique discount code included',
                isMet: true, overridden: false,
                proof: { type: 'transcript', value: 'Use code RAHUL20 for 20% off' },
                comments: []
            },
            {
                id: 'req-6', label: 'No competitor mentions',
                isMet: true, overridden: false,
                proof: null,
                comments: [{ author: 'Auto-scan', text: 'No competitor brands detected.' }]
            },
        ],
        timeline: [
            { id: 't6', role: 'creator', author: 'Rahul Verma', date: 'Feb 18, 7:00 AM', type: 'message', text: 'Submitted script for review. Included all three app mentions and the discount code.' },
        ],
        insights: [
            { type: 'detected', text: 'App name "FitTrack Pro" found 3 times' },
            { type: 'detected', text: 'Discount code RAHUL20 present' },
        ],
        annotations: [
            { line: 5, text: 'Consider making this transition smoother', author: 'Brand Manager', role: 'brand', resolved: false, date: '3h ago' },
        ],
        scriptContent: `Hey everyone, welcome back to my channel!\n\nToday I want to talk about something that has genuinely changed my fitness routine.\n\nI've been using FitTrack Pro for the past three months and honestly, it's a game-changer.\n\n[Sponsor segment]\nFitTrack Pro is the all-in-one fitness companion that tracks your workouts, nutrition, and recovery.\nWhat I love about FitTrack Pro is how intuitive the interface is.\nYou can set custom goals, track your macros, and even get AI-powered workout suggestions.\n\nLet me show you my dashboard — as you can see, I've been hitting my protein goals consistently.\nThe sleep tracking feature has also been incredible for optimizing my recovery days.\n\nIf you're serious about your fitness journey, you need to try this.\nDownload FitTrack Pro today and use code RAHUL20 for 20% off your first year.\nLink is in my bio — trust me, you won't regret it!\n\nThanks for watching, and I'll see you in the next one. Peace!`,
    },
    {
        id: 'apr-003',
        campaign: 'Tech Unboxing Series',
        creator: 'Ananya Patel',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
        version: 3,
        submittedAt: '1d ago',
        status: 'creator_updated',
        type: 'video',
        videoSrc: '',
        sponsorTimestamp: 15,
        ctaTimestamp: 145,
        escrow: 25000,
        creatorFee: 22000,
        budgetRemaining: 150000,
        roas: 4.1,
        requirements: [
            {
                id: 'req-7', label: 'Unboxing shot within first 60s',
                isMet: true, overridden: false,
                proof: { type: 'timestamp', value: '0:08' },
                comments: []
            },
            {
                id: 'req-8', label: 'Feature comparison with at least 2 specs',
                isMet: true, overridden: false,
                proof: { type: 'transcript', value: '...battery life of 18 hours compared to... and the display is 20% brighter...' },
                comments: []
            },
            {
                id: 'req-9', label: 'Affiliate link call-out',
                isMet: true, overridden: false,
                proof: { type: 'transcript', value: 'Link in description for the best price' },
                comments: []
            },
        ],
        timeline: [
            { id: 't7', role: 'creator', author: 'Ananya Patel', date: 'Feb 17, 11:00 PM', type: 'message', text: 'v3 is up! Fixed the audio sync issue and added the comparison table overlay.' },
            { id: 't8', role: 'brand', author: 'Brand Manager', date: 'Feb 17, 6:00 PM', type: 'message', text: 'Audio sync is off at 1:20. Also, please add the comparison table as an overlay.' },
            { id: 't9', role: 'creator', author: 'Ananya Patel', date: 'Feb 16, 9:00 AM', type: 'message', text: 'Uploaded v2 with revised intro.' },
        ],
        insights: [
            { type: 'detected', text: 'Unboxing begins at 0:08 — within requirement' },
            { type: 'info', text: 'Video length: 3m 12s (within 2–5 min target)' },
        ],
        annotations: [],
        scriptContent: '',
    },
    {
        id: 'apr-004',
        campaign: 'Organic Food Delivery',
        creator: 'Vikram Singh',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
        version: 1,
        submittedAt: '3d ago',
        status: 'overdue',
        type: 'script',
        videoSrc: '',
        sponsorTimestamp: null,
        ctaTimestamp: null,
        escrow: 0,
        creatorFee: 8000,
        budgetRemaining: 92000,
        roas: null,
        requirements: [
            {
                id: 'req-10', label: 'Taste test with genuine reaction',
                isMet: false, overridden: false,
                proof: null,
                comments: []
            },
            {
                id: 'req-11', label: 'Delivery speed mentioned',
                isMet: true, overridden: false,
                proof: { type: 'transcript', value: '...delivered in under 30 minutes...' },
                comments: []
            },
        ],
        timeline: [
            { id: 't10', role: 'creator', author: 'Vikram Singh', date: 'Feb 15, 3:00 PM', type: 'message', text: 'Script draft submitted. Haven\'t done the taste test yet — plan to film this weekend.' },
        ],
        insights: [
            { type: 'missing', text: 'Taste test not present — deliverable incomplete' },
        ],
        annotations: [],
        scriptContent: `What's up everyone!\n\nSo I recently discovered GreenBite — an organic food delivery service that's been blowing up lately.\n\nI ordered a bunch of meals to try and honestly, I was impressed.\nEverything was delivered in under 30 minutes, which is crazy fast for organic food.\n\nThe packaging is 100% compostable which I love.\n\n[Taste test section — TO BE FILMED]\nI'll be trying each meal on camera and giving you my honest reaction.\n\nFor now, I can tell you the ingredients are fresh, locally sourced, and you can taste the difference.\n\nUse my code VIKRAM15 at checkout for 15% off your first order.\nLink in bio as always!\n\nLet me know in the comments what meals you'd want me to try next. See you!`,
    },
];

// ──────────────────────────────────────────────────
// Root Component
// ──────────────────────────────────────────────────
const ApprovalQueue = () => {
    const [queue, setQueue] = useState(MOCK_QUEUE);
    const [selectedId, setSelectedId] = useState(MOCK_QUEUE[0]?.id || null);
    const [batchMode, setBatchMode] = useState(false);
    const [batchSelectedIds, setBatchSelectedIds] = useState([]);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [revisionMode, setRevisionMode] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const selectedItem = queue.find(q => q.id === selectedId) || null;

    // ── Toast Helper ──
    const showToast = useCallback((message) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast(message);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
    }, []);

    // ── Keyboard Shortcuts ──
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't fire if typing in an input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

            switch (e.key.toLowerCase()) {
                case 'j': {
                    // Navigate to next
                    const currentIdx = queue.findIndex(q => q.id === selectedId);
                    if (currentIdx < queue.length - 1) {
                        setSelectedId(queue[currentIdx + 1].id);
                        setRevisionMode(false);
                        setFeedbackText('');
                    }
                    break;
                }
                case 'k': {
                    // Navigate to previous
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
                default:
                    break;
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

    // ── Approve (single) ──
    const handleApproveClick = useCallback(() => {
        if (batchMode && batchSelectedIds.length > 0) {
            setConfirmModalOpen(true);
        } else if (selectedItem) {
            setConfirmModalOpen(true);
        }
    }, [batchMode, batchSelectedIds, selectedItem]);

    const handleConfirmApprove = useCallback(async () => {
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        if (batchMode && batchSelectedIds.length > 0) {
            // Batch approve — optimistic removal
            setQueue(prev => prev.filter(q => !batchSelectedIds.includes(q.id)));
            showToast(`✓ ${batchSelectedIds.length} approvals released`);
            setBatchSelectedIds([]);
            setBatchMode(false);
            // Select first remaining
            setQueue(prev => {
                if (prev.length > 0) setSelectedId(prev[0].id);
                else setSelectedId(null);
                return prev;
            });
        } else if (selectedItem) {
            // Single approve — optimistic removal + auto-advance
            const currentIdx = queue.findIndex(q => q.id === selectedId);
            const newQueue = queue.filter(q => q.id !== selectedId);
            setQueue(newQueue);
            showToast(`✓ Escrow released for ${selectedItem.creator}`);

            // Auto-advance
            if (newQueue.length > 0) {
                const nextIdx = Math.min(currentIdx, newQueue.length - 1);
                setSelectedId(newQueue[nextIdx].id);
            } else {
                setSelectedId(null);
            }
        }

        setIsLoading(false);
        setConfirmModalOpen(false);
    }, [batchMode, batchSelectedIds, selectedItem, selectedId, queue, showToast]);

    // ── Request Changes ──
    const handleToggleRevisionMode = useCallback(() => {
        setRevisionMode(prev => !prev);
        if (revisionMode) setFeedbackText('');
    }, [revisionMode]);

    const handleSubmitFeedback = useCallback(async () => {
        if (!feedbackText.trim() || !selectedItem) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Move to waiting state
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
        setIsLoading(false);
        showToast('Changes requested');
    }, [feedbackText, selectedItem, selectedId, showToast]);

    // ── Compliance Actions ──
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

    // ── Script Annotations ──
    const handleAddAnnotation = useCallback((annotation) => {
        setQueue(prev => prev.map(q =>
            q.id === selectedId
                ? { ...q, annotations: [...(q.annotations || []), annotation] }
                : q
        ));
    }, [selectedId]);

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
                            .reduce((sum, q) => sum + q.escrow, 0)
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
