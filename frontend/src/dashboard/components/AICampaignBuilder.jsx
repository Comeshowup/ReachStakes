import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Send,
    X,
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Check,
    Loader2,
    Edit3,
    Rocket,
    Target,
    Clock
} from 'lucide-react';

// Mock creator data for AI-generated suggestions
const MOCK_CREATORS = [
    { id: 1, name: 'Sarah Chen', handle: '@sarahstyle', followers: '2.3M', platform: 'Instagram', niche: 'Fashion', match: 95 },
    { id: 2, name: 'Mike Torres', handle: '@miketfitness', followers: '890K', platform: 'TikTok', niche: 'Lifestyle', match: 92 },
    { id: 3, name: 'Emma Davis', handle: '@emmadbeauty', followers: '1.5M', platform: 'YouTube', niche: 'Beauty', match: 89 },
    { id: 4, name: 'Jay Park', handle: '@jayparktech', followers: '650K', platform: 'TikTok', niche: 'Tech', match: 87 },
    { id: 5, name: 'Lisa Wong', handle: '@lisawtravel', followers: '1.1M', platform: 'Instagram', niche: 'Travel', match: 85 },
];

// Parse user input to extract campaign details
const parseUserInput = (input) => {
    const lower = input.toLowerCase();

    // Extract budget
    const budgetMatch = input.match(/\$?([\d,]+)k?/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1].replace(',', '')) * (lower.includes('k') ? 1000 : 1) : 50000;

    // Extract keywords for campaign type
    const isAwareness = lower.includes('awareness') || lower.includes('reach') || lower.includes('impressions');
    const isConversion = lower.includes('sales') || lower.includes('conversion') || lower.includes('revenue');

    // Extract timing
    const isSummer = lower.includes('summer');
    const isWinter = lower.includes('winter') || lower.includes('holiday');
    const isSpring = lower.includes('spring');

    return {
        budget: Math.max(10000, budget),
        type: isConversion ? 'Conversion' : isAwareness ? 'Awareness' : 'Brand Awareness',
        season: isSummer ? 'Summer' : isWinter ? 'Winter/Holiday' : isSpring ? 'Spring' : 'Q1 2026',
        creatorCount: Math.ceil(budget / 8000),
        projectedReach: Math.round(budget * 45),
        projectedROAS: (Math.random() * 5 + 8).toFixed(1),
    };
};

const TypingIndicator = () => (
    <div className="flex gap-1 px-4 py-3">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-brand-sky"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
        ))}
    </div>
);

