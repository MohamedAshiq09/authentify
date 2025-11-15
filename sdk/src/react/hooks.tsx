import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { AuthentifySDK } from '../sdk';
import {
  AuthentifyConfig,
  UserLogin,
  UserRegistration,
  UserProfile,
  AuthSession,
  UseAuthentifyReturn,
} from '../types';

// Context
interface AuthentifyContextValue extends UseAuthentifyReturn {
  sdk: AuthentifySDK;
}

const AuthentifyContext = createContext<AuthentifyContextValue | null>(null);

// Provider Component
interface AuthentifyProviderProps {
  config: AuthentifyConfig;
  children: ReactNode;
}

export function AuthentifyProvider({ config, children }: AuthentifyProviderProps) {
  const [sdk] = useState(() => new AuthentifySDK(config));
  const [user, setUser] = useState<UserProfile | null>(sdk.getCurrentUser());
  const [session, setSession] = useState<AuthSession | null>(sdk.getCurrentSession());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = sdk.isAuthenticated();

  const register = useCallback(async (data: UserRegistration) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await sdk.register(data);
      setUser(newUser);
      const currentSession = sdk.getCurrentSession();
      setSession(currentSession);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const login = useCallback(async (credentials: UserLogin) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginSession = await sdk.login(credentials);
      setSession(loginSession);
      const currentUser = sdk.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.logout();
      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await sdk.refreshSession();
      setSession(newSession);
    } catch (err: any) {
      setError(err.message || 'Session refresh failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  // Check session validity on mount
  useEffect(() => {
    if (isAuthenticated) {
      const currentUser = sdk.getCurrentUser();
      const currentSession = sdk.getCurrentSession();
      setUser(currentUser);
      setSession(currentSession);
    }
  }, [sdk, isAuthenticated]);

  const value: AuthentifyContextValue = {
    sdk,
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshSession,
    error,
  };

  return (
    <AuthentifyContext.Provider value={value}>
      {children}
    </AuthentifyContext.Provider>
  );
}

// Hook to use Authentify context
export function useAuthentifyContext(): AuthentifyContextValue {
  const context = useContext(AuthentifyContext);
  if (!context) {
    throw new Error('useAuthentifyContext must be used within AuthentifyProvider');
  }
  return context;
}

// Hook for standalone usage (without provider)
export function useAuthentify(config: AuthentifyConfig): UseAuthentifyReturn {
  const [sdk] = useState(() => new AuthentifySDK(config));
  const [user, setUser] = useState<UserProfile | null>(sdk.getCurrentUser());
  const [session, setSession] = useState<AuthSession | null>(sdk.getCurrentSession());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = sdk.isAuthenticated();

  const register = useCallback(async (data: UserRegistration) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await sdk.register(data);
      setUser(newUser);
      const currentSession = sdk.getCurrentSession();
      setSession(currentSession);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const login = useCallback(async (credentials: UserLogin) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginSession = await sdk.login(credentials);
      setSession(loginSession);
      const currentUser = sdk.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.logout();
      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await sdk.refreshSession();
      setSession(newSession);
    } catch (err: any) {
      setError(err.message || 'Session refresh failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  // Check session validity on mount
  useEffect(() => {
    if (isAuthenticated) {
      const currentUser = sdk.getCurrentUser();
      const currentSession = sdk.getCurrentSession();
      setUser(currentUser);
      setSession(currentSession);
    }
  }, [sdk, isAuthenticated]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshSession,
    error,
  };
}

/**
 * Hook for wallet connection
 */
export function useWallet(config: AuthentifyConfig) {
  const { sdk } = useAuthentifyContext() || { sdk: new AuthentifySDK(config) };
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // This would integrate with wallet connection logic
      // For now, we'll simulate wallet connection
      console.log('Wallet connection would be implemented here');
      const mockAccounts = ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'];
      setAccounts(mockAccounts);
      return mockAccounts;
    } catch (err: any) {
      setError(err.message || 'Wallet connection failed');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [sdk]);

  return {
    accounts,
    isConnecting,
    connectWallet,
    error,
  };
}

/**
 * Hook for biometric authentication
 */
export function useBiometric(config: AuthentifyConfig) {
  const { sdk } = useAuthentifyContext() || { sdk: new AuthentifySDK(config) };
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableBiometric = useCallback(async (username: string) => {
    setIsEnabling(true);
    setError(null);
    try {
      const options = await sdk.enableBiometric(username);
      return options;
    } catch (err: any) {
      setError(err.message || 'Biometric setup failed');
      throw err;
    } finally {
      setIsEnabling(false);
    }
  }, [sdk]);

  return {
    isEnabling,
    enableBiometric,
    error,
  };
}