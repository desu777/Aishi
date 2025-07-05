import dotenv from 'dotenv';
import { ServerConfig, NetworkConfig, RateLimitConfig } from '../types';

// Load environment variables
dotenv.config();

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value || defaultValue!;
}

function getEnvVarAsNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  return value ? parseInt(value, 10) : defaultValue;
}

function getEnvVarAsBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  return value ? value.toLowerCase() === 'true' : defaultValue;
}

function getEnvVarAsArray(name: string, defaultValue: string[]): string[] {
  const value = process.env[name];
  return value ? value.split(',').map(item => item.trim()) : defaultValue;
}

export const serverConfig: ServerConfig = {
  port: getEnvVarAsNumber('PORT', 3001),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  corsOrigins: getEnvVarAsArray('CORS_ORIGINS', ['http://localhost:3003']),
  maxRequestsPerMinute: getEnvVarAsNumber('MAX_REQUESTS_PER_MINUTE', 1000), // 10 -> 1000 (100x więcej)
  sessionTimeoutMinutes: getEnvVarAsNumber('SESSION_TIMEOUT_MINUTES', 30),
  logLevel: getEnvVar('LOG_LEVEL', 'info')
};

export const networkConfig: NetworkConfig = {
  computeRpcUrl: getEnvVar('COMPUTE_RPC_URL', 'https://evmrpc-testnet.0g.ai'),
  storageRpcUrl: getEnvVar('STORAGE_RPC_URL', 'https://indexer-storage-testnet-turbo.0g.ai'),
  defaultModel: getEnvVar('DEFAULT_MODEL', 'llama-3.3-70b-instruct'),
  enableDeepseek: getEnvVarAsBoolean('ENABLE_DEEPSEEK', true),
  enableLlama: getEnvVarAsBoolean('ENABLE_LLAMA', true)
};

export const rateLimitConfig: RateLimitConfig = {
  maxAiQueriesPerDay: getEnvVarAsNumber('MAX_AI_QUERIES_PER_DAY', 10000), // 100 -> 10000 (100x więcej)
  maxFundOperationsPerHour: getEnvVarAsNumber('MAX_FUND_OPERATIONS_PER_HOUR', 1000) // 5 -> 1000 (200x więcej)
};

// Validation
if (serverConfig.port < 1 || serverConfig.port > 65535) {
  throw new Error('PORT must be between 1 and 65535');
}

if (!['development', 'production', 'test'].includes(serverConfig.nodeEnv)) {
  throw new Error('NODE_ENV must be development, production, or test');
}

console.log('🔧 Environment configuration loaded:');
console.log(`- Server: ${serverConfig.nodeEnv} mode on port ${serverConfig.port}`);
console.log(`- Network: ${networkConfig.computeRpcUrl}`);
console.log(`- Default Model: ${networkConfig.defaultModel}`);
console.log(`- Rate Limits: ${serverConfig.maxRequestsPerMinute} requests/min, ${rateLimitConfig.maxAiQueriesPerDay} AI queries/day, ${rateLimitConfig.maxFundOperationsPerHour} fund ops/hour`); 