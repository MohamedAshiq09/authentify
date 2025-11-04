// Re-export Polkadot extension types
export type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';

export interface WalletState {
  isConnected: boolean;
  accounts: import('@polkadot/extension-inject/types').InjectedAccountWithMeta[];
  selectedAccount: import('@polkadot/extension-inject/types').InjectedAccountWithMeta | null;
  isExtensionAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}