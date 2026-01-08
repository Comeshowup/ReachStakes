import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Video, HelpCircle } from 'lucide-react';
import SupportChat from '../components/SupportChat';
import MeetingScheduler from '../components/MeetingScheduler';

const ContactUsPage = () => {
    const [activeTab, setActiveTab] = useState('chat');

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Support</h1>
                <p className="text-gray-500 dark:text-slate-400">
                    Need help with your campaign or account? Chat with us or book a strategy call.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl max-w-md">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'chat'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    Talk to Agent
                </button>
                <button
                    onClick={() => setActiveTab('meeting')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'meeting'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                        }`}
                >
                    <Video className="w-4 h-4" />
                    Book a Meeting
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 shadow-sm min-h-[600px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' ? (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Support</h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        Chat with a campaign manager instantly.
                                    </p>
                                </div>
                            </div>
                            <SupportChat />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="meeting"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule a Call</h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                        Book a 1:1 strategy session with our experts.
                                    </p>
                                </div>
                            </div>
                            <MeetingScheduler />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ContactUsPage;
