import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { OAuthService } from '../services/auth/oauth.service';
import { PasswordService } from '../services/auth/password.service';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
    /**
     * Register new user
     */
    static async register(req: Request, res: Response) {
        try {
            const { email, password, wallet_address } = req.body;

            const result = await AuthService.register({
                email,
                password,
                wallet_address,
            });

            return ResponseUtil.success(res, result, 'User registered successfully', 201);
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Login with email/password
     */
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const result = await AuthService.login({ email, password });

            return ResponseUtil.success(res, result, 'Login successful');
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * OAuth callback handler
     */
    static async oauthCallback(req: Request, res: Response) {
        try {
            const { provider, provider_id, email, name } = req.body;

            const result = await OAuthService.handleOAuthCallback({
                provider,
                provider_id,
                email,
                name,
            });

            const message = result.isNewUser ? 'Account created and logged in' : 'Login successful';
            return ResponseUtil.success(res, result, message);
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Get current user profile
     */
    static async getProfile(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return ResponseUtil.unauthorized(res);
            }

            const user = await AuthService.getUserById(req.user.userId);
            if (!user) {
                return ResponseUtil.notFound(res, 'User not found');
            }

            // Get OAuth accounts
            const oauthAccounts = await OAuthService.getUserOAuthAccounts(req.user.userId);

            return ResponseUtil.success(res, {
                user,
                oauthAccounts,
            });
        } catch (error: any) {
            return ResponseUtil.serverError(res, error.message);
        }
    }

    /**
     * Update wallet address
     */
    static async updateWallet(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return ResponseUtil.unauthorized(res);
            }

            const { wallet_address } = req.body;

            const user = await AuthService.updateWalletAddress(req.user.userId, wallet_address);

            return ResponseUtil.success(res, { user }, 'Wallet address updated successfully');
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Change password
     */
    static async changePassword(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return ResponseUtil.unauthorized(res);
            }

            const { current_password, new_password } = req.body;

            await PasswordService.changePassword(
                req.user.userId,
                current_password,
                new_password
            );

            return ResponseUtil.success(res, null, 'Password changed successfully');
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Request password reset
     */
    static async requestPasswordReset(req: Request, res: Response) {
        try {
            const { email } = req.body;

            await PasswordService.requestPasswordReset(email);

            return ResponseUtil.success(res, null, 'Password reset email sent');
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Reset password with token
     */
    static async resetPassword(req: Request, res: Response) {
        try {
            const { reset_token, new_password } = req.body;

            const result = await PasswordService.resetPassword(reset_token, new_password);

            return ResponseUtil.success(res, result, 'Password reset successfully');
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Unlink OAuth account
     */
    static async unlinkOAuth(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return ResponseUtil.unauthorized(res);
            }

            const { provider } = req.params;

            await OAuthService.unlinkOAuthAccount(req.user.userId, provider);

            return ResponseUtil.success(res, null, 'OAuth account unlinked successfully');
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Contract-based login (username + password)
     */
    static async contractLogin(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return ResponseUtil.error(res, 'Username and password are required');
            }

            const result = await AuthService.authenticateWithContract(username, password);

            return ResponseUtil.success(res, result, 'Login successful');
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    }

    /**
     * Contract-based registration
     */
    static async contractRegister(req: Request, res: Response) {
        try {
            const { username, password, walletAddress, socialIdHash, socialProvider } = req.body;

            console.log('📝 Contract registration request:', {
                username,
                password: password ? '[REDACTED]' : undefined,
                walletAddress,
                socialIdHash,
                socialProvider,
            });

            if (!username || !password || !walletAddress || !socialIdHash || !socialProvider) {
                console.error('❌ Missing required fields:', {
                    username: !!username,
                    password: !!password,
                    walletAddress: !!walletAddress,
                    socialIdHash: !!socialIdHash,
                    socialProvider: !!socialProvider,
                });
                return ResponseUtil.error(res, 'All fields are required');
            }

            const result = await AuthService.registerWithContract({
                username,
                password,
                walletAddress,
                socialIdHash,
                socialProvider,
            });

            console.log('✅ Contract registration successful for user:', username);
            return ResponseUtil.success(res, result, 'Registration successful', 201);
        } catch (error: any) {
            console.error('❌ Contract registration error:', error.message);
            return ResponseUtil.error(res, error.message);
        }
    }
}