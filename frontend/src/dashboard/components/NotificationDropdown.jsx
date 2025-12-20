import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Clock, MessageSquare, Briefcase, X } from "lucide-react";

const NOTIFICATIONS = [
    {
        id: 1,
        title: "New Campaign Invite",
        message: "Nike invited you to 'Summer Run Club'",
        time: "2m ago",
        read: false,
        type: "invite"
    },
    {
        id: 2,
        title: "Video Approved",
        message: "Your submission for TechNova was approved",
        time: "1h ago",
        read: false,
        type: "success"
    },
    {
        id: 3,
        title: "New Message",
        message: "Sarah from GlowUp sent you a message",
        time: "3h ago",
        read: true,
        type: "message"
    },
    {
        id: 4,
        title: "Payment Received",
        message: "You received $1,500 from GameZone",
        time: "1d ago",
        read: true,
        type: "payment"
    }
];

const NotificationItem = ({ notification }) => {
    const getIcon = (type) => {
        switch (type) {
            case "invite": return <Briefcase className="w-4 h-4 text-blue-500" />;
            case "success": return <Check className="w-4 h-4 text-green-500" />;
            case "message": return <MessageSquare className="w-4 h-4 text-indigo-500" />;
            case "payment": return <Clock className="w-4 h-4 text-orange-500" />; // Using Clock as placeholder for payment history/time
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800 last:border-0 ${!notification.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
            <div className="flex gap-3">
                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.read ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-gray-100 dark:bg-slate-800"}`}>
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-semibold ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-slate-400"}`}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">{notification.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">
                        {notification.message}
                    </p>
                </div>
                {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
            </div>
        </div>
    );
};

const NotificationDropdown = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-transparent"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 z-50 overflow-hidden origin-top-right"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                            <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                Mark all as read
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {NOTIFICATIONS.map(notification => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))}
                        </div>
                        <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-center">
                            <button className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                View All Notifications
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDropdown;
