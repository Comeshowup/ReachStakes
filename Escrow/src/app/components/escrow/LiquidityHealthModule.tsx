
import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { LiquidityHealth } from '@/app/data/escrow';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';

interface LiquidityHealthModuleProps {
  data: LiquidityHealth;
}

export function LiquidityHealthModule({ data }: LiquidityHealthModuleProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          icon: ShieldCheck,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          title: 'Liquidity Healthy',
          barColor: 'bg-emerald-500',
          trackColor: 'bg-emerald-500/20'
        };
      case 'watch':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          title: 'Liquidity Watch',
          barColor: 'bg-amber-500',
          trackColor: 'bg-amber-500/20'
        };
      case 'risk':
        return {
          icon: AlertOctagon,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          title: 'Liquidity Risk',
          barColor: 'bg-rose-500',
          trackColor: 'bg-rose-500/20'
        };
      default:
        return {
            icon: ShieldCheck,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            title: 'Liquidity Healthy',
            barColor: 'bg-emerald-500',
            trackColor: 'bg-emerald-500/20'
        };
    }
  };

  const config = getStatusConfig(data.status);
  const Icon = config.icon;
  
  // Calculate percentage for progress bar (capped at 100%)
  // Assuming ratio 1.0 is 50%, 2.0 is 100%? Or just a visual representation.
  // Let's say 3.0 is max safe, so ratio / 3 * 100
  const progressPercent = Math.min((data.ratio / 3) * 100, 100);

  return (
    <div className={cn("rounded-xl border p-4 mb-8 flex items-center justify-between gap-6 transition-colors", config.bg, config.border)}>
      <div className="flex items-center gap-4 flex-1">
        <div className={cn("p-3 rounded-full border", config.bg, config.border, config.color)}>
            <Icon className="w-5 h-5" />
        </div>
        
        <div>
            <h3 className={cn("font-semibold text-sm", config.color)}>{config.title}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{data.explanation}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end min-w-[120px]">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Coverage Ratio</span>
            <span className={cn("text-xl font-bold font-mono", config.color)}>{data.ratio}x</span>
        </div>
        
        {/* Simple visual indicator of the ratio */}
        <div className="w-32 h-1.5 rounded-full bg-black/20 overflow-hidden relative">
            <div 
                className={cn("h-full rounded-full transition-all duration-500 ease-out", config.barColor)} 
                style={{ width: `${progressPercent}%` }}
            />
        </div>

        {data.status !== 'healthy' && (
            <Button size="sm" className={cn("ml-2 font-semibold shadow-lg", 
                data.status === 'risk' ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"
            )}>
                Add Funds
            </Button>
        )}
      </div>
    </div>
  );
}
