import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
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
    Edit,
    Mail,
    Phone,
    ArrowRight,
    Image as ImageIcon,
    Video,
    Trash2,
    Heart,
    MessageCircle,
    Calendar,
    Award,
    Info,
    Link as LinkIcon,
    MoreHorizontal
} from "lucide-react";
import { BRAND_PROFILE, CREATOR_PROFILE, BRAND_POSTS, CREATOR_POSTS, CAMPAIGNS_DATA } from "../data";
import EditProfileModal from "../components/EditProfileModal";

// --- Helper Components ---

const SocialLink = ({ icon: Icon, href, colorClass }) => (
    <motion.a
        href={href}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all ${colorClass}`}
    >
        <Icon className="w-4 h-4" />
    </motion.a>
);

const CountUp = ({ value, className }) => {
    const [count, setCount] = useState(0);
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const suffix = value.replace(/[0-9]/g, '');

    useEffect(() => {
        let start = 0;
        const end = numericValue;
        const duration = 1500;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [numericValue]);

    return <span className={className}>{count}{suffix}</span>;
};

const MetricItem = ({ label, value, icon: Icon, colorClass, delay, fullValue }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-default group relative"
        >
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${colorClass.replace("bg-", "text-")}`} />
            </div>
            <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                    <CountUp value={value} />
                </div>
                <div className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                {fullValue || value}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
            </div>
        </motion.div>
    );
};

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 relative ${active
            ? "text-gray-900 dark:text-white bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-slate-700"
            : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
            }`}
    >
        {children}
    </button>
);

const CampaignCard = ({ campaign }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
        <div className="h-48 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
            <img
                src={`https://source.unsplash.com/random/800x600?${campaign.name.split(' ')[0]}`}
                alt={campaign.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/90 dark:bg-slate-900/90 text-gray-900 dark:text-white backdrop-blur-sm shadow-sm">
                    {campaign.status}
                </span>
            </div>
        </div>
        <div className="p-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{campaign.name}</h3>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    {campaign.roi} ROI
                </span>
                <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    {campaign.creators} Creators
                </span>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                View Details <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    </motion.div>
);

