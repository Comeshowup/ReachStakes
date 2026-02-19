import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  MoreHorizontal, 
  Filter, 
  Download,
  AlertTriangle,
  Clock,
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from '../components/MetricCard';

// --- Mock Data ---

const campaigns = [
  {
    id: 'cmp_1',
    name: 'Summer Lookbook 2024',
    status: 'Active',
    objective: 'Conversion',
    budget: 50000,
    spent: 32450,
    revenue: 145000,
    roas: 4.47,
    pacing: 65, // %
    creators: 12,
    endDate: '2024-08-31',
    risk: 'Low',
  },
  {
    id: 'cmp_2',
    name: 'Back to School Blast',
    status: 'At Risk',
    objective: 'Awareness',
    budget: 25000,
    spent: 22100,
    revenue: 45000,
    roas: 2.04,
    pacing: 88, // % (Overpacing)
    creators: 8,
    endDate: '2024-09-15',
    risk: 'High',
  },
  {
    id: 'cmp_3',
    name: 'Holiday Prep - Early Bird',
    status: 'Scheduled',
    objective: 'Traffic',
    budget: 15000,
    spent: 0,
    revenue: 0,
    roas: 0,
    pacing: 0,
    creators: 5,
    endDate: '2024-10-01',
    risk: 'None',
  },
  {
    id: 'cmp_4',
    name: 'Black Friday Teaser',
    status: 'Draft',
    objective: 'Leads',
    budget: 75000,
    spent: 0,
    revenue: 0,
    roas: 0,
    pacing: 0,
    creators: 0,
    endDate: '2024-11-20',
    risk: 'None',
  },
  {
    id: 'cmp_5',
    name: 'Influencer Seeding Q3',
    status: 'Active',
    objective: 'UGC',
    budget: 10000,
    spent: 4500,
    revenue: 12000,
    roas: 2.66,
    pacing: 45,
    creators: 25,
    endDate: '2024-09-30',
    risk: 'Medium',
  },
];

// --- Utility Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    'At Risk': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    Draft: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    Paused: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.Draft}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Active' ? 'bg-emerald-500' : status === 'At Risk' ? 'bg-red-500' : 'bg-current opacity-40'}`}></span>
      {status}
    </span>
  );
};

const RiskBadge = ({ risk }: { risk: string }) => {
  if (risk === 'None') return <span className="text-slate-400 text-xs">-</span>;
  
  const styles = {
    Low: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400',
    Medium: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
    High: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[risk]}`}>
      {risk === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
      {risk}
    </span>
  );
};

const ProgressBar = ({ value, risk }: { value: number, risk: string }) => {
  const color = risk === 'High' ? 'bg-red-500' : risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${color}`} 
          style={{ width: `${Math.min(value, 100)}%` }} 
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-8 text-right">{value}%</span>
    </div>
  );
};

// --- Page Component ---

export default function CampaignList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Campaigns</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage budget allocation and monitor capital efficiency.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={() => navigate('/campaigns/new')}
            className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Campaigns" value="3" suffix="/ 12 Total" />
        <MetricCard title="Total Budget" value="$175,000" trend="up" change={12} />
        <MetricCard title="Avg ROAS" value="3.12x" trend="down" change={4} highlight />
        <MetricCard title="Escrow Locked" value="$45,200" suffix="Secured" trend="neutral" className="border-l-4 border-l-indigo-500" />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
               <Download className="h-4 w-4" />
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Campaign Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Objective</th>
                <th className="px-4 py-3 font-medium text-right">Budget</th>
                <th className="px-4 py-3 font-medium text-right">Spent</th>
                <th className="px-4 py-3 font-medium text-right">Revenue</th>
                <th className="px-4 py-3 font-medium text-right">ROAS</th>
                <th className="px-4 py-3 font-medium">Pacing</th>
                <th className="px-4 py-3 font-medium text-center">Creators</th>
                <th className="px-4 py-3 font-medium">End Date</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((campaign) => (
                <tr 
                  key={campaign.id} 
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {campaign.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{campaign.objective}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-600 dark:text-slate-300">
                    ${campaign.budget.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                    ${campaign.spent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900 dark:text-white">
                    ${campaign.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    <span className={campaign.roas > 3 ? 'text-emerald-600' : campaign.roas > 2 ? 'text-amber-600' : 'text-slate-500'}>
                      {campaign.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProgressBar value={campaign.pacing} risk={campaign.risk} />
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">{campaign.creators}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{campaign.endDate}</td>
                  <td className="px-4 py-3">
                    <RiskBadge risk={campaign.risk} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-opacity" onClick={(e) => { e.stopPropagation(); /* Menu logic */ }}>
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                    No campaigns found. <span className="text-indigo-600 cursor-pointer" onClick={() => navigate('/campaigns/new')}>Create one?</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
           <div className="text-xs text-slate-500">
             Showing <span className="font-medium">1</span> to <span className="font-medium">{campaigns.length}</span> of <span className="font-medium">{campaigns.length}</span> results
           </div>
           <div className="flex items-center gap-2">
             <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-50" disabled>Previous</button>
             <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-50" disabled>Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
