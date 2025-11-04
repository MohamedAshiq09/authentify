/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Substrate address format
 */
export function isValidSubstrateAddress(address: string): boolean {
  // Basic validation - Substrate addresses are typically 47-48 characters
  if (!address || address.length < 47 || address.length > 48) {
    return false;
  }

  // Should start with a number or letter (base58 encoded)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  if (!username || username.length < 3 || username.length > 32) {
    return false;
  }

  // Only alphanumeric and underscore allowed
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}