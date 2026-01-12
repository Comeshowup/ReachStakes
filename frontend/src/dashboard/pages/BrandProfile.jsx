import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    Loader2,
    AlertCircle,
    RefreshCw,
    Settings
} from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";
import {
    getBrandProfile,
    updateBrandProfile,
    getBrandPosts,
    createBrandPost,
    deleteBrandPost,
    getBrandCampaigns,
    deleteAccount
} from "../../api/brandService";

// --- Components ---

const TabButton = ({ active, onClick, children, id }) => (
    <button
        onClick={onClick}
        className={`relative px-1 py-4 text-sm font-medium transition-colors ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
    >
        <span className="relative z-10">{children}</span>
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
    </button>
);

const StatCard = ({ icon: Icon, label, value, colorClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className={`w-10 h-10 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center mb-4`}>
            <Icon className={`w-5 h-5 ${colorClass.replace("bg-", "text-")}`} />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</p>
    </motion.div>
);

const CampaignCard = ({ campaign }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
    >
        <div className="h-40 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
            <img
                src={`https://source.unsplash.com/random/800x600?${campaign.name?.split(' ')[0] || 'campaign'}`}
                alt={campaign.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm shadow-sm ${campaign.status === 'Active' ? 'bg-green-100/90 text-green-700' :
                    campaign.status === 'Completed' ? 'bg-blue-100/90 text-blue-700' :
                        campaign.status === 'Paused' ? 'bg-yellow-100/90 text-yellow-700' :
                            'bg-white/90 text-gray-900 dark:bg-slate-900/90 dark:text-white'
                    }`}>
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
                        <span className="sr-only">Close</span>
                        ×
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

const CreatePostModal = ({ isOpen, onClose, onPost, isSubmitting }) => {
    const [content, setContent] = useState("");
    const [mediaType, setMediaType] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        await onPost({
            content,
            mediaType: mediaType || 'none',
            type: 'General'
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
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Post
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// Loading Skeleton
const ProfileSkeleton = () => (
    <div className="space-y-8 pb-12 animate-pulse">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="h-64 bg-gray-200 dark:bg-slate-800" />
            <div className="px-8 pb-8">
                <div className="flex items-end gap-6 -mt-16 mb-8">
                    <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-slate-700" />
                    <div className="pb-1 space-y-3">
                        <div className="h-8 w-48 bg-gray-300 dark:bg-slate-700 rounded" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
                    </div>
                </div>
                <div className="flex gap-8 border-b border-gray-100 dark:border-slate-800 pb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// Error State
const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Failed to Load Profile</h3>
        <p className="text-gray-500 dark:text-slate-400 mb-4">{message}</p>
        <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
            <RefreshCw className="w-4 h-4" />
            Try Again
        </button>
    </div>
);

// --- Main Page Component ---

const BrandProfile = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all data on mount
    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [profileRes, postsRes, campaignsRes] = await Promise.all([
                getBrandProfile(),
                getBrandPosts(),
                getBrandCampaigns()
            ]);

            setProfile(profileRes.data);
            setPosts(postsRes.data || []);
            setCampaigns(campaignsRes.data || []);
        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError(err.response?.data?.message || 'Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (updatedProfile) => {
        try {
            await updateBrandProfile(updatedProfile);
            // Refetch profile to get updated data
            const profileRes = await getBrandProfile();
            setProfile(profileRes.data);
            return true;
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    const handleCreatePost = async (postData) => {
        setIsSubmittingPost(true);
        try {
            const response = await createBrandPost(postData);
            setPosts([response.data, ...posts]);
        } catch (err) {
            console.error('Error creating post:', err);
            throw err;
        } finally {
            setIsSubmittingPost(false);
        }
    };

    const handleDeletePost = async (id) => {
        try {
            await deleteBrandPost(id);
            setPosts(posts.filter(post => post.id !== id));
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                await deleteAccount();
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
            } catch (err) {
                console.error('Error deleting account:', err);
                alert("Failed to delete account. Please try again.");
            }
        }
    };

    // Show loading state
    if (isLoading) {
        return <ProfileSkeleton />;
    }

    // Show error state
    if (error) {
        return <ErrorState message={error} onRetry={fetchProfileData} />;
    }

    // Profile not found
    if (!profile) {
        return <ErrorState message="Profile not found" onRetry={fetchProfileData} />;
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
                                        {profile.name?.charAt(0) || 'B'}
                                    </div>
                                )}
                            </div>

                            {/* Brand Identity */}
                            <div className="pb-1">
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">{profile.name}</h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 dark:text-slate-400">
                                    <span className="text-lg font-medium">{profile.tagline}</span>
                                    {profile.location && (
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            {profile.location}
                                        </div>
                                    )}
                                </div>

                                {/* Integrated Socials */}
                                <div className="flex items-center gap-4 mt-4">
                                    {profile.socials?.instagram && (
                                        <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profile.socials?.linkedin && (
                                        <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profile.socials?.twitter && (
                                        <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors">
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profile.socials?.website && (
                                        <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500 transition-colors">
                                            <Globe className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={() => setIsEditProfileOpen(true)}
                            className="mb-2 px-5 py-2.5 rounded-full border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold text-sm hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-all"
                        >
                            Edit Profile
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-8 border-b border-gray-100 dark:border-slate-800">
                        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
                        <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>Company Details</TabButton>
                        <TabButton active={activeTab === "posts"} onClick={() => setActiveTab("posts")}>Community Posts</TabButton>
                        <TabButton active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>Past Campaigns</TabButton>
                        <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</TabButton>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
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
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">About Us</h3>
                            </div>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-lg mb-6">
                                {profile.about || 'No description available.'}
                            </p>

                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            <StatCard icon={Briefcase} label="Campaigns Launched" value={profile.stats?.campaigns || 0} colorClass="bg-blue-500" delay={0.1} />
                            <StatCard icon={Calendar} label="Hiring Since" value={profile.stats?.hiringSince || new Date().getFullYear()} colorClass="bg-green-500" delay={0.2} />
                            <StatCard icon={Star} label="Average Rating" value={profile.stats?.rating || 'N/A'} colorClass="bg-yellow-500" delay={0.3} />
                            <StatCard icon={Users} label="Active Campaigns" value={profile.stats?.activeCampaigns || 0} colorClass="bg-purple-500" delay={0.4} />
                        </div>
                    </motion.div>
                )}

                {activeTab === "details" && (
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
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Company Profile</h3>
                                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                                        {profile.about || 'No description available.'}
                                    </p>
                                </div>
                                <div>

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
                                                <p className="text-sm text-gray-500 dark:text-slate-400">Email Support</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{profile.contact?.email || profile.email}</p>
                                            </div>
                                        </div>
                                        {profile.contact?.phone && (
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-slate-400">Phone Support</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{profile.contact.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Company Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-slate-400">Industry</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{profile.industry || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-slate-400">Company Size</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{profile.companySize || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-slate-400">Status</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{profile.hiringStatus || 'Active'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "posts" && (
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
                                <p className="text-gray-500 dark:text-slate-400">Share your first update with the community!</p>
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
                                                {profile.name?.charAt(0) || 'B'}
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

                                        {post.mediaType && post.mediaType !== 'none' && (
                                            <div className="mb-4 h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden">
                                                {post.mediaUrl ? (
                                                    post.mediaType === 'image' ? (
                                                        <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Video className="w-8 h-8" />
                                                    )
                                                ) : (
                                                    post.mediaType === 'image' ? <ImageIcon className="w-8 h-8" /> : <Video className="w-8 h-8" />
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition-colors">
                                                <Heart className="w-4 h-4" /> {post.likes || 0}
                                            </button>
                                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                                <MessageCircle className="w-4 h-4" /> {post.comments || 0}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "campaigns" && (
                    <motion.div
                        key="campaigns"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Past Campaigns</h3>
                            <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">View All History</button>
                        </div>
                        {campaigns.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
                                <Briefcase className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No campaigns yet</h4>
                                <p className="text-gray-500 dark:text-slate-400">Create your first campaign to get started!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {campaigns.map((campaign) => (
                                    <CampaignCard key={campaign.id} campaign={campaign} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "settings" && (
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
                )}
            </AnimatePresence>

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
                        isSubmitting={isSubmittingPost}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandProfile;
