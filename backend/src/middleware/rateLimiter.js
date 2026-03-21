/**
 * In-memory Rate Limiter Middleware
 * 
 * Configurable per-user or per-IP rate limiting.
 * Designed for payout-sensitive endpoints.
 * 
 * Usage:
 *   import { createRateLimiter } from '../middleware/rateLimiter.js';
 *   router.post('/withdraw', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), handler);
 */

// Map of limiter instances: key -> { buckets: Map<string, { count, resetAt }>, cleanup interval }
const limiterInstances = new Map();

/**
 * Clean up expired entries periodically to prevent memory leaks.
 */
const startCleanup = (buckets, intervalMs = 60_000) => {
    return setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of buckets) {
            if (now > entry.resetAt) {
                buckets.delete(key);
            }
        }
    }, intervalMs);
};

/**
 * Create a rate limiter middleware with the given options.
 * 
 * @param {Object} options
 * @param {number} options.max - Maximum requests in the window (default: 10)
 * @param {number} options.windowMs - Window duration in milliseconds (default: 15 minutes)
 * @param {string} options.keyBy - Key strategy: 'user' (req.user.id) or 'ip' (req.ip) — default: 'user'
 * @param {string} options.message - Error message when rate limited
 * @returns {Function} Express middleware
 */
export const createRateLimiter = ({
    max = 10,
    windowMs = 15 * 60 * 1000,
    keyBy = 'user',
    message = 'Too many requests. Please wait before trying again.',
} = {}) => {
    const buckets = new Map();
    startCleanup(buckets);

    return (req, res, next) => {
        // Determine the rate limit key
        let key;
        if (keyBy === 'user' && req.user?.id) {
            key = `user:${req.user.id}`;
        } else {
            key = `ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
        }

        const now = Date.now();
        const entry = buckets.get(key);

        // No entry or window expired — start fresh
        if (!entry || now > entry.resetAt) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', max - 1);
            return next();
        }

        // Within window — check count
        if (entry.count >= max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', 0);
            return res.status(429).json({
                success: false,
                message,
                retryAfter,
            });
        }

        // Increment and continue
        entry.count++;
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - entry.count);
        return next();
    };
};

// ── Pre-configured limiters for common use cases ──────────────────────────────

/** Strict limiter for payout/withdrawal endpoints: 5 per 15 min */
export const payoutRateLimiter = createRateLimiter({
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many payout attempts. Please wait 15 minutes before trying again.',
});

/** Bank connection limiter: 5 per 15 min */
export const bankConnectRateLimiter = createRateLimiter({
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many bank connection attempts. Please wait 15 minutes before trying again.',
});

/** General API limiter: 60 per minute */
export const generalRateLimiter = createRateLimiter({
    max: 60,
    windowMs: 60 * 1000,
    keyBy: 'ip',
    message: 'Rate limit exceeded. Please slow down.',
});

/** Webhook limiter: generous for Tazapay retries — 100 per minute per IP */
export const webhookRateLimiter = createRateLimiter({
    max: 100,
    windowMs: 60 * 1000,
    keyBy: 'ip',
    message: 'Webhook rate limit exceeded.',
});
