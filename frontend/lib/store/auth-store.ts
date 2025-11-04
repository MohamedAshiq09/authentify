import { create } from 'zustand';
import { User, TokenPair } from '../types/auth';

interface AuthState {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (user: User, tokens: TokenPair) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuth: (user, tokens) => {
    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    set({
      user,
      tokens,
      isAuthenticated: true,
      error: null,
    });
  },

  clearAuth: () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }

    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  updateUser: (user) => {
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }

    set({ user });
  },
}));

// Initialize auth state from localStorage on client side
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user');
  const storedAccessToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');

  if (storedUser && storedAccessToken && storedRefreshToken) {
    try {
      const user = JSON.parse(storedUser);
      const tokens = {
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken,
      };

      useAuthStore.setState({
        user,
        tokens,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to parse stored auth data:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
}