import { ethers } from 'ethers';
import { config } from './environment.config';

// Your contract ABI (paste from contract folder)
const AUTHENTIFY_ABI = [
  "function register(address user, string calldata authMethod) external",
  "function login(address user) external view returns (bool)",
  "function getUserAuthMethods(address user) external view returns (string[] memory)",
  "event UserRegistered(address indexed user, string authMethod, uint256 timestamp)",
  "event UserLoggedIn(address indexed user, uint256 timestamp)"
];

// Setup provider
const provider = new ethers.JsonRpcProvider(config.RPC_URL);

// Setup service account wallet
const serviceWallet = new ethers.Wallet(
  config.SERVICE_ACCOUNT_PRIVATE_KEY,
  provider
);

// Contract instance
export const contract = new ethers.Contract(
  config.CONTRACT_ADDRESS,
  AUTHENTIFY_ABI,
  serviceWallet
);

export { provider, serviceWallet };