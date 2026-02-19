
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, FileText } from 'lucide-react';
import { EscrowTransaction } from '@/app/data/escrow';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';

interface RecentActivityFeedProps {
  transactions: EscrowTransaction[];
}

export function RecentActivityFeed({ transactions }: RecentActivityFeedProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getIcon = (type: string) => {
    switch(type) {
        case 'Funding': return ArrowDownLeft;
        case 'Release': return ArrowUpRight;
        case 'Adjustment': return RefreshCcw;
        default: return FileText;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
        case 'Funding': return 'bg-emerald-500/10 text-emerald-400';
        case 'Release': return 'bg-blue-500/10 text-blue-400';
        case 'Adjustment': return 'bg-gray-500/10 text-gray-400';
        default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <Card className="bg-[#14161A] border-white/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
        <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">Recent Escrow Activity</CardTitle>
        <Button variant="link" className="text-xs text-indigo-400 hover:text-indigo-300 h-auto p-0">
            View Full Ledger
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
            {transactions.map((tx) => {
                const Icon = getIcon(tx.type);
                return (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg transition-colors", getColor(tx.type))}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{tx.campaignName}</p>
                                <p className="text-xs text-gray-500">{tx.date} • {tx.type}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={cn(
                                "text-sm font-mono font-medium",
                                tx.type === 'Funding' ? "text-emerald-400" : "text-white"
                            )}>
                                {tx.type === 'Funding' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">{tx.status}</p>
                        </div>
                    </div>
                );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
