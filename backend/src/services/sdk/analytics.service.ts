import { supabaseAdmin } from '../../config/supabase.config';
import { APIUsage } from '../../types/sdk.types';

export class AnalyticsService {
  /**
   * Log API usage
   */
  static async logAPIUsage(data: {
    client_id: string;
    endpoint: string;
    method: string;
    status_code: number;
    response_time_ms: number;
  }): Promise<void> {
    const { error } = await supabaseAdmin
      .from('api_usage')
      .insert({
        ...data,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log API usage:', error);
      // Don't throw error as this shouldn't break the main flow
    }
  }

  /**
   * Get usage analytics for a client
   */
  static async getClientAnalytics(
    clientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalRequests: number;
    avgResponseTime: number;
    statusCodeBreakdown: Record<string, number>;
    endpointBreakdown: Record<string, number>;
    dailyUsage: Array<{ date: string; requests: number }>;
  }> {
    let query = supabaseAdmin
      .from('api_usage')
      .select('*')
      .eq('client_id', clientId);

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data: usage, error } = await query;

    if (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }

    if (!usage || usage.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        statusCodeBreakdown: {},
        endpointBreakdown: {},
        dailyUsage: [],
      };
    }

    // Calculate metrics
    const totalRequests = usage.length;
    const avgResponseTime = usage.reduce((sum, u) => sum + u.response_time_ms, 0) / totalRequests;

    // Status code breakdown
    const statusCodeBreakdown: Record<string, number> = {};
    usage.forEach(u => {
      const code = u.status_code.toString();
      statusCodeBreakdown[code] = (statusCodeBreakdown[code] || 0) + 1;
    });

    // Endpoint breakdown
    const endpointBreakdown: Record<string, number> = {};
    usage.forEach(u => {
      const endpoint = `${u.method} ${u.endpoint}`;
      endpointBreakdown[endpoint] = (endpointBreakdown[endpoint] || 0) + 1;
    });

    // Daily usage
    const dailyUsageMap: Record<string, number> = {};
    usage.forEach(u => {
      const date = new Date(u.timestamp).toISOString().split('T')[0];
      dailyUsageMap[date] = (dailyUsageMap[date] || 0) + 1;
    });

    const dailyUsage = Object.entries(dailyUsageMap)
      .map(([date, requests]) => ({ date, requests }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      statusCodeBreakdown,
      endpointBreakdown,
      dailyUsage,
    };
  }

  /**
   * Get usage analytics for all clients (admin view)
   */
  static async getGlobalAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalRequests: number;
    totalClients: number;
    avgResponseTime: number;
    topClients: Array<{ client_id: string; requests: number }>;
    topEndpoints: Array<{ endpoint: string; requests: number }>;
  }> {
    let query = supabaseAdmin
      .from('api_usage')
      .select('*');

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data: usage, error } = await query;

    if (error) {
      throw new Error(`Failed to get global analytics: ${error.message}`);
    }

    if (!usage || usage.length === 0) {
      return {
        totalRequests: 0,
        totalClients: 0,
        avgResponseTime: 0,
        topClients: [],
        topEndpoints: [],
      };
    }

    const totalRequests = usage.length;
    const uniqueClients = new Set(usage.map(u => u.client_id));
    const totalClients = uniqueClients.size;
    const avgResponseTime = usage.reduce((sum, u) => sum + u.response_time_ms, 0) / totalRequests;

    // Top clients
    const clientUsage: Record<string, number> = {};
    usage.forEach(u => {
      clientUsage[u.client_id] = (clientUsage[u.client_id] || 0) + 1;
    });

    const topClients = Object.entries(clientUsage)
      .map(([client_id, requests]) => ({ client_id, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    // Top endpoints
    const endpointUsage: Record<string, number> = {};
    usage.forEach(u => {
      const endpoint = `${u.method} ${u.endpoint}`;
      endpointUsage[endpoint] = (endpointUsage[endpoint] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointUsage)
      .map(([endpoint, requests]) => ({ endpoint, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      totalRequests,
      totalClients,
      avgResponseTime: Math.round(avgResponseTime),
      topClients,
      topEndpoints,
    };
  }

  /**
   * Get rate limiting data for a client
   */
  static async getClientRateLimit(clientId: string, windowMs: number = 900000): Promise<{
    requestCount: number;
    windowStart: string;
    isLimited: boolean;
  }> {
    const windowStart = new Date(Date.now() - windowMs);

    const { data: usage, error } = await supabaseAdmin
      .from('api_usage')
      .select('id')
      .eq('client_id', clientId)
      .gte('timestamp', windowStart.toISOString());

    if (error) {
      throw new Error(`Failed to get rate limit data: ${error.message}`);
    }

    const requestCount = usage?.length || 0;
    const isLimited = requestCount >= 100; // Default limit

    return {
      requestCount,
      windowStart: windowStart.toISOString(),
      isLimited,
    };
  }
}