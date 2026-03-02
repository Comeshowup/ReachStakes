import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
    getBrandProfile,
    updateBrandProfile,
    getBrandCampaigns,
    deleteAccount
} from "../../api/brandService";
import EditProfileModal from "../components/EditProfileModal";
import BrandProfileHeader from "../components/profile/BrandProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import IdentityTab from "../components/profile/IdentityTab";
import PerformanceTab from "../components/profile/PerformanceTab";
import SecurityBillingTab from "../components/profile/SecurityBillingTab";
import TeamTab from "../components/profile/TeamTab";
import IntegrationsTab from "../components/profile/IntegrationsTab";
import "../../styles/brand-profile.css";

/* ─── Skeleton Loader ─────────────────────────────────── */

const ProfileSkeleton = () => (
    <div className="bp-page">
        <div className="bp-header">
            <div className="bp-skeleton" style={{ height: 80 }} />
            <div style={{ padding: "0 var(--bd-space-6) var(--bd-space-5)" }}>
                <div style={{ display: "flex", gap: "var(--bd-space-4)", marginTop: -32, alignItems: "flex-end" }}>
                    <div className="bp-skeleton" style={{ width: 72, height: 72, borderRadius: "var(--bd-radius-xl)", flexShrink: 0 }} />
                    <div style={{ flex: 1, paddingBottom: "var(--bd-space-1)" }}>
                        <div className="bp-skeleton" style={{ height: 20, width: 200, marginBottom: 8 }} />
                        <div className="bp-skeleton" style={{ height: 14, width: 300 }} />
                    </div>
                </div>
                <div style={{ marginTop: "var(--bd-space-4)", display: "flex", gap: "var(--bd-space-3)" }}>
                    <div className="bp-skeleton" style={{ height: 4, flex: 1, maxWidth: 320, borderRadius: 9999 }} />
                </div>
            </div>
        </div>
        <div className="bp-skeleton" style={{ height: 44, borderRadius: "var(--bd-radius-xl)" }} />
        <div className="bp-skeleton" style={{ height: 200, borderRadius: "var(--bd-radius-2xl)" }} />
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
            <h3 style={{
                fontSize: "var(--bd-font-size-lg)",
                fontWeight: "var(--bd-font-weight-semibold)",
                color: "var(--bd-text-primary)",
                marginBottom: "var(--bd-space-2)"
            }}>
                Failed to Load Profile
            </h3>
            <p style={{
                fontSize: "var(--bd-font-size-sm)",
                color: "var(--bd-text-secondary)",
                marginBottom: "var(--bd-space-4)"
            }}>
                {message}
            </p>
            <button className="bp-btn bp-btn--primary" onClick={onRetry}>
                <RefreshCw style={{ width: 14, height: 14 }} />
                Try Again
            </button>
        </div>
    </div>
);

/* ─── Tab Content Wrapper ─────────────────────────────── */

const tabAnimation = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
};

/* ─── Main Page Component ─────────────────────────────── */

const BrandProfile = () => {
    const [activeTab, setActiveTab] = useState("identity");
    const [profile, setProfile] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
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
            console.error("Error fetching profile data:", err);
            setError(err.response?.data?.message || "Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (updatedProfile) => {
        try {
            await updateBrandProfile(updatedProfile);
            const profileRes = await getBrandProfile();
            setProfile(profileRes.data);
            return true;
        } catch (err) {
            console.error("Error updating profile:", err);
            throw err;
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.")) {
            try {
                await deleteAccount();
                localStorage.removeItem("token");
                localStorage.removeItem("userInfo");
                window.location.href = "/auth";
            } catch (err) {
                console.error("Error deleting account:", err);
                alert("Failed to delete account. Please try again.");
            }
        }
    };

    if (isLoading) return <ProfileSkeleton />;
    if (error) return <ErrorState message={error} onRetry={fetchProfileData} />;
    if (!profile) return <ErrorState message="Profile not found" onRetry={fetchProfileData} />;

    return (
        <div className="bp-page">
            <BrandProfileHeader
                profile={profile}
                onEditProfile={() => setIsEditProfileOpen(true)}
            />

            <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <AnimatePresence mode="wait">
                {activeTab === "identity" && (
                    <motion.div key="identity" {...tabAnimation}>
                        <IdentityTab
                            profile={profile}
                            onSave={handleSaveProfile}
                        />
                    </motion.div>
                )}

                {activeTab === "performance" && (
                    <motion.div key="performance" {...tabAnimation}>
                        <PerformanceTab
                            profile={profile}
                            campaigns={campaigns}
                        />
                    </motion.div>
                )}

                {activeTab === "security" && (
                    <motion.div key="security" {...tabAnimation}>
                        <SecurityBillingTab
                            profile={profile}
                            onDeleteAccount={handleDeleteAccount}
                            onSave={handleSaveProfile}
                        />
                    </motion.div>
                )}

                {activeTab === "team" && (
                    <motion.div key="team" {...tabAnimation}>
                        <TeamTab profile={profile} />
                    </motion.div>
                )}

                {activeTab === "integrations" && (
                    <motion.div key="integrations" {...tabAnimation}>
                        <IntegrationsTab />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isEditProfileOpen && (
                    <EditProfileModal
                        isOpen={isEditProfileOpen}
                        onClose={() => setIsEditProfileOpen(false)}
                        profile={profile}
                        onSave={handleSaveProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandProfile;
