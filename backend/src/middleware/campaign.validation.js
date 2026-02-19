/**
 * Campaign Validation Middleware
 * Validates create campaign request body before service execution
 */
export const validateCreateCampaign = (req, res, next) => {
    const errors = [];
    const body = req.body;

    // Title
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
        errors.push({ code: 'INVALID_TITLE', message: 'Title is required (min 3 characters)', field: 'title' });
    }

    // Objective
    const validObjectives = ['conversions', 'brand awareness', 'awareness', 'traffic', 'ugc creation', 'growth', 'roas'];
    if (!body.objective || !validObjectives.includes(body.objective.toLowerCase())) {
        errors.push({ code: 'INVALID_OBJECTIVE', message: `Objective must be one of: ${validObjectives.join(', ')}`, field: 'objective' });
    }

    // Total Budget
    const budget = parseFloat(body.totalBudget);
    if (isNaN(budget) || budget <= 0) {
        errors.push({ code: 'INVALID_BUDGET', message: 'Budget must be a positive number', field: 'totalBudget' });
    }

    // Target ROAS
    const targetRoas = parseFloat(body.targetRoas);
    if (isNaN(targetRoas) || targetRoas <= 0) {
        errors.push({ code: 'INVALID_ROAS', message: 'Target ROAS must be a positive number', field: 'targetRoas' });
    }

    // Escrow Percentage (optional — defaults to 0 if not provided)
    if (body.escrowPercentage !== undefined) {
        const escrowPct = parseFloat(body.escrowPercentage);
        if (isNaN(escrowPct) || escrowPct < 0 || escrowPct > 100) {
            errors.push({ code: 'INVALID_ESCROW', message: 'Escrow percentage must be between 0 and 100', field: 'escrowPercentage' });
        }
    } else {
        body.escrowPercentage = 0;
    }

    // Auto Pause Threshold
    const autoPause = parseFloat(body.autoPauseThreshold);
    if (body.autoPauseThreshold !== undefined && (isNaN(autoPause) || autoPause < 0 || autoPause > 100)) {
        errors.push({ code: 'INVALID_AUTO_PAUSE', message: 'Auto-pause threshold must be between 0 and 100', field: 'autoPauseThreshold' });
    }

    // Dates
    if (!body.startDate) {
        errors.push({ code: 'MISSING_START_DATE', message: 'Start date is required', field: 'startDate' });
    }
    if (!body.endDate) {
        errors.push({ code: 'MISSING_END_DATE', message: 'End date is required', field: 'endDate' });
    }
    if (body.startDate && body.endDate) {
        const start = new Date(body.startDate);
        const end = new Date(body.endDate);
        if (isNaN(start.getTime())) {
            errors.push({ code: 'INVALID_START_DATE', message: 'Invalid start date format', field: 'startDate' });
        }
        if (isNaN(end.getTime())) {
            errors.push({ code: 'INVALID_END_DATE', message: 'Invalid end date format', field: 'endDate' });
        }
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
            errors.push({ code: 'DATE_RANGE_INVALID', message: 'Start date must be before end date', field: 'startDate' });
        }
    }

    // Payment Model
    const validPaymentModels = ['cpa', 'cpc', 'cpm', 'flat_rate', 'hybrid'];
    if (body.paymentModel && !validPaymentModels.includes(body.paymentModel.toLowerCase())) {
        errors.push({ code: 'INVALID_PAYMENT_MODEL', message: `Payment model must be one of: ${validPaymentModels.join(', ')}`, field: 'paymentModel' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors,
        });
    }

    next();
};
