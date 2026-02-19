import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  MoreHorizontal, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { MetricCard } from '../components/MetricCard';

// --- Mock Data ---
const performanceData = [
  { date: 'Aug 01', revenue: 4000, spend: 1200 },
  { date: 'Aug 02', revenue: 3000, spend: 1300 },
  { date: 'Aug 03', revenue: 2000, spend: 1100 },
  { date: 'Aug 04', revenue: 2780, spend: 1400 },
  { date: 'Aug 05', revenue: 1890, spend: 1500 },
  { date: 'Aug 06', revenue: 2390, spend: 1300 },
  { date: 'Aug 07', revenue: 3490, spend: 1600 },
];

const creators = [
  { id: 1, name: 'Sarah Jenkins', handle: '@sarahstyle', content: 3, spend: 1200, revenue: 5400, roas: 4.5, cpa: 12.50, status: 'Active' },
  { id: 2, name: 'Mike Chen', handle: '@mikeeats', content: 2, spend: 800, revenue: 1200, roas: 1.5, cpa: 25.00, status: 'Underperforming' },
  { id: 3, name: 'Jessica Wu', handle: '@jessicawu', content: 5, spend: 2500, revenue: 11000, roas: 4.4, cpa: 10.20, status: 'Active' },
  { id: 4, name: 'David Miller', handle: '@davemiller', content: 1, spend: 400, revenue: 800, roas: 2.0, cpa: 18.00, status: 'Paused' },
];

const activityLog = [
  { id: 1, type: 'budget', message: 'Budget increased by $5,000', user: 'Admin', time: '2h ago' },
  { id: 2, type: 'status', message: 'Campaign status changed to Active', user: 'System', time: '5h ago' },
  { id: 3, type: 'creator', message: 'New creator added: @sarahstyle', user: 'Manager', time: '1d ago' },
  { id: 4, type: 'payout', message: 'Escrow released for @jessicawu', user: 'Finance', time: '2d ago' },
];

// --- Components ---

const CapitalFlow = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
        <span>Total Budget ($50k)</span>
        <span>Runway: 12 Days</span>
      </div>
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
        {/* Spent */}
        <div className="h-full bg-slate-400 dark:bg-slate-600 w-[35%]" title="Spent: $17.5k"></div>
        {/* Escrow */}
        <div className="h-full bg-indigo-500 w-[25%]" title="Escrow Locked: $12.5k"></div>
        {/* Available */}
        <div className="h-full bg-emerald-500 w-[40%]" title="Available: $20k"></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
          <span>Spent ($17.5k)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <span>Escrow ($12.5k)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>Available ($20k)</span>
        </div>
      </div>
    </div>
  );
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Summer Lookbook 2024</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                Active
              </span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <span>ID: {id || 'cmp_12345'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Aug 1 - Aug 31, 2024</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Edit Campaign
          </button>
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Section 1: Performance Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Performance</h2>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {['7d', '30d', 'All'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Revenue" value="$28,450" change={12} trend="up" highlight />
          <MetricCard title="ROAS" value="3.42x" change={5} trend="up" highlight />
          <MetricCard title="Total Spend" value="$8,320" />
          <MetricCard title="CPA" value="$14.20" change={2} trend="down" />
        </div>

        {/* Main Chart */}
        <div className="h-80 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="spend" 
                stroke="#94a3b8" 
                strokeWidth={2} 
                fill="transparent" 
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Capital Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Capital Intelligence</h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="mb-6">
              <CapitalFlow />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
               <div>
                 <p className="text-xs text-slate-500 mb-1">Forecasted Spend</p>
                 <p className="text-lg font-semibold tabular-nums">$48,200</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 mb-1">Suggested Reallocation</p>
                 <p className="text-lg font-semibold tabular-nums text-emerald-600">+$2,500</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 mb-1">Escrow Efficiency</p>
                 <p className="text-lg font-semibold tabular-nums">94%</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                 <p className="text-lg font-semibold text-emerald-600 flex items-center gap-1">
                   Low <CheckCircle2 className="h-4 w-4" />
                 </p>
               </div>
            </div>
          </div>

          {/* Section 3: Creator Performance Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Creator Performance</h2>
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Creator</th>
                    <th className="px-4 py-3 font-medium text-center">Content</th>
                    <th className="px-4 py-3 font-medium text-right">Spend</th>
                    <th className="px-4 py-3 font-medium text-right">Revenue</th>
                    <th className="px-4 py-3 font-medium text-right">ROAS</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {creators.map((creator) => (
                    <tr key={creator.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{creator.name}</div>
                        <div className="text-xs text-slate-500">{creator.handle}</div>
                      </td>
                      <td className="px-4 py-3 text-center">{creator.content}</td>
                      <td className="px-4 py-3 text-right text-slate-500 tabular-nums">${creator.spend}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">${creator.revenue}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900 dark:text-white">{creator.roas.toFixed(1)}x</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                          ${creator.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 
                            creator.status === 'Paused' ? 'bg-slate-100 text-slate-600' : 
                            'bg-amber-50 text-amber-700'}`}>
                          {creator.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 4: Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activityLog.map((log) => (
                <div key={log.id} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${log.type === 'budget' ? 'bg-emerald-100 text-emerald-600' :
                      log.type === 'status' ? 'bg-blue-100 text-blue-600' :
                      log.type === 'creator' ? 'bg-purple-100 text-purple-600' :
                      'bg-amber-100 text-amber-600'}`}>
                    {log.type === 'budget' ? <DollarSign className="w-4 h-4" /> :
                     log.type === 'status' ? <Activity className="w-4 h-4" /> :
                     log.type === 'creator' ? <Users className="w-4 h-4" /> :
                     <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{log.user}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-xs text-slate-400">{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">View All Activity</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
