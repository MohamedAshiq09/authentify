export const DEFAULT_CONFIG = {
  API_TIMEOUT: 10000,
  SESSION_STORAGE_KEY: "authentify_session",
  USER_STORAGE_KEY: "authentify_user",
  CONTRACT_DEFAULT_GAS: "1000000000000",
  CONTRACT_DEFAULT_VALUE: 0,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY: "/auth/verify",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/update",
  },
  CONTRACT: {
    DEPLOY: "/contract/deploy",
    INTERACT: "/contract/interact",
  },
};

export const CONTRACT_METHODS = {
  REGISTER_IDENTITY: "register_identity",
  AUTHENTICATE: "authenticate",
  CREATE_SESSION: "create_session",
  VERIFY_SESSION: "verify_session",
  REVOKE_SESSION: "revoke_session",
  GET_IDENTITY: "get_identity",
  GET_ACCOUNT_BY_USERNAME: "get_account_by_username",
  IS_USERNAME_AVAILABLE: "is_username_available",
  CHANGE_PASSWORD: "change_password",
  VERIFY_IDENTITY: "verify_identity",
  GET_ADMIN: "get_admin",
  GET_TOTAL_USERS: "get_total_users",
} as const;

export const ERRORS = {
  NETWORK_ERROR: "Network error occurred",
  INVALID_CREDENTIALS: "Invalid credentials provided",
  USER_NOT_FOUND: "User not found",
  SESSION_EXPIRED: "Session has expired",
  WALLET_NOT_CONNECTED: "Wallet not connected",
  CONTRACT_ERROR: "Contract interaction error",
  INVALID_CONFIG: "Invalid SDK configuration",
} as const;
