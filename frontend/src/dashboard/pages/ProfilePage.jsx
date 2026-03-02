import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import {
    MessageSquare,
    CheckCircle,
    MapPin,
    Globe,
    Instagram,
    Linkedin,
    Twitter,
    Briefcase,
    Star,
    TrendingUp,
    Users,
    Edit,
    Mail,
    Phone,
    ArrowRight,
    Trash2,
    Calendar,
    Award,
    Link as LinkIcon,
    Settings,
    AlertCircle,
    DollarSign,
    Clock,
    Target,
    Shield,
    BarChart3,
    ExternalLink,
    Zap
} from "lucide-react";
import { deleteAccount } from "../../api/userService";
import { BRAND_PROFILE, CREATOR_PROFILE, BRAND_POSTS, CREATOR_POSTS, CAMPAIGNS_DATA } from "../data";
import EditProfileModal from "../components/EditProfileModal";

/* ─────────────────────────────────────────────────────────
   HELPER COMPONENTS — Token-driven, fintech minimal
   ───────────────────────────────────────────────────────── */

const SocialLink = ({ icon: Icon, href, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
            padding: '8px',
            borderRadius: 'var(--bd-radius-lg)',
            background: 'var(--bd-bg-tertiary)',
            color: 'var(--bd-text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid transparent',
            transition: 'all 150ms ease',
        }}
        title={label}
    >
        <Icon style={{ width: 16, height: 16 }} />
    </a>
);

const TrustCard = ({ label, value, icon: Icon, subValue, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="trust-strip__card"
    >
        <div
            className="kpi-card-polished__icon"
            style={{ background: 'var(--bd-bg-secondary)', marginBottom: 'var(--bd-space-3)' }}
        >
            <Icon style={{ width: 16, height: 16, color: 'var(--bd-text-secondary)' }} />
        </div>
        <p className="trust-strip__label">{label}</p>
        <p className="trust-strip__value">{value}</p>
        {subValue && <p className="trust-strip__sub">{subValue}</p>}
    </motion.div>
);

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            padding: '10px 20px',
            fontSize: 'var(--bd-font-size-sm)',
            fontWeight: 600,
            borderRadius: 'var(--bd-radius-lg)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            background: active ? 'var(--bd-surface)' : 'transparent',
            color: active ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)',
            boxShadow: active ? 'var(--bd-shadow-sm)' : 'none',
            ...(active ? { border: '1px solid var(--bd-border-subtle)' } : { border: '1px solid transparent' }),
        }}
    >
        {children}
    </button>
);

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────── */

