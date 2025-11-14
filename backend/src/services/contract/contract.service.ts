import { getAPI, getContract, getServiceAccount, isContractAvailable } from '../../config/contract.config';
import { supabaseAdmin } from '../../config/supabase.config';
import { RegisterContractRequest, QueryUserRequest } from '../../types/contract.types';

export class ContractService {
  /**
   * Register user on ink! smart contract
   */
  static async registerUser(data: RegisterContractRequest): Promise<{ transactionHash: string }> {
    const { user_address, auth_method } = data;

    // Validate Substrate address format (basic check)
    if (!user_address || user_address.length < 47) {
      throw new Error('Invalid Substrate address format');
    }

    if (!isContractAvailable()) {
      throw new Error('Contract not available. Ensure contract metadata is loaded.');
    }

    try {
      const contract = getContract();
      const serviceAccount = getServiceAccount();
      const api = getAPI();

      console.log(`📝 Registering user: ${user_address} with method: ${auth_method}`);

      // Execute transaction directly (skip dry run for now)
      const tx = contract.tx.register_identity(
        {
          gasLimit: -1, // Use automatic gas estimation
          storageDepositLimit: null,
        },
        user_address,
        'password_hash_placeholder',
        `social_hash_${Date.now()}`,
        auth_method
      );

      // Sign and send transaction
      return new Promise((resolve, reject) => {
        tx.signAndSend(serviceAccount, (result) => {
          if (result.status.isInBlock) {
            console.log(`✅ Transaction included in block: ${result.status.asInBlock}`);
            
            // Store event in database
            this.storeContractEvent({
              event_name: 'UserRegistered',
              block_number: 0, // Will be updated when we get block info
              transaction_hash: result.txHash.toString(),
              user_address,
              data: { auth_method },
            });

            resolve({ transactionHash: result.txHash.toString() });
          } else if (result.status.isFinalized) {
            console.log(`🎉 Transaction finalized: ${result.status.asFinalized}`);
          } else if (result.isError) {
            console.error('Transaction error:', result);
            reject(new Error('Transaction failed'));
          }
        }).catch(reject);
      });

    } catch (error: any) {
      console.error('Contract registration error:', error);
      throw new Error(`Contract registration failed: ${error.message}`);
    }
  }

  /**
   * Check if user can login (query contract)
   */
  static async canUserLogin(data: QueryUserRequest): Promise<{ canLogin: boolean; authMethods: string[] }> {
    const { user_address } = data;

    if (!isContractAvailable()) {
      // If contract not available, return false but don't throw error
      console.warn('Contract not available for login check');
      return { canLogin: false, authMethods: [] };
    }

    try {
      const contract = getContract();
      const serviceAccount = getServiceAccount();
      const api = getAPI();

      // Check if user has identity
      const { result, output } = await contract.query.has_identity(
        serviceAccount.address,
        {
          gasLimit: -1, // Use automatic gas estimation
          storageDepositLimit: null,
        },
        user_address
      );

      if (result.isOk && output) {
        const canLogin = output.toHuman() as boolean;
        
        // If user can login, get their auth methods
        if (canLogin) {
          const authMethods = await this.getUserAuthMethods(user_address);
          return { canLogin, authMethods };
        }
      }

      return { canLogin: false, authMethods: [] };

    } catch (error: any) {
      console.error('Contract query error:', error);
      throw new Error(`Contract query failed: ${error.message}`);
    }
  }

  /**
   * Get user's authentication methods from contract
   */
  static async getUserAuthMethods(userAddress: string): Promise<string[]> {
    if (!isContractAvailable()) {
      console.warn('Contract not available for auth methods check');
      return [];
    }

    try {
      const contract = getContract();
      const serviceAccount = getServiceAccount();
      const api = getAPI();

      const { result, output } = await contract.query.get_identity(
        serviceAccount.address,
        {
          gasLimit: -1, // Use automatic gas estimation
          storageDepositLimit: null,
        },
        userAddress
      );

      if (result.isOk && output) {
        const identity = output.toHuman() as any;
        
        // Extract auth methods from identity data
        if (identity && identity.socialProvider) {
          return [identity.socialProvider];
        }
      }

      return [];

    } catch (error: any) {
      console.error('Failed to get auth methods:', error);
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
   * Note: This is a placeholder for Polkadot event syncing
   */
  static async syncContractEvents(): Promise<{ syncedEvents: number }> {
    try {
      if (!isContractAvailable()) {
        console.warn('Contract not available for event syncing');
        return { syncedEvents: 0 };
      }

      // TODO: Implement proper event syncing for Polkadot
      // This would involve listening to system events and filtering for contract events
      console.log('📊 Event syncing for Polkadot contracts - implementation pending');
      
      return { syncedEvents: 0 };

    } catch (error: any) {
      console.error('Event sync error:', error);
      throw new Error(`Event sync failed: ${error.message}`);
    }
  }

  /**
   * Get contract connection status
   */
  static getContractStatus(): {
    isConnected: boolean;
    contractAvailable: boolean;
    contractAddress: string;
  } {
    try {
      const api = getAPI();
      return {
        isConnected: api.isConnected,
        contractAvailable: isContractAvailable(),
        contractAddress: process.env.CONTRACT_ADDRESS || 'Not configured',
      };
    } catch (error) {
      return {
        isConnected: false,
        contractAvailable: false,
        contractAddress: 'Not configured',
      };
    }
  }
}