import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getTierConfig } from '../components/support/tierConfig';
import { useSupportSession, SUPPORT_STATUS } from '../components/support/supportStateMachine';
import { getSupportStatus } from '../components/support/supportApi';
import { trackSupportPageViewed } from '../components/support/supportAnalytics';
import SupportHeader from '../components/support/SupportHeader';
import TrustBar from '../components/support/TrustBar';
import PrimaryActions from '../components/support/PrimaryActions';
import LiveChatPanel from '../components/support/LiveChatPanel';
import SupportSidebar from '../components/support/SupportSidebar';
import StrategyCallModal from '../components/support/StrategyCallModal';
import '../../styles/support-center.css';

/**
 * SupportCenterPage — Main page orchestrator.
 *
 * Responsibilities:
 *   - Resolve user tier (auth context → localStorage fallback → starter default)
 *   - Initialize support session state machine
 *   - Fetch agent status on mount
 *   - Manage modal state
 *   - Wire all child components together
 */
const SupportCenterPage = () => {
    /* ── Tier Resolution ────────────────────────── */
    const tierConfig = useMemo(() => {
        try {
            const stored = localStorage.getItem('userInfo');
            if (stored) {
                const user = JSON.parse(stored);
                return getTierConfig(user.planTier || user.plan || 'starter');
            }
        } catch {
            // fallback silently
        }
        return getTierConfig('starter');
    }, []);

    /* ── Session State Machine ──────────────────── */
    const session = useSupportSession();

    /* ── Loading & Modal State ──────────────────── */
    const [isLoading, setIsLoading] = useState(true);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const chatInputRef = useRef(null);

    /* ── Fetch Agent Status on Mount ────────────── */
    useEffect(() => {
        let cancelled = false;

        trackSupportPageViewed(tierConfig.label);

        getSupportStatus()
            .then((status) => {
                if (cancelled) return;

                session.setWeekend(status.isWeekend);

                if (status.agentOnline) {
                    session.setConnected({
                        name: tierConfig.hasNamedManager ? tierConfig.managerName : status.agentName,
                        role: tierConfig.hasNamedManager ? tierConfig.managerRole : status.agentRole,
                        avatarInitials: tierConfig.hasNamedManager
                            ? tierConfig.managerName.split(' ').map(n => n[0]).join('')
                            : status.agentInitials,
                        estimatedReplyTime: status.estimatedReplyTime,
                    });
                } else {
                    session.setAgentInfo({
                        name: tierConfig.hasNamedManager ? tierConfig.managerName : status.agentName,
                        role: tierConfig.hasNamedManager ? tierConfig.managerRole : status.agentRole,
                        avatarInitials: tierConfig.hasNamedManager
                            ? tierConfig.managerName.split(' ').map(n => n[0]).join('')
                            : status.agentInitials,
                        estimatedReplyTime: status.estimatedReplyTime,
                        isOnline: false,
                    });
                    session.setOffline();
                }

                setIsLoading(false);
            })
            .catch(() => {
                if (!cancelled) {
                    session.setError('Unable to reach support servers.');
                    setIsLoading(false);
                }
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Handlers ───────────────────────────────── */
    const handleStartChat = useCallback(() => {
        if (session.isWeekend) {
            // On weekend, still allow messaging but show notice
            if (session.status !== SUPPORT_STATUS.ACTIVE) {
                session.connect();
                // After connecting, set the agent info with weekend notice
                setTimeout(() => {
                    session.setConnected({
                        ...session.agentInfo,
                        isOnline: false,
                        estimatedReplyTime: 'Monday morning',
                    });
                }, 300);
            }
            return;
        }

        if (session.status === SUPPORT_STATUS.IDLE ||
            session.status === SUPPORT_STATUS.OFFLINE) {
            session.connect();
            // Simulate connection
            setTimeout(() => {
                session.setConnected({
                    ...session.agentInfo,
                    isOnline: true,
                });
            }, 600);
        }

        // Focus chat input
        setTimeout(() => {
            chatInputRef.current?.focus();
        }, 100);
    }, [session]);

    const handleRetry = useCallback(() => {
        setIsLoading(true);
        session.reset();

        getSupportStatus()
            .then((status) => {
                if (status.agentOnline) {
                    session.setConnected({
                        name: status.agentName,
                        role: status.agentRole,
                        avatarInitials: status.agentInitials,
                        estimatedReplyTime: status.estimatedReplyTime,
                    });
                } else {
                    session.setOffline();
                }
                setIsLoading(false);
            })
            .catch(() => {
                session.setError('Still unable to connect. Please try again later.');
                setIsLoading(false);
            });
    }, [session]);

    const handleEscalationComplete = useCallback((result) => {
        session.confirmEscalation(result);
    }, [session]);

    const handleSubmitTicket = useCallback(() => {
        // Scroll to chat and show ticket-mode message
        if (chatInputRef.current) {
            chatInputRef.current.focus();
            chatInputRef.current.setAttribute(
                'placeholder',
                'Describe your issue — this will be submitted as a support ticket...'
            );
        }
    }, []);

    return (
        <div className="sc-page">
            {/* Header: Title + Tier Badge + SLA */}
            <SupportHeader
                tierConfig={tierConfig}
                isLoading={isLoading}
            />

            {/* Trust Bar */}
            <TrustBar tierConfig={tierConfig} />

            {/* Primary Action Buttons */}
            <PrimaryActions
                sessionStatus={session.status}
                isWeekend={session.isWeekend}
                chatInputRef={chatInputRef}
                onStartChat={handleStartChat}
                onBookCall={() => setIsCallModalOpen(true)}
                onSubmitTicket={handleSubmitTicket}
                tierLabel={tierConfig.label}
            />

            {/* Content Grid: Chat (65%) + Sidebar (35%) */}
            <div className="sc-grid">
                <LiveChatPanel
                    sessionStatus={session.status}
                    agentInfo={session.agentInfo}
                    isWeekend={session.isWeekend}
                    escalationTicketId={session.escalationTicketId}
                    error={session.error}
                    onRetry={handleRetry}
                    tierConfig={tierConfig}
                    chatInputRef={chatInputRef}
                />

                <SupportSidebar
                    tierConfig={tierConfig}
                    onEscalationComplete={handleEscalationComplete}
                />
            </div>

            {/* Strategy Call Modal */}
            <StrategyCallModal
                isOpen={isCallModalOpen}
                onClose={() => setIsCallModalOpen(false)}
                tierLabel={tierConfig.label}
            />
        </div>
    );
};

export default SupportCenterPage;
