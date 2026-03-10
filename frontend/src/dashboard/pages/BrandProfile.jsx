import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
    getBrandProfile,
    updateBrandProfile,
    getBrandCampaigns,
    deleteAccount
} from "../../api/brandService";
import BrandProfileHeader from "../components/profile/BrandProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileCompletionChecklist from "../components/profile/ProfileCompletionChecklist";
import IdentityTab from "../components/profile/IdentityTab";
import PerformanceTab from "../components/profile/PerformanceTab";
import SecurityBillingTab from "../components/profile/SecurityBillingTab";
import TeamTab from "../components/profile/TeamTab";
import IntegrationsTab from "../components/profile/IntegrationsTab";
import { ToastProvider, useToast } from "../components/profile/Toast";
import "../../styles/brand-profile.css";
import "../../styles/brand-profile-enhancements.css";

/* ─── Skeleton ────────────────────────────────────────── */
const ProfileSkeleton = () => (
    <div className="bp-page">
        <div className="bp-header">
            <div className="bp-skeleton" style={{ height: 80 }} />
            <div style={{ padding: "0 var(--bd-space-6) var(--bd-space-5)" }}>
                <div style={{ display: "flex", gap: "var(--bd-space-4)", marginTop: -32, alignItems: "flex-end" }}>
                    <div className="bp-skeleton" style={{ width: 72, height: 72, borderRadius: "var(--bd-radius-xl)", flexShrink: 0 }} />
                    <div style={{ flex: 1, paddingBottom: "var(--bd-space-1)" }}>
                        <div className="bp-skeleton" style={{ height: 22, width: 220, marginBottom: 10 }} />
                        <div className="bp-skeleton" style={{ height: 14, width: 320 }} />
                    </div>
                </div>
                <div style={{ marginTop: "var(--bd-space-5)", display: "flex", gap: "var(--bd-space-3)", alignItems: "center" }}>
                    <div className="bp-skeleton" style={{ height: 4, width: 80, borderRadius: 9999 }} />
                    <div className="bp-skeleton" style={{ height: 4, flex: 1, maxWidth: 200, borderRadius: 9999 }} />
                    <div className="bp-skeleton" style={{ height: 4, width: 30, borderRadius: 9999 }} />
                </div>
            </div>
        </div>
        <div className="bp-skeleton" style={{ height: 44, borderRadius: "var(--bd-radius-xl)" }} />
        <div className="bp-skeleton" style={{ height: 220, borderRadius: "var(--bd-radius-2xl)" }} />
        <div className="bp-skeleton" style={{ height: 160, borderRadius: "var(--bd-radius-2xl)" }} />
    </div>
);

/* ─── Error State ─────────────────────────────────────── */
const ErrorState = ({ message, onRetry }) => (
    <div className="bp-page" style={{ alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
            <div className="bp-empty__icon" style={{ margin: "0 auto var(--bd-space-4)" }}>
                <AlertCircle style={{ width: 24, height: 24, color: "var(--bd-danger)" }} />
            </div>
            <h3 style={{ fontSize: "var(--bd-font-size-lg)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-primary)", marginBottom: "var(--bd-space-2)" }}>
                Failed to Load Profile
            </h3>
            <p style={{ fontSize: "var(--bd-font-size-sm)", color: "var(--bd-text-secondary)", marginBottom: "var(--bd-space-4)" }}>
                {message}
            </p>
            <button className="bp-btn bp-btn--primary" onClick={onRetry}>
                <RefreshCw style={{ width: 14, height: 14 }} />
                Try Again
            </button>
        </div>
    </div>
);

/* ─── Tab animation presets ───────────────────────────── */
const TAB_ANIM = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
};

/* ─── Inner page — has access to toast ───────────────── */
const BrandProfileInner = () => {
    const toast = useToast();

    const [activeTab, setActiveTab] = useState("identity");
    const [profile, setProfile] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [showChecklist, setShowChecklist] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profileRes, campaignsRes] = await Promise.all([
                getBrandProfile(),
                getBrandCampaigns()
            ]);
            setProfile(profileRes.data);
            setCampaigns(campaignsRes.data || []);
        } catch (err) {
            console.error("Error loading profile:", err);
            setError(err.response?.data?.message || "Unable to load profile data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = useCallback(async (updatedData) => {
        try {
            // If _refresh flag is set (after file upload), just re-fetch without PUT
            if (updatedData?._refresh) {
                const res = await getBrandProfile();
                setProfile(res.data);
                toast("Changes saved successfully", "success");
                return true;
            }
            await updateBrandProfile(updatedData);
            const res = await getBrandProfile();
            setProfile(res.data);
            toast("Changes saved successfully", "success");
            return true;
        } catch (err) {
            console.error("Error updating profile:", err);
            toast("Failed to save changes. Please try again.", "error");
            throw err;
        }
    }, [toast]);

    const handleDeleteAccount = useCallback(async () => {
        try {
            await deleteAccount();
            localStorage.removeItem("token");
            localStorage.removeItem("userInfo");
            window.location.href = "/auth";
        } catch (err) {
            console.error("Error deleting account:", err);
            toast("Failed to delete account. Please try again.", "error");
        }
    }, [toast]);

    /* Navigate to a tab from the checklist */
    const handleChecklistNavigate = (tabId) => {
        setActiveTab(tabId);
        setShowChecklist(false);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
    };

    if (isLoading) return <ProfileSkeleton />;
    if (error) return <ErrorState message={error} onRetry={fetchData} />;
    if (!profile) return <ErrorState message="Profile not found." onRetry={fetchData} />;

    return (
        <div className="bp-page">
            <BrandProfileHeader
                profile={profile}
                onCompleteProfile={() => setShowChecklist(v => !v)}
            />

            {/* Checklist — shows below header when toggled */}
            <AnimatePresence>
                {showChecklist && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ overflow: "hidden" }}
                    >
                        <ProfileCompletionChecklist
                            profile={profile}
                            onNavigate={handleChecklistNavigate}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <AnimatePresence mode="wait">
                {activeTab === "identity" && (
                    <motion.div key="identity" {...TAB_ANIM}>
                        <IdentityTab profile={profile} onSave={handleSaveProfile} />
                    </motion.div>
                )}
                {activeTab === "performance" && (
                    <motion.div key="performance" {...TAB_ANIM}>
                        <PerformanceTab profile={profile} campaigns={campaigns} />
                    </motion.div>
                )}
                {activeTab === "security" && (
                    <motion.div key="security" {...TAB_ANIM}>
                        <SecurityBillingTab
                            profile={profile}
                            onDeleteAccount={handleDeleteAccount}
                            onSave={handleSaveProfile}
                        />
                    </motion.div>
                )}
                {activeTab === "team" && (
                    <motion.div key="team" {...TAB_ANIM}>
                        <TeamTab profile={profile} />
                    </motion.div>
                )}
                {activeTab === "integrations" && (
                    <motion.div key="integrations" {...TAB_ANIM}>
                        <IntegrationsTab />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Root — wraps with ToastProvider ────────────────── */
const BrandProfile = () => (
    <ToastProvider>
        <BrandProfileInner />
    </ToastProvider>
);

export default BrandProfile;
