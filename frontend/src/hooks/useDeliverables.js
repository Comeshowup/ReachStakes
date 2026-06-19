/**
 * useDeliverables — React hooks for the deliverable system.
 */
import { useState, useEffect, useCallback } from 'react';
import deliverableApi from '../api/deliverableService';

/**
 * Fetch all deliverables for a collaboration.
 */
export const useDeliverables = (collabId) => {
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!collabId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await deliverableApi.getByCollaboration(collabId);
            setDeliverables(res.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load deliverables');
        } finally {
            setLoading(false);
        }
    }, [collabId]);

    useEffect(() => { fetch(); }, [fetch]);

    return { deliverables, loading, error, refetch: fetch };
};

/**
 * Fetch a single deliverable with full detail (submissions, timeline, collaboration).
 */
export const useDeliverableDetail = (deliverableId) => {
    const [deliverable, setDeliverable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!deliverableId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await deliverableApi.getById(deliverableId);
            setDeliverable(res.data?.data || null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load deliverable');
        } finally {
            setLoading(false);
        }
    }, [deliverableId]);

    useEffect(() => { fetch(); }, [fetch]);

    return { deliverable, loading, error, refetch: fetch };
};

/**
 * Submit content mutation (script, mock draft, or final draft).
 */
export const useSubmitDeliverable = () => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const submit = useCallback(async (deliverableId, payload) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await deliverableApi.submit(deliverableId, payload);
            return res.data?.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Submission failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setSubmitting(false);
        }
    }, []);

    return { submit, submitting, error };
};

/**
 * Review submission mutation (approve / reject / revision).
 */
export const useReviewDeliverable = () => {
    const [reviewing, setReviewing] = useState(false);
    const [error, setError] = useState(null);

    const review = useCallback(async (deliverableId, payload) => {
        setReviewing(true);
        setError(null);
        try {
            const res = await deliverableApi.review(deliverableId, payload);
            return res.data?.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Review failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setReviewing(false);
        }
    }, []);

    return { review, reviewing, error };
};

/**
 * Checklist update mutation.
 */
export const useUpdateChecklist = () => {
    const [saving, setSaving] = useState(false);

    const updateChecklist = useCallback(async (deliverableId, checklistState) => {
        setSaving(true);
        try {
            await deliverableApi.updateChecklist(deliverableId, checklistState);
        } finally {
            setSaving(false);
        }
    }, []);

    return { updateChecklist, saving };
};
