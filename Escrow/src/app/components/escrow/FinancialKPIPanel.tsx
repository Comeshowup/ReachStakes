
import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, CircleDollarSign, Wallet, Users, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { EscrowKPI } from '@/app/data/escrow';
import { Card, CardContent } from '@/app/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

interface FinancialKPIPanelProps {
  data: EscrowKPI;
}

const KPICard = ({ 
  title, 
  value, 
  delta, 
  subtext, 
  icon: Icon, 
  trend, 
  data, 
  color,
  primary = false
}: { 
  title: string; 
  value: string; 
  delta: string; 
  subtext: string; 
  icon: any; 
  trend: 'up' | 'down' | 'neutral'; 
  data: number[]; 
  color: string;
  primary?: boolean;
}) => {
  const chartData = data.map((val, i) => ({ value: val, index: i }));
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 group hover:shadow-lg border-white/5 bg-[#14161A]",
      primary ? "col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-900/20 to-[#14161A] border-indigo-500/20" : "hover:border-white/10"
    )}>
      <CardContent className="p-5 h-full flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              primary ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-gray-400 group-hover:text-white transition-colors"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</span>
          </div>
          {trend !== 'neutral' && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
              trend === 'up' 
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {delta}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className={cn("font-bold tracking-tight text-white mb-1", primary ? "text-3xl" : "text-2xl")}>
              {value}
            </h3>
            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              {subtext}
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <AlertCircle className="w-3 h-3 text-gray-600 hover:text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-700 text-xs p-2">
                    <p>Based on last 30 days activity.</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </p>
          </div>
          
          <div className="h-12 w-24 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color} 
                  strokeWidth={2} 
                  fill={`url(#gradient-${title})`} 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function FinancialKPIPanel({ data }: FinancialKPIPanelProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Primary Card - Spans 2 columns */}
      <div className="md:col-span-2">
        <div className="h-full relative overflow-hidden transition-all duration-300 group hover:shadow-lg border border-white/5 bg-[#14161A] rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-[#14161A] to-[#14161A]" />
            <div className="p-6 relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Escrow Balance</p>
                            <h2 className="text-4xl font-bold text-white mt-1">{formatCurrency(data.totalBalance)}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +12.5%
                    </div>
                </div>
                
                <div className="mt-6 flex items-end justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            Available across all campaigns
                            <TooltipProvider>
                                <UITooltip>
                                    <TooltipTrigger>
                                        <AlertCircle className="w-3.5 h-3.5 text-gray-600 hover:text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-gray-800 border-gray-700 text-xs p-2">
                                        <p>Includes allocated and unallocated funds.</p>
                                    </TooltipContent>
                                </UITooltip>
                            </TooltipProvider>
                        </p>
                    </div>
                    <div className="h-16 w-full max-w-[200px] opacity-60 group-hover:opacity-100 transition-opacity">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.history.totalBalance.map((v, i) => ({ value: v, index: i }))}>
                                <defs>
                                <linearGradient id="gradient-total" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#gradient-total)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-[#14161A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
        <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                    <CircleDollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Unallocated</span>
            </div>
             <div className="text-xs font-medium text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> -1.5%
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{formatCurrency(data.unallocated)}</h3>
        <p className="text-[11px] text-gray-500">Available for new campaigns</p>
         <div className="h-10 w-full mt-3 opacity-40 group-hover:opacity-80 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history.unallocated.map((v, i) => ({ value: v, index: i }))}>
                    <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} fill="none" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#14161A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
        <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Allocated</span>
            </div>
             <div className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +5.2%
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{formatCurrency(data.allocatedActive)}</h3>
        <p className="text-[11px] text-gray-500">Locked for 3 active campaigns</p>
         <div className="h-10 w-full mt-3 opacity-40 group-hover:opacity-80 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history.allocatedActive.map((v, i) => ({ value: v, index: i }))}>
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="none" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#14161A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
        <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Released</span>
            </div>
             <div className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +8.4%
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{formatCurrency(data.released)}</h3>
        <p className="text-[11px] text-gray-500">Paid to creators YTD</p>
         <div className="h-10 w-full mt-3 opacity-40 group-hover:opacity-80 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history.released.map((v, i) => ({ value: v, index: i }))}>
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="none" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#14161A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
        <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pending</span>
            </div>
             <div className="text-xs font-medium text-amber-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2.1%
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{formatCurrency(data.pendingRelease)}</h3>
        <p className="text-[11px] text-gray-500">Due in next 30 days</p>
         <div className="h-10 w-full mt-3 opacity-40 group-hover:opacity-80 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history.pendingRelease.map((v, i) => ({ value: v, index: i }))}>
                    <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="none" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
