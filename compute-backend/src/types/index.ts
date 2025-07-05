import { Request } from 'express';

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface AuthenticatedRequest extends Request {
  userAddress?: string;
  timestamp?: number;
}

// Broker Operations
export interface InitBrokerRequest {
  address: string;
  signature: string;
  timestamp: number;
}

export interface InitBrokerResponse {
  success: boolean;
  brokerAddress: string;
  message: string;
}

export interface FundAccountRequest {
  address: string;
  amount: string; // In OG tokens
  signature: string;
  timestamp: number;
}

export interface FundAccountResponse {
  success: boolean;
  txHash?: string;
  newBalance: string;
  message: string;
}

export interface BalanceResponse {
  balance: string;
  formatted: string;
  currency: "OG";
}

// AI Operations
export interface AIAnalysisRequest {
  address: string;
  dreamText: string;
  signature: string;
  timestamp: number;
  options?: {
    model?: "llama" | "deepseek";
    level?: number; // Agent level 1-7
  };
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis?: {
    interpretation: string;
    symbols: string[];
    emotions: string[];
    insights: string[];
    model: string;
    responseTime: number;
  };
  cost: string;
  remainingBalance: string;
  error?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  costPerQuery: string;
  features: string[];
  available: boolean;
}

export interface ModelsResponse {
  models: AIModel[];
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

export interface UserSession {
  address: string;
  brokerInitialized: boolean;
  lastActivity: Date;
  requestCount: number;
  aiQueriesUsed: number;
  fundOperationsUsed: number;
}

export interface BrokerSession {
  broker: any; // ZGComputeNetworkBroker instance
  wallet: any; // ethers.Wallet instance
  initialized: boolean;
  lastUsed: Date;
}

export interface SignatureVerification {
  isValid: boolean;
  address?: string;
  timestamp?: number;
  message?: string;
}

export interface ComputeOperation {
  type: 'init' | 'fund' | 'balance' | 'inference';
  address: string;
  timestamp: Date;
  success: boolean;
  cost?: string;
  error?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ComputeBackendError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ComputeBackendError';
  }
}

export class AuthenticationError extends ComputeBackendError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class ValidationError extends ComputeBackendError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class RateLimitError extends ComputeBackendError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class InsufficientFundsError extends ComputeBackendError {
  constructor(message: string = 'Insufficient funds') {
    super(message, 402, 'INSUFFICIENT_FUNDS');
  }
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  maxRequestsPerMinute: number;
  sessionTimeoutMinutes: number;
  logLevel: string;
}

export interface NetworkConfig {
  computeRpcUrl: string;
  storageRpcUrl: string;
  defaultModel: string;
  enableDeepseek: boolean;
  enableLlama: boolean;
}

export interface RateLimitConfig {
  maxAiQueriesPerDay: number;
  maxFundOperationsPerHour: number;
} 