const MessageBubble = ({ message, isUser }) => (
    <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
        <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                    ? 'bg-brand-sky text-black'
                    : 'bg-white/5 border border-white/10 text-white'
                }`}
        >
            {!isUser && (
                <div className="flex items-center gap-2 mb-2 text-xs text-brand-sky">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">ReachStakes AI</span>
                </div>
            )}
            <p className="text-sm leading-relaxed">{message}</p>
        </div>
    </motion.div>
);

const CreatorCard = ({ creator, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
    >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-sky/30 to-violet-500/30 flex items-center justify-center text-sm font-bold text-white">
            {creator.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{creator.name}</p>
            <p className="text-xs text-white/50">{creator.handle} · {creator.followers}</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold text-emerald-400">{creator.match}%</span>
            <p className="text-[10px] text-white/40">match</p>
        </div>
    </motion.div>
);

const ResultCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
        <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-white/50">{label}</span>
        </div>
        <p className="text-xl font-bold text-white">{value}</p>
    </motion.div>
);

const AICampaignBuilder = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { type: 'ai', text: "Hi! I'm your AI Campaign Builder. Tell me about the campaign you'd like to create. For example: \"I want to launch a summer collection campaign for $50K\"" }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [campaignData, setCampaignData] = useState(null);
    const [step, setStep] = useState('input'); // input, processing, review
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setInput('');
        setIsProcessing(true);
        setStep('processing');

        // Simulate AI processing
        await new Promise(r => setTimeout(r, 1500));

        setMessages(prev => [...prev, { type: 'ai', text: "Analyzing your campaign brief... 🔍" }]);
        await new Promise(r => setTimeout(r, 1000));

        setMessages(prev => [...prev, { type: 'ai', text: "Finding the perfect creators for your campaign... 👥" }]);
        await new Promise(r => setTimeout(r, 1200));

        setMessages(prev => [...prev, { type: 'ai', text: "Generating timeline and projections... 📊" }]);
        await new Promise(r => setTimeout(r, 1000));

        const parsed = parseUserInput(userMessage);
        setCampaignData(parsed);
        setStep('review');

        setMessages(prev => [...prev, {
            type: 'ai',
            text: "Perfect! I've created a campaign plan based on your brief. Here's what I recommend:"
        }]);

        setIsProcessing(false);
    };

    const handleApprove = () => {
        setMessages(prev => [...prev, {
            type: 'ai',
            text: "🚀 Campaign approved! Redirecting to campaign management..."
        }]);
        setTimeout(() => {
            onClose();
            // In production, navigate to campaign page
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#0a0a0b] border border-white/10 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-sky/20 to-violet-500/20">
                                <Sparkles className="w-5 h-5 text-brand-sky" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">AI Campaign Builder</h2>
                                <p className="text-xs text-white/50">Tell me about your campaign</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <X className="w-5 h-5 text-white/50" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 p-4 border-b border-white/5">
                        {['Input', 'Processing', 'Review'].map((s, i) => {
                            const stepIndex = ['input', 'processing', 'review'].indexOf(step);
                            const isActive = i === stepIndex;
                            const isComplete = i < stepIndex;
                            return (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? 'bg-emerald-500 text-white' :
                                            isActive ? 'bg-brand-sky text-black' :
                                                'bg-white/10 text-white/40'
                                        }`}>
                                        {isComplete ? <Check className="w-3 h-3" /> : i + 1}
                                    </div>
                                    <span className={`text-xs ${isActive ? 'text-white' : 'text-white/40'}`}>{s}</span>
                                    {i < 2 && <div className="w-8 h-px bg-white/10" />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex">
                        {/* Chat Column */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, i) => (
                                    <MessageBubble key={i} message={msg.text} isUser={msg.type === 'user'} />
                                ))}
                                {isProcessing && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Describe your ideal campaign..."
                                        disabled={step === 'review'}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-brand-sky/50 disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isProcessing || step === 'review'}
                                        className="px-4 py-3 rounded-xl bg-brand-sky text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-sky/90 transition-colors"
                                    >
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Results Panel */}
                        {campaignData && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="w-80 border-l border-white/10 p-4 overflow-y-auto"
                            >
                                <h3 className="text-sm font-semibold text-white mb-4">Campaign Summary</h3>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <ResultCard icon={DollarSign} label="Budget" value={`$${(campaignData.budget / 1000).toFixed(0)}K`} color="text-emerald-400" delay={0.1} />
                                    <ResultCard icon={Target} label="Type" value={campaignData.type} color="text-brand-sky" delay={0.15} />
                                    <ResultCard icon={Users} label="Creators" value={campaignData.creatorCount} color="text-violet-400" delay={0.2} />
                                    <ResultCard icon={TrendingUp} label="Proj. ROAS" value={`${campaignData.projectedROAS}x`} color="text-amber-400" delay={0.25} />
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="w-4 h-4 text-white/50" />
                                        <span className="text-xs text-white/50">Timeline</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Brief & Matching', days: '1-3' },
                                            { label: 'Creator Outreach', days: '4-7' },
                                            { label: 'Content Production', days: '8-21' },
                                            { label: 'Launch & Monitor', days: '22-30' },
                                        ].map((phase, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
                                                <span className="text-white/70">{phase.label}</span>
                                                <span className="text-white/40">Days {phase.days}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-white/50">Recommended Creators</span>
                                        <span className="text-xs text-brand-sky">{MOCK_CREATORS.length} matches</span>
                                    </div>
                                    <div className="space-y-2">
                                        {MOCK_CREATORS.slice(0, 4).map((creator, i) => (
                                            <CreatorCard key={creator.id} creator={creator} delay={0.3 + i * 0.05} />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <button
                                        onClick={handleApprove}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
                                    >
                                        <Rocket className="w-4 h-4" />
                                        Approve & Launch
                                    </button>
                                    <button
                                        onClick={() => setStep('input')}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Brief
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AICampaignBuilder;