const ProfilePage = ({ type: propType }) => {
    const { id, type: routeType } = useParams();
    const location = useLocation();

    const isPublic = !!id || location.pathname.includes("/profile/");
    const type = propType || routeType || (location.pathname.includes("brand") ? "brand" : "creator");
    const isSelf = !isPublic;

    const [activeTab, setActiveTab] = useState("overview");
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.")) {
            try {
                await deleteAccount();
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/auth';
            } catch (err) {
                console.error('Error deleting account:', err);
                alert("Failed to delete account. Please try again.");
            }
        }
    };

    const [profile, setProfile] = useState(() => {
        const initialProfile = type === "brand" ? BRAND_PROFILE : CREATOR_PROFILE;
        return {
            ...initialProfile,
            skills: initialProfile.skills || ["Marketing", "Content Creation", "Video Editing", "Social Media", "Branding"]
        };
    });

    /* ─── Trust Strip Data ─────────────────────────── */
    const brandTrustCards = [
        { label: "Campaigns Launched", value: profile.stats?.campaigns?.toString() || "12", icon: Briefcase },
        { label: "Total Creator Payout", value: "$48,500", icon: DollarSign },
        { label: "Avg Approval Time", value: "18h", icon: Clock, subValue: "Response time" },
        { label: "Escrow Status", value: "Funded", icon: Shield, subValue: "3 active" },
    ];

    const creatorTrustCards = [
        { label: "Campaigns Completed", value: profile.stats?.campaigns?.toString() || "45", icon: Award },
        { label: "Revenue Generated", value: "$12,400", icon: DollarSign },
        { label: "Avg Conversion Rate", value: "8.5%", icon: Target },
        { label: "On-time Delivery", value: "96%", icon: Clock, subValue: "Reliable" },
    ];

    const trustCards = type === "brand" ? brandTrustCards : creatorTrustCards;

    /* ─── Performance Data ──────────────────────────── */
    const brandPerfData = [
        { label: "Average ROAS", value: "3.2x", icon: TrendingUp },
        { label: "Repeat Creator Rate", value: "68%", icon: Users },
        { label: "Campaign Completion", value: "94%", icon: BarChart3 },
        { label: "Creator Rating", value: profile.stats?.rating || "4.8", icon: Star },
    ];

    const creatorPerfData = [
        { label: "Engagement Rate", value: "8.5%", icon: TrendingUp },
        { label: "Avg Views", value: "45K", icon: BarChart3 },
        { label: "Niche Category", value: profile.industry || "Tech", icon: Zap },
        { label: "Creator Rating", value: profile.stats?.rating || "4.9", icon: Star },
    ];

    const perfData = type === "brand" ? brandPerfData : creatorPerfData;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bd-bg-primary)', fontFamily: 'var(--bd-font-body)', paddingBottom: 'var(--bd-space-12)' }}>

            {/* ─── HEADER SECTION ──────────────────────────── */}
            <div className="profile-header-refined">
                {/* Banner — reduced, supportive */}
                <div className="profile-header-refined__banner">
                    <div className="profile-header-refined__banner-overlay" />
                    {profile.banner && (
                        <img src={profile.banner} alt="Banner" />
                    )}
                </div>

                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 var(--bd-space-6) var(--bd-space-5)' }}>
                    <div style={{ position: 'relative', marginTop: -48, display: 'flex', alignItems: 'flex-end', gap: 'var(--bd-space-5)' }}>

                        {/* Avatar */}
                        <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                            <div style={{
                                width: 96, height: 96, borderRadius: '50%',
                                background: 'var(--bd-surface)', padding: 3,
                                boxShadow: 'var(--bd-shadow-lg)',
                                border: '1px solid var(--bd-border-subtle)'
                            }}>
                                <img
                                    src={type === "brand"
                                        ? "https://ui-avatars.com/api/?name=Acme+Co&background=6366f1&color=fff&size=256"
                                        : "https://i.pravatar.cc/300?u=a042581f4e29026704d"
                                    }
                                    alt={profile.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, paddingBottom: 'var(--bd-space-1)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--bd-space-4)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)' }}>
                                        <h1 className="page-title" style={{ fontSize: 'var(--bd-font-size-2xl)' }}>{profile.name}</h1>
                                        <span className="verified-badge">
                                            <CheckCircle style={{ width: 12, height: 12 }} /> Verified
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-secondary)', marginTop: 2 }}>{profile.tagline}</p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--bd-space-4)', marginTop: 'var(--bd-space-2)', fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 14, height: 14 }} /> {profile.location}</span>
                                        <span style={{ color: 'var(--bd-border-default)' }}>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase style={{ width: 14, height: 14 }} /> {profile.industry}</span>
                                        {profile.socials?.website && (
                                            <>
                                                <span style={{ color: 'var(--bd-border-default)' }}>•</span>
                                                <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--bd-accent)', textDecoration: 'none' }}>
                                                    <Globe style={{ width: 14, height: 14 }} /> Website
                                                    <ExternalLink style={{ width: 10, height: 10 }} />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-3)', flexShrink: 0 }}>
                                    {isSelf ? (
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            style={{
                                                padding: '10px 20px', borderRadius: 'var(--bd-radius-lg)',
                                                border: '1px solid var(--bd-border-default)', background: 'var(--bd-surface)',
                                                color: 'var(--bd-text-primary)', fontSize: 'var(--bd-font-size-sm)',
                                                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                                transition: 'all 150ms ease', boxShadow: 'var(--bd-shadow-sm)'
                                            }}
                                        >
                                            <Edit style={{ width: 16, height: 16 }} /> Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button style={{
                                                padding: '10px', borderRadius: 'var(--bd-radius-lg)',
                                                border: '1px solid var(--bd-border-default)', background: 'var(--bd-surface)',
                                                color: 'var(--bd-text-secondary)', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <MessageSquare style={{ width: 16, height: 16 }} />
                                            </button>
                                            <button
                                                onClick={() => setIsFollowing(!isFollowing)}
                                                style={{
                                                    padding: '10px 24px', borderRadius: 'var(--bd-radius-lg)',
                                                    fontWeight: 600, fontSize: 'var(--bd-font-size-sm)', cursor: 'pointer',
                                                    border: 'none', transition: 'all 150ms ease',
                                                    background: isFollowing ? 'var(--bd-success)' : 'var(--bd-primary)',
                                                    color: 'var(--bd-primary-fg)',
                                                    boxShadow: 'var(--bd-shadow-primary-btn)'
                                                }}
                                            >
                                                {isFollowing ? "Following" : "Follow"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div style={{ display: 'flex', gap: 'var(--bd-space-2)', marginTop: 'var(--bd-space-4)' }}>
                        <SocialLink icon={Instagram} href="#" label="Instagram" />
                        <SocialLink icon={Twitter} href="#" label="Twitter" />
                        <SocialLink icon={Linkedin} href="#" label="LinkedIn" />
                        <SocialLink icon={Globe} href="#" label="Website" />
                    </div>
                </div>
            </div>

            {/* ─── TRUST SUMMARY STRIP ─────────────────────── */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 var(--bd-space-6)' }}>
                <div className="trust-strip" style={{ marginTop: 'var(--bd-space-5)' }}>
                    {trustCards.map((card, i) => (
                        <TrustCard key={card.label} {...card} delay={i * 0.05} />
                    ))}
                </div>
            </div>

            {/* ─── MAIN CONTENT ─────────────────────────────── */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--bd-space-6)' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)', marginBottom: 'var(--bd-space-6)' }}>
                    <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
                    <TabButton active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>{type === "brand" ? "Campaigns" : "Portfolio"}</TabButton>
                    {isSelf && (
                        <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</TabButton>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {/* ─── OVERVIEW TAB ─────────────────────── */}
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--bd-space-6)' }}
                        >
                            {/* LEFT SIDEBAR */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bd-space-5)' }}>
                                {/* About */}
                                <div className="surface-card" style={{ padding: 'var(--bd-space-5)' }}>
                                    <h3 className="section-header__title" style={{ marginBottom: 'var(--bd-space-4)' }}>About</h3>
                                    <p style={{ fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--bd-space-5)' }}>
                                        {profile.about}
                                    </p>

                                    <div style={{ borderTop: '1px solid var(--bd-border-muted)', paddingTop: 'var(--bd-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--bd-space-3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-3)', fontSize: 'var(--bd-font-size-sm)' }}>
                                            <Mail style={{ width: 16, height: 16, color: 'var(--bd-text-muted)' }} />
                                            <span style={{ color: 'var(--bd-text-primary)', fontWeight: 500 }}>{profile.contact.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-3)', fontSize: 'var(--bd-font-size-sm)' }}>
                                            <Phone style={{ width: 16, height: 16, color: 'var(--bd-text-muted)' }} />
                                            <span style={{ color: 'var(--bd-text-primary)', fontWeight: 500 }}>{profile.contact.phone}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bd-space-3)', fontSize: 'var(--bd-font-size-sm)' }}>
                                            <LinkIcon style={{ width: 16, height: 16, color: 'var(--bd-text-muted)' }} />
                                            <a href={profile.socials?.website || "#"} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bd-accent)', textDecoration: 'none', fontWeight: 500 }}>
                                                {profile.socials?.website || "Add Website"}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="surface-card" style={{ padding: 'var(--bd-space-5)' }}>
                                    <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bd-text-primary)', marginBottom: 'var(--bd-space-4)' }}>
                                        {type === "brand" ? "Focus Areas" : "Skills & Interests"}
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--bd-space-2)' }}>
                                        {profile.skills?.map((tag) => (
                                            <span key={tag} style={{
                                                padding: '4px 12px', borderRadius: 9999,
                                                background: 'var(--bd-bg-tertiary)',
                                                color: 'var(--bd-text-secondary)',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                border: '1px solid var(--bd-border-subtle)'
                                            }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Audience Overview (Creator only) */}
                                {type === "creator" && (
                                    <div className="surface-card" style={{ padding: 'var(--bd-space-5)' }}>
                                        <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bd-text-primary)', marginBottom: 'var(--bd-space-4)' }}>
                                            Audience Overview
                                        </h3>
                                        <div className="audience-grid">
                                            <div className="audience-grid__item">
                                                <p className="audience-grid__label">Primary Geo</p>
                                                <p className="audience-grid__value">United States</p>
                                            </div>
                                            <div className="audience-grid__item">
                                                <p className="audience-grid__label">Engagement</p>
                                                <p className="audience-grid__value">8.5%</p>
                                            </div>
                                            <div className="audience-grid__item">
                                                <p className="audience-grid__label">Niche</p>
                                                <p className="audience-grid__value">{profile.industry}</p>
                                            </div>
                                            <div className="audience-grid__item">
                                                <p className="audience-grid__label">Avg Views</p>
                                                <p className="audience-grid__value">45K</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT CONTENT */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bd-space-5)' }}>
                                {/* Performance Section */}
                                <div className="surface-card" style={{ padding: 'var(--bd-space-5)' }}>
                                    <div className="section-header" style={{ marginBottom: 'var(--bd-space-5)' }}>
                                        <div>
                                            <h2 className="section-header__title">Performance Overview</h2>
                                            <p className="section-header__subtitle">Key performance metrics</p>
                                        </div>
                                    </div>
                                    <div className="perf-grid">
                                        {perfData.map((item, i) => (
                                            <TrustCard key={item.label} {...item} delay={i * 0.05} />
                                        ))}
                                    </div>
                                </div>

                                {/* Campaign History Table */}
                                <div className="surface-card" style={{ padding: 'var(--bd-space-5)' }}>
                                    <div className="section-header" style={{ marginBottom: 'var(--bd-space-5)' }}>
                                        <div>
                                            <h2 className="section-header__title">Campaign History</h2>
                                            <p className="section-header__subtitle">
                                                {type === "brand" ? "Recent campaigns launched" : "Completed collaborations"}
                                            </p>
                                        </div>
                                    </div>

                                    {CAMPAIGNS_DATA.length > 0 ? (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="campaign-history-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ textAlign: 'left' }}>Campaign</th>
                                                        <th style={{ textAlign: 'left' }}>Status</th>
                                                        <th style={{ textAlign: 'right' }}>Budget</th>
                                                        <th style={{ textAlign: 'right' }}>ROAS</th>
                                                        <th style={{ textAlign: 'right' }}>Completion</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {CAMPAIGNS_DATA.map((campaign) => (
                                                        <tr key={campaign.id} style={{ cursor: 'pointer' }}>
                                                            <td style={{ fontWeight: 600, color: 'var(--bd-text-primary)' }}>
                                                                {campaign.name}
                                                            </td>
                                                            <td>
                                                                <span className={`status-pill ${campaign.status === 'Active' ? 'status-pill--success' : campaign.status === 'Completed' ? 'status-pill--info' : 'status-pill--neutral'}`}>
                                                                    {campaign.status}
                                                                </span>
                                                            </td>
                                                            <td className="col-numeric" style={{ fontFamily: 'var(--bd-font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                                                                ${campaign.budget || '—'}
                                                            </td>
                                                            <td className="col-numeric" style={{ fontFamily: 'var(--bd-font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--bd-success)' }}>
                                                                {campaign.roi || '—'}
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                                                    <div style={{ width: 60, height: 4, borderRadius: 2, background: 'var(--bd-bg-tertiary)', overflow: 'hidden' }}>
                                                                        <div style={{ width: '85%', height: '100%', borderRadius: 2, background: 'var(--bd-success)' }} />
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)', fontVariantNumeric: 'tabular-nums' }}>85%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="empty-state-guided">
                                            <div className="empty-state-guided__icon">
                                                <Briefcase style={{ width: 24, height: 24 }} />
                                            </div>
                                            <h4 className="empty-state-guided__title">No campaigns yet</h4>
                                            <p className="empty-state-guided__text">
                                                {type === "brand"
                                                    ? "Launch your first campaign to start building your performance history."
                                                    : "Complete your first campaign to build your portfolio."
                                                }
                                            </p>
                                            <button className="empty-state-guided__cta">
                                                <ArrowRight style={{ width: 16, height: 16 }} />
                                                {type === "brand" ? "Create Campaign" : "Browse Opportunities"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── CAMPAIGNS / PORTFOLIO TAB ───────── */}
                    {activeTab === "campaigns" && (
                        <motion.div
                            key="campaigns"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="surface-card" style={{ padding: 'var(--bd-space-5)' }}>
                                <div className="section-header" style={{ marginBottom: 'var(--bd-space-5)' }}>
                                    <div>
                                        <h2 className="section-header__title">
                                            {type === "brand" ? "All Campaigns" : "Full Portfolio"}
                                        </h2>
                                        <p className="section-header__subtitle">
                                            {type === "brand"
                                                ? `${CAMPAIGNS_DATA.length} campaigns total`
                                                : `${CAMPAIGNS_DATA.length} collaborations completed`
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="campaign-history-table">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left' }}>Campaign</th>
                                                <th style={{ textAlign: 'left' }}>Status</th>
                                                <th style={{ textAlign: 'right' }}>Budget</th>
                                                <th style={{ textAlign: 'right' }}>ROAS</th>
                                                <th style={{ textAlign: 'right' }}>
                                                    {type === "brand" ? "Creators" : "Revenue"}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {CAMPAIGNS_DATA.map((campaign) => (
                                                <tr key={campaign.id} style={{ cursor: 'pointer' }}>
                                                    <td style={{ fontWeight: 600, color: 'var(--bd-text-primary)' }}>
                                                        {campaign.name}
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${campaign.status === 'Active' ? 'status-pill--success' : campaign.status === 'Completed' ? 'status-pill--info' : 'status-pill--neutral'}`}>
                                                            {campaign.status}
                                                        </span>
                                                    </td>
                                                    <td className="col-numeric">${campaign.budget || '—'}</td>
                                                    <td className="col-numeric" style={{ color: 'var(--bd-success)' }}>{campaign.roi || '—'}</td>
                                                    <td className="col-numeric">{campaign.creators || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── SETTINGS TAB ─────────────────────── */}
                    {activeTab === "settings" && isSelf && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="surface-card" style={{ padding: 'var(--bd-space-6)', maxWidth: 640 }}>
                                <h3 className="section-header__title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--bd-space-6)' }}>
                                    <Settings style={{ width: 20, height: 20 }} /> Account Settings
                                </h3>

                                <div style={{
                                    padding: 'var(--bd-space-5)', borderRadius: 'var(--bd-radius-xl)',
                                    border: '1px solid var(--bd-danger-border)',
                                    background: 'var(--bd-danger-muted)'
                                }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--bd-danger)', marginBottom: 'var(--bd-space-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertCircle style={{ width: 20, height: 20 }} /> Danger Zone
                                    </h4>
                                    <p style={{ fontSize: 'var(--bd-font-size-sm)', color: 'var(--bd-danger)', opacity: 0.8, marginBottom: 'var(--bd-space-5)', lineHeight: 1.5 }}>
                                        Once you delete your account, there is no going back. All your data including profile information, campaigns, and posts will be permanently removed.
                                    </p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        style={{
                                            padding: '10px 20px', borderRadius: 'var(--bd-radius-lg)',
                                            background: 'var(--bd-danger)', color: '#fff',
                                            fontWeight: 700, fontSize: 'var(--bd-font-size-sm)',
                                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                            transition: 'all 150ms ease'
                                        }}
                                    >
                                        <Trash2 style={{ width: 16, height: 16 }} /> Delete Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <EditProfileModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        profile={profile}
                        onSave={setProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
