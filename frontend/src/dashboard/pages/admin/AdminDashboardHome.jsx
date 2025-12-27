import React from 'react';
import { Users, Target, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, icon: Icon, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {change}
            </span>
            <span className="text-gray-400 dark:text-slate-500">vs last month</span>
        </div>
    </motion.div>
);

const AdminDashboardHome = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
                <p className="text-gray-500 dark:text-slate-400">Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value="12,345"
                    change="+12%"
                    icon={Users}
                    color="bg-blue-500"
                    delay={0}
                />
                <StatCard
                    title="Active Campaigns"
                    value="423"
                    change="+8%"
                    icon={Target}
                    color="bg-purple-500"
                    delay={0.1}
                />
                <StatCard
                    title="Total Revenue"
                    value="$1.2M"
                    change="+24%"
                    icon={DollarSign}
                    color="bg-emerald-500"
                    delay={0.2}
                />
                <StatCard
                    title="Pending Approvals"
                    value="45"
                    change="-5%"
                    icon={AlertCircle}
                    color="bg-amber-500"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Placeholder for Recent Activity */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Registrations</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800" />
                                <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">New User {i}</p>
                                    <p className="text-xs text-gray-500">Joined 2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                                <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">Payment #{1000 + i}</p>
                                    <p className="text-xs text-gray-500">Processed successfully</p>
                                </div>
                                <span className="font-medium text-emerald-500">+$250.00</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;
