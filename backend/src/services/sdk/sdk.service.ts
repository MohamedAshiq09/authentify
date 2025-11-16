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
}