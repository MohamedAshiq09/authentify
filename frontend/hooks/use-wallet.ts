import { useCallback, useEffect } from 'react';
import { useWalletStore } from '../lib/store/wallet-store';
import { isExtensionAvailable, getAccounts } from '../lib/polkadot/wallet';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export function useWallet() {
  const {
    isConnected,
    accounts,
    selectedAccount,
    isExtensionAvailable: extensionAvailable,
    isLoading,
    error,
    setConnected,
    setAccounts,
    setSelectedAccount,
    setExtensionAvailable,
    setLoading,
    setError,
    reset,
  } = useWalletStore();

  // Check extension availability on mount
  useEffect(() => {
    const checkExtension = () => {
      // Only check in browser environment
      if (typeof window === 'undefined') {
        setExtensionAvailable(false);
        return;
      }

      const available = isExtensionAvailable();
      setExtensionAvailable(available);
    };

    checkExtension();
    
    // Check periodically in case extension is installed after page load
    const interval = setInterval(checkExtension, 2000);
    
    return () => clearInterval(interval);
  }, [setExtensionAvailable]);

  // Connect to wallet
  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Wallet connection is only available in browser environment');
      }

      if (!extensionAvailable) {
        throw new Error('Polkadot.js extension not found. Please install it first.');
      }

      const accounts = await getAccounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your Polkadot.js extension.');
      }

      setAccounts(accounts);
      setSelectedAccount(accounts[0]); // Auto-select first account
      setConnected(true);

      return accounts;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to connect wallet';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [extensionAvailable, setAccounts, setConnected, setError, setLoading, setSelectedAccount]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    reset();
  }, [reset]);

  // Select account
  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
  }, [setSelectedAccount]);

  // Refresh accounts
  const refreshAccounts = useCallback(async () => {
    if (typeof window === 'undefined' || !extensionAvailable) return;

    try {
      const accounts = await getAccounts();
      setAccounts(accounts);

      // Check if selected account still exists
      if (selectedAccount) {
        const stillExists = accounts.find(acc => acc.address === selectedAccount.address);
        if (!stillExists && accounts.length > 0) {
          setSelectedAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Failed to refresh accounts:', error);
    }
  }, [extensionAvailable, selectedAccount, setAccounts, setSelectedAccount]);

  return {
    // State
    isConnected,
    accounts,
    selectedAccount,
    isExtensionAvailable: extensionAvailable,
    isLoading,
    error,

    // Actions
    connect,
    disconnect,
    selectAccount,
    refreshAccounts,
  };
}