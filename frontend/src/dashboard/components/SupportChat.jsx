import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    CornerUpLeft,
    Smile,
    User,
    Bot,
    Clock
} from "lucide-react";

const INITIAL_MESSAGES = [
    {
        id: 1,
        sender: "agent",
        type: "text",
        content: "Hello! I'm your dedicated Campaign Manager. How can I help you today?",
        time: "Just now"
    }
];

const SupportChat = () => {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

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

        setMessages(prev => [...prev, newMessage]);
        setInputText("");

        // Simulate agent response
        setIsTyping(true);
        setTimeout(() => {
            const agentResponse = {
                id: Date.now() + 1,
                sender: "agent",
                type: "text",
                content: "Thanks for reaching out! I've received your query and will get back to you shortly.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, agentResponse]);
            setIsTyping(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col h-[600px] bg-gray-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 relative">

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} group`}
                        >
                            {msg.sender === "agent" && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-2 border border-indigo-200 dark:border-indigo-800">
                                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}

                            <div className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"} max-w-[75%]`}>
                                <div className="relative">
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "me"
                                        ? "bg-indigo-600 text-white rounded-br-sm"
                                        : "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-sm border border-gray-100 dark:border-slate-700"
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                                <span className={`text-[10px] text-gray-400 dark:text-slate-500 mt-1 px-1 font-medium ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                                    {msg.time}
                                </span>
                            </div>

                            {msg.sender === "me" && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center ml-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-2 border border-indigo-200 dark:border-indigo-800">
                                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center border border-gray-100 dark:border-slate-700 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                <form onSubmit={handleSendMessage} className="relative flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupportChat;
