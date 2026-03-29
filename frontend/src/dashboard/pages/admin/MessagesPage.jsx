import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const fetchThreads = () =>
  axios.get(`${API}/api/admin/messages/threads`, { headers: authHeader() }).then(r => r.data);

const MessagesPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'message-threads'], queryFn: fetchThreads, staleTime: 30_000 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">All campaign message threads across the platform.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-40" />
              <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-60" />
            </div>
          </div>
        ))}
        {!isLoading && data?.map((thread) => (
          <div key={thread.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {thread.sender?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{thread.campaign?.title || 'Campaign Thread'}</p>
              <p className="text-xs text-gray-400 truncate">{thread.content}</p>
            </div>
            <div className="text-xs text-gray-400 shrink-0">
              {new Date(thread.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
        {!isLoading && !data?.length && (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="w-8 h-8 text-gray-300 dark:text-zinc-600 mb-3" />
            <p className="text-gray-400">No message threads yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
