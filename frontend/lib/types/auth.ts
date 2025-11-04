export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  wallet_address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: TokenPair;
  };
}

export interface OAuthAccount {
  id: string;
  provider: string;
  provider_id: string;
  email: string;
  name?: string;
  created_at: string;
}