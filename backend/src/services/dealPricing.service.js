const SUPPORTED_PRICING_MODELS = new Set(['flat_fee', 'cpm', 'hybrid', 'milestone', 'gifted', 'affiliate']);

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export class DealPricingService {
    static normalizePricingModel(value) {
        const model = String(value || 'flat_fee').trim().toLowerCase();
        return SUPPORTED_PRICING_MODELS.has(model) ? model : 'flat_fee';
    }

    static buildProposal(input = {}) {
        const proposedPrice = toNumber(input.proposedPrice ?? input.agreedPrice);
        const estimatedViews = toNumber(input.estimatedViews);
        const pricingModel = DealPricingService.normalizePricingModel(input.pricingModel);
        const calculatedCpm = proposedPrice && estimatedViews
            ? Number(((proposedPrice / estimatedViews) * 1000).toFixed(2))
            : null;

        return {
            proposedPrice: proposedPrice && proposedPrice > 0 ? proposedPrice : null,
            estimatedViews: estimatedViews && estimatedViews > 0 ? Math.round(estimatedViews) : null,
            pricingModel,
            calculatedCpm,
        };
    }

    static buildOffer(input = {}) {
        const agreedPrice = toNumber(input.agreedPrice);
        const proposedPrice = toNumber(input.proposedPrice ?? input.amount ?? input.agreedPrice);
        const estimatedViews = toNumber(input.estimatedViews);
        const pricingModel = DealPricingService.normalizePricingModel(input.pricingModel);
        const priceForCpm = agreedPrice || proposedPrice;
        const calculatedCpm = priceForCpm && estimatedViews
            ? Number(((priceForCpm / estimatedViews) * 1000).toFixed(2))
            : null;

        return {
            agreedPrice,
            proposedPrice: proposedPrice && proposedPrice > 0 ? proposedPrice : null,
            estimatedViews: estimatedViews && estimatedViews > 0 ? Math.round(estimatedViews) : null,
            pricingModel,
            calculatedCpm,
            offerTerms: input.offerTerms || null,
            offerExpiresAt: input.offerExpiresAt ? new Date(input.offerExpiresAt) : null,
        };
    }

    static buildOfferTerms({ existingTerms, actorRole, action, offer, message, deliverables, milestones }) {
        const history = Array.isArray(existingTerms?.history) ? existingTerms.history : [];
        const currentOffer = offer?.proposedPrice ? {
            amount: offer.proposedPrice,
            pricingModel: offer.pricingModel,
            estimatedViews: offer.estimatedViews,
            calculatedCpm: offer.calculatedCpm,
            deliverables: deliverables || existingTerms?.currentOffer?.deliverables || [],
            milestones: milestones || existingTerms?.currentOffer?.milestones || [],
            message: message || null,
            proposedBy: actorRole,
            proposedAt: new Date().toISOString(),
            expiresAt: offer.offerExpiresAt || null,
        } : existingTerms?.currentOffer || null;

        return {
            ...(existingTerms || {}),
            currentOffer,
            history: [
                ...history,
                {
                    actorRole,
                    action,
                    amount: offer?.proposedPrice || offer?.agreedPrice || null,
                    pricingModel: offer?.pricingModel || existingTerms?.currentOffer?.pricingModel || 'flat_fee',
                    message: message || null,
                    createdAt: new Date().toISOString(),
                },
            ],
        };
    }

    static assertOfferAllowed({ campaign, currentCollaboration, agreedPrice, proposedPrice, estimatedViews, nextStatus }) {
        const effectivePrice = agreedPrice ?? Number(currentCollaboration.agreedPrice || 0);
        const finalizingStatuses = new Set(['In_Progress', 'Approved', 'Paid']);

        if (finalizingStatuses.has(nextStatus) && !effectivePrice) {
            throw new Error('A deal must have an agreed price before it can move forward.');
        }

        const priceToValidate = agreedPrice ?? proposedPrice;
        if (priceToValidate === undefined || priceToValidate === null) return;
        if (!Number.isFinite(Number(priceToValidate)) || Number(priceToValidate) <= 0) {
            throw new Error('Offer amount must be a positive number.');
        }

        const targetBudget = Number(campaign.targetBudget || 0);
        const maxCreatorPayout = Number(campaign.maxCreatorPayout || 0);
        const guardrailMax = Number(campaign.budgetGuardrailMax || 0);
        const hardCap = maxCreatorPayout || guardrailMax || targetBudget;

        if (hardCap > 0 && Number(priceToValidate) > hardCap) {
            throw new Error(`Offer exceeds this campaign's creator payout cap of $${hardCap.toLocaleString()}.`);
        }

        const committed = (campaign.collaborations || [])
            .filter((collab) => collab.id !== currentCollaboration.id)
            .filter((collab) => !['Rejected'].includes(collab.status))
            .reduce((sum, collab) => sum + Number(collab.agreedPrice || 0), 0);

        if (targetBudget > 0 && committed + Number(priceToValidate) > targetBudget) {
            const remaining = Math.max(0, targetBudget - committed);
            throw new Error(`Offer exceeds remaining campaign budget. Remaining negotiable budget is $${remaining.toLocaleString()}.`);
        }

        const maxCpm = Number(campaign.maxCpm || 0);
        const viewsForCpm = Number(estimatedViews || currentCollaboration.estimatedViews || 0);
        if (maxCpm > 0 && viewsForCpm > 0) {
            const cpm = (Number(priceToValidate) / viewsForCpm) * 1000;
            if (cpm > maxCpm) {
                throw new Error(`Offer exceeds this campaign's CPM cap of $${maxCpm.toLocaleString()}.`);
            }
        }
    }
}
