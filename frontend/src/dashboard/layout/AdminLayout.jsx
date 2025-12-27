import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { ADMIN_NAV_GROUPS } from "../data";
import { Bell, Search, Menu, X, ChevronRight, Shield } from "lucide-react";
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
                fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-950 text-white border-r border-zinc-800 transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-zinc-900">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        Admin
                    </div>
                    <button onClick={onClose} className="ml-auto md:hidden text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-64px)]">
                    {ADMIN_NAV_GROUPS.map((group) => (
                        <div key={group.title}>
                            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === "/admin"}
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative group ${isActive
                                                ? "text-white font-medium bg-zinc-900"
                                                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeIndicator"
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-red-600 rounded-r-full"
                                                    />
                                                )}
                                                <item.icon className={`w-[18px] h-[18px] stroke-[1.5px] ${isActive ? "text-red-500" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                                                <span>{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

const Topbar = ({ onMenuClick }) => {
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean);

    return (
        <header className="h-16 sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 px-4 md:px-8 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <span className="hover:text-gray-900 dark:hover:text-slate-200 transition-colors cursor-pointer">Admin</span>
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
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
                        A
                    </div>
                </div>
            </div>
        </header>
    );
};

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100 selection:bg-red-100 dark:selection:bg-red-900/30">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="md:pl-64 transition-all duration-300">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="p-6 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
