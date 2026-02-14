import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, Check, Instagram, Youtube, FileText, Camera, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * CreatorScoreWidget
 * 
 * Gamified profile completion with actionable tips.
 * Addresses creator pain point: discoverability by brands
 */

const SCORE_ITEMS = [
    { id: 'profile_photo', label: 'Add profile photo', points: 10, icon: Camera, path: '/creator/profile' },
    { id: 'bio', label: 'Write a compelling bio', points: 10, icon: FileText, path: '/creator/profile' },
    { id: 'instagram', label: 'Link Instagram', points: 15, icon: Instagram, path: '/creator/social-accounts' },
    { id: 'youtube', label: 'Link YouTube', points: 15, icon: Youtube, path: '/creator/social-accounts' },
    { id: 'media_kit', label: 'Complete media kit', points: 20, icon: FileText, path: '/creator/media-kit' },
    { id: 'portfolio', label: 'Add portfolio item', points: 10, icon: LinkIcon, path: '/creator/profile' },
];

const getScoreColor = (score) => {
    if (score >= 90) return { text: 'text-emerald-600', bg: 'bg-emerald-500', light: 'bg-emerald-100' };
    if (score >= 70) return { text: 'text-blue-600', bg: 'bg-blue-500', light: 'bg-blue-100' };
    if (score >= 50) return { text: 'text-indigo-600', bg: 'bg-indigo-500', light: 'bg-indigo-100' };
    if (score >= 30) return { text: 'text-orange-600', bg: 'bg-orange-500', light: 'bg-orange-100' };
    return { text: 'text-red-600', bg: 'bg-red-500', light: 'bg-red-100' };
};

const ScoreRing = ({ score }) => {
    const colors = getScoreColor(score);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="48" cy="48" r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                />
                <motion.circle
                    cx="48" cy="48" r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={colors.text}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${colors.text}`}>{score}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/100</span>
            </div>
        </div>
    );
};

const ActionItem = ({ item, completed, onClick }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onClick}
        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all
            ${completed
                ? 'bg-emerald-50 dark:bg-emerald-900/10'
                : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}
    >
        <div className={`p-1.5 rounded-md ${completed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-white dark:bg-slate-700'}`}>
            {completed ? (
                <Check className="w-4 h-4 text-emerald-600" />
            ) : (
                <item.icon className="w-4 h-4 text-indigo-500" />
            )}
        </div>

        <span className={`flex-1 text-sm font-medium ${completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
            {item.label}
        </span>

        <span className={`text-xs font-bold ${completed ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
            +{item.points}
        </span>
    </motion.div>
);

export default function CreatorScoreWidget({
    completedItems = [],
    showMax = 3
}) {
    const navigate = useNavigate();

    // Calculate score based on completed items
    const score = completedItems.reduce((total, id) => {
        const item = SCORE_ITEMS.find(i => i.id === id);
        return total + (item?.points || 0);
    }, 20); // Base score of 20

    // Get incomplete items for suggestions
    const incompleteItems = SCORE_ITEMS
        .filter(item => !completedItems.includes(item.id))
        .slice(0, showMax);

    const colors = getScoreColor(score);

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 ${colors.text}`} />
                    <h3 className="font-bold text-slate-900 dark:text-white">Creator Score</h3>
                </div>
                <button
                    onClick={() => navigate('/creator/profile')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                    Improve <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Score Display */}
            <div className="p-4 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent">
                <ScoreRing score={Math.min(score, 100)} />

                <div className="flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        {score >= 80
                            ? "Great job! Your profile stands out."
                            : score >= 50
                                ? "Good progress! Keep improving."
                                : "Complete tasks to boost visibility."}
                    </p>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(score, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${colors.bg}`}
                        />
                    </div>
                </div>
            </div>

            {/* Suggestions */}
            {incompleteItems.length > 0 && (
                <div className="p-4 pt-0">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                        Quick Wins
                    </p>
                    <div className="space-y-2">
                        {incompleteItems.map((item) => (
                            <ActionItem
                                key={item.id}
                                item={item}
                                completed={completedItems.includes(item.id)}
                                onClick={() => navigate(item.path)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* All Complete State */}
            {incompleteItems.length === 0 && (
                <div className="p-4 pt-0 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold">
                        <Check className="w-4 h-4" /> Profile Complete!
                    </div>
                </div>
            )}
        </div>
    );
}
