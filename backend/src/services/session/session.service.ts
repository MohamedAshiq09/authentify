import { supabaseAdmin } from '../../config/supabase.config';
import { JWTUtil } from '../../utils/jwt.util';
import { Session, TokenPair, TokenPayload } from '../../types/session.types';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(userId: string, tokens: TokenPair): Promise<Session> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        session_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return session;
  }

  /**
   * Get session by refresh token
   */
  static async getSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error) {
      return null;
    }

    return session;
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    let decoded: TokenPayload;
    try {
      decoded = JWTUtil.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Get session from database
    const session = await this.getSessionByRefreshToken(refreshToken);
    if (!session) {
      throw new Error('Session not found or expired');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      walletAddress: decoded.walletAddress,
    };

    const newTokens = JWTUtil.generateTokenPair(tokenPayload);

    // Update session with new refresh token
    const { error } = await supabaseAdmin
      .from('sessions')
      .update({
        refresh_token: newTokens.refreshToken,
      })
      .eq('id', session.id);

    if (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }

    return newTokens;
  }

  /**
   * Invalidate session (logout)
   */
  static async invalidateSession(refreshToken: string): Promise<{ success: boolean }> {
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('refresh_token', refreshToken);

    if (error) {
      throw new Error(`Failed to invalidate session: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Invalidate all user sessions
   */
  static async invalidateAllUserSessions(userId: string): Promise<{ success: boolean }> {
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to invalidate sessions: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Get user's active sessions
   */
  static async getUserSessions(userId: string): Promise<Partial<Session>[]> {
    const { data: sessions, error } = await supabaseAdmin
      .from('sessions')
      .select('id, created_at, expires_at')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get sessions: ${error.message}`);
    }

    return sessions || [];
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<{ deletedCount: number }> {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to cleanup sessions: ${error.message}`);
    }

    return { deletedCount: data?.length || 0 };
  }
}