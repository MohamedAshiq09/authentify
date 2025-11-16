import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import type { WeightV2 } from "@polkadot/types/interfaces";
import {
  AuthentifyConfig,
  IdentityInfo,
  OnchainAuthSession,
  ContractResult,
} from "./types";
import { CONTRACT_METHODS, DEFAULT_CONFIG } from "./constants";
import { AuthentifyError, parseContractResult } from "./utils";

export class ContractClient {
  private config: AuthentifyConfig;
  private api: ApiPromise | null = null;
  private provider: WsProvider | null = null;
  private contract: ContractPromise | null = null;
  private signerAddress: string | null = null;
  private signerInjector: any | null = null;

  constructor(config: AuthentifyConfig) {
    this.config = config;
    // no-op
  }

  public async initialize(): Promise<void> {
    if (this.api && this.contract) return;
    const wsUrl = this.config.wsUrl || "ws://127.0.0.1:9944";
    this.provider = new WsProvider(wsUrl);
    this.api = await ApiPromise.create({ provider: this.provider });
    if (!this.config.contractAddress) {
      throw new AuthentifyError(
        "Missing contract address",
        "NO_CONTRACT_ADDRESS"
      );
    }
    const metadata = await this.loadMetadata();
    this.contract = new ContractPromise(
      this.api,
      metadata as any,
      this.config.contractAddress
    );
    await this.enableWallet();
  }

  private async loadMetadata(): Promise<any> {
    try {
      const meta = await import("../public/contract-metadata.json");
      return meta.default || meta;
    } catch {
      return { spec: { messages: [] } };
    }
  }

  private async enableWallet(): Promise<void> {
    try {
      const extensions = await web3Enable("Authentify SDK");
      if (!extensions.length) return;
      const accounts = await web3Accounts();
      if (!accounts.length) return;
      this.signerAddress = accounts[0].address;
      this.signerInjector = await web3FromAddress(accounts[0].address);
    } catch (e) {
      console.warn("Wallet extension not available", e);
    }
  }

  public async connectWallet(): Promise<string | null> {
    await this.enableWallet();
    return this.signerAddress;
  }

  private ensureSigner(): void {
    if (!this.signerAddress || !this.signerInjector) {
      throw new AuthentifyError("Wallet not connected", "WALLET_NOT_CONNECTED");
    }
  }

  private makeGas(): WeightV2 {
    const ref = BigInt(DEFAULT_CONFIG.CONTRACT_DEFAULT_GAS);
    const proof = ref;
    return this.api!.registry.createType("WeightV2", {
      refTime: ref,
      proofSize: proof,
    }) as unknown as WeightV2;
  }

  private makeMaxGas(): WeightV2 {
    // Very high gas for dry-run estimation (ref/proof ~1e15)
    const ref = BigInt("1000000000000000");
    const proof = ref;
    return this.api!.registry.createType("WeightV2", {
      refTime: ref,
      proofSize: proof,
    }) as unknown as WeightV2;
  }

  private multiplyWeight(g: WeightV2): WeightV2 {
    // Apply a safety multiplier to WeightV2
    const toBn = (x: any) =>
      typeof x?.toBn === "function" ? x.toBn() : BigInt(x ?? 0);
    const refBn = toBn((g as any).refTime ?? BigInt(0));
    const proofBn = toBn((g as any).proofSize ?? BigInt(0));
    const ref =
      (refBn * BigInt(DEFAULT_CONFIG.GAS_MULTIPLIER_NUM)) /
      BigInt(DEFAULT_CONFIG.GAS_MULTIPLIER_DEN);
    const proof =
      (proofBn * BigInt(DEFAULT_CONFIG.GAS_MULTIPLIER_NUM)) /
      BigInt(DEFAULT_CONFIG.GAS_MULTIPLIER_DEN);
    return this.api!.registry.createType("WeightV2", {
      refTime: ref,
      proofSize: proof,
    }) as unknown as WeightV2;
  }

