import { create } from 'zustand';

interface ContractState {
  isConnected: boolean;
  contractAddress: string;
  isContractAvailable: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConnected: (connected: boolean) => void;
  setContractAddress: (address: string) => void;
  setContractAvailable: (available: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useContractStore = create<ContractState>((set) => ({
  isConnected: false,
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
  isContractAvailable: false,
  isLoading: false,
  error: null,

  setConnected: (connected) => set({ isConnected: connected }),

  setContractAddress: (address) => set({ contractAddress: address }),

  setContractAvailable: (available) => set({ isContractAvailable: available }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));