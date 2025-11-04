export interface ContractIdentity {
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

export interface ContractRegisterRequest {
  user_address: string;
  auth_method: string;
}

export interface ContractResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ContractStatus {
  isConnected: boolean;
  contractAvailable: boolean;
  contractAddress: string;
}