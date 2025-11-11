import {
  AuthentifyConfig,
  IdentityInfo,
  AuthSession,
} from "./types";
import { AuthentifyError, parseErrorMessage } from "./utils";

export class ContractClient {
  private config: AuthentifyConfig;
  private contract: any = null;
  private account: string | null = null;

  constructor(config: AuthentifyConfig) {
    if (!config.contractAddress) {
      throw new AuthentifyError(
        "Contract address is required",
        "INVALID_CONFIG"
      );
    }
    this.config = config;
    // Web3 initialization would happen on connectWallet or similar
  }

  /**
   * Register a new identity on the contract
   */
  public async registerIdentity(data: {
    username: string;
    password_hash: string;
    social_id_hash: string;
    social_provider: string;
  }): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const tx = await this.contract.methods
        .register_identity(
          data.username,
          data.password_hash,
          data.social_id_hash,
          data.social_provider
        )
        .send({ from: this.account });

      return !!tx.transactionHash;
    } catch (error) {
      throw new AuthentifyError(
        "Contract registration failed: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Authenticate user credentials against contract
   */
  public async authenticate(
    username: string,
    passwordHash: string
  ): Promise<string | null> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const result = await this.contract.methods
        .authenticate(username, passwordHash)
        .call();

      return result ? result : null;
    } catch (error) {
      throw new AuthentifyError(
        "Contract authentication failed: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Create a new session on the contract
   */
  public async createSession(
    accountId: string,
    sessionId: string,
    duration: number
  ): Promise<AuthSession | null> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const expiresAt = Date.now() + duration;

      await this.contract.methods
        .create_session(accountId, sessionId, Math.floor(expiresAt / 1000))
        .send({ from: this.account });

      return {
        sessionId,
        accountId,
        expiresAt,
        isActive: true,
      };
    } catch (error) {
      throw new AuthentifyError(
        "Session creation failed: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Verify if a session is valid
   */
  public async verifySession(sessionId: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const isValid = await this.contract.methods
        .verify_session(sessionId)
        .call();

      return !!isValid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke a session
   */
  public async revokeSession(sessionId: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      await this.contract.methods
        .revoke_session(sessionId)
        .send({ from: this.account });

      return true;
    } catch (error) {
      throw new AuthentifyError(
        "Session revocation failed: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Get identity information
   */
  public async getIdentity(accountId: string): Promise<IdentityInfo | null> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const identity = await this.contract.methods
        .get_identity(accountId)
        .call();

      if (!identity) {
        return null;
      }

      return {
        username: identity.username || "",
        password_hash: identity.password_hash || "",
        social_id_hash: identity.social_id_hash || "",
        social_provider: identity.social_provider || "",
        wallet_address: identity.wallet_address || "",
        is_verified: identity.is_verified || false,
        created_at: identity.created_at || 0,
        last_login: identity.last_login || 0,
        failed_attempts: identity.failed_attempts || 0,
        is_locked: identity.is_locked || false,
      };
    } catch (error) {
      throw new AuthentifyError(
        "Failed to get identity: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Get account ID by username
   */
  public async getAccountByUsername(username: string): Promise<string | null> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const accountId = await this.contract.methods
        .get_account_by_username(username)
        .call();

      return accountId || null;
    } catch (error) {
      throw new AuthentifyError(
        "Failed to get account: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Check if username is available
   */
  public async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const available = await this.contract.methods
        .is_username_available(username)
        .call();

      return !!available;
    } catch (error) {
      throw new AuthentifyError(
        "Failed to check username availability: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Change password on contract
   */
  public async changePassword(
    oldPasswordHash: string,
    newPasswordHash: string
  ): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      await this.contract.methods
        .change_password(oldPasswordHash, newPasswordHash)
        .send({ from: this.account });

      return true;
    } catch (error) {
      throw new AuthentifyError(
        "Password change failed: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Get total number of users
   */
  public async getTotalUsers(): Promise<number> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const total = await this.contract.methods.get_total_users().call();
      return parseInt(total, 10) || 0;
    } catch (error) {
      throw new AuthentifyError(
        "Failed to get total users: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Get number of active sessions
   */
  public async getActiveSessions(): Promise<number> {
    try {
      if (!this.contract) {
        throw new AuthentifyError(
          "Contract not initialized",
          "CONTRACT_NOT_INITIALIZED"
        );
      }

      const active = await this.contract.methods.get_active_sessions().call();
      return parseInt(active, 10) || 0;
    } catch (error) {
      throw new AuthentifyError(
        "Failed to get active sessions: " + parseErrorMessage(error),
        "CONTRACT_ERROR",
        error
      );
    }
  }

  /**
   * Set the Web3 account to use for transactions
   */
  public setAccount(account: string): void {
    this.account = account;
  }

  /**
   * Connect to a Web3 provider (for browser environments)
   */
  public async connectWallet(): Promise<string[]> {
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new AuthentifyError(
          "Web3 provider not available",
          "WEB3_NOT_AVAILABLE"
        );
      }

      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
      }

      return accounts;
    } catch (error) {
      throw new AuthentifyError(
        "Failed to connect wallet: " + parseErrorMessage(error),
        "WALLET_CONNECT_FAILED",
        error
      );
    }
  }
}
