import { getAPI, isContractAvailable } from '../../config/contract.config';
import { supabaseAdmin } from '../../config/supabase.config';

export class EventsService {
  private static isListening = false;

  /**
   * Start listening to Polkadot contract events in real-time
   */
  static startEventListener(): void {
    if (this.isListening) {
      console.log('Event listener already running');
      return;
    }

    if (!isContractAvailable()) {
      console.warn('⚠️  Contract not available. Event listener cannot start.');
      console.warn('📋 Ensure contract metadata is loaded first.');
      return;
    }

    console.log('Starting Polkadot contract event listener...');
    this.isListening = true;

    try {
      const api = getAPI();

      // Subscribe to system events (includes contract events)
      api.query.system.events((events: any) => {
        events.forEach((record: any) => {
          const { event } = record;

          // Filter for contract events
          if (api.events.contracts && event.section === 'contracts') {
            this.handleContractEvent(event, record);
          }
        });
      });

      console.log('✅ Polkadot event listener started');

    } catch (error) {
      console.error('Failed to start event listener:', error);
      this.isListening = false;
    }
  }

  /**
   * Handle contract events
   */
  private static async handleContractEvent(event: any, record: any): Promise<void> {
    try {
      console.log('📡 Contract event received:', event.method);

      // Extract event data based on event type
      let eventData: any = {};

      if (event.method === 'ContractEmitted') {
        // Parse contract emitted events
        const [contractAddress, data] = event.data;
        
        eventData = {
          event_name: 'ContractEmitted',
          block_number: record.phase.asApplyExtrinsic || 0,
          transaction_hash: 'pending', // Will be updated when available
          user_address: contractAddress.toString(),
          data: {
            raw_data: data.toString(),
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Store event in database
      if (eventData.event_name) {
        await supabaseAdmin
          .from('contract_events')
          .insert({
            ...eventData,
            indexed_at: new Date().toISOString(),
          });

        console.log('✅ Contract event stored:', eventData.event_name);
      }

    } catch (error) {
      console.error('Failed to handle contract event:', error);
    }
  }

  /**
   * Stop event listener
   */
  static stopEventListener(): void {
    if (!this.isListening) {
      return;
    }

    console.log('Stopping Polkadot contract event listener...');
    
    try {
      // Note: Polkadot.js subscriptions are automatically cleaned up when API disconnects
      this.isListening = false;
      console.log('✅ Event listener stopped');
    } catch (error) {
      console.error('Error stopping event listener:', error);
    }
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
  static getListenerStatus(): { 
    isListening: boolean; 
    contractAvailable: boolean;
    apiConnected: boolean;
  } {
    let apiConnected = false;
    
    try {
      const api = getAPI();
      apiConnected = api.isConnected;
    } catch (error) {
      apiConnected = false;
    }

    return { 
      isListening: this.isListening,
      contractAvailable: isContractAvailable(),
      apiConnected,
    };
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

  /**
   * Get contract connection info
   */
  static getConnectionInfo(): {
    isListening: boolean;
    contractAvailable: boolean;
    endpoint: string;
  } {
    return {
      isListening: this.isListening,
      contractAvailable: isContractAvailable(),
      endpoint: process.env.SUBSTRATE_WS_ENDPOINT || 'Not configured',
    };
  }
}