import { api } from './client';

export const sdkApi = {
  /**
   * Register new SDK client
   */
  registerClient: async (data: {
    app_name: string;
    redirect_uris: string[];
    description?: string;
  }) => {
    return api.post<{
      client_id: string;
      client_secret: string;
      app_name: string;
    }>('/sdk/register', data);
  },

  /**
   * Get client details
   */
  getClient: async (clientId: string) => {
    return api.get<{
      client_id: string;
      app_name: string;
      redirect_uris: string[];
      created_at: string;
    }>(`/sdk/client/${clientId}`);
  },

  /**
   * Update client
   */
  updateClient: async (clientId: string, data: {
    app_name?: string;
    redirect_uris?: string[];
    description?: string;
  }) => {
    return api.put(`/sdk/client/${clientId}`, data);
  },

  /**
   * Delete client
   */
  deleteClient: async (clientId: string) => {
    return api.delete(`/sdk/client/${clientId}`);
  },

  /**
   * Get client analytics
   */
  getAnalytics: async (clientId: string, timeframe: string = '7d') => {
    return api.get<{
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      averageResponseTime: number;
      requestsByDay: any[];
    }>(`/sdk/analytics/${clientId}?timeframe=${timeframe}`);
  },

  /**
   * Get all clients for user
   */
  getClients: async () => {
    return api.get<{ clients: any[] }>('/sdk/clients');
  },

  /**
   * Get client user statistics
   */
  getClientStats: async (clientId: string) => {
    return api.get<{ total_users: number }>(`/sdk/clients/${clientId}/stats`);
  },

  /**
   * Get comprehensive user analytics
   */
  getUserAnalytics: async () => {
    return api.get<{
      total_users: number;
      active_today: number;
      total_requests: number;
      bandwidth_gb: number;
      growth_rate: number;
      databases_count: number;
      storage_mb: number;
      queries_today: number;
      avg_response_time: number;
      daily_stats: Array<{ date: string; users: number; requests: number }>;
    }>('/sdk-client/analytics');
  },
};