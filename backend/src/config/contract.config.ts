import { ApiPromise, WsProvider, HttpProvider, Keyring } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { KeyringPair } from '@polkadot/keyring/types';
import { config } from './environment.config';
import * as fs from 'fs';
import * as path from 'path';

// Contract metadata path (will be copied after contract deployment)
const CONTRACT_METADATA_PATH = path.join(__dirname, '../../contract-metadata.json');

let api: ApiPromise | null = null;
let contract: ContractPromise | null = null;
let serviceAccount: KeyringPair | null = null;

/**
 * Initialize Polkadot API connection
 */
export async function initializePolkadotAPI(): Promise<void> {
  // Try multiple RPC endpoints (WebSocket and HTTP)
  const endpoints = [
    config.SUBSTRATE_WS_ENDPOINT,
    'wss://rpc1.paseo.popnetwork.xyz',
    'wss://rpc2.paseo.popnetwork.xyz', 
    'wss://rpc3.paseo.popnetwork.xyz',
    'https://rpc1.paseo.popnetwork.xyz',
    'https://rpc2.paseo.popnetwork.xyz'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔗 Connecting to Substrate node: ${endpoint}...`);
      
      // Create appropriate provider based on endpoint type
      let provider;
      if (endpoint.startsWith('wss://') || endpoint.startsWith('ws://')) {
        provider = new WsProvider(endpoint, false, undefined, 8000); // 8 second timeout
        
        // Add connection event listeners for debugging WebSocket
        provider.on('connected', () => console.log(`🔌 WebSocket connected to ${endpoint}`));
        provider.on('disconnected', () => console.log(`🔌 WebSocket disconnected from ${endpoint}`));
        provider.on('error', (error) => console.log(`🔌 WebSocket error for ${endpoint}:`, error.message));
      } else {
        // HTTP provider
        provider = new HttpProvider(endpoint);
        console.log(`🔌 Using HTTP provider for ${endpoint}`);
      }
      
      // Create API with shorter timeout
      const apiPromise = ApiPromise.create({ 
        provider,
        throwOnConnect: true,
        throwOnUnknown: false
      });
      
      // Add timeout to the connection attempt
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Connection timeout after 10 seconds for ${endpoint}`)), 10000);
      });
      
      api = await Promise.race([
        apiPromise,
        timeoutPromise
      ]) as ApiPromise;
      
      await api.isReady;
      
      console.log(`✅ Connected to Substrate node: ${endpoint}`);
      console.log(`🌐 Chain: ${await api.rpc.system.chain()}`);

      // Initialize keyring and service account
      const keyring = new Keyring({ type: 'sr25519' });
      serviceAccount = keyring.addFromUri(config.SERVICE_ACCOUNT_SEED);
      
      console.log(`🔑 Service account: ${serviceAccount.address}`);

      // Load contract metadata if available
      if (fs.existsSync(CONTRACT_METADATA_PATH)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(CONTRACT_METADATA_PATH, 'utf8'));
          
          // Initialize contract instance
          contract = new ContractPromise(api, metadata, config.CONTRACT_ADDRESS);
          
          console.log('✅ Contract initialized');
          console.log(`📄 Contract address: ${config.CONTRACT_ADDRESS}`);
        } catch (error) {
          console.error('❌ Failed to load contract metadata:', error);
        }
      } else {
        console.warn('⚠️  Contract metadata not found. Contract calls will be limited.');
        console.warn(`📁 Expected location: ${CONTRACT_METADATA_PATH}`);
        console.warn('📋 Copy contract metadata after deployment: cp ../contract/target/ink/authentify_contract.json ./contract-metadata.json');
      }

      // Successfully connected, break out of the loop
      return;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  Failed to connect to ${endpoint}:`, errorMessage);
      if (api) {
        await api.disconnect();
        api = null;
      }
      // Continue to next endpoint
    }
  }

  // If we get here, all endpoints failed
  throw new Error('❌ Failed to connect to any Pop Network RPC endpoint');
}

/**
 * Get API instance (throws if not initialized)
 */
export function getAPI(): ApiPromise {
  if (!api) {
    throw new Error('Polkadot API not initialized. Call initializePolkadotAPI() first.');
  }
  return api;
}

/**
 * Get contract instance (throws if not initialized)
 */
export function getContract(): ContractPromise {
  if (!contract) {
    throw new Error('Contract not initialized. Ensure metadata file exists and API is connected.');
  }
  return contract;
}

/**
 * Get service account (throws if not initialized)
 */
export function getServiceAccount(): KeyringPair {
  if (!serviceAccount) {
    throw new Error('Service account not initialized.');
  }
  return serviceAccount;
}

/**
 * Check if contract is available
 */
export function isContractAvailable(): boolean {
  return contract !== null;
}

/**
 * Close API connection
 */
export async function closeAPI(): Promise<void> {
  if (api) {
    await api.disconnect();
    console.log('🔌 Disconnected from Substrate node');
  }
}

export { api, contract, serviceAccount };