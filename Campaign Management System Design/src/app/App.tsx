import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  CreditCard, 
  PieChart, 
  Users, 
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline', size?: 'sm' | 'md' | 'lg' | 'icon' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border border-transparent',
      secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent',
      outline: 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-2 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

const Badge = ({ children, variant = 'neutral', className }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info', className?: string }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

// --- Mock Data & Pages (Placeholders for now) ---

// --- Layout ---

const SidebarItem = ({ icon: Icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
  <Link
    to={path}
    className={cn(
      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      active 
        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
    )}
  >
    <Icon className={cn('h-4 w-4', active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300')} />
    {label}
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode class on html element
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800 px-6">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            ReachStakes
          </div>
          <button 
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform
          </div>
          <SidebarItem icon={LayoutDashboard} label="Campaigns" path="/" active={location.pathname === '/' || location.pathname.startsWith('/campaigns')} />
          <SidebarItem icon={Users} label="Creators" path="/creators" active={location.pathname === '/creators'} />
          <SidebarItem icon={PieChart} label="Performance" path="/performance" active={location.pathname === '/performance'} />
          
          <div className="mt-6 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Finance
          </div>
          <SidebarItem icon={Wallet} label="Wallet & Escrow" path="/finance" active={location.pathname === '/finance'} />
          <SidebarItem icon={CreditCard} label="Transactions" path="/transactions" active={location.pathname === '/transactions'} />

          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
             <SidebarItem icon={Settings} label="Settings" path="/settings" active={location.pathname === '/settings'} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Breadcrumb placeholder or Title */}
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {location.pathname === '/' ? 'Campaigns' : 
               location.pathname.includes('create') ? 'Create Campaign' :
               location.pathname.includes('campaigns') ? 'Campaign Details' :
               'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="h-9 w-64 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            <div className="ml-2 h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-white dark:ring-slate-900"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Page Imports (Lazy loaded or defined later) ---
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CampaignList />} />
          <Route path="/campaigns/new" element={<CreateCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="*" element={<div className="flex h-full items-center justify-center text-slate-400">Page under construction</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}
