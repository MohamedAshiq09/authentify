import { api } from './client';
import { ContractRegisterRequest, ContractStatus } from '../types/contract';

export const contractApi = {
  /**
   * Register user on smart contract
   */
  registerUser: async (data: ContractRegisterRequest) => {
    return api.post<{ transactionHash: string }>('/contract/register', data);
  },

  /**
   * Check if user can login via contract
   */
  canUserLogin: async (userAddress: string) => {
    return api.post<{ canLogin: boolean; authMethods: string[] }>('/contract/can-login', {
      user_address: userAddress,
    });
  },

  /**
   * Get contract status
   */
  getContractStatus: async () => {
    const response = await api.get<ContractStatus>('/contract/status');
    return response.data.data!;
  },

  /**
   * Get user's contract events
   */
  getUserEvents: async (userAddress: string) => {
    return api.get<{ events: any[] }>(`/contract/events/${userAddress}`);
  },

  /**
   * Sync contract events
   */
  syncEvents: async () => {
    return api.post<{ syncedEvents: number }>('/contract/sync-events');
  },
};