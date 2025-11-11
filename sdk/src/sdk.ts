import { ApiClient } from "./client";
import { ContractClient } from "./contract";
import {
  AuthentifyConfig,
  UserRegistration,
  UserLogin,
  AuthSession,
  UserProfile,
  IdentityInfo,
} from "./types";
import {
  validateUsername,
  validatePassword,
  validateEmail,
  hashPassword,
  parseErrorMessage,
  AuthentifyError,
} from "./utils";
import { DEFAULT_CONFIG, ERRORS } from "./constants";

export class AuthentifySDK {
  private config: AuthentifyConfig;
  private apiClient: ApiClient;
  private contractClient: ContractClient | null = null;
  private currentSession: AuthSession | null = null;
  private currentUser: UserProfile | null = null;

  constructor(config: AuthentifyConfig) {
    this.validateConfig(config);
    this.config = config;
    this.apiClient = new ApiClient(config);

    // Initialize contract client if contract address provided
    if (config.contractAddress) {
      this.contractClient = new ContractClient(config);
    }

    // Load existing session from storage
    this.loadSessionFromStorage();
  }

  private validateConfig(config: AuthentifyConfig): void {
    if (!config.clientId) {
      throw new AuthentifyError("Client ID is required", "INVALID_CONFIG");
    }
    if (!config.apiUrl) {
      throw new AuthentifyError("API URL is required", "INVALID_CONFIG");
    }
  }

  private loadSessionFromStorage(): void {
    try {
      const sessionData = localStorage.getItem(
        DEFAULT_CONFIG.SESSION_STORAGE_KEY
      );
      const userData = localStorage.getItem(DEFAULT_CONFIG.USER_STORAGE_KEY);

      if (sessionData) {
        this.currentSession = JSON.parse(sessionData);
      }

      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  private saveSessionToStorage(session: AuthSession, user: UserProfile): void {
    try {
      localStorage.setItem(
        DEFAULT_CONFIG.SESSION_STORAGE_KEY,
        JSON.stringify(session)
      );
      localStorage.setItem(
        DEFAULT_CONFIG.USER_STORAGE_KEY,
        JSON.stringify(user)
      );
    } catch (error) {
      // Ignore storage errors
    }
  }

  private clearSessionFromStorage(): void {
    try {
      localStorage.removeItem(DEFAULT_CONFIG.SESSION_STORAGE_KEY);
      localStorage.removeItem(DEFAULT_CONFIG.USER_STORAGE_KEY);
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Register a new user
   */
  public async register(data: UserRegistration): Promise<UserProfile> {
    try {
      // Validate inputs
      validateUsername(data.username);
      validatePassword(data.password);

      if (data.email) {
        validateEmail(data.email);
      }

      // Hash password client-side for security
      const passwordHash = await hashPassword(data.password);

      // Try contract registration first if available
      if (this.contractClient) {
        const contractResult = await this.contractClient.registerIdentity({
          username: data.username,
          password_hash: passwordHash,
          social_id_hash: data.socialIdHash || "",
          social_provider: data.socialProvider || "email",
        });

        // If contract registration successful, also register with backend
        if (contractResult) {
          const backendResult = await this.apiClient.register({
            ...data,
            password: passwordHash, // Send hashed password
          });
          return backendResult;
        }
      }

      // Fallback to backend only
      return await this.apiClient.register({
        ...data,
        password: passwordHash,
      });
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "REGISTRATION_FAILED",
        error
      );
    }
  }

  /**
   * Authenticate user and create session
   */
  public async login(credentials: UserLogin): Promise<AuthSession> {
    try {
      // Validate inputs
      if (credentials.username) {
        validateUsername(credentials.username);
      }
      if (credentials.email) {
        validateEmail(credentials.email);
      }
      validatePassword(credentials.password);

      // Hash password for authentication
      const passwordHash = await hashPassword(credentials.password);

      // Try contract authentication first if available
      if (this.contractClient && credentials.username) {
        const accountId = await this.contractClient.authenticate(
          credentials.username,
          passwordHash
        );

        if (accountId) {
          // Create session via contract
          const sessionId = `sess_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2)}`;
          const session = await this.contractClient.createSession(
            accountId,
            sessionId,
            24 * 60 * 60 * 1000 // 24 hours
          );

          if (session) {
            this.currentSession = session;

            // Also authenticate with backend for additional features
            try {
              const backendSession = await this.apiClient.login({
                ...credentials,
                password: passwordHash,
              });

              // Get user profile
              const user = await this.apiClient.getUserProfile();
              this.currentUser = user;
              this.saveSessionToStorage(session, user);

              return session;
            } catch (backendError) {
              // Backend auth failed, but contract auth succeeded
              console.warn("Backend authentication failed:", backendError);
              return session;
            }
          }
        }
      }

      // Fallback to backend authentication
      const session = await this.apiClient.login({
        ...credentials,
        password: passwordHash,
      });

      const user = await this.apiClient.getUserProfile();

      this.currentSession = session;
      this.currentUser = user;
      this.saveSessionToStorage(session, user);

      return session;
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "LOGIN_FAILED",
        error
      );
    }
  }

  /**
   * Logout and revoke session
   */
  public async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        // Revoke session in contract if available
        if (this.contractClient) {
          try {
            await this.contractClient.revokeSession(
              this.currentSession.sessionId
            );
          } catch (error) {
            console.warn("Contract session revocation failed:", error);
          }
        }

        // Revoke session in backend
        try {
          await this.apiClient.logout();
        } catch (error) {
          console.warn("Backend logout failed:", error);
        }
      }

      // Clear local state
      this.currentSession = null;
      this.currentUser = null;
      this.clearSessionFromStorage();
    } catch (error) {
      // Don't throw on logout errors, just clear local state
      this.currentSession = null;
      this.currentUser = null;
      this.clearSessionFromStorage();
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    if (!this.currentSession) return false;

    // Check if session is expired
    if (Date.now() > this.currentSession.expiresAt) {
      this.currentSession = null;
      this.currentUser = null;
      this.clearSessionFromStorage();
      return false;
    }

    return true;
  }

