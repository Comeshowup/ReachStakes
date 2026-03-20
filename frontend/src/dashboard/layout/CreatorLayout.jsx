import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CREATOR_NAV_CONFIG, CREATOR_FOOTER_NAV, SECTION_MAIN } from "../creatorNavigationConfig";
import {
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "../components/NotificationDropdown";
import { ThemeProvider, useTheme } from "../../contexts/ThemeProvider";
import { ThemeToggle } from "../../components/ThemeToggle";
import { getUnreadCount } from "../../api/notificationService";
import { getCreatorProfile } from "../../api/creatorDashboardService";

// ===========================
// SHARED HOOK — fetch creator identity once
// ===========================
const useCreatorIdentity = () => {
    const [creator, setCreator] = useState({ displayName: '', email: '', avatarUrl: null });

    useEffect(() => {
        // Seed from localStorage immediately so there's no blank flash
        try {
            const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const fallbackName =
                stored.creatorProfile?.fullName ||
                stored.creatorProfile?.displayName ||
                stored.creatorProfile?.name ||
                stored.name ||
                stored.displayName ||
                '';
            if (fallbackName) {
                setCreator(prev => ({
                    ...prev,
                    displayName: fallbackName,
                    email: stored.email || '',
                }));
            }
        } catch { }

        // Then fetch fresh data from the API
        getCreatorProfile()
            .then(res => {
                const p = res?.data || res;
                setCreator({
                    displayName: p.fullName || p.displayName || p.name || 'Creator Account',
                    email: p.email || p.contactEmail || '',
                    avatarUrl: p.avatarUrl || p.profilePicture || null,
                });
            })
            .catch(() => { }); // Fail silently — localStorage fallback stays
    }, []);

    return creator;
};

// ===========================
// SIDEBAR — Workflow-based navigation (Stripe / Linear pattern)
// ===========================
const Sidebar = ({ isOpen, onClose }) => {
    const creator = useCreatorIdentity();
    const displayName = creator.displayName || 'Creator Account';
    const creatorEmail = creator.email || '';
    const avatarLetter = displayName.charAt(0).toUpperCase();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if a nav item (or any of its children) matches the current path
    const isItemActive = (item) => {
        if (item.end) return location.pathname === item.path;
        if (location.pathname === item.path) return true;
        if (location.pathname.startsWith(item.path + '/')) return true;
        if (item.children) {
            return item.children.some(child => location.pathname === child.path || location.pathname.startsWith(child.path + '/'));
        }
        return false;
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 md:hidden"
                        style={{ background: 'var(--bd-overlay)', backdropFilter: 'blur(4px)' }}
                    />
                )}
            </AnimatePresence>

            <aside
                role="navigation"
                aria-label="Creator navigation"
                className={`
                    fixed top-0 left-0 z-50 h-screen w-[320px] flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
                style={{
                    background: 'var(--bd-sidebar-bg)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: '0 2.5rem 2.5rem 0',
                    borderRight: '1px solid var(--bd-sidebar-border)',
                    boxShadow: 'var(--bd-sidebar-shadow)',
                }}
            >
                {/* Logo */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'var(--bd-sidebar-logo-bg)',
                                boxShadow: 'var(--bd-sidebar-logo-shadow)',
                            }}
                        >
                            <span className="text-white text-sm font-bold">RS</span>
                        </div>
                        <div>
                            <h1
                                className="font-bold text-lg tracking-tight"
                                style={{ color: 'var(--bd-text-primary)' }}
                            >
                                Reachstakes
                            </h1>
                            <p
                                className="text-[11px] font-medium uppercase tracking-wider"
                                style={{ color: 'var(--bd-text-secondary)' }}
                            >
                                Creator Portal
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-xl"
                        style={{ color: 'var(--bd-text-secondary)' }}
                        aria-label="Close navigation"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation — grouped by section */}
                <nav className="flex-1 overflow-y-auto px-5 py-2 space-y-5">
                    {CREATOR_NAV_CONFIG.map((group) => (
                        <div key={group.section}>
                            {/* Section header — hidden for MAIN to keep Overview clean */}
                            {group.section !== SECTION_MAIN && (
                                <h3
                                    className="px-4 text-[11px] font-bold uppercase tracking-[0.1em] mb-2"
                                    style={{ color: 'var(--bd-text-muted)' }}
                                >
                                    {group.section}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isItemActive(item);
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={!!item.end}
                                            onClick={() => window.innerWidth < 768 && onClose()}
                                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative"
                                            style={() => ({
                                                ...(active ? {
                                                    background: 'var(--bd-sidebar-active)',
                                                    boxShadow: 'var(--bd-shadow-active-nav)',
                                                    color: 'var(--bd-text-primary)',
                                                } : {
                                                    color: 'var(--bd-text-secondary)',
                                                })
                                            })}
                                        >
                                            <item.icon
                                                className="w-[18px] h-[18px] shrink-0"
                                                style={{
                                                    color: active ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)',
                                                    strokeWidth: active ? 2 : 1.5,
                                                }}
                                            />
                                            <span>{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-bold"
                                                    style={{
                                                        background: 'var(--bd-danger)',
                                                        color: 'var(--bd-text-inverse)',
                                                        boxShadow: 'var(--bd-shadow-badge)',
                                                    }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer — Support + Profile Card + Logout */}
                <div className="px-5 pb-5 pt-3 shrink-0 space-y-3">
                    {/* Support Center link */}
                    <div className="space-y-1">
                        {CREATOR_FOOTER_NAV.map((item) => {
                            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => window.innerWidth < 768 && onClose()}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                                    style={() => ({
                                        ...(active ? {
                                            background: 'var(--bd-sidebar-active)',
                                            boxShadow: 'var(--bd-shadow-active-nav)',
                                            color: 'var(--bd-text-primary)',
                                        } : {
                                            color: 'var(--bd-text-secondary)',
                                        })
                                    })}
                                >
                                    <item.icon
                                        className="w-[18px] h-[18px] shrink-0"
                                        style={{
                                            color: active ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)',
                                            strokeWidth: active ? 2 : 1.5,
                                        }}
                                    />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>

                    {/* Creator Profile Card */}
                    <div
                        className="p-4 rounded-2xl"
                        style={{
                            background: 'var(--bd-surface-overlay)',
                            border: '1px solid var(--bd-border-subtle)',
                        }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            {creator.avatarUrl ? (
                                <img
                                    src={creator.avatarUrl}
                                    alt={displayName}
                                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{
                                        background: 'var(--bd-sidebar-logo-bg)',
                                        color: '#ffffff',
                                    }}
                                >
                                    {avatarLetter}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-semibold truncate"
                                    style={{ color: 'var(--bd-text-primary)' }}
                                >
                                    {displayName}
                                </p>
                                <p
                                    className="text-xs truncate"
                                    style={{ color: 'var(--bd-text-secondary)' }}
                                >
                                    {creatorEmail}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userInfo');
                                window.location.href = '/auth';
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{
                                color: 'var(--bd-danger)',
                                background: 'transparent',
                                border: '1px solid var(--bd-danger-border)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--bd-danger-muted)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

// ===========================
// TOPBAR — Semantic tokens only (mirrors DashboardLayout)
// ===========================
const Topbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const creator = useCreatorIdentity();
    const topbarName = creator.displayName || 'C';
    const topbarLetter = topbarName.charAt(0).toUpperCase();

    // Fetch unread count on mount
    useEffect(() => {
        getUnreadCount()
            .then(res => setUnreadCount(res.data?.count || 0))
            .catch(() => { }); // Fail silently
    }, []);

    return (
        <header
            className="h-16 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 shrink-0"
            style={{
                background: 'var(--bd-topbar-bg)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--bd-topbar-border)',
            }}
        >
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-xl"
                    style={{ color: 'var(--bd-text-secondary)' }}
                    aria-label="Open navigation menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="relative hidden md:block">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: 'var(--bd-text-secondary)' }}
                    />
                    <input
                        type="search"
                        placeholder="Search campaigns, brands..."
                        className="w-72 pl-9 pr-4 py-2 rounded-2xl text-sm outline-none transition-all"
                        style={{
                            background: 'var(--bd-surface-input)',
                            border: '1px solid var(--bd-border-subtle)',
                            color: 'var(--bd-text-primary)',
                        }}
                        aria-label="Search campaigns and brands"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <button
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
                    style={{
                        background: 'var(--bd-surface-input)',
                        border: '1px solid var(--bd-border-subtle)',
                        color: 'var(--bd-text-secondary)',
                    }}
                >
                    <Calendar className="w-4 h-4" />
                    {currentMonth}
                </button>

                <ThemeToggle />

                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2.5 rounded-xl transition-colors"
                        style={{ color: 'var(--bd-text-secondary)' }}
                        aria-label="View notifications"
                    >
                        <Bell className="w-5 h-5" strokeWidth={1.5} />
                        {unreadCount > 0 && (
                            <span
                                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                                style={{
                                    background: 'var(--bd-danger)',
                                    border: '2px solid var(--bd-bg-primary)',
                                }}
                            />
                        )}
                    </button>
                    <NotificationDropdown
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                        onUnreadCountChange={setUnreadCount}
                    />
                </div>

                {/* Profile Avatar */}
                <button
                    onClick={() => navigate('/creator/settings/profile')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-opacity hover:opacity-80 overflow-hidden"
                    style={!creator.avatarUrl ? {
                        background: 'var(--bd-sidebar-logo-bg)',
                        color: '#ffffff',
                    } : {}}
                    aria-label="Go to profile"
                    title={topbarName}
                >
                    {creator.avatarUrl ? (
                        <img src={creator.avatarUrl} alt={topbarName} className="w-full h-full object-cover" />
                    ) : (
                        topbarLetter
                    )}
                </button>
            </div>
        </header>
    );
};

// ===========================
// LAYOUT WRAPPER + THEME PROVIDER (mirrors DashboardLayout)
// ===========================
const CreatorContent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { theme } = useTheme();

    return (
        <div
            data-theme={theme}
            className="min-h-screen font-sans"
            style={{
                background: 'var(--bd-bg-primary)',
                color: 'var(--bd-text-primary)',
            }}
        >
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="md:pl-[320px] transition-all duration-300 flex flex-col min-h-screen">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main
                    className={
                        location.pathname === "/creator"
                            ? "flex-1 overflow-auto p-4 md:p-8"
                            : location.pathname === "/creator/messages"
                                ? "flex-1 overflow-hidden"
                                : "flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full"
                    }
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={location.pathname === "/creator/messages" ? "h-full" : ""}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

const CreatorLayout = () => {
    return (
        <ThemeProvider>
            <CreatorContent />
        </ThemeProvider>
    );
};

export default CreatorLayout;
