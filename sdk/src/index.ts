// Export main SDK class
export { AuthentifySDK } from "./sdk";

// Export types
export type {
  AuthentifyConfig,
  IdentityInfo,
  SessionInfo,
  AuthSession,
  ContractResult,
  UserProfile,
  ApiResponse,
} from "./types";

// Export client classes
export { ApiClient } from "./client";
export { ContractClient } from "./contract";

// Export utilities
export {
  AuthentifyError,
  hashPassword,
  generateSessionId,
  parseContractResult,
} from "./utils";

// Export constants
export { DEFAULT_CONFIG, CONTRACT_METHODS, ENDPOINTS } from "./constants";

// Version
export const VERSION = "1.0.0";
