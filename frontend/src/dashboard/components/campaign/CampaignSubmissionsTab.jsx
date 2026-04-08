/**
 * CampaignSubmissionsTab — thin wrapper around the new SubmissionsModule.
 * Previously contained its own local submission logic; now delegates to the
 * feature-level module for a single source of truth.
 */
import React from 'react';
import { SubmissionsModule } from '../../../features/submissions/index.js';

/**
 * @param {{ collaborationId: string; campaign: object; }} props
 */
const CampaignSubmissionsTab = ({ collaborationId, campaign }) => {
  return (
    <SubmissionsModule
      campaignId={String(collaborationId)}
      campaign={campaign}
    />
  );
};

export default CampaignSubmissionsTab;
