/**
 * Log Masking Utility
 * 
 * Prevents sensitive data (account numbers, IBANs, emails, API keys)
 * from appearing in server logs. PCI-DSS-style handling.
 * 
 * Usage:
 *   import { safeLog, maskSensitive } from '../utils/logMasker.js';
 *   safeLog('Processing payout', payloadObject);
 */

// Fields that should always be masked in logs
const SENSITIVE_FIELDS = new Set([
    'accountNumber', 'account_number',
    'iban', 'IBAN',
    'bankCode', 'bank_code', 'bank_codes',
    'routingNumber', 'routing_number',
    'pixKey', 'pix_key',
    'swiftCode', 'swift_code',
    'ifscCode', 'ifsc_code',
    'sortCode', 'sort_code',
    'abaCode', 'aba_code',
    'bsbCode', 'bsb_code',
    'email',
    'phone', 'phoneNumber', 'phone_number',
    'ssn', 'taxId', 'tax_id',
    'password', 'passwordHash', 'password_hash',
    'accessToken', 'access_token',
    'refreshToken', 'refresh_token',
    'apiKey', 'api_key',
    'apiSecret', 'api_secret',
    'Authorization', 'authorization',
    'secret', 'token',
    'dob', 'dateOfBirth', 'date_of_birth',
]);

// Patterns to detect and mask in string values
const SENSITIVE_PATTERNS = [
    { name: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, mask: (m) => m[0] + '***@***' },
    { name: 'phone', regex: /\+?\d{10,15}/g, mask: (m) => m.slice(0, 3) + '***' + m.slice(-2) },
];

/**
 * Mask a single value for logging.
 * Shows only last 4 chars for strings > 6 chars, otherwise fully masks.
 */
const maskValue = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return '***';
    if (typeof value !== 'string') return '***';

    if (value.length <= 4) return '****';
    if (value.length <= 8) return '••••' + value.slice(-2);
    return '••••••' + value.slice(-4);
};

/**
 * Recursively mask sensitive fields in an object.
 * Returns a NEW object (does not mutate the original).
 * 
 * @param {*} obj - The object to mask
 * @param {number} depth - Current recursion depth (max 10)
 * @returns {*} New object with sensitive fields masked
 */
export const maskSensitive = (obj, depth = 0) => {
    if (depth > 10) return '[MAX_DEPTH]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => maskSensitive(item, depth + 1));
    }

    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_FIELDS.has(key)) {
            masked[key] = maskValue(value);
        } else if (typeof value === 'object' && value !== null) {
            masked[key] = maskSensitive(value, depth + 1);
        } else {
            masked[key] = value;
        }
    }
    return masked;
};

/**
 * Mask sensitive patterns in a raw string.
 */
export const maskString = (str) => {
    if (typeof str !== 'string') return str;
    let result = str;
    for (const pattern of SENSITIVE_PATTERNS) {
        result = result.replace(pattern.regex, pattern.mask);
    }
    return result;
};

/**
 * Safe logging wrapper. Auto-masks sensitive fields before logging.
 * Drop-in replacement for console.log on sensitive payloads.
 * 
 * @param {string} label - Log label/prefix
 * @param {*} data - Data to log (will be masked)
 */
export const safeLog = (label, data) => {
    if (data === undefined) {
        console.log(label);
        return;
    }

    if (typeof data === 'object' && data !== null) {
        console.log(label, JSON.stringify(maskSensitive(data), null, 2));
    } else if (typeof data === 'string') {
        console.log(label, maskString(data));
    } else {
        console.log(label, data);
    }
};

/**
 * Safe error logging. Masks sensitive fields in error context.
 */
export const safeError = (label, error, context = null) => {
    const safeMessage = maskString(error?.message || String(error));
    if (context) {
        console.error(label, safeMessage, JSON.stringify(maskSensitive(context)));
    } else {
        console.error(label, safeMessage);
    }
};
