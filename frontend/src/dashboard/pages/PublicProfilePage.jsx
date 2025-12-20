import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    UserPlus,
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
    LayoutGrid,
    Image as ImageIcon,
    PlayCircle,
    Award
} from "lucide-react";
import { BRAND_PROFILE, CREATOR_PROFILE, BRAND_POSTS, CREATOR_POSTS } from "../data";

// --- Helper Components ---

const SocialLink = ({ icon: Icon, href, colorClass }) => (
    <motion.a
        href={href}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-gray-500 dark:text-slate-400 transition-colors ${colorClass}`}
    >
        <Icon className="w-5 h-5" />
    </motion.a>
);

const StatCard = ({ label, value, icon: Icon, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            whileHover={{
                scale: 1.05,
                rotateX: 5,
                rotateY: 5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center group perspective-1000"
        >
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
        </motion.div>
    );
};

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 relative ${active
            ? "text-white"
            : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10">{children}</span>
    </button>
);

const PostCard = ({ post }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
        <div className="p-6">
            <p className="text-gray-700 dark:text-slate-300 mb-4 leading-relaxed">{post.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 pt-4">
                <span>{post.date}</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                </div>
            </div>
        </div>
    </motion.div>
);

// --- Main Component ---

const PublicProfilePage = ({ type = "creator" }) => { // type: "brand" | "creator"
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    // Select data based on type
    const profile = type === "brand" ? BRAND_PROFILE : CREATOR_PROFILE;
    const posts = type === "brand" ? BRAND_POSTS : CREATOR_POSTS;

    // Dynamic Stats
    const stats = type === "brand"
        ? [
            { label: "Active Campaigns", value: profile.stats.campaigns, icon: Briefcase },
            { label: "Hiring Since", value: profile.stats.hiringSince, icon: CheckCircle },
            { label: "Creator Rating", value: profile.stats.rating, icon: Star },
            { label: "Total Hires", value: "150+", icon: Users },
        ]
        : [
            { label: "Campaigns Done", value: profile.stats.campaigns, icon: Award },
            { label: "Avg. Engagement", value: "8.5%", icon: TrendingUp }, // Mocked extra stat
            { label: "Rating", value: profile.stats.rating, icon: Star },
            { label: "Followers", value: "1.2M", icon: Users }, // Mocked extra stat
        ];

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 font-sans pb-20">

            {/* Hero Section */}
            <div className="relative bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 pb-12">
                {/* Banner */}
                <div className="h-64 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 gap-6 mb-8">
                        {/* Avatar */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <div className="w-40 h-40 rounded-3xl bg-white dark:bg-slate-900 p-1.5 shadow-2xl ring-1 ring-gray-100 dark:ring-slate-800">
                                <img
                                    src={type === "brand" ? "https://ui-avatars.com/api/?name=Acme+Co&background=6366f1&color=fff&size=256" : "https://i.pravatar.cc/300?u=a042581f4e29026704d"}
                                    alt={profile.name}
                                    className="w-full h-full object-cover rounded-2xl bg-gray-100 dark:bg-slate-800"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full" title="Online Now"></div>
                        </motion.div>

                        {/* Profile Info */}
                        <div className="flex-1 pt-4 md:pt-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                        {profile.name}
                                        <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                                    </h1>
                                    <p className="text-lg text-gray-500 dark:text-slate-400 mt-1 font-medium">{profile.tagline}</p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>
                                        <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {profile.industry}</span>
                                        {type === "creator" && <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 1.2M Followers</span>}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all"
                                    >
                                        <MessageSquare className="w-5 h-5" /> Message
                                    </motion.button>

                                    <motion.button
                                        onClick={() => setIsFollowing(!isFollowing)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-6 py-3 rounded-xl font-bold border flex items-center gap-2 transition-all ${isFollowing
                                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                                            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600"
                                            }`}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <CheckCircle className="w-5 h-5" /> Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" /> Follow
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-3 mb-8">
                        <SocialLink icon={Instagram} href="#" colorClass="hover:text-pink-500 hover:border-pink-200 dark:hover:border-pink-900/50" />
                        <SocialLink icon={Twitter} href="#" colorClass="hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900/50" />
                        <SocialLink icon={Linkedin} href="#" colorClass="hover:text-blue-700 hover:border-blue-200 dark:hover:border-blue-900/50" />
                        <SocialLink icon={Globe} href="#" colorClass="hover:text-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-900/50" />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-8 -mt-8 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} delay={index * 0.1} />
                    ))}
                </div>

                {/* Content Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-full border border-gray-200 dark:border-slate-800 shadow-sm inline-flex">
                        <TabButton active={activeTab === "posts"} onClick={() => setActiveTab("posts")}>
                            {type === "brand" ? "Recent Updates" : "Portfolio & Posts"}
                        </TabButton>
                        <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")}>
                            About
                        </TabButton>
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === "posts" ? (
                        <motion.div
                            key="posts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="about"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {profile.name}</h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-lg">
                                {profile.about}
                            </p>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                                    <ul className="space-y-2 text-gray-600 dark:text-slate-400">
                                        <li>Email: {profile.contact.email}</li>
                                        <li>Phone: {profile.contact.phone}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">Details</h4>
                                    <ul className="space-y-2 text-gray-600 dark:text-slate-400">
                                        <li>Location: {profile.location}</li>
                                        <li>Industry: {profile.industry}</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PublicProfilePage;
