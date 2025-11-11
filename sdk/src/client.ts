import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  AuthentifyConfig,
  UserRegistration,
  UserLogin,
  AuthSession,
  UserProfile,
  ApiResponse,
} from "./types";
import { DEFAULT_CONFIG, ENDPOINTS, ERRORS } from "./constants";
import { AuthentifyError, parseErrorMessage } from "./utils";

export class ApiClient {
  private client: AxiosInstance;
  private config: AuthentifyConfig;
  private accessToken: string | null = null;

  constructor(config: AuthentifyConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: DEFAULT_CONFIG.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        "X-Client-ID": config.clientId,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: any) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.accessToken = null;
          // Could trigger a refresh here
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);

      if (!response.data.success) {
        throw new AuthentifyError(
          response.data.error || response.data.message || "API request failed",
          "API_ERROR",
          response.data
        );
      }

      return response.data.data as T;
    } catch (error: any) {
      if (error instanceof AuthentifyError) {
        throw error;
      }

      if (error.response) {
        // Server error response
        throw new AuthentifyError(
          error.response.data?.error ||
            error.response.data?.message ||
            "Server error",
          "SERVER_ERROR",
          error.response.data
        );
      } else if (error.request) {
        // Network error
        throw new AuthentifyError(ERRORS.NETWORK_ERROR, "NETWORK_ERROR", error);
      } else {
        // Request setup error
        throw new AuthentifyError(
          parseErrorMessage(error),
          "REQUEST_ERROR",
          error
        );
      }
    }
  }

  /**
   * Register a new user
   */
  public async register(data: UserRegistration): Promise<UserProfile> {
    return this.request<UserProfile>({
      method: "POST",
      url: ENDPOINTS.AUTH.REGISTER,
      data,
    });
  }

  /**
   * Login user
   */
  public async login(credentials: UserLogin): Promise<AuthSession> {
    const response = await this.request<{
      user: UserProfile;
      session: AuthSession;
      accessToken: string;
    }>({
      method: "POST",
      url: ENDPOINTS.AUTH.LOGIN,
      data: credentials,
    });

    // Store access token for future requests
    this.accessToken = response.accessToken;

    return response.session;
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      await this.request<void>({
        method: "POST",
        url: ENDPOINTS.AUTH.LOGOUT,
      });
    } finally {
      this.accessToken = null;
    }
  }

  /**
   * Refresh session
   */
  public async refreshSession(): Promise<AuthSession> {
    const response = await this.request<{
      session: AuthSession;
      accessToken: string;
    }>({
      method: "POST",
      url: ENDPOINTS.AUTH.REFRESH,
    });

    this.accessToken = response.accessToken;
    return response.session;
  }

  /**
   * Get user profile
   */
  public async getUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>({
      method: "GET",
      url: ENDPOINTS.USER.PROFILE,
    });
  }

  /**
   * Update user profile
   */
  public async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>({
      method: "PUT",
      url: ENDPOINTS.USER.UPDATE,
      data,
    });
  }

  /**
   * Check if username is available
   */
  public async isUsernameAvailable(username: string): Promise<boolean> {
    const response = await this.request<{ available: boolean }>({
      method: "GET",
      url: `/auth/username-available/${encodeURIComponent(username)}`,
    });

    return response.available;
  }

  /**
   * Change password
   */
  public async changePassword(
    oldPasswordHash: string,
    newPasswordHash: string
  ): Promise<void> {
    return this.request<void>({
      method: "POST",
      url: "/auth/change-password",
      data: {
        oldPassword: oldPasswordHash,
        newPassword: newPasswordHash,
      },
    });
  }

  /**
   * Verify session
   */
  public async verifySession(sessionId: string): Promise<boolean> {
    try {
      const response = await this.request<{ valid: boolean }>({
        method: "POST",
        url: ENDPOINTS.AUTH.VERIFY,
        data: { sessionId },
      });

      return response.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set access token for authenticated requests
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear access token
   */
  public clearAccessToken(): void {
    this.accessToken = null;
  }
}
