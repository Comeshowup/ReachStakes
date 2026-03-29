import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_NAV_GROUPS, ADMIN_BADGE_KEY_MAP } from "../adminNavigationConfig";
import {
  Bell, Menu, X, ChevronRight, Shield, LogOut, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ─── Fetch live badge counts ───────────────────────────────────────────────────
const fetchNavBadges = async () => {
  try {
    const { data } = await axios.get(`${API}/api/admin/analytics/overview`, { headers: authHeader() });
    return {
      unreadMessages: data?.unreadMessages || 0,
      pendingTasks:   data?.pendingTasks   || 0,
      openTickets:    data?.openIssues     || 0,
    };
  } catch {
    return { unreadMessages: 0, pendingTasks: 0, openTickets: 0 };
  }
};

// Resolve badge count from live data using ADMIN_BADGE_KEY_MAP
const resolveBadge = (badgeKey, badges) => {
  if (!badgeKey || !badges) return 0;
  const serverKey = ADMIN_BADGE_KEY_MAP[badgeKey];
  return serverKey ? (badges[serverKey] || 0) : 0;
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse, badges }) => {
  const w = isCollapsed ? "w-[62px]" : "w-60";

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen ${w} bg-[#0a0a0b] text-white
          border-r border-zinc-900 transition-all duration-200 ease-in-out
          flex flex-col overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo row */}
        <div className="h-14 flex items-center px-4 border-b border-zinc-900 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="font-bold text-sm tracking-tight text-white truncate">ReachStakes</span>
                <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded shrink-0">
                  ADMIN
                </span>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-zinc-300 shrink-0">
            <X className="w-4 h-4" />
          </button>

          {/* Desktop collapse toggle */}
          {!isOpen && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex text-zinc-600 hover:text-zinc-300 transition-colors shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed
                ? <PanelLeftOpen className="w-4 h-4" />
                : <PanelLeftClose className="w-4 h-4" />
              }
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-hide">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.id}>
              {/* Section label — hidden when collapsed */}
              {!isCollapsed && (
                <p className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  {group.title}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const badgeCount = resolveBadge(item.badgeKey, badges);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end || false}
                      onClick={() => window.innerWidth < 768 && onClose()}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group ${
                          isCollapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "text-white font-medium bg-zinc-800"
                            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active bar indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="adminActiveBar"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-red-500 rounded-r-full"
                            />
                          )}

                          <item.icon
                            className={`w-4 h-4 shrink-0 stroke-[1.5px] ${
                              isActive ? "text-red-500" : "text-zinc-600 group-hover:text-zinc-400"
                            }`}
                          />

                          {!isCollapsed && (
                            <>
                              <span className="flex-1 truncate">{item.label}</span>
                              {badgeCount > 0 && (
                                <span className="text-[10px] font-bold min-w-[18px] h-[18px] px-1 bg-red-600 text-white rounded-full flex items-center justify-center tabular-nums">
                                  {badgeCount > 99 ? "99+" : badgeCount}
                                </span>
                              )}
                            </>
                          )}

                          {/* Badge dot in collapsed mode */}
                          {isCollapsed && badgeCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-5 py-3 border-t border-zinc-900 shrink-0">
            <p className="text-[10px] text-zinc-700">v1.1.0 · Campaign Manager</p>
          </div>
        )}
      </aside>
    </>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminInfo = (() => {
    try { return JSON.parse(localStorage.getItem("userInfo") || "{}"); }
    catch { return {}; }
  })();

  const adminInitial = adminInfo.name ? adminInfo.name.charAt(0).toUpperCase() : "A";
  const adminName   = adminInfo.name || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/admin/login");
  };

  // Build breadcrumbs from path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const crumbLabel = (seg) => seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="h-14 sticky top-0 z-40 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-900 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-zinc-600" aria-label="Breadcrumb">
          <button
            onClick={() => navigate("/admin")}
            className="hover:text-zinc-300 transition-colors text-zinc-500"
          >
            Admin
          </button>
          {pathSegments.slice(1).map((seg, i) => (
            <React.Fragment key={`${seg}-${i}`}>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-800" />
              <span
                className={
                  i === pathSegments.slice(1).length - 1
                    ? "font-medium text-zinc-300"
                    : "text-zinc-600"
                }
              >
                {crumbLabel(seg)}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="h-5 w-px bg-zinc-800 hidden md:block mx-1" />

        {/* Admin avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-bold select-none">
            {adminInitial}
          </div>
          <span className="hidden md:block text-sm font-medium text-zinc-400">{adminName}</span>
        </div>

        {/* Logout */}
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-zinc-500 hover:bg-red-950/40 hover:text-red-400 transition-all ml-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline text-xs">Sign out</span>
        </button>
      </div>
    </header>
  );
};

// ─── AdminLayout ──────────────────────────────────────────────────────────────
const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const { data: badges } = useQuery({
    queryKey: ["admin", "nav-badges"],
    queryFn: fetchNavBadges,
    staleTime: 30_000,
    retry: 1,
  });

  const sidebarWidth = isCollapsed ? "md:pl-[62px]" : "md:pl-60";

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-red-900/30">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((c) => !c)}
        badges={badges}
      />

      <div className={`${sidebarWidth} transition-all duration-200`}>
        <Topbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="p-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
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
