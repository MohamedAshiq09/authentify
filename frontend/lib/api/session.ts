import { api } from './client';

export const sessionApi = {
  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string) => {
    return api.post<{ accessToken: string }>('/session/refresh', {
      refreshToken,
    });
  },

  /**
   * Logout from current session
   */
  logout: async (refreshToken: string) => {
    return api.post('/session/logout', {
      refreshToken,
    });
  },

  /**
   * Logout from all sessions
   */
  logoutAll: async () => {
    return api.post('/session/logout-all');
  },

  /**
   * Get active sessions
   */
  getSessions: async () => {
    return api.get<{ sessions: any[] }>('/session/list');
  },

  /**
   * Revoke specific session
   */
  revokeSession: async (sessionId: string) => {
    return api.delete(`/session/${sessionId}`);
  },
};