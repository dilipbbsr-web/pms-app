/**
 * utils/passwordGenerator.js
 * Generates a strong, random temporary password.
 * Format: Uppercase + lowercase + digits + symbols, min 10 chars.
 * Uses the browser's crypto API for true randomness (not Math.random).
 */

const UPPER   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER   = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS  = '23456789';
const SYMBOLS = '@#$!%&*';
const ALL     = UPPER + LOWER + DIGITS + SYMBOLS;

function randomChar(set) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return set[arr[0] % set.length];
}

/**
 * Generates a secure temporary password.
 * Guarantees at least 1 uppercase, 1 lowercase, 1 digit, 1 symbol.
 * @param {number} length - Total length (default 10)
 * @returns {string}
 */
export function generatePassword(length = 10) {
  const required = [
    randomChar(UPPER),
    randomChar(LOWER),
    randomChar(DIGITS),
    randomChar(SYMBOLS),
  ];
  const rest = Array.from({ length: length - 4 }, () => randomChar(ALL));
  const combined = [...required, ...rest];

  // Shuffle using Fisher-Yates + crypto
  for (let i = combined.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join('');
}

/**
 * Validates a password meets minimum requirements.
 * @param {string} pwd
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(pwd) {
  if (!pwd || pwd.length < 8)
    return { valid: false, message: 'Minimum 8 characters required' };
  if (!/[A-Z]/.test(pwd))
    return { valid: false, message: 'Must include at least one uppercase letter' };
  if (!/[a-z]/.test(pwd))
    return { valid: false, message: 'Must include at least one lowercase letter' };
  if (!/[0-9]/.test(pwd))
    return { valid: false, message: 'Must include at least one digit' };
  return { valid: true, message: 'Strong password' };
}
