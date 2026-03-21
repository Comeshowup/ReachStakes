/**
 * Field-level AES-256-GCM Encryption Utility
 * 
 * Used for encrypting sensitive data (bank account numbers, etc.)
 * before any intermediate storage or processing.
 * 
 * NEVER store raw PII — always encrypt first.
 * 
 * Requires ENCRYPTION_KEY env var (64-char hex = 32-byte key).
 * Generate one: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;       // 128-bit IV for GCM
const TAG_LENGTH = 16;      // 128-bit auth tag
const ENCODING = 'hex';

/**
 * Get the encryption key from env, validating format.
 * @returns {Buffer}
 */
const getKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set. Cannot encrypt/decrypt sensitive data.');
    }
    if (key.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).');
    }
    return Buffer.from(key, 'hex');
};

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a string in format: iv:authTag:ciphertext (all hex-encoded).
 * 
 * @param {string} plaintext - The sensitive value to encrypt
 * @returns {string} Encrypted string (iv:tag:ciphertext)
 */
export const encrypt = (plaintext) => {
    if (!plaintext || typeof plaintext !== 'string') {
        return null;
    }

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext
    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
};

/**
 * Decrypt a value encrypted by encrypt().
 * 
 * @param {string} encryptedValue - The iv:tag:ciphertext string
 * @returns {string} Decrypted plaintext
 */
export const decrypt = (encryptedValue) => {
    if (!encryptedValue || typeof encryptedValue !== 'string') {
        return null;
    }

    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted value format. Expected iv:authTag:ciphertext.');
    }

    const key = getKey();
    const [ivHex, authTagHex, ciphertext] = parts;

    const iv = Buffer.from(ivHex, ENCODING);
    const authTag = Buffer.from(authTagHex, ENCODING);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

/**
 * Mask a sensitive value, showing only the last N characters.
 * 
 * @param {string} value - The value to mask
 * @param {number} visibleChars - Number of trailing characters to show (default: 4)
 * @returns {string} Masked string, e.g. "••••1234"
 */
export const mask = (value, visibleChars = 4) => {
    if (!value || typeof value !== 'string') return '••••';
    if (value.length <= visibleChars) return '•'.repeat(4) + value;
    const visible = value.slice(-visibleChars);
    const masked = '•'.repeat(Math.min(value.length - visibleChars, 8));
    return `${masked}${visible}`;
};

/**
 * Hash a value (one-way, for lookups without storing plaintext).
 * Uses SHA-256. Not reversible.
 * 
 * @param {string} value 
 * @returns {string} Hex-encoded hash
 */
export const hashValue = (value) => {
    if (!value) return null;
    return crypto.createHash('sha256').update(value).digest('hex');
};

/**
 * Validate that the encryption key is configured.
 * Call on server startup.
 */
export const validateEncryptionConfig = () => {
    try {
        getKey();
        console.log('✅ Encryption key configured');
        return true;
    } catch (err) {
        console.warn(`⚠️  Encryption: ${err.message}`);
        return false;
    }
};
