import React, { useState } from "react";
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
    ArrowRight
} from "lucide-react";
import { BRAND_PROFILE, BRAND_POSTS, CAMPAIGNS_DATA } from "../data";
import EditProfileModal from "../components/EditProfileModal";

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

const BrandProfile = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [profile, setProfile] = useState(BRAND_PROFILE);
    const [posts, setPosts] = useState(BRAND_POSTS);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    const handleSaveProfile = (updatedProfile) => {
        setProfile(updatedProfile);
    };

    const handleCreatePost = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handleDeletePost = (id) => {
        setPosts(posts.filter(post => post.id !== id));
    };

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
                                {profile.about}
                            </p>
                            <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800/50">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Our Mission</h4>
                                <p className="text-gray-500 dark:text-slate-400 italic">
                                    "To empower creators and brands to build authentic connections that drive real value and inspire communities worldwide."
                                </p>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            <StatCard icon={Briefcase} label="Campaigns Launched" value={profile.stats.campaigns} colorClass="bg-blue-500" delay={0.1} />
                            <StatCard icon={Calendar} label="Hiring Since" value={profile.stats.hiringSince} colorClass="bg-green-500" delay={0.2} />
                            <StatCard icon={Star} label="Average Rating" value={profile.stats.rating} colorClass="bg-yellow-500" delay={0.3} />
                            <StatCard icon={Users} label="Creator Engagements" value="1.2k+" colorClass="bg-purple-500" delay={0.4} />
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
                                        {profile.about} We believe in transparency, sustainability, and community-driven growth. Our headquarters are designed to foster creativity and collaboration.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Our Values</h3>
                                    <ul className="space-y-3">
                                        {['Innovation First', 'Community Driven', 'Sustainable Practices', 'Transparent Partnerships'].map((value, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-slate-400">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                {value}
                                            </li>
                                        ))}
                                    </ul>
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
                                                <p className="font-bold text-gray-900 dark:text-white">{profile.contact.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">Phone Support</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{profile.contact.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Key Personnel</h3>
                                    <div className="flex items-center gap-4">
                                        <img src="https://i.pravatar.cc/150?u=ceo" alt="CEO" className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-md" />
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">Sarah Miller</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Chief Marketing Officer</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {CAMPAIGNS_DATA.map((campaign) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
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
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandProfile;
