import { supabaseAdmin } from '../../config/supabase.config';
import { JWTUtil } from '../../utils/jwt.util';
import { OAuthCallbackData, User } from '../../types/auth.types';
import { TokenPair } from '../../types/session.types';
import { SessionService } from '../session/session.service';

export class OAuthService {
  /**
   * Handle OAuth callback and create/login user
   */
  static async handleOAuthCallback(data: OAuthCallbackData): Promise<{ user: User; tokens: TokenPair; isNewUser: boolean }> {
    const { provider, provider_id, email, name } = data;

    // Check if OAuth account exists
    const { data: oauthAccount } = await supabaseAdmin
      .from('oauth_accounts')
      .select(`
        *,
        users (*)
      `)
      .eq('provider', provider)
      .eq('provider_id', provider_id)
      .single();

    let user: User;
    let isNewUser = false;

    if (oauthAccount && oauthAccount.users) {
      // Existing OAuth account
      user = oauthAccount.users;
    } else {
      // Check if user exists with this email
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        // Link OAuth account to existing user
        user = existingUser;
        
        await supabaseAdmin
          .from('oauth_accounts')
          .insert({
            user_id: user.id,
            provider,
            provider_id,
            email,
          });
      } else {
        // Create new user
        const { data: newUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            email,
            // No password_hash for OAuth users
          })
          .select()
          .single();

        if (userError) {
          throw new Error(`Failed to create user: ${userError.message}`);
        }

        user = newUser;
        isNewUser = true;

        // Create OAuth account
        const { error: oauthError } = await supabaseAdmin
          .from('oauth_accounts')
          .insert({
            user_id: user.id,
            provider,
            provider_id,
            email,
          });

        if (oauthError) {
          throw new Error(`Failed to create OAuth account: ${oauthError.message}`);
        }
      }
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      walletAddress: user.wallet_address,
    };

    const tokens = JWTUtil.generateTokenPair(tokenPayload);

    // Create session
    await SessionService.createSession(user.id, tokens);

    return { user, tokens, isNewUser };
  }

  /**
   * Get user's OAuth accounts
   */
  static async getUserOAuthAccounts(userId: string) {
    const { data: accounts, error } = await supabaseAdmin
      .from('oauth_accounts')
      .select('provider, email, created_at')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get OAuth accounts: ${error.message}`);
    }

    return accounts;
  }

  /**
   * Unlink OAuth account
   */
  static async unlinkOAuthAccount(userId: string, provider: string) {
    // Check if user has password or other OAuth accounts
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    const { data: otherAccounts } = await supabaseAdmin
      .from('oauth_accounts')
      .select('id')
      .eq('user_id', userId)
      .neq('provider', provider);

    if (!user?.password_hash && (!otherAccounts || otherAccounts.length === 0)) {
      throw new Error('Cannot unlink the only authentication method');
    }

    const { error } = await supabaseAdmin
      .from('oauth_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) {
      throw new Error(`Failed to unlink OAuth account: ${error.message}`);
    }

    return { success: true };
  }
}