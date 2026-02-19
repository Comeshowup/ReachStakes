
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal, 
  Plus, 
  ArrowUpRight, 
  FileText, 
  RotateCcw,
  Wallet
} from 'lucide-react';
import { CampaignFunding } from '@/app/data/escrow';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";

interface CampaignFundingTableProps {
  campaigns: CampaignFunding[];
}

export function CampaignFundingTable({ campaigns }: CampaignFundingTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Draft': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'Completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="bg-[#14161A] border border-white/5 rounded-xl overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-white">Campaign Funding Intelligence</h3>
        <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-gray-400">Filter</Button>
            <Button variant="ghost" size="sm" className="text-xs text-gray-400">Export</Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-medium w-12"></th>
              <th className="px-6 py-4 font-medium">Campaign Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Target Budget</th>
              <th className="px-6 py-4 font-medium text-right">Funded / Rel.</th>
              <th className="px-6 py-4 font-medium w-48">Funding Progress</th>
              <th className="px-6 py-4 font-medium text-center">Health</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.length === 0 ? (
                <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Wallet className="w-6 h-6 text-gray-600" />
                            </div>
                            <h4 className="text-white font-medium mb-1">No active campaigns</h4>
                            <p className="text-sm mb-4">Create a campaign to start tracking funding.</p>
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Create Campaign</Button>
                        </div>
                    </td>
                </tr>
            ) : (
                campaigns.map((campaign) => {
                  const isExpanded = expandedRows.has(campaign.id);
                  const fundedPercent = (campaign.fundedAmount / campaign.targetBudget) * 100;
                  const releasedPercent = (campaign.releasedAmount / campaign.targetBudget) * 100; // Relative to target for the visualization
                  // Actually, released should be relative to funded if we want to show consumption of funds?
                  // The prompt says: "Base = Target, Fill 1 = Funded, Fill 2 = Released"
                  // So visually: [ Released | Funded-Released | Unfunded ]
                  
                  // Health Logic
                  let healthStatus = 'healthy';
                  if (campaign.status === 'Active' && campaign.fundedAmount < campaign.targetBudget && campaign.startDate) {
                      // Simple logic: if active and not fully funded, check if start date is passed
                      // For now, let's just mark it risk if funded < 50% of target and active
                      if (fundedPercent < 50) healthStatus = 'risk';
                      else if (fundedPercent < 100) healthStatus = 'watch';
                  }

                  return (
                    <React.Fragment key={campaign.id}>
                      <tr 
                        className={cn(
                            "hover:bg-white/[0.02] transition-colors group cursor-pointer",
                            isExpanded ? "bg-white/[0.02]" : ""
                        )}
                        onClick={() => toggleRow(campaign.id)}
                      >
                        <td className="px-6 py-4 text-center">
                          <button className="text-gray-500 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{campaign.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{campaign.milestones.length} Milestones</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", getStatusColor(campaign.status))}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-gray-300">
                          {formatCurrency(campaign.targetBudget)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-mono text-white">{formatCurrency(campaign.fundedAmount)}</div>
                          <div className="text-xs text-gray-500 font-mono">
                            {formatCurrency(campaign.releasedAmount)} rel.
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                            {/* Funded Bar */}
                            <div 
                                className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${fundedPercent}%` }}
                            />
                            {/* Released Bar (Overlay) */}
                            <div 
                                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-500 opacity-80"
                                style={{ width: `${releasedPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-medium">
                            <span>{Math.round(releasedPercent)}% Rel.</span>
                            <span>{Math.round(fundedPercent)}% Fun.</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex justify-center">
                                {healthStatus === 'healthy' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                {healthStatus === 'watch' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                                {healthStatus === 'risk' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1A1D24] border-gray-800 text-gray-300">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-gray-800" />
                              <DropdownMenuItem className="focus:bg-indigo-500/20 focus:text-indigo-400 cursor-pointer">
                                <Plus className="w-4 h-4 mr-2" /> Add Funds
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-emerald-500/20 focus:text-emerald-400 cursor-pointer">
                                <ArrowUpRight className="w-4 h-4 mr-2" /> Release Milestone
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                                <FileText className="w-4 h-4 mr-2" /> View Ledger
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-800" />
                              <DropdownMenuItem className="focus:bg-rose-500/20 focus:text-rose-400 cursor-pointer text-rose-400">
                                <RotateCcw className="w-4 h-4 mr-2" /> Withdraw Surplus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      
                      {/* Expanded Row Content */}
                      {isExpanded && (
                        <tr className="bg-[#0F1115]/50 border-b border-white/5">
                            <td colSpan={8} className="p-0">
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-200">
                                    <div className="lg:col-span-2">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Milestone Schedule</h4>
                                        <div className="space-y-3">
                                            {campaign.milestones.map((milestone, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                                                    <div className="flex items-center gap-3">
                                                        {milestone.status === 'released' ? (
                                                            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            </div>
                                                        ) : (
                                                            <div className="p-1 rounded-full bg-gray-500/20 text-gray-400">
                                                                <Clock className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-200">{milestone.name}</p>
                                                            <p className="text-xs text-gray-500">Due: {milestone.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-mono text-gray-300">{formatCurrency(milestone.amount)}</span>
                                                        <span className={cn(
                                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                                                            milestone.status === 'released' 
                                                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                                                                : "border-gray-500/20 bg-gray-500/10 text-gray-400"
                                                        )}>
                                                            {milestone.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="lg:col-span-1 border-l border-white/5 pl-8">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Funding Gap Analysis</h4>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Total Requirement</p>
                                                <p className="text-xl font-mono font-medium text-white">{formatCurrency(campaign.targetBudget)}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">Current Funding</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xl font-mono font-medium text-indigo-400">{formatCurrency(campaign.fundedAmount)}</p>
                                                    <span className="text-xs text-gray-500">{Math.round(fundedPercent)}%</span>
                                                </div>
                                                <Progress value={fundedPercent} className="h-1.5 mt-2 bg-white/5" />
                                            </div>

                                            {campaign.fundedAmount < campaign.targetBudget && (
                                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-4">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-xs font-bold text-amber-500 mb-1">Funding Gap Detected</p>
                                                            <p className="text-[11px] text-amber-200/70">
                                                                You need <strong>{formatCurrency(campaign.targetBudget - campaign.fundedAmount)}</strong> additional funds to fully cover all milestones.
                                                            </p>
                                                            <Button size="sm" variant="outline" className="h-7 text-xs mt-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300">
                                                                Add Funds Now
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
