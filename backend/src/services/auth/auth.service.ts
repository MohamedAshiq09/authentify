import { supabaseAdmin } from '../../config/supabase.config';
import { PasswordUtil } from '../../utils/password.util';
import { JWTUtil } from '../../utils/jwt.util';
import { ValidatorUtil } from '../../utils/validator.util';
import { RegisterRequest, LoginRequest, User } from '../../types/auth.types';
import { TokenPair } from '../../types/session.types';
import { SessionService } from '../session/session.service';
import { ContractService } from '../contract/contract.service';
import { getContract, getServiceAccount, isContractAvailable } from '../../config/contract.config';

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

  /**
   * Contract-based authentication (username + password)
   */
  static async authenticateWithContract(username: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    if (!isContractAvailable()) {
      console.log('⚠️ Contract not available, using database authentication fallback');
      return this.authenticateWithDatabase(username, password);
    }

    try {
      const contract = getContract();
      const serviceAccount = getServiceAccount();

      // Hash password for contract verification
      const passwordHash = await PasswordUtil.hash(password);

      // Call contract authenticate method
      const { result, output } = await contract.query.authenticate(
        serviceAccount.address,
        {
          gasLimit: {
            refTime: 2000000000,
            proofSize: 200000,
          } as any,
        },
        username,
        passwordHash
      );

      if (result.isOk && output) {
        const accountId = output.toHuman() as string;
        
        // Get or create user in database
        let { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('wallet_address', accountId)
          .single();

        if (!user) {
          // Create user record if doesn't exist
          let insertData: any = {
            email: `${username}@authentify.local`, // Placeholder email
            wallet_address: accountId,
          };
          
          // Try to add username if the column exists
          try {
            insertData.username = username;
            const { data: newUser, error } = await supabaseAdmin
              .from('users')
              .insert(insertData)
              .select()
              .single();
              
            if (error) {
              if (error.message.includes('username')) {
                // Username column doesn't exist, try without it
                delete insertData.username;
                const { data: fallbackUser, error: fallbackError } = await supabaseAdmin
                  .from('users')
                  .insert(insertData)
                  .select()
                  .single();
                  
                if (fallbackError) {
                  throw new Error(`Failed to create user record: ${fallbackError.message}`);
                }
                
                // Add username to the response object for consistency
                fallbackUser.username = username;
                user = fallbackUser;
              } else {
                throw new Error(`Failed to create user record: ${error.message}`);
              }
            } else {
              user = newUser;
            }
          } catch (error: any) {
            throw new Error(`Failed to create user record: ${error.message}`);
          }
        }

        // Generate tokens
        const tokenPayload = {
          userId: user.id,
          email: user.email,
          walletAddress: user.wallet_address,
          username: username,
        };

        const tokens = JWTUtil.generateTokenPair(tokenPayload);

        // Create session
        await SessionService.createSession(user.id, tokens);

        return { user, tokens };
      } else {
        throw new Error('Invalid credentials');
      }

    } catch (error: any) {
      console.error('Contract authentication error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Register user on contract and database
   */
  static async registerWithContract(data: {
    username: string;
    password: string;
    walletAddress: string;
    socialIdHash: string;
    socialProvider: string;
  }): Promise<{ user: User; tokens: TokenPair; transactionHash?: string }> {
    const { username, password, walletAddress, socialIdHash, socialProvider } = data;

    // Validate inputs
    if (!ValidatorUtil.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    const passwordValidation = PasswordUtil.validate(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Check if user already exists in database
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      throw new Error('User already exists with this wallet address');
    }

    let transactionHash: string | undefined;

    // Register on contract if available
    if (isContractAvailable()) {
      try {
        const contract = getContract();
        const serviceAccount = getServiceAccount();

        // Hash password for contract
        const passwordHash = await PasswordUtil.hash(password);

        // Execute contract registration
        const tx = contract.tx.register_identity(
          {
            gasLimit: {
              refTime: 3000000000,
              proofSize: 1000000,
            } as any,
            storageDepositLimit: null,
          },
          username,
          passwordHash,
          socialIdHash,
          socialProvider
        );

        // Sign and send transaction
        transactionHash = await new Promise((resolve, reject) => {
          tx.signAndSend(serviceAccount, (result) => {
            if (result.status.isInBlock) {
              console.log(`✅ Contract registration in block: ${result.status.asInBlock}`);
              resolve(result.txHash.toString());
            } else if (result.isError) {
              reject(new Error('Contract registration failed'));
            }
          }).catch(reject);
        });

      } catch (error: any) {
        console.error('Contract registration error:', error);
        // Continue with database registration even if contract fails
      }
    }

    // Create user in database
    const passwordHash = await PasswordUtil.hash(password);
    
    // Try to insert with username, fallback without if column doesn't exist
    let insertData: any = {
      email: `${username}@authentify.local`, // Placeholder email
      password_hash: passwordHash,
      wallet_address: walletAddress,
    };
    
    let user: any;
    
    // Try to add username if the column exists
    try {
      insertData.username = username;
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert(insertData)
        .select()
        .single();
        
      if (error) {
        if (error.message.includes('username')) {
          // Username column doesn't exist, try without it
          delete insertData.username;
          const { data: fallbackUser, error: fallbackError } = await supabaseAdmin
            .from('users')
            .insert(insertData)
            .select()
            .single();
            
          if (fallbackError) {
            throw new Error(`Failed to create user: ${fallbackError.message}`);
          }
          
          // Add username to the response object for consistency
          fallbackUser.username = username;
          user = fallbackUser;
        } else {
          throw new Error(`Failed to create user: ${error.message}`);
        }
      } else {
        user = newUser;
      }
    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      walletAddress: user.wallet_address,
      username: username,
    };

    const tokens = JWTUtil.generateTokenPair(tokenPayload);

    // Create session
    await SessionService.createSession(user.id, tokens);

    return { user, tokens, transactionHash };
  }

  /**
   * Database-based authentication (fallback when contract is not available)
   */
  static async authenticateWithDatabase(username: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    try {
      // Find user by email (since username column might not exist)
      let { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', `${username}@authentify.local`)
        .single();

      if (!user) {
        throw new Error('Invalid username or password');
      }

      if (!user.password_hash) {
        throw new Error('Please use social login for this account');
      }

      // Verify password
      const isValidPassword = await PasswordUtil.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid username or password');
      }

      // Add username to user object if not present
      if (!user.username) {
        user.username = username;
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        walletAddress: user.wallet_address,
        username: user.username || username,
      };

      const tokens = JWTUtil.generateTokenPair(tokenPayload);

      // Create session
      await SessionService.createSession(user.id, tokens);

      return { user, tokens };

    } catch (error: any) {
      console.error('Database authentication error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
}