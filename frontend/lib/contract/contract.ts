import { ContractPromise } from '@polkadot/api-contract';
import { getApi } from '../polkadot/connection';
import { getSigner } from '../polkadot/wallet';
import contractMetadata from './metadata.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

let contract: ContractPromise | null = null;

/**
 * Initialize contract instance
 */
export async function initContract(): Promise<ContractPromise> {
  if (contract) {
    return contract;
  }

  try {
    const api = await getApi();
    contract = new ContractPromise(api, contractMetadata, CONTRACT_ADDRESS);
    console.log('✅ Contract initialized');
    return contract;
  } catch (error) {
    console.error('❌ Failed to initialize contract:', error);
    throw error;
  }
}

/**
 * Get contract instance
 */
export async function getContract(): Promise<ContractPromise> {
  if (!contract) {
    return initContract();
  }
  return contract;
}

/**
 * Query contract (read-only)
 */
export async function queryContract(
  method: string,
  callerAddress: string,
  ...args: any[]
) {
  try {
    const contract = await getContract();
    const api = await getApi();

    const gasLimit = api.registry.createType('WeightV2', {
      refTime: 1000000000,
      proofSize: 100000,
    });

    const { result, output } = await (contract.query as any)[method](
      callerAddress,
      { gasLimit },
      ...args
    );

    if (result.isOk && output) {
      return output.toHuman();
    } else {
      throw new Error(`Contract query failed: ${result.asErr || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Failed to query contract method ${method}:`, error);
    throw error;
  }
}

/**
 * Execute contract transaction (write)
 */
export async function executeContract(
  method: string,
  signerAddress: string,
  ...args: any[]
) {
  try {
    const contract = await getContract();
    const api = await getApi();
    const signer = await getSigner(signerAddress);

    const gasLimit = api.registry.createType('WeightV2', {
      refTime: 3000000000,
      proofSize: 1000000,
    });

    // Execute transaction
    const tx = (contract.tx as any)[method](
      { gasLimit, storageDepositLimit: null },
      ...args
    );

    return new Promise((resolve, reject) => {
      tx.signAndSend(signerAddress, { signer }, (result: any) => {
        if (result.status.isInBlock) {
          console.log(`Transaction included in block: ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized: ${result.status.asFinalized}`);
          resolve(result.txHash.toString());
        } else if (result.isError) {
          reject(new Error('Transaction failed'));
        }
      }).catch(reject);
    });
  } catch (error) {
    console.error(`Failed to execute contract method ${method}:`, error);
    throw error;
  }
}

/**
 * Check if user has identity on contract
 */
export async function hasIdentity(address: string): Promise<boolean> {
  try {
    const result = await queryContract('hasIdentity', address, address);
    return result as boolean;
  } catch (error) {
    console.error('Failed to check identity:', error);
    return false;
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(
  callerAddress: string,
  username: string
): Promise<boolean> {
  try {
    const result = await queryContract('isUsernameAvailable', callerAddress, username);
    return result as boolean;
  } catch (error) {
    console.error('Failed to check username availability:', error);
    return false;
  }
}

/**
 * Get user identity from contract
 */
export async function getIdentity(callerAddress: string, userAddress: string) {
  try {
    const result = await queryContract('getIdentity', callerAddress, userAddress);
    return result;
  } catch (error) {
    console.error('Failed to get identity:', error);
    return null;
  }
}