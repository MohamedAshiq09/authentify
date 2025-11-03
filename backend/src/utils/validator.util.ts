export class ValidatorUtil {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Substrate address (basic validation)
   */
  static isValidAddress(address: string): boolean {
    // Basic Substrate address validation (SS58 format)
    // Addresses are typically 47-48 characters long and start with 1-9 or A-Z
    return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address);
  }

  /**
   * Validate Ethereum address (kept for compatibility)
   */
  static isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Validate URL
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize string input
   */
  static sanitize(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}