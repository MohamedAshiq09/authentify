import { supabaseAdmin } from '../../config/supabase.config';
import { PasswordUtil } from '../../utils/password.util';
import { JWTUtil } from '../../utils/jwt.util';
import { ValidatorUtil } from '../../utils/validator.util';
import { RegisterRequest, LoginRequest, User } from '../../types/auth.types';
import { TokenPair } from '../../types/session.types';
import { SessionService } from '../session/session.service';

export class AuthService {
  /**
   * Register new user with email/password
   */
  static async register(data: RegisterRequest): Promise<{ user: User; tokens: TokenPair }> {
    const { email, password, wallet_address } = data;

    // Validate email format
    if (!ValidatorUtil.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validate(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Validate wallet address if provided
    if (wallet_address && !ValidatorUtil.isValidAddress(wallet_address)) {
      throw new Error('Invalid wallet address');
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Check if wallet address is already used
    if (wallet_address) {
      const { data: existingWallet } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('wallet_address', wallet_address)
        .single();

      if (existingWallet) {
        throw new Error('Wallet address already registered');
      }
    }

    // Hash password
    const password_hash = await PasswordUtil.hash(password);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash,
        wallet_address,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
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

    return { user, tokens };
  }

  /**
   * Login with email/password
   */
  static async login(data: LoginRequest): Promise<{ user: User; tokens: TokenPair }> {
    const { email, password } = data;

    // Get user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password_hash) {
      throw new Error('Please use social login for this account');
    }

    // Verify password
    const isValidPassword = await PasswordUtil.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
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

    return { user, tokens };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, wallet_address, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return user;
  }

  /**
   * Update user wallet address
   */
  static async updateWalletAddress(userId: string, walletAddress: string): Promise<User> {
    if (!ValidatorUtil.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Check if wallet address is already used
    const { data: existingWallet } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .neq('id', userId)
      .single();

    if (existingWallet) {
      throw new Error('Wallet address already registered');
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ wallet_address: walletAddress })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update wallet address: ${error.message}`);
    }

    return user;
  }
}