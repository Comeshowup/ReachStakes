
import React from 'react';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { Search, Bell, Moon, Calendar } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#0F1115] text-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0F1115]">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search campaigns, creators..." 
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 border border-white/5">
              <Calendar className="w-3.5 h-3.5" />
              <span>February 2026</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <Moon className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-[#0F1115]" />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
              + Create Campaign
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-[#0F1115] p-8">
            <div className="max-w-[1280px] mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
