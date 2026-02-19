
export interface EscrowKPI {
  totalBalance: number;
  allocatedActive: number;
  released: number;
  pendingRelease: number;
  unallocated: number;
  history: {
    totalBalance: number[];
    allocatedActive: number[];
    released: number[];
    pendingRelease: number[];
    unallocated: number[];
  };
}

export type LiquidityHealthStatus = 'healthy' | 'watch' | 'risk';

export interface LiquidityHealth {
  status: LiquidityHealthStatus;
  ratio: number;
  explanation: string;
}

export type CampaignStatus = 'Draft' | 'Active' | 'Completed';

export interface CampaignFunding {
  id: string;
  name: string;
  status: CampaignStatus;
  targetBudget: number;
  fundedAmount: number;
  releasedAmount: number;
  milestones: {
    name: string;
    amount: number;
    date: string;
    status: 'Pending' | 'released';
  }[];
  startDate?: string;
}

export interface EscrowTransaction {
  id: string;
  date: string;
  campaignName: string;
  type: 'Funding' | 'Release' | 'Adjustment';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

export const MOCK_KPI: EscrowKPI = {
  totalBalance: 145250,
  allocatedActive: 94412,
  released: 32500,
  pendingRelease: 18338,
  unallocated: 50838,
  history: {
    totalBalance: [120000, 125000, 130000, 128000, 135000, 140000, 145250],
    allocatedActive: [80000, 85000, 88000, 90000, 92000, 93000, 94412],
    released: [20000, 22000, 25000, 28000, 30000, 31000, 32500],
    pendingRelease: [15000, 16000, 17000, 17500, 18000, 18200, 18338],
    unallocated: [40000, 42000, 45000, 48000, 49000, 50000, 50838],
  }
};

export const MOCK_LIQUIDITY: LiquidityHealth = {
  status: 'healthy',
  ratio: 2.4,
  explanation: 'Available funds cover upcoming releases for the next 45 days.',
};

export const MOCK_CAMPAIGNS: CampaignFunding[] = [
  {
    id: '1',
    name: 'Summer Influencer Blast',
    status: 'Active',
    targetBudget: 50000,
    fundedAmount: 50000,
    releasedAmount: 15000,
    milestones: [
      { name: 'Initial Deposit', amount: 15000, date: '2026-02-01', status: 'released' },
      { name: 'Content Approval', amount: 20000, date: '2026-03-01', status: 'Pending' },
      { name: 'Completion', amount: 15000, date: '2026-04-01', status: 'Pending' },
    ],
    startDate: '2026-02-01',
  },
  {
    id: '2',
    name: 'Q3 Product Launch',
    status: 'Draft',
    targetBudget: 75000,
    fundedAmount: 0,
    releasedAmount: 0,
    milestones: [
      { name: 'Kickoff', amount: 25000, date: '2026-06-01', status: 'Pending' },
    ],
  },
  {
    id: '3',
    name: 'Tech Review Series',
    status: 'Active',
    targetBudget: 25000,
    fundedAmount: 25000,
    releasedAmount: 12500,
    milestones: [
      { name: 'Unboxing', amount: 12500, date: '2026-02-15', status: 'released' },
      { name: 'Final Review', amount: 12500, date: '2026-02-28', status: 'Pending' },
    ],
    startDate: '2026-02-10',
  },
  {
    id: '4',
    name: 'Holiday Spec',
    status: 'Active',
    targetBudget: 100000,
    fundedAmount: 40000, // Underfunded
    releasedAmount: 0,
    milestones: [
      { name: 'Concept', amount: 40000, date: '2026-10-01', status: 'Pending' },
      { name: 'Production', amount: 60000, date: '2026-11-01', status: 'Pending' },
    ],
    startDate: '2026-10-01',
  },
];

export const MOCK_TRANSACTIONS: EscrowTransaction[] = [
  { id: 'tx1', date: '2026-02-18', campaignName: 'Summer Influencer Blast', type: 'Funding', amount: 50000, status: 'Completed' },
  { id: 'tx2', date: '2026-02-15', campaignName: 'Tech Review Series', type: 'Release', amount: 12500, status: 'Completed' },
  { id: 'tx3', date: '2026-02-10', campaignName: 'Tech Review Series', type: 'Funding', amount: 25000, status: 'Completed' },
  { id: 'tx4', date: '2026-02-01', campaignName: 'Summer Influencer Blast', type: 'Release', amount: 15000, status: 'Completed' },
  { id: 'tx5', date: '2026-01-28', campaignName: 'Q1 Budget Load', type: 'Adjustment', amount: 100000, status: 'Completed' },
];
