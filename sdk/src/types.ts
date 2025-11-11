// Core SDK types
export interface AuthentifyConfig {
  clientId: string;
  clientSecret?: string;
  apiUrl: string;
  contractAddress?: string;
  wsUrl?: string;
}

export interface UserRegistration {
  username: string;
  email?: string;
  password: string;
  socialIdHash?: string;
  socialProvider?: string;
  walletAddress?: string;
}

export interface UserLogin {
  username?: string;
  email?: string;
  password: string;
}

export interface IdentityInfo {
  username: string;
  password_hash: string;
  social_id_hash: string;
  social_provider: string;
  wallet_address: string;
  is_verified: boolean;
  created_at: number;
  last_login: number;
  failed_attempts: number;
  is_locked: boolean;
}

export interface SessionInfo {
  account: string;
  session_id: string;
  created_at: number;
  expires_at: number;
  is_active: boolean;
}

export interface AuthSession {
  sessionId: string;
  accountId: string;
  expiresAt: number;
  isActive: boolean;
}

export interface ContractError {
  IdentityAlreadyExists?: null;
  UsernameAlreadyTaken?: null;
  SocialIdAlreadyBound?: null;
  IdentityNotFound?: null;
  InvalidCredentials?: null;
  Unauthorized?: null;
  EmptyUsername?: null;
  EmptyPasswordHash?: null;
  EmptySocialIdHash?: null;
  UsernameTooShort?: null;
  UsernameTooLong?: null;
  InvalidUsernameFormat?: null;
  AccountLocked?: null;
  SessionNotFound?: null;
  SessionExpired?: null;
  SessionAlreadyRevoked?: null;
}

export type ContractResult<T> =
  | {
      Ok: T;
    }
  | {
      Err: ContractError;
    };

// Event types
export interface IdentityRegisteredEvent {
  account: string;
  username: string;
  social_provider: string;
  timestamp: number;
}

export interface LoginSuccessfulEvent {
  account: string;
  username: string;
  timestamp: number;
}

export interface SessionCreatedEvent {
  account: string;
  session_id: string;
  expires_at: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  walletAddress?: string;
  isVerified: boolean;
  createdAt: string;
}

// Hook types for React integration
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
