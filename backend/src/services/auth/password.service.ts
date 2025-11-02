import { supabaseAdmin } from '../../config/supabase.config';
import { PasswordUtil } from '../../utils/password.util';
import { JWTUtil } from '../../utils/jwt.util';
import { TokenPair } from '../../types/session.types';
import { SessionService } from '../session/session.service';

export class PasswordService {
  /**
   * Change user password
   */
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean }> {
    // Get user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // If user doesn't have a password (OAuth only), allow setting one
    if (user.password_hash) {
      // Verify current password
      const isValidPassword = await PasswordUtil.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }
    }

    // Validate new password
    const passwordValidation = PasswordUtil.validate(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Hash new password
    const newPasswordHash = await PasswordUtil.hash(newPassword);

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    // Invalidate all existing sessions for security
    await SessionService.invalidateAllUserSessions(userId);

    return { success: true };
  }

  /**
   * Request password reset (generate reset token)
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    // Check if user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!user) {
      // Don't reveal if email exists or not
      return { success: true };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = JWTUtil.generateAccessToken({
      userId: user.id,
      email: user.email,
      type: 'password_reset'
    } as any);

    // In a real app, you would:
    // 1. Store the reset token in database with expiry
    // 2. Send email with reset link containing the token
    // For now, we'll just log it (in production, remove this)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    // TODO: Implement email sending service
    // await EmailService.sendPasswordResetEmail(email, resetToken);

    return { success: true };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    resetToken: string, 
    newPassword: string
  ): Promise<{ user: any; tokens: TokenPair }> {
    try {
      // Verify reset token
      const decoded = JWTUtil.verifyAccessToken(resetToken) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      // Validate new password
      const passwordValidation = PasswordUtil.validate(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Hash new password
      const passwordHash = await PasswordUtil.hash(newPassword);

      // Update password
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', decoded.userId)
        .select('id, email, wallet_address, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(`Failed to reset password: ${error.message}`);
      }

      // Invalidate all existing sessions
      await SessionService.invalidateAllUserSessions(user.id);

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        walletAddress: user.wallet_address,
      };

      const tokens = JWTUtil.generateTokenPair(tokenPayload);

      // Create new session
      await SessionService.createSession(user.id, tokens);

      return { user, tokens };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}