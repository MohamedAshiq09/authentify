import bcrypt from "bcryptjs";
import { ContractError, ContractResult } from "./types";

export class AuthentifyError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = "AuthentifyError";
    this.code = code;
    this.details = details;
  }
}

export const validateUsername = (username: string): void => {
  if (!username || username.trim().length === 0) {
    throw new AuthentifyError("Username cannot be empty", "EMPTY_USERNAME");
  }

  if (username.length < 3) {
    throw new AuthentifyError(
      "Username must be at least 3 characters long",
      "USERNAME_TOO_SHORT"
    );
  }

  if (username.length > 32) {
    throw new AuthentifyError(
      "Username must be no more than 32 characters long",
      "USERNAME_TOO_LONG"
    );
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new AuthentifyError(
      "Username can only contain letters, numbers, and underscores",
      "INVALID_USERNAME_FORMAT"
    );
  }
};

export const validatePassword = (password: string): void => {
  if (!password || password.length === 0) {
    throw new AuthentifyError("Password cannot be empty", "EMPTY_PASSWORD");
  }

  if (password.length < 6) {
    throw new AuthentifyError(
      "Password must be at least 6 characters long",
      "PASSWORD_TOO_SHORT"
    );
  }
};

export const validateEmail = (email: string): void => {
  if (!email || email.trim().length === 0) {
    throw new AuthentifyError("Email cannot be empty", "EMPTY_EMAIL");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AuthentifyError("Invalid email format", "INVALID_EMAIL_FORMAT");
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateSocialIdHash = (
  provider: string,
  socialId: string
): string => {
  const combined = `${provider}:${socialId}`;
  return bcrypt.hashSync(combined, 10);
};

export const generateSessionId = (): string => {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};

export const isContractError = (
  result: any
): result is { Err: ContractError } => {
  return result && typeof result === "object" && "Err" in result;
};

export const isContractSuccess = <T>(result: any): result is { Ok: T } => {
  return result && typeof result === "object" && "Ok" in result;
};

export const parseContractResult = <T>(result: ContractResult<T>): T => {
  if (isContractSuccess(result)) {
    return result.Ok;
  }

  if (isContractError(result)) {
    const errorKey = Object.keys(result.Err)[0];
    throw new AuthentifyError(
      `Contract error: ${errorKey}`,
      `CONTRACT_${errorKey.toUpperCase()}`,
      result.Err
    );
  }

  throw new AuthentifyError(
    "Invalid contract result",
    "INVALID_CONTRACT_RESULT",
    result
  );
};

export const formatAccountId = (accountId: string): string => {
  if (accountId.length <= 10) return accountId;
  return `${accountId.slice(0, 6)}...${accountId.slice(-4)}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries) break;
      await sleep(delay * (i + 1)); // Exponential backoff
    }
  }

  throw lastError!;
};

export const parseErrorMessage = (error: any): string => {
  if (error instanceof AuthentifyError) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
};
