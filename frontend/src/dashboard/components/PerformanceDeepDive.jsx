import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import {
    TrendingUp,
    Eye,
    MousePointer,
    DollarSign,
    ArrowUpRight
} from "lucide-react";

const DATA = [
    { name: 'Mon', views: 4000, clicks: 240 },
    { name: 'Tue', views: 3000, clicks: 139 },
    { name: 'Wed', views: 2000, clicks: 980 },
    { name: 'Thu', views: 2780, clicks: 390 },
    { name: 'Fri', views: 1890, clicks: 480 },
    { name: 'Sat', views: 2390, clicks: 380 },
    { name: 'Sun', views: 3490, clicks: 430 },
];

const PerformanceDeepDive = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Views", value: "245.2K", change: "+12%", icon: Eye, color: "indigo" },
                    { label: "Link Clicks", value: "12,450", change: "+5%", icon: MousePointer, color: "purple" },
                    { label: "Est. Revenue", value: "$45,200", change: "+22%", icon: DollarSign, color: "emerald" },
                    { label: "Avg. ROI", value: "3.4x", change: "+8%", icon: TrendingUp, color: "amber" },
                ].map((stat, i) => {
                    const colors = {
                        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10",
                        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10",
                        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
                        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10"
                    };
                    const colorClass = colors[stat.color];

                    return (
                        <div key={i} className="bg-[#18181B] p-6 rounded-2xl border border-white/5 shadow-sm relative overflow-hidden group hover:border-white/10 transition-all">
                            <div className={`absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity bg-white rounded-full`}>
                                <stat.icon className={`w-24 h-24`} />
                            </div>
                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colorClass} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <p className="text-sm text-slate-400 font-medium mb-1 font-sans">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mb-2 font-sans tracking-tight">{stat.value}</h3>
                                <span className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#18181B] p-6 rounded-2xl border border-white/5 shadow-sm">
                    <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 rounded-full bg-indigo-500"></span>
                        Views & Reach
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={DATA}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#6366f1" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#18181B] p-6 rounded-2xl border border-white/5 shadow-sm">
                    <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 rounded-full bg-purple-500"></span>
                        Conversions & Clicks
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="clicks" fill="#a855f7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDeepDive;
