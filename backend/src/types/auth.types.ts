export interface User {
  id: string;
  email: string;
  username?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface OAuthAccount {
  id: string;
  user_id: string;
  provider: 'google' | 'github' | 'twitter';
  provider_id: string;
  email: string;
  created_at: string;
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

export interface OAuthCallbackData {
  provider: string;
  provider_id: string;
  email: string;
  name?: string;
}