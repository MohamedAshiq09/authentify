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
  
  // Polkadot Contract Configuration
  CONTRACT_ADDRESS: string;
  SUBSTRATE_WS_ENDPOINT: string;
  SERVICE_ACCOUNT_SEED: string;
  
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
  
  CONTRACT_ADDRESS: getOptionalEnvVariable('CONTRACT_ADDRESS', '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'),
  SUBSTRATE_WS_ENDPOINT: getOptionalEnvVariable('SUBSTRATE_WS_ENDPOINT', 'ws://127.0.0.1:9944'),
  SERVICE_ACCOUNT_SEED: getOptionalEnvVariable('SERVICE_ACCOUNT_SEED', '//Alice'),
  
  RATE_LIMIT_WINDOW_MS: parseInt(getOptionalEnvVariable('RATE_LIMIT_WINDOW_MS', '900000')),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getOptionalEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100')),
};