import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Send,
    Check,
    CheckCircle,
    XCircle,
    Briefcase,
    Clock,
    User,
    ChevronRight,
    Star,
    Filter,
    Image as ImageIcon,
    FileText,
    MoreHorizontal,
    Plus,
    ChevronDown,
    ChevronLeft,
    DollarSign,
    Smile,
    CornerUpLeft
} from "lucide-react";

// --- Mock Data ---

const CONTACTS = [
    {
        id: "c1",
        name: "Sarah Jenkins",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
        status: "online",
        role: "Lifestyle Creator",
        lastMessage: "That sounds great! When do we start?",
        unread: 2,
        time: "10:42 AM",
        niche: "Lifestyle & Travel",
        engagement: "4.8%",
        followers: "125k",
        location: "Los Angeles, CA",
        activeCampaign: {
            name: "Summer Collection Launch",
            status: "In Progress",
            dueDate: "Nov 30"
        }
    },
    {
        id: "c2",
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
        status: "offline",
        role: "Tech Reviewer",
        lastMessage: "I've attached the draft video for review.",
        unread: 0,
        time: "Yesterday",
        niche: "Tech & Gadgets",
        engagement: "5.2%",
        followers: "85k",
        location: "Austin, TX",
        activeCampaign: null
    },
    {
        id: "c3",
        name: "Emily Chen",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
        status: "online",
        role: "Beauty Influencer",
        lastMessage: "Can we discuss the budget?",
        unread: 0,
        time: "Yesterday",
        niche: "Beauty & Skincare",
        engagement: "3.9%",
        followers: "210k",
        location: "New York, NY",
        activeCampaign: null
    }
];

const INITIAL_MESSAGES = {
    "c1": [
        { id: 1, sender: "them", type: "text", content: "Hi! I saw your new campaign for the Summer Collection.", time: "10:30 AM" },
        { id: 2, sender: "me", type: "text", content: "Hey Sarah! Yes, we think you'd be a perfect fit for it.", time: "10:32 AM" },
        {
            id: 3,
            sender: "me",
            type: "invitation",
            content: {
                title: "Summer Collection Launch",
                budget: "$1,500",
                requirements: "1 Reel + 2 Stories",
                status: "awaiting_response" // awaiting_response, accepted, declined
            },
            time: "10:35 AM"
        },
        { id: 4, sender: "them", type: "text", content: "That sounds great! When do we start?", time: "10:42 AM" }
    ],
    "c2": [
        { id: 1, sender: "me", type: "text", content: "Hi Alex, checking in on the draft.", time: "Yesterday" },
        { id: 2, sender: "them", type: "text", content: "I've attached the draft video for review.", time: "Yesterday" }
    ],
    "c3": [
        { id: 1, sender: "them", type: "text", content: "Can we discuss the budget?", time: "Yesterday" }
    ]
};

// --- Components ---

