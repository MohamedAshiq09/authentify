import { api } from './client';
import { RegisterRequest, LoginRequest, User, TokenPair } from '../types/auth';

export const authApi = {
  /**
   * Register new user
   */
  register: async (data: RegisterRequest) => {
    return api.post<{ user: User; tokens: TokenPair }>('/auth/register', data);
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest) => {
    return api.post<{ user: User; tokens: TokenPair }>('/auth/login', data);
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get<{ user: User; oauthAccounts: any[] }>('/auth/profile');
    return response.data.data!;
  },

  /**
   * Update wallet address
   */
  updateWallet: async (walletAddress: string) => {
    const response = await api.put<{ user: User }>('/auth/wallet', {
      wallet_address: walletAddress,
    });
    return response.data.data!;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string) => {
    return api.post('/auth/password/reset', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (resetToken: string, newPassword: string) => {
    return api.post('/auth/password/reset/confirm', {
      reset_token: resetToken,
      new_password: newPassword,
    });
  },

  /**
   * OAuth callback
   */
  oauthCallback: async (provider: string, code: string) => {
    return api.post<{ user: User; tokens: TokenPair; isNewUser: boolean }>('/auth/oauth/callback', {
      provider,
      code,
    });
  },

  /**
   * Unlink OAuth account
   */
  unlinkOAuth: async (provider: string) => {
    return api.delete(`/auth/oauth/${provider}`);
  },

  /**
   * Contract-based login
   */
  contractLogin: async (username: string, password: string) => {
    return api.post<{ user: User; tokens: TokenPair }>('/auth/contract/login', {
      username,
      password,
    });
  },

  /**
   * Contract-based registration
   */
  contractRegister: async (data: {
    username: string;
    password: string;
    walletAddress: string;
    socialIdHash: string;
    socialProvider: string;
  }) => {
    return api.post<{ user: User; tokens: TokenPair; transactionHash?: string }>('/auth/contract/register', data);
  },
};