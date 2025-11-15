// SDK Configuration
export interface AuthentifyConfig {
  clientId: string;
  clientSecret?: string; // Optional for client-side usage
  apiUrl: string;
  timeout?: number;
}

// User Registration
export interface UserRegistration {
  email: string;
  password: string;
  username?: string;
  walletAddress?: string;
}

// User Login
export interface UserLogin {
  email: string;
  password: string;
}

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
  is_verified?: boolean;
}

// Authentication Session
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// Biometric Authentication
export interface BiometricOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: string;
    userVerification?: string;
  };
  timeout?: number;
  attestation?: string;
}

export interface BiometricAssertion {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
  type: string;
}

// React Hook Types
export interface UseAuthentifyReturn {
  user: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (data: UserRegistration) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  error: string | null;
}

// SDK Client Management (for developers)
export interface SDKClient {
  id: string;
  client_id: string;
  app_name: string;
  app_url?: string;
  redirect_uris: string[];
  created_at: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface APIError {
  success: false;
  message: string;
  error?: string;
}

// Wallet Integration
export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

// Contract Integration
export interface ContractIdentity {
  username: string;
  account_id: string;
  created_at: number;
  is_active: boolean;
}

// Statistics
export interface AuthStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  biometricUsers: number;
}