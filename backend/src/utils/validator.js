/**
 * Input Validation Utility
 * 
 * Lightweight schema-based validation for API inputs.
 * Returns structured error messages for frontend consumption.
 * 
 * Usage:
 *   import { validateBankConnection, validateWithdrawal } from '../utils/validator.js';
 *   const errors = validateBankConnection(req.body);
 *   if (errors) return res.status(400).json({ success: false, errors });
 */

// ── Validation helpers ───────────────────────────────────────────────────────

const isString = (v) => typeof v === 'string' && v.trim().length > 0;
const isNumber = (v) => typeof v === 'number' && !isNaN(v);
const isPositiveNumber = (v) => isNumber(v) && v > 0;

const patterns = {
    countryCode: /^[A-Z]{2}$/,
    currencyCode: /^[A-Z]{3}$/,
    accountNumber: /^[0-9]{4,34}$/,
    iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/,
    bankCode: /^[A-Z0-9]{3,11}$/,
    bankName: /^[a-zA-Z0-9\s.&'\-]{2,100}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[0-9]{7,15}$/,
    pixKey: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+?\d{10,15}|\d{11,14}|[0-9a-f-]{32,36})$/,
    name: /^[a-zA-Z\s.\-']{2,100}$/,
};

// ── Sanitization ─────────────────────────────────────────────────────────────

/**
 * Sanitize a string input — remove dangerous characters.
 */
export const sanitize = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>"'&;(){}]/g, '').trim();
};

// ── Validation schemas ───────────────────────────────────────────────────────

/**
 * Validate bank connection input.
 * @param {Object} data - Request body
 * @returns {Array|null} Array of error objects, or null if valid
 */
export const validateBankConnection = (data) => {
    const errors = [];

    const country = sanitize(data.country).toUpperCase();
    const currency = sanitize(data.currency).toUpperCase();
    const bankName = sanitize(data.bankName);
    const accountNumber = sanitize(data.accountNumber);
    const bankCode = sanitize(data.bankCode).toUpperCase();
    const bankCodeType = sanitize(data.bankCodeType);
    const iban = sanitize(data.iban).toUpperCase().replace(/\s/g, '');
    const pixKey = sanitize(data.pixKey);

    // Required fields
    if (!country || !patterns.countryCode.test(country)) {
        errors.push({ field: 'country', message: 'Invalid country code. Must be a 2-letter ISO code (e.g. US, GB, IN).' });
    }

    if (!currency || !patterns.currencyCode.test(currency)) {
        errors.push({ field: 'currency', message: 'Invalid currency code. Must be a 3-letter ISO code (e.g. USD, GBP).' });
    }

    // Determine type
    const isPix = bankCodeType === 'pix_brl' || country === 'BR';
    const isIban = iban && iban.length > 0;

    if (isPix) {
        if (!pixKey || !patterns.pixKey.test(pixKey)) {
            errors.push({ field: 'pixKey', message: 'Invalid PIX key. Must be a valid email, phone, CPF, or random key.' });
        }
    } else if (isIban) {
        if (!patterns.iban.test(iban)) {
            errors.push({ field: 'iban', message: 'Invalid IBAN format.' });
        }
        if (!bankName || !patterns.bankName.test(bankName)) {
            errors.push({ field: 'bankName', message: 'Invalid bank name (2-100 characters).' });
        }
    } else {
        if (!accountNumber || !patterns.accountNumber.test(accountNumber)) {
            errors.push({ field: 'accountNumber', message: 'Invalid account number. Must be 4-34 digits.' });
        }
        if (!bankName || !patterns.bankName.test(bankName)) {
            errors.push({ field: 'bankName', message: 'Invalid bank name (2-100 characters).' });
        }
        if (bankCode && !patterns.bankCode.test(bankCode.replace(/[-\s]/g, ''))) {
            errors.push({ field: 'bankCode', message: 'Invalid bank/routing code. Must be 3-11 alphanumeric characters.' });
        }
    }

    return errors.length > 0 ? errors : null;
};

/**
 * Validate withdrawal request input.
 * @param {Object} data - Request body
 * @param {number} availableBalance - Creator's available balance
 * @returns {Array|null} Array of error objects, or null if valid
 */
export const validateWithdrawal = (data, availableBalance = 0) => {
    const errors = [];
    const amount = parseFloat(data.amount);

    if (!data.amount || isNaN(amount) || amount <= 0) {
        errors.push({ field: 'amount', message: 'A valid positive amount is required.' });
        return errors;
    }

    // Minimum withdrawal threshold
    const MIN_WITHDRAWAL = 25;
    if (amount < MIN_WITHDRAWAL) {
        errors.push({ field: 'amount', message: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}.` });
    }

    // Maximum 2 decimal places
    if (Math.round(amount * 100) / 100 !== amount) {
        errors.push({ field: 'amount', message: 'Amount can have at most 2 decimal places.' });
    }

    // Balance check
    if (amount > availableBalance) {
        errors.push({ field: 'amount', message: `Insufficient balance. Available: $${availableBalance.toFixed(2)}.` });
    }

    return errors.length > 0 ? errors : null;
};

/**
 * Validate payout initiation input (admin/system).
 * @param {Object} data - Request body
 * @returns {Array|null}
 */
export const validatePayoutInitiation = (data) => {
    const errors = [];

    if (!data.creatorId || typeof data.creatorId !== 'number') {
        errors.push({ field: 'creatorId', message: 'Valid creator ID is required.' });
    }

    const amount = parseFloat(data.amount);
    if (!data.amount || isNaN(amount) || amount <= 0) {
        errors.push({ field: 'amount', message: 'A valid positive amount is required.' });
    }

    if (data.currency && !patterns.currencyCode.test(data.currency)) {
        errors.push({ field: 'currency', message: 'Invalid currency code.' });
    }

    return errors.length > 0 ? errors : null;
};

/**
 * Validate identity/KYC input for onboarding.
 * @param {Object} data
 * @returns {Array|null}
 */
export const validateIdentity = (data) => {
    const errors = [];

    if (!data.fullName || !patterns.name.test(sanitize(data.fullName))) {
        errors.push({ field: 'fullName', message: 'Full legal name is required (2-100 characters).' });
    }

    if (!data.email || !patterns.email.test(data.email)) {
        errors.push({ field: 'email', message: 'Valid email address is required.' });
    }

    if (!data.country || !patterns.countryCode.test(sanitize(data.country).toUpperCase())) {
        errors.push({ field: 'country', message: 'Valid country code is required.' });
    }

    return errors.length > 0 ? errors : null;
};

/**
 * Express middleware factory for request validation.
 * @param {Function} validationFn - One of the validate* functions
 * @returns {Function} Express middleware
 */
export const validate = (validationFn) => {
    return (req, res, next) => {
        const errors = validationFn(req.body);
        if (errors) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }
        next();
    };
};