  /**
   * Get current user profile
   */
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Refresh session
   */
  public async refreshSession(): Promise<AuthSession> {
    try {
      if (!this.currentSession) {
        throw new AuthentifyError("No active session to refresh", "NO_SESSION");
      }

      // Try contract session verification first
      if (this.contractClient) {
        const isValid = await this.contractClient.verifySession(
          this.currentSession.sessionId
        );
        if (isValid) {
          return this.currentSession;
        }
      }

      // Refresh via backend
      const newSession = await this.apiClient.refreshSession();
      this.currentSession = newSession;

      if (this.currentUser) {
        this.saveSessionToStorage(newSession, this.currentUser);
      }

      return newSession;
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "REFRESH_FAILED",
        error
      );
    }
  }

  /**
   * Check if username is available
   */
  public async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      validateUsername(username);

      // Check with contract first if available
      if (this.contractClient) {
        return await this.contractClient.isUsernameAvailable(username);
      }

      // Fallback to backend check
      return await this.apiClient.isUsernameAvailable(username);
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "USERNAME_CHECK_FAILED",
        error
      );
    }
  }

  /**
   * Change user password
   */
  public async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw new AuthentifyError(
          "User not authenticated",
          "NOT_AUTHENTICATED"
        );
      }

      validatePassword(oldPassword);
      validatePassword(newPassword);

      const oldHash = await hashPassword(oldPassword);
      const newHash = await hashPassword(newPassword);

      // Try contract password change first if available
      if (this.contractClient) {
        await this.contractClient.changePassword(oldHash, newHash);
      }

      // Also update in backend
      await this.apiClient.changePassword(oldHash, newHash);
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "PASSWORD_CHANGE_FAILED",
        error
      );
    }
  }

  /**
   * Get identity information from contract
   */
  public async getIdentity(accountId: string): Promise<IdentityInfo | null> {
    try {
      if (!this.contractClient) {
        throw new AuthentifyError(
          "Contract client not initialized",
          "NO_CONTRACT_CLIENT"
        );
      }

      return await this.contractClient.getIdentity(accountId);
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "GET_IDENTITY_FAILED",
        error
      );
    }
  }

  /**
   * Get account ID by username from contract
   */
  public async getAccountByUsername(username: string): Promise<string | null> {
    try {
      if (!this.contractClient) {
        throw new AuthentifyError(
          "Contract client not initialized",
          "NO_CONTRACT_CLIENT"
        );
      }

      validateUsername(username);
      return await this.contractClient.getAccountByUsername(username);
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "GET_ACCOUNT_FAILED",
        error
      );
    }
  }

  /**
   * Get contract statistics
   */
  public async getStats(): Promise<{
    totalUsers: number;
    activeSessions: number;
  }> {
    try {
      if (!this.contractClient) {
        throw new AuthentifyError(
          "Contract client not initialized",
          "NO_CONTRACT_CLIENT"
        );
      }

      const totalUsers = await this.contractClient.getTotalUsers();
      const activeSessions = await this.contractClient.getActiveSessions();

      return { totalUsers, activeSessions };
    } catch (error) {
      throw new AuthentifyError(
        parseErrorMessage(error),
        "GET_STATS_FAILED",
        error
      );
    }
  }
}
