import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MessageCircle,
    Share2,
    Video,
    Image as ImageIcon,
    Send,
    Play,
    CheckCircle,
    Filter,
    Grid,
    List,
    MoreHorizontal,
    X,
    UserPlus,
    UserCheck
} from "lucide-react";
import { FEED_DATA } from "../data";
import { useNavigate } from "react-router-dom";

// --- Components ---

const PostDetailModal = ({ post, isOpen, onClose, onLike, onComment, isLiked, isFollowing, onFollow }) => {
    const [commentText, setCommentText] = useState("");
    const commentsRef = useRef(null);

    if (!isOpen) return null;

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            onComment(post.id, commentText);
            setCommentText("");
            // Scroll to bottom of comments
            setTimeout(() => {
                if (commentsRef.current) {
                    commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
                }
            }, 100);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Media Side (Left) */}
                    <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative">
                        {post.content.media ? (
                            post.content.media.type === "video" ? (
                                <video
                                    src={post.content.media.url}
                                    className="w-full h-full max-h-[50vh] md:max-h-[90vh] object-contain"
                                    controls
                                    autoPlay
                                />
                            ) : (
                                <img
                                    src={post.content.media.url}
                                    alt="Post content"
                                    className="w-full h-full max-h-[50vh] md:max-h-[90vh] object-contain"
                                />
                            )
                        ) : (
                            <div className="p-12 text-center text-gray-500">No Media</div>
                        )}
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors md:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Side (Right) */}
                    <div className="w-full md:w-2/5 flex flex-col h-[50vh] md:h-auto bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-slate-800"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{post.author.name}</h3>
                                        {post.author.type === "brand" ? (
                                            <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                                        ) : (
                                            <CheckCircle className="w-3.5 h-3.5 text-purple-500 fill-purple-500 text-white" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">{post.author.badge}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onFollow(post.author.name)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowing
                                        ? "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                        }`}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <button onClick={onClose} className="hidden md:block p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={commentsRef}>
                            {/* Original Post Caption */}
                            <div className="flex gap-3 mb-6">
                                <img src={post.author.avatar} alt="Author" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        <span className="font-bold mr-2">{post.author.name}</span>
                                        {post.content.text}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{post.content.timestamp}</p>
                                </div>
                            </div>

                            {/* Mock Comments (and newly added ones) */}
                            {post.comments && post.comments.map((comment, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                        {comment.user[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            <span className="font-bold mr-2">{comment.user}</span>
                                            {comment.text}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Just now</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions & Input */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => onLike(post.id)}
                                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? "text-pink-500" : "text-gray-900 dark:text-white hover:text-pink-500"
                                            }`}
                                    >
                                        <Heart className={`w-6 h-6 ${isLiked ? "fill-pink-500" : ""}`} />
                                    </button>
                                    <button className="text-gray-900 dark:text-white hover:text-indigo-500 transition-colors">
                                        <MessageCircle className="w-6 h-6" />
                                    </button>
                                    <button className="text-gray-900 dark:text-white hover:text-green-500 transition-colors">
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                </div>
                                <button className="text-gray-900 dark:text-white">
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{post.stats.likes + (isLiked ? 1 : 0)} likes</p>
                            </div>
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="text-indigo-600 dark:text-indigo-400 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Post
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const MasonryPostCard = ({ post, onLike, onOpen, isLiked, onFollow, isFollowing }) => {
    const isBrand = post.author.type === "brand";
    const videoRef = useRef(null);
    const navigate = useNavigate();

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        if (isBrand) {
            navigate("/dashboard/profile");
        } else {
            navigate("/dashboard/discovery"); // Or specific creator profile
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="break-inside-avoid mb-8 group relative cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onOpen(post)}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-slate-800">
                {/* Media Section (Hero) */}
                {post.content.media && (
                    <div className={`relative w-full overflow-hidden bg-gray-100 dark:bg-slate-800 ${post.content.media.aspectRatio === "vertical" ? "aspect-[3/4]" : "aspect-[16/9]"
                        }`}>
                        {post.content.media.type === "video" ? (
                            <>
                                <video
                                    ref={videoRef}
                                    src={post.content.media.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    playsInline
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <img
                                src={post.content.media.url}
                                alt="Post content"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                )}

                {/* Content Section */}
                <div className="p-5">
                    {/* Author Header (Inside Card) */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3" onClick={handleProfileClick}>
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 hover:ring-indigo-500 transition-all"
                            />
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-none hover:underline">{post.author.name}</h3>
                                    {isBrand ? (
                                        <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500 text-white" />
                                    ) : (
                                        <CheckCircle className="w-3 h-3 text-purple-500 fill-purple-500 text-white" />
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-0.5">{post.author.badge || post.content.timestamp}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onFollow(post.author.name);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${isFollowing
                                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                : "text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-800"
                                }`}
                        >
                            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Text Content */}
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                        {post.content.text}
                    </p>

                    {/* Stats Footer */}
                    <div className="flex items-center gap-4 pt-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLike(post.id);
                            }}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? "text-pink-500" : "text-gray-400 dark:text-slate-500 hover:text-pink-500"
                                }`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-pink-500" : ""}`} />
                            {post.stats.likes + (isLiked ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-slate-500 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {post.stats.comments + (post.comments ? post.comments.length : 0)}
                        </button>
                    </div>
                </div>

                {/* Call to Action (Hover Reveal) */}
                <div className="h-0 group-hover:h-12 transition-all duration-300 overflow-hidden">
                    <button
                        onClick={handleProfileClick}
                        className={`w-full h-full text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${isBrand
                            ? "bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
                            : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                    >
                        {isBrand ? "Apply Now" : "View Profile"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const FilterBar = ({ viewMode, setViewMode }) => {
    const tabs = ["All Posts", "Casting Calls", "Showcase", "Discussions"];
    const [activeTab, setActiveTab] = useState("All Posts");

    return (
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 mb-8 -mx-6 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                            : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-slate-800 ml-4 hidden sm:flex">
                <button
                    onClick={() => setViewMode("masonry")}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === "masonry"
                        ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                        }`}
                >
                    <Grid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === "list"
                        ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                        }`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const CommunityHub = () => {
    const [viewMode, setViewMode] = useState("masonry");
    const [posts, setPosts] = useState(FEED_DATA.map(p => ({ ...p, comments: [] }))); // Initialize with empty comments
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [followedUsers, setFollowedUsers] = useState(new Set());
    const [selectedPost, setSelectedPost] = useState(null);

    const handleLike = (postId) => {
        setLikedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const handleFollow = (userName) => {
        setFollowedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userName)) {
                newSet.delete(userName);
            } else {
                newSet.add(userName);
            }
            return newSet;
        });
    };

    const handleComment = (postId, text) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...(post.comments || []), { user: "You", text }]
                };
            }
            return post;
        }));
    };

    return (
        <div className="min-h-screen">
            <FilterBar viewMode={viewMode} setViewMode={setViewMode} />

            <div className="max-w-5xl mx-auto">
                {/* Create Post Widget (Simplified) */}
                <div className="mb-12 flex gap-4 items-start max-w-2xl mx-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 p-[1px]">
                            <img
                                src="https://i.pravatar.cc/150?u=brand"
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            placeholder="Share something with the community..."
                            className="w-full bg-gray-100 dark:bg-slate-900/50 border-none rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                <Video className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feed Layout */}
                <div className={viewMode === "masonry" ? "columns-1 md:columns-2 gap-8 space-y-8" : "max-w-2xl mx-auto space-y-8"}>
                    {posts.map((post) => (
                        <MasonryPostCard
                            key={post.id}
                            post={post}
                            onLike={handleLike}
                            onOpen={setSelectedPost}
                            isLiked={likedPosts.has(post.id)}
                            onFollow={handleFollow}
                            isFollowing={followedUsers.has(post.author.name)}
                        />
                    ))}
                </div>
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <PostDetailModal
                    post={posts.find(p => p.id === selectedPost.id)}
                    isOpen={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onLike={handleLike}
                    onComment={handleComment}
                    isLiked={likedPosts.has(selectedPost.id)}
                    onFollow={handleFollow}
                    isFollowing={followedUsers.has(selectedPost.author.name)}
                />
            )}
        </div>
    );
};

export default CommunityHub;
