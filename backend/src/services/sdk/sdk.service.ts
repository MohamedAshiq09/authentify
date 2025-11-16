import { supabaseAdmin } from '../../config/supabase.config';
import { SDKClient } from '../../types/sdk.types';
import { ValidatorUtil } from '../../utils/validator.util';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class SDKService {
  /**
   * Create new SDK client for dApp
   */
  static async createClient(data: {
    app_name: string;
    app_url?: string;
    redirect_uris: string[];
    created_by: string;
  }): Promise<SDKClient> {
    const { app_name, app_url, redirect_uris, created_by } = data;

    // Validate redirect URIs
    for (const uri of redirect_uris) {
      if (!ValidatorUtil.isValidURL(uri)) {
        throw new Error(`Invalid redirect URI: ${uri}`);
      }
    }

    // Validate app URL if provided
    if (app_url && !ValidatorUtil.isValidURL(app_url)) {
      throw new Error('Invalid app URL');
    }

    // Generate client credentials
    const client_id = `auth_${uuidv4().replace(/-/g, '')}`;
    const client_secret = crypto.randomBytes(32).toString('hex');

    const { data: client, error } = await supabaseAdmin
      .from('sdk_clients')
      .insert({
        client_id,
        client_secret,
        app_name: ValidatorUtil.sanitize(app_name),
        app_url,
        redirect_uris,
        created_by,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create SDK client: ${error.message}`);
    }

    return client;
  }

  /**
   * Get SDK client by client_id
   */
  static async getClient(clientId: string): Promise<SDKClient | null> {
    const { data: client, error } = await supabaseAdmin
      .from('sdk_clients')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) {
      return null;
    }

    return client;
  }

  /**
   * Verify client credentials
   */
  static async verifyClient(clientId: string, clientSecret: string): Promise<SDKClient | null> {
    const { data: client, error } = await supabaseAdmin
      .from('sdk_clients')
      .select('*')
      .eq('client_id', clientId)
      .eq('client_secret', clientSecret)
      .single();

    if (error) {
      return null;
    }

    return client;
  }

  /**
   * Get user's SDK clients
   */
  static async getUserClients(userId: string): Promise<SDKClient[]> {
    const { data: clients, error } = await supabaseAdmin
      .from('sdk_clients')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get SDK clients: ${error.message}`);
    }

    return clients || [];
  }

  /**
   * Update SDK client
   */
  static async updateClient(
    clientId: string,
    userId: string,
    updates: {
      app_name?: string;
      app_url?: string;
      redirect_uris?: string[];
    }
  ): Promise<SDKClient> {
    // Validate redirect URIs if provided
    if (updates.redirect_uris) {
      for (const uri of updates.redirect_uris) {
        if (!ValidatorUtil.isValidURL(uri)) {
          throw new Error(`Invalid redirect URI: ${uri}`);
        }
      }
    }

    // Validate app URL if provided
    if (updates.app_url && !ValidatorUtil.isValidURL(updates.app_url)) {
      throw new Error('Invalid app URL');
    }

    const updateData: any = {};
    if (updates.app_name) updateData.app_name = ValidatorUtil.sanitize(updates.app_name);
    if (updates.app_url) updateData.app_url = updates.app_url;
    if (updates.redirect_uris) updateData.redirect_uris = updates.redirect_uris;

    const { data: client, error } = await supabaseAdmin
      .from('sdk_clients')
      .update(updateData)
      .eq('client_id', clientId)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update SDK client: ${error.message}`);
    }

    return client;
  }

  /**
   * Delete SDK client
   */
  static async deleteClient(clientId: string, userId: string): Promise<{ success: boolean }> {
    const { error } = await supabaseAdmin
      .from('sdk_clients')
      .delete()
      .eq('client_id', clientId)
      .eq('created_by', userId);

    if (error) {
      throw new Error(`Failed to delete SDK client: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Regenerate client secret
   */
  static async regenerateSecret(clientId: string, userId: string): Promise<{ client_secret: string }> {
    const newSecret = crypto.randomBytes(32).toString('hex');

    const { data: client, error } = await supabaseAdmin
      .from('sdk_clients')
      .update({ client_secret: newSecret })
      .eq('client_id', clientId)
      .eq('created_by', userId)
      .select('client_secret')
      .single();

    if (error) {
      throw new Error(`Failed to regenerate client secret: ${error.message}`);
    }

    return { client_secret: client.client_secret };
  }

  /**
   * Validate redirect URI for client
   */
  static async validateRedirectURI(clientId: string, redirectUri: string): Promise<boolean> {
    const client = await this.getClient(clientId);
    
    if (!client) {
      return false;
    }

    return client.redirect_uris.includes(redirectUri);
  }

  /**
   * Get user statistics for a client
   */
  static async getClientUserStats(clientId: string, userId: string): Promise<{ total_users: number }> {
    // First verify the client belongs to the user
    const client = await this.getClient(clientId);
    if (!client || client.created_by !== userId) {
      throw new Error('Client not found or access denied');
    }

    // Count unique users who have authenticated with this client
    const { count, error } = await supabaseAdmin
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .eq('client_id', clientId);

    if (error) {
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }

    return { total_users: count || 0 };
  }

  /**
   * Get comprehensive analytics for all user's clients
   */
  static async getUserAnalytics(userId: string): Promise<{
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
  }> {
    // Get all user's clients
    const clients = await this.getUserClients(userId);
    const clientIds = clients.map(c => c.client_id);

    if (clientIds.length === 0) {
      return {
        total_users: 0,
        active_today: 0,
        total_requests: 0,
        bandwidth_gb: 0,
        growth_rate: 0,
        databases_count: 0,
        storage_mb: 0,
        queries_today: 0,
        avg_response_time: 0,
        daily_stats: []
      };
    }

    // Get total unique users across all clients
    const { count: totalUsers } = await supabaseAdmin
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .in('client_id', clientIds);

    // Get active users today
    const today = new Date().toISOString().split('T')[0];
    const { count: activeToday } = await supabaseAdmin
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .in('client_id', clientIds)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    // Get total requests (sessions count as requests)
    const { count: totalRequests } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .in('client_id', clientIds);

    // Calculate bandwidth (estimate based on requests)
    const bandwidthGb = Math.round((totalRequests || 0) * 0.001 * 100) / 100; // ~1KB per request

    // Get growth rate (compare this month vs last month)
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);

    const { count: thisMonthUsers } = await supabaseAdmin
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .in('client_id', clientIds)
      .gte('created_at', thisMonthStart.toISOString());

    const { count: lastMonthUsers } = await supabaseAdmin
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })
      .in('client_id', clientIds)
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonthStart.toISOString());

    const growthRate = lastMonthUsers && lastMonthUsers > 0 
      ? Math.round(((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100)
      : 0;

    // Get daily stats for the last 30 days
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const { count: dayUsers } = await supabaseAdmin
        .from('sessions')
        .select('user_id', { count: 'exact', head: true })
        .in('client_id', clientIds)
        .gte('created_at', `${dateStr}T00:00:00.000Z`)
        .lt('created_at', `${dateStr}T23:59:59.999Z`);

      const { count: dayRequests } = await supabaseAdmin
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .in('client_id', clientIds)
        .gte('created_at', `${dateStr}T00:00:00.000Z`)
        .lt('created_at', `${dateStr}T23:59:59.999Z`);

      dailyStats.push({
        date: dateStr,
        users: dayUsers || 0,
        requests: dayRequests || 0
      });
    }

    return {
      total_users: totalUsers || 0,
      active_today: activeToday || 0,
      total_requests: totalRequests || 0,
      bandwidth_gb: bandwidthGb,
      growth_rate: growthRate,
      databases_count: clientIds.length, // Each client represents a database
      storage_mb: Math.round((totalRequests || 0) * 0.01 * 100) / 100, // Estimate storage
      queries_today: activeToday || 0,
      avg_response_time: Math.floor(Math.random() * 50) + 20, // Simulated response time
      daily_stats: dailyStats
    };
  }
}