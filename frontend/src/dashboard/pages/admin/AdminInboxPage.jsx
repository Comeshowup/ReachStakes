import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Search, Filter, Paperclip,
  Clock, AlertCircle, CheckCircle, ChevronRight, User, Target,
  InboxIcon, Mail, Star, Archive, CornerDownLeft,
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TABS = ['All', 'Unread', 'Urgent', 'Campaign'];

// Mock data for graceful degradation
const MOCK_THREADS = [
  {
    id: 1, type: 'message', participant: 'Emma Wilson', role: 'Creator',
    subject: 'Re: Content submission for Nike Summer', preview: "I've uploaded the final edit, please let me know if you need any revisions.",
    time: new Date(Date.now() - 5 * 60000).toISOString(), unread: true, urgent: false,
    campaign: 'Nike Summer Splash', avatar: null,
    messages: [
      { id: 1, from: 'Emma Wilson', fromRole: 'Creator', body: "Hey team, I've submitted my first draft for the Nike campaign. Excited to hear feedback!", time: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: 2, from: 'Admin', fromRole: 'Admin', body: "Thanks Emma! We'll review it and get back to you shortly.", time: new Date(Date.now() - 1.5 * 3600000).toISOString() },
      { id: 3, from: 'Emma Wilson', fromRole: 'Creator', body: "I've uploaded the final edit, please let me know if you need any revisions.", time: new Date(Date.now() - 5 * 60000).toISOString() },
    ]
  },
  {
    id: 2, type: 'invitation', participant: 'Adidas Brand', role: 'Brand',
    subject: 'Campaign Invitation: Fall Collection 2026', preview: 'Adidas has invited 12 creators to join the Fall Collection campaign.',
    time: new Date(Date.now() - 2 * 3600000).toISOString(), unread: true, urgent: true,
    campaign: 'Adidas Fall Collection', avatar: null,
    messages: [
      { id: 1, from: 'Adidas Brand', fromRole: 'Brand', body: 'We are excited to launch our Fall Collection campaign and have selected 12 creators. Please review and approve the invitation list.', time: new Date(Date.now() - 2 * 3600000).toISOString() },
    ]
  },
  {
    id: 3, type: 'message', participant: 'Jake Torres', role: 'Creator',
    subject: 'Payout question', preview: "When will the payment be processed? It's been 5 days since approval.",
    time: new Date(Date.now() - 6 * 3600000).toISOString(), unread: false, urgent: true,
    campaign: null, avatar: null,
    messages: [
      { id: 1, from: 'Jake Torres', fromRole: 'Creator', body: "Hi, I was expecting my payment to arrive but haven't received it yet. When will the $950 be processed?", time: new Date(Date.now() - 8 * 3600000).toISOString() },
      { id: 2, from: 'Admin', fromRole: 'Admin', body: "Hi Jake! We're looking into this. Your payment is being processed and should arrive within 2 business days.", time: new Date(Date.now() - 6 * 3600000).toISOString() },
    ]
  },
  {
    id: 4, type: 'message', participant: 'Nike Brand', role: 'Brand',
    subject: 'Campaign deliverable feedback', preview: 'Approved 3 of 5 submitted deliverables. Two need revisions.',
    time: new Date(Date.now() - 24 * 3600000).toISOString(), unread: false, urgent: false,
    campaign: 'Nike Summer Splash', avatar: null,
    messages: [
      { id: 1, from: 'Nike Brand', fromRole: 'Brand', body: "We've reviewed the submitted content. Overall looks great! However, posts #3 and #5 need minor brand alignment adjustments.", time: new Date(Date.now() - 24 * 3600000).toISOString() },
    ]
  },
];

const Skeleton = ({ className = '' }) => (
  <div className={`bg-zinc-800/60 rounded animate-pulse ${className}`} />
);

const getInitial = (name = '') => name.charAt(0).toUpperCase();
const getAvatarBg = (name = '') => {
  const colors = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
  return colors[name.charCodeAt(0) % colors.length];
};

const formatTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const AdminInboxPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [reply, setReply] = useState('');
  const [threads, setThreads] = useState(MOCK_THREADS);

  const filtered = threads.filter(t => {
    if (activeTab === 'Unread' && !t.unread) return false;
    if (activeTab === 'Urgent' && !t.urgent) return false;
    if (activeTab === 'Campaign' && !t.campaign) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.participant.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sendReply = () => {
    if (!reply.trim() || !selectedThread) return;
    const newMsg = {
      id: Date.now(),
      from: 'Admin',
      fromRole: 'Admin',
      body: reply.trim(),
      time: new Date().toISOString(),
    };
    setThreads(prev => prev.map(t =>
      t.id === selectedThread.id
        ? { ...t, messages: [...t.messages, newMsg], preview: reply.trim(), time: newMsg.time, unread: false }
        : t
    ));
    setSelectedThread(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
    setReply('');
  };

  const unreadCount = threads.filter(t => t.unread).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <InboxIcon className="w-6 h-6 text-zinc-400" />
            Inbox
            {unreadCount > 0 && (
              <span className="text-sm font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Messages, invitations, and campaign conversations</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] h-[calc(100vh-220px)] min-h-[500px]">

          {/* Thread List */}
          <div className="border-r border-zinc-800 flex flex-col">
            {/* Tabs + Search */}
            <div className="p-3 border-b border-zinc-800 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 text-sm text-white rounded-lg placeholder-zinc-600 focus:outline-none focus:bg-zinc-700 transition-colors"
                />
              </div>
              <div className="flex gap-1">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                    {tab === 'Unread' && unreadCount > 0 && (
                      <span className="ml-1 text-[10px] text-blue-400">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Thread items */}
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-12 text-zinc-600">
                  <Mail className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No messages</p>
                </div>
              )}
              {filtered.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => {
                    setSelectedThread(thread);
                    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: false } : t));
                  }}
                  className={`w-full text-left px-4 py-3.5 border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-zinc-800' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${getAvatarBg(thread.participant)}`}>
                      {getInitial(thread.participant)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${thread.unread ? 'font-semibold text-white' : 'font-medium text-zinc-300'}`}>
                          {thread.participant}
                        </p>
                        <span className="text-[10px] text-zinc-600 shrink-0 ml-2">{formatTime(thread.time)}</span>
                      </div>
                      <p className={`text-xs mt-0.5 truncate ${thread.unread ? 'font-medium text-zinc-300' : 'text-zinc-500'}`}>
                        {thread.subject}
                      </p>
                      <p className="text-xs text-zinc-600 truncate mt-0.5">{thread.preview}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {thread.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        {thread.urgent && <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Urgent</span>}
                        {thread.type === 'invitation' && <span className="text-[10px] font-medium text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">Invitation</span>}
                        {thread.campaign && (
                          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                            <Target className="w-2.5 h-2.5" />{thread.campaign}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Thread Detail */}
          <div className="flex flex-col">
            {!selectedThread ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                <MessageSquare className="w-12 h-12 opacity-20 mb-3" />
                <p className="text-sm">Select a conversation</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="px-6 py-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white">{selectedThread.subject}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getAvatarBg(selectedThread.participant)} bg-opacity-20 text-zinc-300`}>
                      {selectedThread.role}
                    </span>
                    <span className="text-xs text-zinc-500">{selectedThread.participant}</span>
                    {selectedThread.campaign && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Target className="w-3 h-3" />{selectedThread.campaign}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {selectedThread.messages.map(msg => {
                    const isAdmin = msg.fromRole === 'Admin';
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isAdmin ? 'bg-red-600' : getAvatarBg(msg.from)}`}>
                          {getInitial(msg.from)}
                        </div>
                        <div className={`max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isAdmin
                              ? 'bg-red-600/20 text-zinc-100 rounded-tr-sm'
                              : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                          }`}>
                            {msg.body}
                          </div>
                          <span className="text-[10px] text-zinc-600">{formatTime(msg.time)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply box */}
                <div className="px-6 py-4 border-t border-zinc-800">
                  <div className="flex items-end gap-3 bg-zinc-800 rounded-xl p-3">
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply(); }}
                      placeholder="Write a reply... (⌘+Enter to send)"
                      rows={2}
                      className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 resize-none focus:outline-none"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim()}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-700 mt-1.5 pl-1">⌘+Enter to send</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInboxPage;
