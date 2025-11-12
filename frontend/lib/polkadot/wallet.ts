// Dynamic import to avoid SSR issues
let web3Accounts: any, web3Enable: any, web3FromAddress: any;

if (typeof window !== 'undefined') {
  import('@polkadot/extension-dapp').then((module) => {
    web3Accounts = module.web3Accounts;
    web3Enable = module.web3Enable;
    web3FromAddress = module.web3FromAddress;
  });
}
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

/**
 * Check if Polkadot.js extension is available
 */
export function isExtensionAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window as any).injectedWeb3;
}

/**
 * Enable Polkadot.js extension
 */
export async function enableExtension(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    // Dynamically import if not already loaded
    if (!web3Enable) {
      const module = await import('@polkadot/extension-dapp');
      web3Accounts = module.web3Accounts;
      web3Enable = module.web3Enable;
      web3FromAddress = module.web3FromAddress;
    }

    const extensions = await web3Enable('Authentify');
    return extensions.length > 0;
  } catch (error) {
    console.error('Failed to enable extension:', error);
    return false;
  }
}

/**
 * Get all accounts from extension
 */
export async function getAccounts(): Promise<InjectedAccountWithMeta[]> {
  try {
    if (typeof window === 'undefined') {
      return [];
    }

    const enabled = await enableExtension();
    if (!enabled) {
      throw new Error('Extension not enabled');
    }

    const accounts = await web3Accounts();
    return accounts;
  } catch (error) {
    console.error('Failed to get accounts:', error);
    throw error;
  }
}

/**
 * Get signer for an account
 */
export async function getSigner(address: string) {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Signer operations are only available in browser environment');
    }

    // Dynamically import if not already loaded
    if (!web3FromAddress) {
      const module = await import('@polkadot/extension-dapp');
      web3Accounts = module.web3Accounts;
      web3Enable = module.web3Enable;
      web3FromAddress = module.web3FromAddress;
    }

    const injector = await web3FromAddress(address);
    return injector.signer;
  } catch (error) {
    console.error('Failed to get signer:', error);
    throw error;
  }
}

/**
 * Format address for display (show first 6 and last 4 characters)
 */
export function formatAddress(address: string, length: number = 10): string {
  if (!address || address.length <= length) {
    return address;
  }

  const start = Math.floor(length / 2);
  const end = length - start;

  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Sign message with account
 */
export async function signMessage(address: string, message: string): Promise<string> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Message signing is only available in browser environment');
    }

    // Dynamically import if not already loaded
    if (!web3FromAddress) {
      const module = await import('@polkadot/extension-dapp');
      web3Accounts = module.web3Accounts;
      web3Enable = module.web3Enable;
      web3FromAddress = module.web3FromAddress;
    }

    const injector = await web3FromAddress(address);

    if (!injector.signer.signRaw) {
      throw new Error('Signer does not support raw signing');
    }

    const { signature } = await injector.signer.signRaw({
      address,
      data: message,
      type: 'bytes',
    });

    return signature;
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw error;
  }
}