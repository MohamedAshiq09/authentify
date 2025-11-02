import { contract, provider } from '../../config/contract.config';
import { supabaseAdmin } from '../../config/supabase.config';

export class EventsService {
  private static isListening = false;

  /**
   * Start listening to contract events in real-time
   */
  static startEventListener(): void {
    if (this.isListening) {
      console.log('Event listener already running');
      return;
    }

    console.log('Starting contract event listener...');
    this.isListening = true;

    // Listen for UserRegistered events
    contract.on('UserRegistered', async (user, authMethod, timestamp, event) => {
      try {
        console.log('New UserRegistered event:', { user, authMethod, timestamp });

        await supabaseAdmin
          .from('contract_events')
          .insert({
            event_name: 'UserRegistered',
            block_number: event.blockNumber,
            transaction_hash: event.transactionHash,
            user_address: user,
            data: {
              auth_method: authMethod,
              timestamp: timestamp.toString(),
            },
            indexed_at: new Date().toISOString(),
          });

        console.log('Event stored successfully');
      } catch (error) {
        console.error('Failed to store UserRegistered event:', error);
      }
    });

    // Listen for UserLoggedIn events
    contract.on('UserLoggedIn', async (user, timestamp, event) => {
      try {
        console.log('New UserLoggedIn event:', { user, timestamp });

        await supabaseAdmin
          .from('contract_events')
          .insert({
            event_name: 'UserLoggedIn',
            block_number: event.blockNumber,
            transaction_hash: event.transactionHash,
            user_address: user,
            data: {
              timestamp: timestamp.toString(),
            },
            indexed_at: new Date().toISOString(),
          });

        console.log('Login event stored successfully');
      } catch (error) {
        console.error('Failed to store UserLoggedIn event:', error);
      }
    });

    // Handle provider errors
    provider.on('error', (error) => {
      console.error('Provider error:', error);
      this.restartListener();
    });
  }

  /**
   * Stop event listener
   */
  static stopEventListener(): void {
    if (!this.isListening) {
      return;
    }

    console.log('Stopping contract event listener...');
    contract.removeAllListeners();
    provider.removeAllListeners();
    this.isListening = false;
  }

  /**
   * Restart event listener (useful for error recovery)
   */
  static restartListener(): void {
    console.log('Restarting event listener...');
    this.stopEventListener();
    
    // Wait a bit before restarting
    setTimeout(() => {
      this.startEventListener();
    }, 5000);
  }

  /**
   * Get event listener status
   */
  static getListenerStatus(): { isListening: boolean } {
    return { isListening: this.isListening };
  }

  /**
   * Get recent contract events from database
   */
  static async getRecentEvents(limit: number = 50) {
    const { data: events, error } = await supabaseAdmin
      .from('contract_events')
      .select('*')
      .order('indexed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get recent events: ${error.message}`);
    }

    return events || [];
  }

  /**
   * Get events by user address
   */
  static async getEventsByUser(userAddress: string, limit: number = 20) {
    const { data: events, error } = await supabaseAdmin
      .from('contract_events')
      .select('*')
      .eq('user_address', userAddress)
      .order('indexed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get user events: ${error.message}`);
    }

    return events || [];
  }

  /**
   * Get events by transaction hash
   */
  static async getEventsByTransaction(transactionHash: string) {
    const { data: events, error } = await supabaseAdmin
      .from('contract_events')
      .select('*')
      .eq('transaction_hash', transactionHash);

    if (error) {
      throw new Error(`Failed to get transaction events: ${error.message}`);
    }

    return events || [];
  }
}