import { useState, useEffect, useCallback } from 'react';
import payoutService from '../../../api/payoutService';

/**
 * usePayoutMethods — Manages payout method state via the real Tazapay backend.
 *
 * Simplified flow:
 * 1. On mount, fetches payout/onboarding status
 * 2. User can initiate bank connection (manual form shown in UI)
 * 3. On form submit, calls connectBank which creates Tazapay beneficiary server-side
 * 4. User can disconnect to remove their bank account
 */
const usePayoutMethods = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try onboarding-status first, fall back to legacy status
            try {
                const result = await payoutService.getOnboardingStatus();
                setStatus(result.data);
            } catch (statusErr) {
                // If onboarding-status fails, try basic status
                const fallback = await payoutService.getPayoutStatus();
                setStatus(fallback.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load payout status');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    /**
     * Connect bank via the backend (backend creates Tazapay beneficiary securely).
     * Bank details are validated server-side, sent to Tazapay, then only metadata
     * (last 4 digits, bank name, country) is stored in our DB.
     */
    const connectBank = async (bankDetails) => {
        setActionLoading(true);
        setError(null);
        try {
            const result = await payoutService.connectBank(bankDetails);
            await fetchStatus();
            return result;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to connect bank account';
            setError(msg);
            throw new Error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Disconnect the current bank account.
     */
    const disconnectBank = async () => {
        setActionLoading(true);
        setError(null);
        try {
            await payoutService.disconnectBank();
            await fetchStatus();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to disconnect bank';
            setError(msg);
            throw new Error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    return {
        status,
        loading,
        actionLoading,
        error,
        fetchStatus,
        connectBank,
        disconnectBank,
    };
};

export default usePayoutMethods;
