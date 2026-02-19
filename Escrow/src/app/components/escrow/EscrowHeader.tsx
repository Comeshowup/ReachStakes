
import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

export function EscrowHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          Escrow Vault
        </h1>
        <p className="text-gray-400 text-sm max-w-lg">
          Manage campaign funding and track escrow balances. All funds are held in secure, segregated accounts.
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium cursor-help">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Escrow Protected</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 border-gray-800 text-gray-300 text-xs p-3 max-w-xs">
              Your funds are held in a regulated trust account and only released upon milestone completion.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
          Escrow Policy
          <Info className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
