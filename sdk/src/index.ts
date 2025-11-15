// Main SDK export
export { AuthentifySDK } from './sdk';

// Type exports
export type {
  AuthentifyConfig,
  UserRegistration,
  UserLogin,
  UserProfile,
  AuthSession,
  BiometricOptions,
  BiometricAssertion,
  UseAuthentifyReturn,
  SDKClient,
  APIResponse,
  APIError,
  WalletAccount,
  ContractIdentity,
  AuthStats,
} from './types';

// Utility exports
export {
  validateConfig,
  validateEmail,
  validatePassword,
  isValidURL,
  generateRandomString,
  base64URLEncode,
  base64URLDecode,
  formatError,
  debounce,
  isBrowser,
  safeJSONParse,
  withTimeout,
} from './utils';

// React integration exports (optional)
export {
  useAuthentify,
  useAuthentifyContext,
  useWallet,
  useBiometric,
  AuthentifyProvider,
} from './react/hooks';

// UI components (optional, Tailwind-friendly)
export { LoginCard } from './react/components/LoginCard';
export { RegisterCard } from './react/components/RegisterCard';