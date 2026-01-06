import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { CREATOR_NAV_GROUPS } from "../data";

import { Bell, Search, Menu, X, ChevronRight } from "lucide-react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isOpen, onClose }) => {
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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-800/50 transition-transform duration-300 ease-in-out flex flex-col
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                        <div className="w-6 h-6 bg-indigo-600 rounded-lg"></div>
                        CreatorHub
                    </div>
                    <button onClick={onClose} className="ml-auto md:hidden text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-8 overflow-y-auto flex-1">
                    {CREATOR_NAV_GROUPS.map((group) => (
                        <div key={group.title}>
                            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === "/creator"}
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative group ${isActive
                                                ? "text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50/50 dark:bg-indigo-900/10"
                                                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeIndicator"
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full"
                                                    />
                                                )}
                                                <item.icon className={`w-[18px] h-[18px] stroke-[1.5px] ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300"}`} />
                                                <span>{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200/50 dark:border-slate-800/50">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('userInfo');
                            window.location.href = '/login';
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

import NotificationDropdown from "../components/NotificationDropdown";

const Topbar = ({ onMenuClick }) => {
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <header className="h-16 sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 px-4 md:px-8 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <span className="hover:text-gray-900 dark:hover:text-slate-200 transition-colors cursor-pointer">Creator</span>
                    {pathSegments.slice(1).map((segment, index) => (
                        <React.Fragment key={segment}>
                            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                            <span className="capitalize font-medium text-gray-900 dark:text-white">
                                {segment.replace("-", " ")}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="w-64 pl-9 pr-4 py-1.5 rounded-full bg-gray-100/50 dark:bg-slate-900/50 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm outline-none"
                    />
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            <Bell className="w-5 h-5 stroke-[1.5px]" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                        </button>
                        <NotificationDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                    </div>
                    <NavLink to="/creator/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 p-[1px]">
                            <img
                                src="https://i.pravatar.cc/150?u=creator"
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </NavLink>
                </div>
            </div>
        </header>
    );
};

const CreatorLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="md:pl-64 transition-all duration-300">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className={location.pathname === "/creator/messages"
                    ? "h-[calc(100vh-64px)] overflow-hidden"
                    : "p-6 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]"
                }>
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

export default CreatorLayout;
