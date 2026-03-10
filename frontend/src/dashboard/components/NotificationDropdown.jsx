import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, Check, Clock, MessageSquare, Briefcase,
    DollarSign, Users, FileCheck, AlertCircle, Loader2
} from "lucide-react";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../../api/notificationService";

// ─── Icon + colour config per notification type ──────────────────────────────
const TYPE_CONFIG = {
    campaign_invite: { icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    creator_applied: { icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    content_submitted: { icon: FileCheck, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    content_approved: { icon: Check, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    content_revision: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    payment_received: { icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    payment_pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    general: { icon: Bell, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800/40" },
};

// ─── Single notification row ──────────────────────────────────────────────────
const NotificationItem = ({ notification, onRead }) => {
    const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.general;
    const Icon = config.icon;

    const handleClick = async () => {
        if (!notification.isRead) {
            // Optimistically mark read in UI, then persist
            onRead(notification.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800 last:border-0 ${!notification.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
        >
            <div className="flex gap-3">
                {/* Icon badge */}
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                        <h4 className={`text-sm font-semibold truncate pr-2 ${!notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-slate-400"}`}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {notification.relativeTime}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">
                        {notification.message}
                    </p>
                </div>

                {/* Unread dot */}
                {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                )}
            </div>
        </div>
    );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const Skeleton = () => (
    <div className="p-4 border-b border-gray-100 dark:border-slate-800 last:border-0 animate-pulse">
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-full" />
            </div>
        </div>
    </div>
);

// ─── Main dropdown ────────────────────────────────────────────────────────────
const NotificationDropdown = ({ isOpen, onClose, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getNotifications(20);
            const list = res.data?.notifications || [];
            setNotifications(list);
            // Bubble updated unread count to parent (bell badge)
            const unread = list.filter(n => !n.isRead).length;
            onUnreadCountChange?.(unread);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setError("Could not load notifications.");
        } finally {
            setLoading(false);
        }
    }, [onUnreadCountChange]);

    // Fetch when dropdown opens
    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen, fetchNotifications]);

    const handleMarkRead = useCallback(async (id) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        const unread = notifications.filter(n => !n.isRead && n.id !== id).length;
        onUnreadCountChange?.(unread);
        try {
            await markAsRead(id);
        } catch {
            // Revert on failure
            fetchNotifications();
        }
    }, [notifications, onUnreadCountChange, fetchNotifications]);

    const handleMarkAllRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        onUnreadCountChange?.(0);
        try {
            await markAllAsRead();
        } catch {
            fetchNotifications();
        }
    }, [onUnreadCountChange, fetchNotifications]);

    const hasUnread = notifications.some(n => !n.isRead);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-transparent"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 z-50 overflow-hidden origin-top-right"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Notifications
                                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                            </h3>
                            {hasUnread && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="max-h-[420px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <>
                                    <Skeleton />
                                    <Skeleton />
                                    <Skeleton />
                                </>
                            ) : error ? (
                                <div className="p-6 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{error}</p>
                                    <button
                                        onClick={fetchNotifications}
                                        className="mt-2 text-xs text-indigo-500 hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">All caught up!</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">No new notifications</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notification={n}
                                        onRead={handleMarkRead}
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 text-center">
                                <button
                                    onClick={onClose}
                                    className="text-xs font-medium text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDropdown;
