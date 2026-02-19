
import React from 'react';
import { EscrowHeader } from '@/app/components/escrow/EscrowHeader';
import { FinancialKPIPanel } from '@/app/components/escrow/FinancialKPIPanel';
import { LiquidityHealthModule } from '@/app/components/escrow/LiquidityHealthModule';
import { CampaignFundingTable } from '@/app/components/escrow/CampaignFundingTable';
import { RecentActivityFeed } from '@/app/components/escrow/RecentActivityFeed';
import { MOCK_KPI, MOCK_LIQUIDITY, MOCK_CAMPAIGNS, MOCK_TRANSACTIONS } from '@/app/data/escrow';
import { motion } from 'motion/react';

export default function EscrowVault() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <EscrowHeader />
      
      <section>
        <FinancialKPIPanel data={MOCK_KPI} />
      </section>

      <section>
        <LiquidityHealthModule data={MOCK_LIQUIDITY} />
      </section>

      <section>
        <CampaignFundingTable campaigns={MOCK_CAMPAIGNS} />
      </section>

      <section>
        <h3 className="font-semibold text-white mb-4">Recent Escrow Activity</h3>
        <RecentActivityFeed transactions={MOCK_TRANSACTIONS} />
      </section>
    </div>
  );
}
