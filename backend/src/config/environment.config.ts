import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  
  CONTRACT_ADDRESS: string;
  RPC_URL: string;
  SERVICE_ACCOUNT_PRIVATE_KEY: string;
  
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getOptionalEnvVariable = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

export const config: EnvConfig = {
  NODE_ENV: getOptionalEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getOptionalEnvVariable('PORT', '5000')),
  FRONTEND_URL: getOptionalEnvVariable('FRONTEND_URL', 'http://localhost:3000'),
  
  SUPABASE_URL: getEnvVariable('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVariable('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_KEY: getEnvVariable('SUPABASE_SERVICE_KEY'),
  
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET'),
  JWT_EXPIRY: getOptionalEnvVariable('JWT_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: getOptionalEnvVariable('JWT_REFRESH_EXPIRY', '7d'),
  
  CONTRACT_ADDRESS: getOptionalEnvVariable('CONTRACT_ADDRESS', '0x0000000000000000000000000000000000000000'),
  RPC_URL: getOptionalEnvVariable('RPC_URL', 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'),
  SERVICE_ACCOUNT_PRIVATE_KEY: getOptionalEnvVariable('SERVICE_ACCOUNT_PRIVATE_KEY', '0x0000000000000000000000000000000000000000000000000000000000000000'),
  
  RATE_LIMIT_WINDOW_MS: parseInt(getOptionalEnvVariable('RATE_LIMIT_WINDOW_MS', '900000')),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getOptionalEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100')),
};