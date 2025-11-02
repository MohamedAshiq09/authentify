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

export const config: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000')),
  FRONTEND_URL: getEnvVariable('FRONTEND_URL', 'http://localhost:3000'),
  
  SUPABASE_URL: getEnvVariable('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVariable('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_KEY: getEnvVariable('SUPABASE_SERVICE_KEY'),
  
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET'),
  JWT_EXPIRY: getEnvVariable('JWT_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: getEnvVariable('JWT_REFRESH_EXPIRY', '7d'),
  
  CONTRACT_ADDRESS: getEnvVariable('CONTRACT_ADDRESS'),
  RPC_URL: getEnvVariable('RPC_URL'),
  SERVICE_ACCOUNT_PRIVATE_KEY: getEnvVariable('SERVICE_ACCOUNT_PRIVATE_KEY'),
  
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVariable('RATE_LIMIT_WINDOW_MS', '900000')),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100')),
};