/**
 * RiskService — Stateless risk computation for campaigns.
 * Returns a 0-100 score and human-readable risk level.
 */
export class RiskService {
    /**
     * Compute a risk score for campaign data.
     * Higher score = higher risk. Considers budget size, escrow ratio, and timeline.
     * 
     * @param {Object} campaignData
     * @returns {number} Risk score 0-100
     */
    static async computeRisk(campaignData) {
        let score = 0;

        const budget = parseFloat(campaignData.totalBudget) || 0;
        const escrowPct = parseFloat(campaignData.escrowPercentage) || 0;
        const startDate = campaignData.startDate ? new Date(campaignData.startDate) : null;
        const endDate = campaignData.endDate ? new Date(campaignData.endDate) : null;

        // Budget risk: larger budgets carry more risk
        if (budget > 100000) score += 25;
        else if (budget > 50000) score += 15;
        else if (budget > 10000) score += 8;
        else score += 3;

        // Escrow ratio: lower escrow = higher risk
        if (escrowPct < 10) score += 30;
        else if (escrowPct < 20) score += 20;
        else if (escrowPct < 40) score += 10;
        else score += 2;

        // Timeline risk: very short campaigns are riskier
        if (startDate && endDate) {
            const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (durationDays < 7) score += 20;
            else if (durationDays < 14) score += 12;
            else if (durationDays < 30) score += 5;
            else score += 0;
        } else {
            score += 10; // Missing dates = moderate risk
        }

        // Cap at 100
        return Math.min(100, Math.max(0, score));
    }

    /**
     * Convert numeric risk score to human-readable level.
     * @param {number} score - 0-100
     * @returns {string} 'Low' | 'Medium' | 'High'
     */
    static getRiskLevel(score) {
        if (score <= 30) return 'Low';
        if (score <= 60) return 'Medium';
        return 'High';
    }
}
