import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
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
  try {
    console.log('🔗 Connecting to Substrate node...');
    const provider = new WsProvider(config.SUBSTRATE_WS_ENDPOINT);
    
    api = await ApiPromise.create({ provider });
    await api.isReady;
    
    console.log('✅ Connected to Substrate node');
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

  } catch (error) {
    console.error('❌ Failed to initialize Polkadot API:', error);
    throw error;
  }
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