import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/store/auth-store';
import { authApi } from '../lib/api/auth';
import { sessionApi } from '../lib/api/session';
import { RegisterRequest, LoginRequest } from '../lib/types/auth';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
  } = useAuthStore();

  // Register new user
  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register(data);
      const { user, tokens } = response.data.data!;
      setAuth(user, tokens);
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setError, setLoading]);

  // Login user
  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);
      const { user, tokens } = response.data.data!;
      setAuth(user, tokens);
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setError, setLoading]);

  // Logout user
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await sessionApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setLoading(false);
      router.push('/login');
    }
  }, [clearAuth, router, setLoading]);

  // Logout from all devices
  const logoutAll = useCallback(async () => {
    setLoading(true);
    try {
      await sessionApi.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      clearAuth();
      setLoading(false);
      router.push('/login');
    }
  }, [clearAuth, router, setLoading]);

  // Get user profile
  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { user: updatedUser } = await authApi.getProfile();
      useAuthStore.setState({ user: updatedUser });
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [isAuthenticated]);

  // Update wallet address
  const updateWallet = useCallback(async (walletAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const { user: updatedUser } = await authApi.updateWallet(walletAddress);
      useAuthStore.setState({ user: updatedUser });
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update wallet';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  // Contract-based login
  const contractLogin = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.contractLogin(username, password);
      const { user, tokens } = response.data.data!;
      setAuth(user, tokens);
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setError, setLoading]);

  // Contract-based registration
  const contractRegister = useCallback(async (data: {
    username: string;
    password: string;
    walletAddress: string;
    socialIdHash: string;
    socialProvider: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.contractRegister(data);
      const { user, tokens } = response.data.data!;
      setAuth(user, tokens);
      return response;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setError, setLoading]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    register,
    login,
    logout,
    logoutAll,
    refreshProfile,
    updateWallet,
    contractLogin,
    contractRegister,
  };
}