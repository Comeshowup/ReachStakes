
import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, CheckSquare, FileCheck, ShieldCheck, HelpCircle, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: CheckSquare, label: 'Active Campaigns', href: '/campaigns' },
    { icon: FileCheck, label: 'Approvals', href: '/approvals', badge: 3 },
    { icon: ShieldCheck, label: 'Escrow Vault', href: '/' }, // Set as root for this task
  ];

  return (
    <aside className={cn("w-64 bg-[#0F1115] text-white flex flex-col h-screen border-r border-white/5", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-sm">RS</div>
          <div>
            <h1 className="font-semibold text-sm leading-none">Reachstakes</h1>
            <p className="text-[10px] text-gray-400 mt-1 tracking-wider">BRAND PORTAL</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Overview</h3>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                    isActive 
                      ? "bg-white/10 text-white font-medium" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                      )}
                      <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300")} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Support</h3>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span>Contact Us</span>
              </a>
            </nav>
          </div>
          
           <div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Settings</h3>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <User className="w-4 h-4 text-gray-500" />
                <span>Profile</span>
              </a>
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-300 border border-indigo-500/20">B</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">Brand Account</p>
            <p className="text-[10px] text-gray-400 truncate">brand@reachstakes.com</p>
          </div>
        </div>
        <button className="w-full mt-3 flex items-center justify-center gap-2 text-xs text-rose-400 hover:text-rose-300 py-2 rounded border border-rose-500/20 hover:border-rose-500/40 transition-all bg-rose-500/5 hover:bg-rose-500/10">
            <LogOut className="w-3 h-3" />
            Log Out
        </button>
      </div>
    </aside>
  );
}
