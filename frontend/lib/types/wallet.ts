export interface InjectedAccountWithMeta {
  address: string;
  meta: {
    genesisHash?: string;
    name?: string;
    source: string;
  };
  type?: string;
}

export interface InjectedExtension {
  name: string;
  version: string;
  accounts: {
    get: () => Promise<InjectedAccountWithMeta[]>;
  };
  signer: {
    signPayload?: (payload: any) => Promise<any>;
    signRaw?: (raw: any) => Promise<any>;
  };
}

export interface WalletState {
  isConnected: boolean;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  isExtensionAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}