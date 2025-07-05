// 0G Network Provider Addresses
export const OFFICIAL_PROVIDERS = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
} as const;

// Contract Addresses (0G Galileo Testnet)
export const CONTRACT_ADDRESSES = {
  LEDGER: '0x1a85Dd32da10c170F4f138d082DDc496ab3E5BAa',
  INFERENCE: '0x5299bd255B76305ae08d7F95B270A485c6b95D54',
  FINE_TUNING: '0xda478Ccf5d534346A16b1475E4c2DecE0268B176'
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: 16601,
  CURRENCY: 'OG',
  BLOCK_EXPLORER: 'https://chainscan-galileo.0g.ai'
} as const;

// Signature Message Templates
export const SIGNATURE_MESSAGES = {
  INIT_BROKER: (address: string, timestamp: number) => 
    `Initialize 0G Broker for ${address} at ${timestamp}`,
  
  CHECK_BALANCE: (address: string, timestamp: number) => 
    `Check balance for ${address} at ${timestamp}`,
  
  FUND_ACCOUNT: (address: string, amount: string, timestamp: number) => 
    `Fund ${amount} OG for ${address} at ${timestamp}`,
  
  AI_ANALYSIS: (address: string, timestamp: number) => 
    `Analyze dream for ${address} at ${timestamp}`
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  SESSION_TTL_MS: 30 * 60 * 1000, // 30 minutes
  BROKER_TTL_MS: 60 * 60 * 1000,  // 1 hour
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000 // 5 minutes
} as const;

// Operation Limits
export const OPERATION_LIMITS = {
  MIN_FUND_AMOUNT: 0.001, // 0.001 OG minimum
  MAX_FUND_AMOUNT: 10.0,  // 10 OG maximum per operation
  MAX_DREAM_TEXT_LENGTH: 5000, // 5000 characters
  MIN_DREAM_TEXT_LENGTH: 10,   // 10 characters
  SIGNATURE_TIMESTAMP_TOLERANCE_MS: 5 * 60 * 1000 // 5 minutes
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Model Configuration
export const MODEL_CONFIG = {
  MODELS: [
    {
      id: 'llama',
      name: 'LLAMA-3.3-70B-Instruct',
      provider: OFFICIAL_PROVIDERS['llama-3.3-70b-instruct'],
      features: ['fast', 'conversational', 'general-purpose'],
      estimatedCostPerQuery: '0.001-0.003'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek-R1-70B',
      provider: OFFICIAL_PROVIDERS['deepseek-r1-70b'],
      features: ['detailed', 'analytical', 'reasoning'],
      estimatedCostPerQuery: '0.001-0.003'
    }
  ]
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_SIGNATURE: 'Invalid signature or expired timestamp',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this operation',
  BROKER_NOT_INITIALIZED: 'Broker account not initialized',
  INVALID_ADDRESS: 'Invalid Ethereum address',
  INVALID_AMOUNT: 'Invalid amount specified',
  DREAM_TEXT_TOO_LONG: 'Dream text exceeds maximum length',
  DREAM_TEXT_TOO_SHORT: 'Dream text is too short',
  MODEL_NOT_AVAILABLE: 'Selected AI model is not available',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded, please try again later',
  NETWORK_ERROR: 'Network error, please try again',
  INTERNAL_ERROR: 'Internal server error'
} as const; 