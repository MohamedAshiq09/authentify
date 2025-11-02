export interface ContractEvent {
  id: string;
  event_name: string;
  block_number: number;
  transaction_hash: string;
  user_address: string;
  data: any;
  indexed_at: string;
}

export interface RegisterContractRequest {
  user_address: string;
  auth_method: string;
}

export interface QueryUserRequest {
  user_address: string;
}