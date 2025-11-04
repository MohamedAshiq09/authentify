import { ApiPromise, WsProvider } from '@polkadot/api';

const WS_PROVIDER = process.env.NEXT_PUBLIC_WS_PROVIDER || 'ws://127.0.0.1:9944';

let api: ApiPromise | null = null;

/**
 * Initialize Polkadot API connection
 */
export async function initApi(): Promise<ApiPromise> {
  if (api && api.isConnected) {
    return api;
  }

  try {
    const provider = new WsProvider(WS_PROVIDER);
    api = await ApiPromise.create({ provider });
    await api.isReady;
    
    console.log('✅ Connected to Polkadot node');
    return api;
  } catch (error) {
    console.error('❌ Failed to connect to Polkadot node:', error);
    throw error;
  }
}

/**
 * Get API instance (initialize if not connected)
 */
export async function getApi(): Promise<ApiPromise> {
  if (!api || !api.isConnected) {
    return initApi();
  }
  return api;
}

/**
 * Check if API is connected
 */
export function isApiConnected(): boolean {
  return api !== null && api.isConnected;
}

/**
 * Disconnect API
 */
export async function disconnectApi(): Promise<void> {
  if (api) {
    await api.disconnect();
    api = null;
    console.log('🔌 Disconnected from Polkadot node');
  }
}

/**
 * Get chain info
 */
export async function getChainInfo() {
  const api = await getApi();
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  return {
    chain: chain.toString(),
    nodeName: nodeName.toString(),
    nodeVersion: nodeVersion.toString(),
  };
}

/**
 * Get account balance
 */
export async function getBalance(address: string): Promise<string> {
  try {
    const api = await getApi();
    const { data: balance } = await api.query.system.account(address);
    return balance.free.toString();
  } catch (error) {
    console.error('Failed to get balance:', error);
    return '0';
  }
}