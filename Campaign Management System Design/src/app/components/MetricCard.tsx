import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: number; // percentage
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  className?: string;
  highlight?: boolean; // For primary metrics like ROAS/Revenue
}

export function MetricCard({ title, value, change, trend = 'neutral', prefix, suffix, className, highlight = false }: MetricCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-5 transition-all",
      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md",
      highlight ? "ring-1 ring-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-900/10" : "",
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        {trend !== 'neutral' && change !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium rounded-full px-1.5 py-0.5",
            trend === 'up' ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" : "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-baseline gap-1">
        {prefix && <span className="text-lg font-medium text-slate-400 dark:text-slate-500">{prefix}</span>}
        <span className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums",
          highlight ? "text-indigo-900 dark:text-indigo-100" : "text-slate-900 dark:text-white"
        )}>
          {value}
        </span>
        {suffix && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}
