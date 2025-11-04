import { create } from 'zustand';
import { InjectedAccountWithMeta } from '../types/wallet';

interface WalletState {
  isConnected: boolean;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  isExtensionAvailable: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConnected: (connected: boolean) => void;
  setAccounts: (accounts: InjectedAccountWithMeta[]) => void;
  setSelectedAccount: (account: InjectedAccountWithMeta | null) => void;
  setExtensionAvailable: (available: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  accounts: [],
  selectedAccount: null,
  isExtensionAvailable: false,
  isLoading: false,
  error: null,

  setConnected: (connected) => set({ isConnected: connected }),

  setAccounts: (accounts) => set({ accounts }),

  setSelectedAccount: (account) => {
    // Save to localStorage
    if (typeof window !== 'undefined' && account) {
      localStorage.setItem('selectedAccount', JSON.stringify(account));
    }
    set({ selectedAccount: account });
  },

  setExtensionAvailable: (available) => set({ isExtensionAvailable: available }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedAccount');
    }
    set({
      isConnected: false,
      accounts: [],
      selectedAccount: null,
      error: null,
    });
  },
}));

// Initialize selected account from localStorage on client side
if (typeof window !== 'undefined') {
  const storedAccount = localStorage.getItem('selectedAccount');
  if (storedAccount) {
    try {
      const account = JSON.parse(storedAccount);
      useWalletStore.setState({ selectedAccount: account });
    } catch (error) {
      console.error('Failed to parse stored account:', error);
      localStorage.removeItem('selectedAccount');
    }
  }
}