  private async estimateGas(
    method: string,
    value: number | bigint,
    ...args: any[]
  ): Promise<WeightV2> {
    await this.ensureInitialized();
    const dryRun = await (this.contract as any).query[method](
      this.caller(),
      { gasLimit: this.makeMaxGas(), storageDepositLimit: null, value },
      ...args
    );
    const required: WeightV2 = (dryRun as any).gasRequired as WeightV2;
    return this.multiplyWeight(required);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.api || !this.contract) {
      await this.initialize();
    }
  }

  private caller(): string {
    if (!this.signerAddress) {
      throw new AuthentifyError("Wallet not connected", "WALLET_NOT_CONNECTED");
    }
    return this.signerAddress;
  }

  public async registerIdentity(data: {
    username: string;
    password_hash: string;
    social_id_hash: string;
    social_provider: string;
  }): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureSigner();
    const value = DEFAULT_CONFIG.CONTRACT_DEFAULT_VALUE;
    const gasLimit = await this.estimateGas(
      CONTRACT_METHODS.REGISTER_IDENTITY,
      value,
      data.username,
      data.password_hash,
      data.social_id_hash,
      data.social_provider
    );
    await this.contract!.tx[CONTRACT_METHODS.REGISTER_IDENTITY](
      { gasLimit, storageDepositLimit: null, value },
      data.username,
      data.password_hash,
      data.social_id_hash,
      data.social_provider
    ).signAndSend(this.signerAddress!, { signer: this.signerInjector!.signer });
    return true;
  }

  public async authenticate(
    username: string,
    passwordHash: string
  ): Promise<string | null> {
    await this.ensureInitialized();
    const gasLimit = this.makeGas();
    const result = await this.contract!.query[CONTRACT_METHODS.AUTHENTICATE](
      this.caller(),
      { gasLimit, storageDepositLimit: null },
      username,
      passwordHash
    );
    if (result.result.isOk && result.output) {
      return parseContractResult(
        result.output.toHuman() as unknown as ContractResult<string>
      );
    }
    return null;
  }

  public async createSession(
    accountId: string,
    sessionId: string,
    durationMs: number
  ): Promise<OnchainAuthSession | null> {
    await this.ensureInitialized();
    this.ensureSigner();
    const value = DEFAULT_CONFIG.CONTRACT_DEFAULT_VALUE;
    const gasLimit = await this.estimateGas(
      CONTRACT_METHODS.CREATE_SESSION,
      value,
      accountId,
      sessionId,
      durationMs
    );
    await this.contract!.tx[CONTRACT_METHODS.CREATE_SESSION](
      { gasLimit, storageDepositLimit: null, value },
      accountId,
      sessionId,
      durationMs
    ).signAndSend(this.signerAddress!, { signer: this.signerInjector!.signer });
    return {
      sessionId,
      accountId,
      expiresAt: Date.now() + durationMs,
      isActive: true,
    };
  }

  public async verifySession(sessionId: string): Promise<string | null> {
    await this.ensureInitialized();
    const gasLimit = this.makeGas();
    const result = await this.contract!.query[CONTRACT_METHODS.VERIFY_SESSION](
      this.caller(),
      { gasLimit, storageDepositLimit: null },
      sessionId
    );
    if (result.result.isOk && result.output) {
      return parseContractResult(
        result.output.toHuman() as unknown as ContractResult<string>
      );
    }
    return null;
  }

  public async revokeSession(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureSigner();
    const value = DEFAULT_CONFIG.CONTRACT_DEFAULT_VALUE;
    const gasLimit = await this.estimateGas(
      CONTRACT_METHODS.REVOKE_SESSION,
      value,
      sessionId
    );
    await this.contract!.tx[CONTRACT_METHODS.REVOKE_SESSION](
      { gasLimit, storageDepositLimit: null, value },
      sessionId
    ).signAndSend(this.signerAddress!, { signer: this.signerInjector!.signer });
    return true;
  }

  public async changePassword(
    oldHash: string,
    newHash: string
  ): Promise<boolean> {
    await this.ensureInitialized();
    this.ensureSigner();
    const value = DEFAULT_CONFIG.CONTRACT_DEFAULT_VALUE;
    const gasLimit = await this.estimateGas(
      CONTRACT_METHODS.CHANGE_PASSWORD,
      value,
      oldHash,
      newHash
    );
    await this.contract!.tx[CONTRACT_METHODS.CHANGE_PASSWORD](
      { gasLimit, storageDepositLimit: null, value },
      oldHash,
      newHash
    ).signAndSend(this.signerAddress!, { signer: this.signerInjector!.signer });
    return true;
  }

  public async getIdentity(accountId: string): Promise<IdentityInfo | null> {
    await this.ensureInitialized();
    const gasLimit = this.makeGas();
    const result = await this.contract!.query[CONTRACT_METHODS.GET_IDENTITY](
      this.caller(),
      { gasLimit, storageDepositLimit: null },
      accountId
    );
    if (result.result.isOk && result.output) {
      return parseContractResult(
        result.output.toHuman() as unknown as ContractResult<IdentityInfo>
      );
    }
    return null;
  }

  public async isUsernameAvailable(username: string): Promise<boolean> {
    await this.ensureInitialized();
    const gasLimit = this.makeGas();
    const result = await this.contract!.query[
      CONTRACT_METHODS.IS_USERNAME_AVAILABLE
    ](this.caller(), { gasLimit, storageDepositLimit: null }, username);
    if (result.result.isOk && result.output) {
      return parseContractResult(
        result.output.toHuman() as unknown as ContractResult<boolean>
      );
    }
    return false;
  }

  public async getAccountByUsername(username: string): Promise<string | null> {
    await this.ensureInitialized();
    const gasLimit = this.makeGas();
    const result = await this.contract!.query[
      CONTRACT_METHODS.GET_ACCOUNT_BY_USERNAME
    ](this.caller(), { gasLimit, storageDepositLimit: null }, username);
    if (result.result.isOk && result.output) {
      return parseContractResult(
        result.output.toHuman() as unknown as ContractResult<string>
      );
    }
    return null;
  }

  public async getTotalUsers(): Promise<number> {
    await this.ensureInitialized();
    const gasLimit = this.makeGas();
    const result = await this.contract!.query[CONTRACT_METHODS.GET_TOTAL_USERS](
      this.caller(),
      { gasLimit, storageDepositLimit: null }
    );
    if (result.result.isOk && result.output) {
      return parseContractResult(
        result.output.toHuman() as unknown as ContractResult<number>
      );
    }
    return 0;
  }

  public async getActiveSessions(): Promise<number> {
    return 0;
  }

  public async disconnect(): Promise<void> {
    if (this.api) await this.api.disconnect();
    this.api = null;
    this.contract = null;
    this.provider = null;
  }
}

export default ContractClient;
