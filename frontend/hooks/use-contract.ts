import { useCallback, useEffect } from 'react';
import { useContractStore } from '../lib/store/contract-store';
import { initContract, hasIdentity, isUsernameAvailable, getIdentity } from '../lib/contract/contract';
import { contractApi } from '../lib/api/contract';

export function useContract() {
  const {
    isConnected,
    contractAddress,
    isContractAvailable,
    isLoading,
    error,
    setConnected,
    setContractAvailable,
    setLoading,
    setError,
  } = useContractStore();

  // Initialize contract on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initContract();
        setConnected(true);
        setContractAvailable(true);
      } catch (error: any) {
        console.error('Failed to initialize contract:', error);
        setConnected(false);
        setContractAvailable(false);
      }
    };

    init();
  }, [setConnected, setContractAvailable]);

  // Check if user has identity
  const checkIdentity = useCallback(async (address: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await hasIdentity(address);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to check identity';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  // Check username availability
  const checkUsernameAvailability = useCallback(async (callerAddress: string, username: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await isUsernameAvailable(callerAddress, username);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to check username';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  // Get user identity
  const getUserIdentity = useCallback(async (callerAddress: string, userAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getIdentity(callerAddress, userAddress);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get identity';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  // Register user on contract (via backend)
  const registerUser = useCallback(async (userAddress: string, authMethod: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await contractApi.registerUser({
        user_address: userAddress,
        auth_method: authMethod,
      });
      return result;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to register on contract';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  // Get contract status
  const getContractStatus = useCallback(async () => {
    try {
      const status = await contractApi.getContractStatus();
      setConnected(status.isConnected);
      setContractAvailable(status.contractAvailable);
      return status;
    } catch (error: any) {
      console.error('Failed to get contract status:', error);
      return null;
    }
  }, [setConnected, setContractAvailable]);

  return {
    // State
    isConnected,
    contractAddress,
    isContractAvailable,
    isLoading,
    error,

    // Actions
    checkIdentity,
    checkUsernameAvailability,
    getUserIdentity,
    registerUser,
    getContractStatus,
  };
}