const CampaignInvitationCard = ({ data, onAction }) => {
    const isPending = data.status === "awaiting_response";
    const isAccepted = data.status === "accepted";
    const isDeclined = data.status === "declined";

    return (
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm my-1">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Invitation</span>
                </div>
                {isAccepted && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>}
                {isDeclined && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Declined</span>}
                {isPending && <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{data.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">You're invited to collaborate on our upcoming campaign.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg">
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide font-bold mb-0.5">Budget</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{data.budget}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg">
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide font-bold mb-0.5">Deliverables</p>
                        <p className="font-bold text-gray-900 dark:text-white text-xs truncate">{data.requirements}</p>
                    </div>
                </div>

                {/* Actions */}
                {isPending ? (
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => onAction("accept")}
                            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                            onClick={() => onAction("decline")}
                            className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                        </button>
                    </div>
                ) : (
                    <div className={`text-center py-1 text-xs font-bold uppercase tracking-wide ${isAccepted ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {isAccepted ? "Invitation Accepted" : "Invitation Declined"}
                    </div>
                )}
            </div>
        </div>
    );
};

const MessagingPanel = () => {
    const [activeContactId, setActiveContactId] = useState("c1");
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState("");
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isContextOpen, setIsContextOpen] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const activeContact = CONTACTS.find(c => c.id === activeContactId);
    const activeMessages = messages[activeContactId] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeMessages, activeContactId, isTyping]);

    // Simulate typing indicator when switching chats (mock effect)
    useEffect(() => {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 800);
        return () => clearTimeout(timer);
    }, [activeContactId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage = {
            id: Date.now(),
            sender: "me",
            type: "text",
            content: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
            ...prev,
            [activeContactId]: [...prev[activeContactId], newMessage]
        }));
        setInputText("");
    };

    const handleSendInvitation = () => {
        const newMessage = {
            id: Date.now(),
            sender: "me",
            type: "invitation",
            content: {
                title: "Tech Review Challenge",
                budget: "$2,000",
                requirements: "1 YouTube Video",
                status: "awaiting_response"
            },
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
            ...prev,
            [activeContactId]: [...prev[activeContactId], newMessage]
        }));
        setIsActionMenuOpen(false);
    };

    const handleInvitationAction = (msgId, action) => {
        setMessages(prev => ({
            ...prev,
            [activeContactId]: prev[activeContactId].map(msg => {
                if (msg.id === msgId) {
                    return {
                        ...msg,
                        content: { ...msg.content, status: action === "accept" ? "accepted" : "declined" }
                    };
                }
                return msg;
            })
        }));
    };

    return (
        <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden">
            {/* Left Column: Inbox List */}
            <div className="w-80 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
                {/* Sticky Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Messages</h2>
                        <div className="flex gap-1">
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-lg text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence>
                        {CONTACTS.map((contact, index) => (
                            <motion.button
                                key={contact.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setActiveContactId(contact.id)}
                                className={`w-full p-4 flex items-start gap-3 transition-all relative group ${activeContactId === contact.id
                                    ? "bg-indigo-50/50 dark:bg-indigo-900/10"
                                    : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                {activeContactId === contact.id && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"
                                    />
                                )}

                                <div className="relative flex-shrink-0">
                                    <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-slate-700 transition-all" />
                                    {contact.status === "online" && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`text-sm font-bold truncate ${activeContactId === contact.id ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}>
                                            {contact.name}
                                        </h3>
                                        <span className={`text-[10px] font-medium ${contact.unread > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}>
                                            {contact.time}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate leading-relaxed ${contact.unread > 0 ? "font-semibold text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-slate-400"}`}>
                                        {contact.lastMessage}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Center Column: Active Chat */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 relative">
                {/* Chat Header */}
                <div className="h-16 px-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={activeContact.avatar} alt={activeContact.name} className="w-9 h-9 rounded-full object-cover" />
                            {activeContact.status === "online" && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-sm">{activeContact.name}</h2>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{activeContact.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <Video className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                        <button
                            onClick={() => setIsContextOpen(!isContextOpen)}
                            className={`p-2 rounded-full transition-colors ${isContextOpen ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
                        >
                            <Briefcase className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeContactId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {activeMessages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} group`}
                                >
                                    <div className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"} max-w-[75%]`}>
                                        {msg.type === "text" ? (
                                            <div className="relative">
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative z-10 ${msg.sender === "me"
                                                    ? "bg-indigo-600 text-white rounded-br-sm"
                                                    : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-sm"
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                                {/* Hover Reaction Icon */}
                                                <div className={`absolute top-0 ${msg.sender === "me" ? "-left-8" : "-right-8"} opacity-0 group-hover:opacity-100 transition-opacity p-1`}>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-gray-100 dark:border-slate-700">
                                                        <Smile className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <CampaignInvitationCard
                                                data={msg.content}
                                                onAction={(action) => handleInvitationAction(msg.id, action)}
                                            />
                                        )}
                                        <span className={`text-[10px] text-gray-300 dark:text-slate-600 mt-1 px-1 font-medium ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-gray-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Floating Input Bar */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                    <form onSubmit={handleSendMessage} className="relative">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg flex items-center p-2 pl-3 gap-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">

                            {/* Action Menu Trigger */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                                    className={`p-2 rounded-xl transition-all duration-300 ${isActionMenuOpen ? "bg-indigo-600 text-white rotate-45" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"}`}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>

                                {/* Slide-Up Action Menu */}
                                <AnimatePresence>
                                    {isActionMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                            className="absolute bottom-full left-0 mb-4 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden p-2"
                                        >
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 px-3 py-2 uppercase tracking-wider">Quick Actions</div>
                                            <button
                                                type="button"
                                                onClick={handleSendInvitation}
                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 transition-colors group"
                                            >
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Campaign Invite</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-slate-400">Send a formal offer</p>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-3 transition-colors group"
                                            >
                                                <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
                                                    <DollarSign className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Request Payment</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-slate-400">Create an invoice</p>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors group"
                                            >
                                                <div className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-slate-700 transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Attach File</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-slate-400">PDF, Images, etc.</p>
                                                </div>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 px-2"
                            />

                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="p-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-gray-900 rounded-xl transition-all shadow-sm"
                            >
                                <CornerUpLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Context Sidebar */}
            <AnimatePresence>
                {isContextOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden xl:flex flex-col overflow-hidden"
                    >
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Profile Card */}
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <img src={activeContact.avatar} alt={activeContact.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50 dark:ring-slate-800" />
                                    <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm border border-gray-100 dark:border-slate-700">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    </div>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeContact.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{activeContact.role}</p>
                                <button className="w-full py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                    View Full Profile
                                </button>
                            </div>

                            {/* Campaign Snapshot */}
                            {activeContact.activeCampaign && (
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Active Campaign</h3>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/20">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-100 leading-tight">{activeContact.activeCampaign.name}</h4>
                                            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                                {activeContact.activeCampaign.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-indigo-600/80 dark:text-indigo-400/80">
                                            <Clock className="w-3 h-3" />
                                            <span>Due {activeContact.activeCampaign.dueDate}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attachments Log */}
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Shared Files</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                                        <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-700 dark:text-slate-300 truncate">Contract_v1.pdf</p>
                                            <p className="text-[10px] text-gray-400">2.4 MB • Yesterday</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                                        <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-700 dark:text-slate-300 truncate">Moodboard_Final.jpg</p>
                                            <p className="text-[10px] text-gray-400">1.8 MB • 2 days ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MessagingPanel;