const PostCard = ({ post, profile, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800"
    >
        <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{profile.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{post.date}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        <p className="text-gray-700 dark:text-slate-300 mb-4 text-sm leading-relaxed">
            {typeof post.content === 'string' ? post.content : post.content?.text || ''}
        </p>

        {post.mediaType && (
            <div className="mb-4 h-56 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400 overflow-hidden">
                {post.mediaType === 'image' ? (
                    <img src={`https://source.unsplash.com/random/800x600?${post.content.split(' ')[0]}`} alt="Post" className="w-full h-full object-cover" />
                ) : (
                    <Video className="w-8 h-8" />
                )}
            </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition-colors">
                <Heart className="w-4 h-4" /> {post.likes}
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4" /> {post.comments}
            </button>
        </div>
    </motion.div>
);

// --- Main Component ---

const ProfilePage = ({ type: propType }) => {
    const { id, type: routeType } = useParams();
    const location = useLocation();

    // Determine context
    const isPublic = !!id || location.pathname.includes("/profile/");
    const type = propType || routeType || (location.pathname.includes("brand") ? "brand" : "creator");
    const isSelf = !isPublic; // Simplified logic for demo

    // State
    const [activeTab, setActiveTab] = useState("overview");
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Data Loading (Mock)
    const [profile, setProfile] = useState(() => {
        const initialProfile = type === "brand" ? BRAND_PROFILE : CREATOR_PROFILE;
        return {
            ...initialProfile,
            skills: initialProfile.skills || ["Marketing", "Content Creation", "Video Editing", "Social Media", "Branding"]
        };
    });
    const [posts, setPosts] = useState(type === "brand" ? BRAND_POSTS : CREATOR_POSTS);

    // Dynamic Stats
    const stats = type === "brand"
        ? [
            { label: "Active Campaigns", value: profile.stats.campaigns.toString(), fullValue: "12 Active Campaigns", icon: Briefcase, colorClass: "bg-blue-500" },
            { label: "Hiring Since", value: profile.stats.hiringSince, fullValue: `Hiring since ${profile.stats.hiringSince}`, icon: Calendar, colorClass: "bg-green-500" },
            { label: "Creator Rating", value: profile.stats.rating, fullValue: "4.8/5.0 Rating", icon: Star, colorClass: "bg-yellow-500" },
            { label: "Total Hires", value: "150+", fullValue: "156 Total Hires", icon: Users, colorClass: "bg-purple-500" },
        ]
        : [
            { label: "Campaigns", value: profile.stats.campaigns.toString(), fullValue: "45 Campaigns Completed", icon: Award, colorClass: "bg-blue-500" },
            { label: "Engagement", value: "8.5%", fullValue: "8.52% Avg. Engagement", icon: TrendingUp, colorClass: "bg-green-500" },
            { label: "Rating", value: profile.stats.rating, fullValue: "4.9/5.0 Rating", icon: Star, colorClass: "bg-yellow-500" },
            { label: "Followers", value: "1.2M", fullValue: "1,240,500 Followers", icon: Users, colorClass: "bg-purple-500" },
        ];

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 font-sans pb-20">

            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                {/* Banner */}
                <div className="h-64 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900">
                        {profile.banner && (
                            <img src={profile.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                    <div className="relative -mt-20 flex flex-col md:flex-row items-end gap-6">

                        {/* Avatar */}
                        <div className="relative z-10">
                            <div className="w-40 h-40 rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-xl ring-1 ring-gray-100 dark:ring-slate-800">
                                <img
                                    src={type === "brand" ? "https://ui-avatars.com/api/?name=Acme+Co&background=6366f1&color=fff&size=256" : "https://i.pravatar.cc/300?u=a042581f4e29026704d"}
                                    alt={profile.name}
                                    className="w-full h-full object-cover rounded-full bg-gray-100 dark:bg-slate-800"
                                />
                            </div>
                            <div className="absolute bottom-3 right-3 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full shadow-sm" title="Online Now"></div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 pb-2 w-full md:w-auto text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                                        {profile.name}
                                        <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                                    </h1>
                                    <p className="text-lg text-gray-500 dark:text-slate-400 font-medium">{profile.tagline}</p>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>
                                        <span className="hidden md:inline text-gray-300 dark:text-slate-700">•</span>
                                        <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {profile.industry}</span>
                                        {type === "creator" && (
                                            <>
                                                <span className="hidden md:inline text-gray-300 dark:text-slate-700">•</span>
                                                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 1.2M Followers</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-center gap-3 mt-4 md:mt-0">
                                    {isSelf ? (
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" /> Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setIsFollowing(!isFollowing)}
                                                className={`px-6 py-2.5 rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-all ${isFollowing
                                                    ? "bg-green-600 text-white hover:bg-green-700"
                                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                    }`}
                                            >
                                                {isFollowing ? "Following" : "Follow"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 dark:bg-slate-800 my-6"></div>

                    {/* Stats & Social Row */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-6">
                            {stats.map((stat, index) => (
                                <MetricItem key={index} {...stat} delay={index * 0.1} />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <SocialLink icon={Instagram} href="#" colorClass="hover:text-pink-500" />
                            <SocialLink icon={Twitter} href="#" colorClass="hover:text-blue-400" />
                            <SocialLink icon={Linkedin} href="#" colorClass="hover:text-blue-700" />
                            <SocialLink icon={Globe} href="#" colorClass="hover:text-indigo-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar (Left) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* About Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
                            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                {profile.about}
                            </p>

                            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white font-medium">{profile.contact.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white font-medium">{profile.contact.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <LinkIcon className="w-4 h-4 text-gray-400" />
                                    <a href={profile.socials?.website || "#"} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate max-w-[200px]">
                                        {profile.socials?.website || "Add Website"}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Skills/Tags */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Skills & Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills && profile.skills.map((tag) => (
                                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-full text-xs font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feed (Right) */}
                    <div className="lg:col-span-8">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
                            <TabButton active={activeTab === "posts"} onClick={() => setActiveTab("posts")}>{type === "brand" ? "Updates" : "Posts"}</TabButton>
                            <TabButton active={activeTab === "portfolio"} onClick={() => setActiveTab("portfolio")}>{type === "brand" ? "Campaigns" : "Portfolio"}</TabButton>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === "overview" && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* Featured / Pinned Post */}
                                    <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-4 opacity-80">
                                                <Star className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Featured</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">Welcome to our official profile!</h3>
                                            <p className="text-indigo-100 mb-6 max-w-lg">
                                                We are excited to connect with creators and brands. Check out our latest campaigns and updates below.
                                            </p>
                                            <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                                Learn More
                                            </button>
                                        </div>
                                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                                            <Award className="w-64 h-64" />
                                        </div>
                                    </div>

                                    {/* Recent Activity Preview */}
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-4">Recent Activity</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {posts.slice(0, 2).map((post) => (
                                            <PostCard key={post.id} post={post} profile={profile} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "posts" && (
                                <motion.div
                                    key="posts"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {posts.map((post) => (
                                        <PostCard key={post.id} post={post} profile={profile} onDelete={isSelf ? (id) => setPosts(posts.filter(p => p.id !== id)) : null} />
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === "portfolio" && (
                                <motion.div
                                    key="portfolio"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                                >
                                    {CAMPAIGNS_DATA.map((campaign) => (
                                        <CampaignCard key={campaign.id} campaign={campaign} />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
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
