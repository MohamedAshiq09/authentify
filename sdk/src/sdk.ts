import axios, { AxiosInstance } from 'axios';
import { 
  AuthentifyConfig, 
  UserRegistration, 
  UserLogin, 
  UserProfile, 
  AuthSession,
  BiometricOptions,
  BiometricAssertion
} from './types';
import { validateConfig, validateEmail, validatePassword } from './utils';

export class AuthentifySDK {
  private client: AxiosInstance;
  private config: AuthentifyConfig;
  private currentUser: UserProfile | null = null;
  private currentSession: AuthSession | null = null;

  constructor(config: AuthentifyConfig) {
    validateConfig(config);
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-ID': config.clientId,
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearSession();
        }
        return Promise.reject(error);
      }
    );

    // Load existing session
    this.loadStoredSession();
  }

  /**
   * Register a new user
   */
  async register(data: UserRegistration): Promise<UserProfile> {
    try {
      // Validate input
      if (!validateEmail(data.email)) {
        throw new Error('Invalid email address');
      }
      if (!validatePassword(data.password)) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await this.client.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        username: data.username,
        wallet_address: data.walletAddress,
      });

      const { user, tokens } = response.data.data;
      
      // Store session
      this.currentUser = user;
      this.currentSession = tokens;
      this.storeSession(tokens);

      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  /**
   * Login user with email/password
   */
  async login(credentials: UserLogin): Promise<AuthSession> {
    try {
      if (!validateEmail(credentials.email)) {
        throw new Error('Invalid email address');
      }

      const response = await this.client.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { user, tokens } = response.data.data;
      
      // Store session
      this.currentUser = user;
      this.currentSession = tokens;
      this.storeSession(tokens);

      return tokens;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Login with biometric authentication
   */
  async loginWithBiometric(email: string, assertion: BiometricAssertion): Promise<AuthSession> {
    try {
      const response = await this.client.post('/api/sdk/auth/authenticate-complete', {
        email,
        biometric_assertion: assertion,
      });

      const { user, tokens } = response.data.data;
      
      // Store session
      this.currentUser = user;
      this.currentSession = tokens;
      this.storeSession(tokens);

      return tokens;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Biometric login failed');
    }
  }

  /**
   * Enable biometric authentication for current user
   */
  async enableBiometric(username: string): Promise<BiometricOptions> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be logged in to enable biometric authentication');
      }

      const response = await this.client.post('/api/sdk/biometric/enable', {
        username,
        authenticator_type: 'platform',
      });

      return response.data.data.registration_options;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enable biometric authentication');
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        await this.client.post('/api/auth/logout');
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.currentUser && this.currentSession && this.getStoredToken());
  }

  /**
   * Refresh authentication session
   */
  async refreshSession(): Promise<AuthSession> {
    try {
      const refreshToken = this.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.client.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });

      const tokens = response.data.data;
      this.currentSession = tokens;
      this.storeSession(tokens);

      return tokens;
    } catch (error: any) {
      this.clearSession();
      throw new Error(error.response?.data?.message || 'Session refresh failed');
    }
  }

  /**
   * Change user password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be logged in to change password');
      }

      if (!validatePassword(newPassword)) {
        throw new Error('New password must be at least 8 characters long');
      }

      await this.client.post('/api/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const response = await this.client.get(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      return response.data.data.available;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Username check failed');
    }
  }

  /**
   * Get user profile with security details
   */
  async getProfile(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be logged in to get profile');
      }

      const response = await this.client.get('/api/sdk/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions(): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User must be logged in to revoke sessions');
      }

      await this.client.post('/api/sdk/sessions/revoke-all');
      this.clearSession();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to revoke sessions');
    }
  }

  // Private methods for session management
  private storeSession(tokens: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authentify_access_token', tokens.access_token);
      localStorage.setItem('authentify_refresh_token', tokens.refresh_token);
      localStorage.setItem('authentify_user', JSON.stringify(this.currentUser));
    }
  }

  private loadStoredSession(): void {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('authentify_access_token');
      const refreshToken = localStorage.getItem('authentify_refresh_token');
      const userStr = localStorage.getItem('authentify_user');

      if (accessToken && refreshToken && userStr) {
        try {
          this.currentUser = JSON.parse(userStr);
          this.currentSession = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600, // Default
            token_type: 'Bearer',
          };
        } catch (error) {
          this.clearSession();
        }
      }
    }
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authentify_access_token');
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authentify_refresh_token');
    }
    return null;
  }

  private clearSession(): void {
    this.currentUser = null;
    this.currentSession = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authentify_access_token');
      localStorage.removeItem('authentify_refresh_token');
      localStorage.removeItem('authentify_user');
    }
  }
}