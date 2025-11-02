import { contract, provider } from '../../config/contract.config';
import { supabaseAdmin } from '../../config/supabase.config';
import { RegisterContractRequest, QueryUserRequest } from '../../types/contract.types';
import { ValidatorUtil } from '../../utils/validator.util';

export class ContractService {
  /**
   * Register user on smart contract
   */
  static async registerUser(data: RegisterContractRequest): Promise<{ transactionHash: string }> {
    const { user_address, auth_method } = data;

    // Validate address
    if (!ValidatorUtil.isValidAddress(user_address)) {
      throw new Error('Invalid wallet address');
    }

    try {
      // Call contract register function
      const tx = await contract.register(user_address, auth_method);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Store event in database for caching
      await this.storeContractEvent({
        event_name: 'UserRegistered',
        block_number: receipt.blockNumber,
        transaction_hash: receipt.hash,
        user_address,
        data: { auth_method },
      });

      return { transactionHash: receipt.hash };
    } catch (error: any) {
      throw new Error(`Contract registration failed: ${error.message}`);
    }
  }

  /**
   * Check if user is registered and can login
   */
  static async canUserLogin(data: QueryUserRequest): Promise<{ canLogin: boolean; authMethods: string[] }> {
    const { user_address } = data;

    // Validate address
    if (!ValidatorUtil.isValidAddress(user_address)) {
      throw new Error('Invalid wallet address');
    }

    try {
      // Query contract
      const canLogin = await contract.login(user_address);
      const authMethods = await contract.getUserAuthMethods(user_address);

      return { canLogin, authMethods };
    } catch (error: any) {
      throw new Error(`Contract query failed: ${error.message}`);
    }
  }

  /**
   * Get user's authentication methods from contract
   */
  static async getUserAuthMethods(userAddress: string): Promise<string[]> {
    if (!ValidatorUtil.isValidAddress(userAddress)) {
      throw new Error('Invalid wallet address');
    }

    try {
      const authMethods = await contract.getUserAuthMethods(userAddress);
      return authMethods;
    } catch (error: any) {
      throw new Error(`Failed to get auth methods: ${error.message}`);
    }
  }

  /**
   * Store contract event in database for caching
   */
  private static async storeContractEvent(eventData: {
    event_name: string;
    block_number: number;
    transaction_hash: string;
    user_address: string;
    data: any;
  }) {
    const { error } = await supabaseAdmin
      .from('contract_events')
      .insert({
        ...eventData,
        indexed_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to store contract event:', error);
      // Don't throw error as this is just caching
    }
  }

  /**
   * Get cached contract events for a user
   */
  static async getUserContractEvents(userAddress: string) {
    const { data: events, error } = await supabaseAdmin
      .from('contract_events')
      .select('*')
      .eq('user_address', userAddress)
      .order('block_number', { ascending: false });

    if (error) {
      throw new Error(`Failed to get contract events: ${error.message}`);
    }

    return events || [];
  }

  /**
   * Get latest block number from cached events
   */
  static async getLatestCachedBlock(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('contract_events')
      .select('block_number')
      .order('block_number', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return 0; // Start from beginning if no cached events
    }

    return data.block_number;
  }

  /**
   * Sync contract events from blockchain
   */
  static async syncContractEvents(): Promise<{ syncedEvents: number }> {
    try {
      const latestCachedBlock = await this.getLatestCachedBlock();
      const currentBlock = await provider.getBlockNumber();

      if (latestCachedBlock >= currentBlock) {
        return { syncedEvents: 0 };
      }

      // Get events from contract
      const filter = contract.filters.UserRegistered();
      const events = await contract.queryFilter(
        filter,
        latestCachedBlock + 1,
        currentBlock
      );

      let syncedCount = 0;

      for (const event of events) {
        if (event.args) {
          await this.storeContractEvent({
            event_name: 'UserRegistered',
            block_number: event.blockNumber,
            transaction_hash: event.transactionHash,
            user_address: event.args[0], // user address
            data: {
              auth_method: event.args[1], // auth method
              timestamp: event.args[2]?.toString(), // timestamp
            },
          });
          syncedCount++;
        }
      }

      return { syncedEvents: syncedCount };
    } catch (error: any) {
      throw new Error(`Event sync failed: ${error.message}`);
    }
  }
}