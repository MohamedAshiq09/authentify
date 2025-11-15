import { AuthentifyConfig, ContractResult } from './types';
import bcrypt from 'bcryptjs';

// Custom error class used throughout the SDK
export class AuthentifyError extends Error {
  public code: string;
  public original?: any;
  constructor(message: string, code: string, original?: any) {
    super(message);
    this.code = code;
    this.original = original;
  }
}

// ----------- Identity & Credential Helpers -----------
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function validateUsername(username: string): void {
  if (!username) throw new AuthentifyError('Username required', 'INVALID_USERNAME');
  if (username.length < 3) throw new AuthentifyError('Username too short', 'INVALID_USERNAME');
  if (username.length > 32) throw new AuthentifyError('Username too long', 'INVALID_USERNAME');
  if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new AuthentifyError('Invalid username format', 'INVALID_USERNAME');
}

export function parseErrorMessage(error: any): string {
  if (!error) return 'Unknown error';
  if (error instanceof AuthentifyError) return error.message;
  if (typeof error === 'string') return error;
  return error.message || 'Unknown error';
}

// Parse a ContractResult<T> structure
export function parseContractResult<T>(result: ContractResult<T>): T {
  if ((result as any).Ok !== undefined) return (result as any).Ok as T;
  const err = (result as any).Err;
  throw new AuthentifyError('Contract error: ' + JSON.stringify(err), 'CONTRACT_ERROR', err);
}

/**
 * Validate SDK configuration
 */
export function validateConfig(config: AuthentifyConfig): void {
  if (!config.clientId) {
    throw new Error('clientId is required');
  }
  
  if (!config.apiUrl) {
    throw new Error('apiUrl is required');
  }
  
  if (!isValidURL(config.apiUrl)) {
    throw new Error('apiUrl must be a valid URL');
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a random string for challenges
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Base64 URL encode
 */
export function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
export function base64URLDecode(str: string): ArrayBuffer {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Format error message from API response
 */
export function formatError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// ----------- Safe Storage (SSR guard) -----------
export function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Create a promise that rejects after a timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}