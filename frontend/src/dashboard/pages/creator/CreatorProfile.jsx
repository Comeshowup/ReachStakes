import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    MapPin,
    Edit,
    Instagram,
    Linkedin,
    Globe,
    Twitter,
    Trash2,
    Heart,
    MessageCircle,
    Briefcase,
    Calendar,
    Star,
    Mail,
    Phone,
    Plus,
    Image as ImageIcon,
    Video,
    Link as LinkIcon,
    Send,
    TrendingUp,
    Users,
    CheckCircle2,
    ArrowRight,
    X,
    DollarSign,
    PieChart,
    BarChart3,
    Clock,
    Settings,
    AlertCircle,
    Loader2
} from "lucide-react";
import { deleteAccount, getMyPosts, createPost, deletePost } from "../../../api/userService";
import { calculateSuggestedRate, getPriceRange } from "../../../utils/rateUtils";
// Mock data removed
import EditProfileModal from "../../components/EditProfileModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- Mock Data removed ---
// ...(TabButton, StatCard, CampaignCard, Modal, CreatePostModal components remain unchanged)...

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

const StatCard = ({ icon: Icon, label, value, colorClass, delay }) => (
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
        <div className={`p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 ${colorClass} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
    </motion.div>
);

const CampaignCard = ({ campaign }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
    >
        <div className="h-40 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
            <img
                src={`https://source.unsplash.com/random/800x600?${campaign.name?.split(' ')[0] || 'campaign'}`}
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
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{campaign.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    {campaign.roi} ROI
                </span>
                <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {campaign.creators} Creators
                </span>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                View Details <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    </motion.div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

const CreatePostModal = ({ isOpen, onClose, onPost }) => {
    const [content, setContent] = useState("");
    const [mediaType, setMediaType] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        onPost({
            id: Date.now(),
            content,
            date: "Just now",
            likes: 0,
            comments: 0,
            mediaType
        });
        setContent("");
        setMediaType(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Post">
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                />

                <div className="flex gap-2">
                    <button type="button" onClick={() => setMediaType('image')} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${mediaType === 'image' ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Image</span>
                    </button>
                    <button type="button" onClick={() => setMediaType('video')} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${mediaType === 'video' ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        <Video className="w-4 h-4" />
                        <span className="text-sm">Video</span>
                    </button>
                    <button type="button" onClick={() => setMediaType('link')} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${mediaType === 'link' ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        <LinkIcon className="w-4 h-4" />
                        <span className="text-sm">Link</span>
                    </button>
                </div>

                {mediaType && (
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 text-sm">
                        {mediaType === 'image' && "Image Upload Placeholder"}
                        {mediaType === 'video' && "Video Upload Placeholder"}
                        {mediaType === 'link' && "Link Input Placeholder"}
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-slate-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Post
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// --- Main Page Component ---

const CreatorProfile = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        name: "",
        handle: "",
        tagline: "",
        location: "",
        about: "",
        logo: null,
        banner: null,
        socials: { instagram: "", linkedin: "", twitter: "", website: "" },
        stats: { campaigns: 0, hiringSince: "2024", rating: 5.0 },
        contact: { email: "", phone: "" },
        followersCount: 0,
        engagementRate: 0
    });

    // Use empty array for new users
    const [posts, setPosts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const [profileRes, postsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/users/me/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    getMyPosts()
                ]);

                if (profileRes.data.status === "success") {
                    const data = profileRes.data.data;

                    // Transform backend data to frontend structure if necessary
                    // Assuming socialAccounts is an array from backend, we might map it to the object structure
                    const socialMap = { instagram: "", linkedin: "", twitter: "", website: "" };
                    if (data.socialAccounts) {
                        data.socialAccounts.forEach(acc => {
                            if (socialMap.hasOwnProperty(acc.platform.toLowerCase())) {
                                socialMap[acc.platform.toLowerCase()] = acc.profileUrl;
                            }
                        });
                    }

                    setProfile({
                        ...data,
                        logo: data.avatarUrl || null,
                        socials: data.socialLinks || socialMap, // Use existing socialLinks or mapped accounts
                        stats: {
                            campaigns: data.completedCampaigns || 0,
                            hiringSince: new Date(data.createdAt || Date.now()).getFullYear().toString(),
                            rating: data.reliabilityScore ? (data.reliabilityScore / 20).toFixed(1) : 5.0 // Scale 0-100 to 0-5
                        },
                        contact: {
                            email: data.email,
                            phone: data.phone || ""
                        },
                        followersCount: data.followersCount || 0,
                        engagementRate: data.engagementRate || 0
                    });
                }

                if (postsRes && postsRes.status === "success") {
                    setPosts(postsRes.data);
                }

            } catch (err) {
                console.error("Failed to fetch profile:", err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userInfo");
                    window.location.href = "/login";
                } else {
                    setError("Failed to load profile data. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSaveProfile = (updatedProfile) => {
        setProfile(updatedProfile);
        // Here you would also send a PUT request to update the backend
    };

    const handleCreatePost = async (newPostData) => {
        try {
            const res = await createPost({
                content: newPostData.content,
                mediaType: newPostData.mediaType,
                mediaUrl: null // Add upload logic later
            });
            if (res.status === "success") {
                setPosts([res.data, ...posts]);
            }
        } catch (err) {
            console.error("Failed to create post:", err);
            alert("Failed to create post");
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await deletePost(id);
            setPosts(posts.filter(post => post.id !== id));
        } catch (err) {
            console.error("Failed to delete post:", err);
            alert("Failed to delete post");
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
            } catch (err) {
                console.error('Error deleting account:', err);
                alert("Failed to delete account. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                <p className="mb-4">{error}</p>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userInfo");
                        window.location.href = "/login";
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-bold"
                >
                    Log Out & Reset
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden relative group">
                {/* Banner */}
                <div className="h-64 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: profile.banner ? `url(${profile.banner})` : 'linear-gradient(to right, #4f46e5, #7c3aed)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>

                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row justify-between items-end -mt-16 mb-8 gap-6">
                        <div className="flex items-end gap-6">
                            {/* Logo */}
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-2xl relative z-10 ring-1 ring-gray-100 dark:ring-slate-700">
                                {profile.logo ? (
                                    <img src={profile.logo} alt={profile.name} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/50 flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400 border-4 border-white dark:border-slate-900">
                                        {profile.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Brand Identity */}
                            <div className="pb-1">
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">{profile.name}</h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 dark:text-slate-400">
                                    <span className="text-lg font-medium">{profile.tagline}</span>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {profile.location}
                                    </div>
                                </div>

                                {/* Integrated Socials */}
                                <div className="flex items-center gap-4 mt-4">
                                    <a href={profile.socials.instagram} className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></a>
                                    <a href={profile.socials.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
                                    <a href={profile.socials.twitter} className="text-gray-400 hover:text-sky-500 transition-colors"><Twitter className="w-5 h-5" /></a>
                                    <a href={profile.socials.website} className="text-gray-400 hover:text-indigo-500 transition-colors"><Globe className="w-5 h-5" /></a>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const shareUrl = `${window.location.origin}/profile/@${profile.handle}`;
                                    navigator.clipboard.writeText(shareUrl);
                                    alert("Media Kit link copied to clipboard!");
                                }}
                                className="mb-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Share Media Kit
                            </button>
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="mb-2 px-5 py-2.5 rounded-full border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold text-sm hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-all"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex justify-center">
                        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-full border border-gray-200 dark:border-slate-800 shadow-sm inline-flex">
                            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
                            <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>Details & Audience</TabButton>
                            <TabButton active={activeTab === "services"} onClick={() => setActiveTab("services")}>Services</TabButton>
                            <TabButton active={activeTab === "posts"} onClick={() => setActiveTab("posts")}>Posts</TabButton>
                            <TabButton active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>Portfolio</TabButton>
                            <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</TabButton>
                        </div>
                    </div>
                </div>
            </div >

            {/* Content Area */}
            < AnimatePresence mode="wait" >
                {activeTab === "overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* About Card */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">About Me</h3>
                            </div>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-lg mb-6">
                                {profile.about}
                            </p>

                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            <StatCard icon={Briefcase} label="Campaigns Completed" value={profile.stats.campaigns} colorClass="bg-blue-500" delay={0.1} />
                            <StatCard icon={Calendar} label="Creating Since" value={profile.stats.hiringSince} colorClass="bg-green-500" delay={0.2} />
                            <StatCard icon={Star} label="Average Rating" value={profile.stats.rating} colorClass="bg-yellow-500" delay={0.3} />
                            <StatCard icon={Users} label="Total Reach" value={(profile.followersCount || 0).toLocaleString()} colorClass="bg-purple-500" delay={0.4} />
                        </div>
                    </motion.div>
                )}

                {
                    activeTab === "details" && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Creator Profile</h3>
                                        <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                                            {profile.about || 'No description available.'}
                                        </p>
                                    </div>

                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{profile.contact.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-slate-400">Phone</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{profile.contact.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Audience Demographics Section */}
                                    {/* Audience Demographics - Placeholder for now until backend supports it */}
                                    {profile.demographics ? (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <PieChart className="w-5 h-5 text-indigo-500" />
                                                Audience Insights
                                            </h3>
                                            {/* Render demographics here if available */}
                                        </div>
                                    ) : (
                                        <div className="p-8 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-center border border-dashed border-gray-200 dark:border-slate-700">
                                            <PieChart className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Audience Insights</h4>
                                            <p className="text-gray-500 dark:text-slate-400">Demographics data will appear here once you connect your social accounts.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeTab === "services" && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Services List - synced with real data or empty */}
                            {(profile.services && profile.services.length > 0) ? (
                                profile.services.map((service) => (
                                    <div key={service.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                                <DollarSign className="w-6 h-6" />
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold rounded-full">
                                                ${service.price}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                                        <p className="text-gray-500 dark:text-slate-400 mb-4 text-sm leading-relaxed">
                                            {service.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50 dark:border-slate-800/50">
                                            <span className="flex items-center gap-1.5 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {service.time} turnaround
                                            </span>
                                            <button className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Edit</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-1 md:col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
                                    <Briefcase className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No services listed yet</h4>
                                    <p className="text-gray-500 dark:text-slate-400">Add services to start accepting offers!</p>
                                </div>
                            )}
                            <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all gap-3 group">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                                </div>
                                <span className="font-bold text-gray-500 group-hover:text-gray-900 dark:text-slate-400 dark:group-hover:text-white">Add New Service</span>
                            </button>

                            {/* Suggested Rates Insight */}
                            <div className="md:col-span-2 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-white/20 rounded-xl">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold">Smart Pricing Insight</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-4">
                                            <p className="text-indigo-100/80 leading-relaxed">
                                                Based on your current <span className="text-white font-bold">{(profile.followersCount || 0).toLocaleString()} followers</span> and <span className="text-white font-bold">{(profile.engagementRate || 0)}% engagement rate</span>, your recommended market rate for a primary integration is:
                                            </p>
                                            <div className="text-5xl font-black">
                                                ${calculateSuggestedRate(profile.followersCount || 0, profile.engagementRate || 0).toLocaleString()}
                                            </div>
                                            <div className="text-sm font-medium text-indigo-100/60 uppercase tracking-widest">
                                                Market Fair Value
                                            </div>
                                        </div>
                                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 space-y-4">
                                            <h4 className="font-bold flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4" /> Recommended Range
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Minimum</span>
                                                    <span className="font-bold">${getPriceRange(calculateSuggestedRate(profile.followersCount || 0, profile.engagementRate || 0)).min.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-300 w-2/3 mx-auto"></div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Premium</span>
                                                    <span className="font-bold">${getPriceRange(calculateSuggestedRate(profile.followersCount || 0, profile.engagementRate || 0)).max.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-indigo-200/50 italic py-2">
                                                *Standard industry valuation based on reach and high engagement multiplier.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeTab === "posts" && (
                        <motion.div
                            key="posts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Community Updates</h3>
                                <button
                                    onClick={() => setIsCreatePostOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Post
                                </button>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
                                    <MessageCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No posts yet</h4>
                                    <p className="text-gray-500 dark:text-slate-400">Time to share something with your community!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {posts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            layout
                                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 group hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-colors"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {profile.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{profile.name}</h4>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400">{post.date}</p>
                                                        </div>
                                                        <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>

                                            {post.mediaType && (
                                                <div className="mb-4 h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400">
                                                    {post.mediaType === 'image' ? <ImageIcon className="w-8 h-8" /> : <Video className="w-8 h-8" />}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                                                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition-colors">
                                                    <Heart className="w-4 h-4" /> {post.likes}
                                                </button>
                                                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                                    <MessageCircle className="w-4 h-4" /> {post.comments}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )
                }

                {
                    activeTab === "campaigns" && (
                        <motion.div
                            key="campaigns"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio & Past Work</h3>
                                <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">View Full Portfolio</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {campaigns.length === 0 ? (
                                    <div className="col-span-1 lg:col-span-3 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
                                        <Briefcase className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No campaigns yet</h4>
                                        <p className="text-gray-500 dark:text-slate-400">Join a campaign to build your portfolio!</p>
                                    </div>
                                ) : (
                                    campaigns.map((campaign) => (
                                        <CampaignCard key={campaign.id} campaign={campaign} />
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeTab === "settings" && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800"
                        >
                            <div className="max-w-2xl">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Account Settings
                                </h3>

                                <div className="mb-8 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
                                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Danger Zone
                                    </h4>
                                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
                                        Once you delete your account, there is no going back. All your data including profile information, campaigns, and posts will be permanently removed.
                                    </p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            <AnimatePresence>
                {isEditProfileOpen && (
                    <EditProfileModal
                        isOpen={isEditProfileOpen}
                        onClose={() => setIsEditProfileOpen(false)}
                        profile={profile}
                        onSave={handleSaveProfile}
                    />
                )}
                {isCreatePostOpen && (
                    <CreatePostModal
                        isOpen={isCreatePostOpen}
                        onClose={() => setIsCreatePostOpen(false)}
                        onPost={handleCreatePost}
                    />
                )}
            </AnimatePresence>
        </div >
    );
};

export default CreatorProfile;
