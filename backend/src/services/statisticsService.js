/**
 * Statistics Service
 * Statistical calculations for A/B testing and lift measurement
 */

/**
 * Calculate lift percentage between test and control groups
 * Formula: ((test - control) / control) * 100
 */
export const calculateLiftPercentage = (testValue, controlValue) => {
    if (controlValue === 0) {
        return testValue > 0 ? Infinity : 0;
    }
    return ((testValue - controlValue) / controlValue) * 100;
};

/**
 * Calculate absolute lift (incremental conversions/revenue)
 */
export const calculateAbsoluteLift = (testValue, controlValue) => {
    return testValue - controlValue;
};

/**
 * Calculate conversion rate
 */
export const calculateConversionRate = (conversions, impressions) => {
    if (impressions === 0) return 0;
    return (conversions / impressions) * 100;
};

/**
 * Calculate Chi-squared statistic for A/B test significance
 * Uses 2x2 contingency table approach
 */
export const calculateChiSquared = (testConversions, testTotal, controlConversions, controlTotal) => {
    // 2x2 contingency table:
    // |              | Converted | Not Converted | Total        |
    // | Test         | a         | b             | a + b        |
    // | Control      | c         | d             | c + d        |
    // | Total        | a + c     | b + d         | a + b + c + d|

    const a = testConversions;
    const b = testTotal - testConversions;
    const c = controlConversions;
    const d = controlTotal - controlConversions;
    const n = a + b + c + d;

    if (n === 0) return 0;

    // Expected values
    const expectedA = ((a + b) * (a + c)) / n;
    const expectedB = ((a + b) * (b + d)) / n;
    const expectedC = ((c + d) * (a + c)) / n;
    const expectedD = ((c + d) * (b + d)) / n;

    // Chi-squared with Yates correction for small samples
    const chiSquared =
        Math.pow(Math.abs(a - expectedA) - 0.5, 2) / expectedA +
        Math.pow(Math.abs(b - expectedB) - 0.5, 2) / expectedB +
        Math.pow(Math.abs(c - expectedC) - 0.5, 2) / expectedC +
        Math.pow(Math.abs(d - expectedD) - 0.5, 2) / expectedD;

    return chiSquared;
};

/**
 * Get p-value from chi-squared statistic (1 degree of freedom)
 * Using approximation for chi-squared CDF
 */
export const chiSquaredToPValue = (chiSquared) => {
    if (chiSquared <= 0) return 1;

    // Approximation using the regularized incomplete gamma function
    // For 1 degree of freedom: p = 1 - erf(sqrt(chi2/2))
    const x = Math.sqrt(chiSquared / 2);

    // Error function approximation (Abramowitz and Stegun)
    const t = 1 / (1 + 0.3275911 * x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;

    const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 1 - erf;
};

/**
 * Calculate p-value for A/B test
 */
export const calculatePValue = (testConversions, testTotal, controlConversions, controlTotal) => {
    const chiSquared = calculateChiSquared(testConversions, testTotal, controlConversions, controlTotal);
    return chiSquaredToPValue(chiSquared);
};

/**
 * Check if result is statistically significant at given alpha level
 */
export const isStatisticallySignificant = (pValue, alpha = 0.05) => {
    return pValue < alpha;
};

/**
 * Calculate confidence interval for lift
 * Uses normal approximation for difference in proportions
 */
export const calculateConfidenceInterval = (testConversions, testTotal, controlConversions, controlTotal, confidenceLevel = 0.95) => {
    if (testTotal === 0 || controlTotal === 0) {
        return { lower: 0, upper: 0 };
    }

    // Conversion rates
    const pTest = testConversions / testTotal;
    const pControl = controlConversions / controlTotal;

    // Relative lift
    const lift = pControl === 0 ? 0 : (pTest - pControl) / pControl;

    // Standard error of relative lift (delta method approximation)
    const seTest = Math.sqrt(pTest * (1 - pTest) / testTotal);
    const seControl = Math.sqrt(pControl * (1 - pControl) / controlTotal);

    // Combined standard error for relative lift
    const seLift = pControl === 0 ? 0 : Math.sqrt(
        Math.pow(seTest / pControl, 2) +
        Math.pow(pTest * seControl / Math.pow(pControl, 2), 2)
    );

    // Z-score for confidence level (95% = 1.96)
    const zScores = {
        0.90: 1.645,
        0.95: 1.96,
        0.99: 2.576
    };
    const z = zScores[confidenceLevel] || 1.96;

    return {
        lower: (lift - z * seLift) * 100,
        upper: (lift + z * seLift) * 100
    };
};

/**
 * Calculate minimum sample size needed for desired power
 * Based on desired MDE (minimum detectable effect)
 */
export const calculateMinSampleSize = (baselineConversionRate, minDetectableEffect, power = 0.8, alpha = 0.05) => {
    // Z-scores
    const zAlpha = 1.96; // For 95% confidence (two-tailed)
    const zBeta = power === 0.8 ? 0.84 : power === 0.9 ? 1.28 : 0.84;

    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate * (1 + minDetectableEffect);
    const pPooled = (p1 + p2) / 2;

    const n = Math.pow(
        zAlpha * Math.sqrt(2 * pPooled * (1 - pPooled)) +
        zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)),
        2
    ) / Math.pow(p1 - p2, 2);

    return Math.ceil(n);
};

/**
 * Calculate statistical power given sample size
 */
export const calculatePower = (sampleSize, baselineConversionRate, detectedEffect) => {
    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate * (1 + detectedEffect);
    const pPooled = (p1 + p2) / 2;

    const se = Math.sqrt(2 * pPooled * (1 - pPooled) / sampleSize);
    const z = Math.abs(p1 - p2) / se - 1.96;

    // Approximate normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return z > 0 ? 1 - prob : prob;
};

/**
 * Get human-readable significance interpretation
 */
export const getSignificanceInterpretation = (pValue, lift) => {
    if (pValue >= 0.1) {
        return {
            status: 'not_significant',
            message: 'Not enough data to draw conclusions',
            recommendation: 'Continue running the test to collect more data'
        };
    }

    if (pValue >= 0.05) {
        return {
            status: 'trending',
            message: `Trending ${lift > 0 ? 'positive' : 'negative'} but not yet significant`,
            recommendation: 'Results are suggestive but need more data for confidence'
        };
    }

    if (pValue >= 0.01) {
        return {
            status: 'significant',
            message: `Statistically significant ${lift > 0 ? 'lift' : 'decline'} detected`,
            recommendation: lift > 0
                ? 'The test group is performing better - consider rolling out'
                : 'The test group is underperforming - investigate the cause'
        };
    }

    return {
        status: 'highly_significant',
        message: `Highly significant ${lift > 0 ? 'lift' : 'decline'} detected`,
        recommendation: lift > 0
            ? 'Strong evidence of positive impact - confident to proceed'
            : 'Strong evidence of negative impact - action needed'
    };
};
