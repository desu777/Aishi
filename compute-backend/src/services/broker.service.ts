import { ethers } from 'ethers';
import { networkConfig } from '../config/env';
import { OFFICIAL_PROVIDERS } from '../config/constants';
import { 
  BrokerSession, 
  ComputeBackendError, 
  InsufficientFundsError,
  InitBrokerResponse,
  FundAccountResponse,
  BalanceResponse
} from '../types';
import { 
  getBrokerSession, 
  setBrokerSession, 
  updateBrokerActivity,
  removeBrokerSession 
} from '../utils/cache';
import { logOperation, logError } from '../utils/logger';
import { FrontendDelegatedBroker, createFrontendDelegatedBroker } from './frontend-delegated-broker';
import axios from 'axios';

/**
 * Broker Service - Manages 0G Compute Network broker instances
 * Uses FrontendDelegatedBroker instead of SDK's broker
 */
export class BrokerService {
  private provider: ethers.JsonRpcProvider;
  private apiUrl: string = process.env.SIGNATURE_API_URL || 'http://localhost:3001/api/signature';

  constructor() {
    this.provider = new ethers.JsonRpcProvider(networkConfig.computeRpcUrl);
  }

  /**
   * Create signature callback that communicates with frontend
   */
  private createSignatureCallback(address: string) {
    return async (operation: any): Promise<string> => {
      const operationId = this.generateOperationId(operation.type, JSON.stringify(operation));
      
      logOperation('signature_request_creating', address, false, { 
        operationId, 
        type: operation.type 
      });
      
      // Create signature request
      await axios.post(`${this.apiUrl}/request`, {
        operationId,
        address,
        operation
      });
      
      // Wait for signature (long polling)
      try {
        const response = await axios.get(`${this.apiUrl}/wait/${operationId}`, {
          timeout: 65000 // 65 seconds
        });
        
        if (response.data.success && response.data.signature) {
          logOperation('signature_received', address, true, { operationId });
          return response.data.signature;
        }
        
        throw new Error('Failed to get signature');
      } catch (error: any) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Signature timeout - user did not sign in time');
        }
        throw error;
      }
    };
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(type: string, data: string): string {
    const timestamp = Date.now();
    const hash = ethers.keccak256(ethers.toUtf8Bytes(data));
    return `${type}_${timestamp}_${hash.slice(0, 10)}`;
  }

  /**
   * Initialize broker account for a user using RemoteSigner
   */
  async initializeBroker(address: string): Promise<InitBrokerResponse> {
    try {
      logOperation('init_broker_start', address, false, { rpc: networkConfig.computeRpcUrl });

      // Check if broker already exists
      let existingSession = getBrokerSession(address);
      if (existingSession && existingSession.initialized) {
        logOperation('init_broker_exists', address, true);
        return {
          success: true,
          brokerAddress: address,
          message: 'Broker already initialized'
        };
      }

      // Create signature callback
      const signatureCallback = this.createSignatureCallback(address);

      // Create custom broker
      logOperation('init_broker_creating', address, false);
      const broker = await createFrontendDelegatedBroker(
        address, 
        this.provider, 
        signatureCallback
      );

      // Check if ledger exists
      let ledgerExists = false;
      let ledgerInfo;
      
      try {
        logOperation('init_broker_checking_ledger', address, false);
        ledgerInfo = await broker.ledger.getLedger();
        ledgerExists = true;
        logOperation('init_broker_ledger_exists', address, true, {
          balance: ethers.formatEther(ledgerInfo.ledgerInfo[0])
        });
      } catch (error: any) {
        if (error.message.includes('LedgerNotExists')) {
          logOperation('init_broker_ledger_not_exists', address, true);
          ledgerExists = false;
        } else {
          logError('Error checking ledger', error, { address });
          throw error;
        }
      }

      // Create ledger if it doesn't exist
      if (!ledgerExists) {
        try {
          logOperation('init_broker_creating_ledger', address, false);
          
          // This will trigger a transaction signature request
          await broker.ledger.addLedger(0.1); // 0.1 OG initial funding
          
          // Verify ledger was created
          ledgerInfo = await broker.ledger.getLedger();
          logOperation('init_broker_ledger_created', address, true, { 
            initialFunding: 0.1,
            balance: ethers.formatEther(ledgerInfo.ledgerInfo[0])
          });
        } catch (error: any) {
          logError('Failed to create ledger', error, { address });
          
          if (error.message.includes('user rejected') || error.message.includes('denied')) {
            throw new ComputeBackendError(
              'Transaction was rejected by user. Please approve the transaction to initialize your broker.',
              400,
              'USER_REJECTED'
            );
          }
          
          if (error.message.includes('insufficient funds')) {
            throw new InsufficientFundsError(
              'Insufficient funds. You need at least 0.1 OG plus gas fees to initialize broker.'
            );
          }
          
          throw new ComputeBackendError(
            'Failed to create ledger. Please ensure you have sufficient funds and try again.',
            500,
            'LEDGER_CREATE_FAILED'
          );
        }
      }

      // Cache broker session
      const brokerSession: BrokerSession = {
        broker: broker as any, // Cast to any since it's our custom implementation
        wallet: { address } as any, // Simplified wallet object
        initialized: true,
        lastUsed: new Date()
      };
      setBrokerSession(address, brokerSession);

      logOperation('init_broker_success', address, true, {
        ledgerBalance: ledgerInfo ? ethers.formatEther(ledgerInfo.ledgerInfo[0]) : 'unknown'
      });

      return {
        success: true,
        brokerAddress: address,
        message: 'Broker initialized successfully'
      };

    } catch (error) {
      logError('Broker initialization failed', error as Error, { address });
      
      // Cleanup on failure
      
      throw new ComputeBackendError(
        `Failed to initialize broker: ${(error as Error).message}`,
        500,
        'BROKER_INIT_FAILED'
      );
    }
  }



  /**
   * Get broker balance
   */
  async getBalance(address: string): Promise<BalanceResponse> {
    try {
      const brokerSession = await this.getBrokerInstance(address);
      
      updateBrokerActivity(address);

      let ledgerInfo;
      try {
        ledgerInfo = await brokerSession.broker.ledger.getLedger();
      } catch (error: any) {
        if (error.message.includes('LedgerNotExists')) {
          // Ledger doesn't exist yet
          return {
            balance: "0",
            formatted: "0 OG",
            currency: "OG"
          };
        }
        throw error;
      }

      const balance = ledgerInfo.ledgerInfo[0];
      const formatted = ethers.formatEther(balance);

      logOperation('get_balance', address, true, { balance: formatted });

      return {
        balance: balance.toString(),
        formatted: `${formatted} OG`,
        currency: "OG"
      };

    } catch (error) {
      logError('Get balance failed', error as Error, { address });
      throw new ComputeBackendError(
        `Failed to get balance: ${(error as Error).message}`,
        500,
        'GET_BALANCE_FAILED'
      );
    }
  }

  /**
   * Fund account
   */
  async fundAccount(address: string, amount: string): Promise<FundAccountResponse> {
    try {
      const brokerSession = await this.getBrokerInstance(address);
      const amountNum = parseFloat(amount);
      
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new ComputeBackendError('Invalid amount. Must be a positive number.', 400, 'INVALID_AMOUNT');
      }
      
      updateBrokerActivity(address);

      // Get current balance
      let currentBalance;
      try {
        const currentLedger = await brokerSession.broker.ledger.getLedger();
        currentBalance = parseFloat(ethers.formatEther(currentLedger.ledgerInfo[0]));
      } catch (error: any) {
        if (error.message.includes('LedgerNotExists')) {
          currentBalance = 0;
        } else {
          throw error;
        }
      }

      logOperation('fund_account_start', address, false, { 
        amount: amountNum, 
        currentBalance 
      });

      // Add funds - this will trigger transaction signature
      try {
        await brokerSession.broker.ledger.depositFund(amountNum);
      } catch (error: any) {
        if (error.message.includes('user rejected') || error.message.includes('denied')) {
          throw new ComputeBackendError(
            'Transaction was rejected by user.',
            400,
            'USER_REJECTED'
          );
        }
        
        if (error.message.includes('insufficient funds')) {
          throw new InsufficientFundsError(
            `Insufficient funds. You need ${amount} OG plus gas fees.`
          );
        }
        
        throw error;
      }

      // Get updated balance
      const newLedger = await brokerSession.broker.ledger.getLedger();
      const newFormatted = ethers.formatEther(newLedger.ledgerInfo[0]);

      logOperation('fund_account_success', address, true, {
        amount: amountNum,
        newBalance: newFormatted
      });

      return {
        success: true,
        newBalance: newFormatted,
        message: `Successfully added ${amount} OG to account`
      };

    } catch (error) {
      logError('Fund account failed', error as Error, { address, amount });
      throw new ComputeBackendError(
        `Failed to fund account: ${(error as Error).message}`,
        500,
        'FUND_ACCOUNT_FAILED'
      );
    }
  }

  /**
   * Get available AI models (similar to test-compute.ts)
   */
  async getAvailableModels(address: string) {
    try {
      const brokerSession = await this.getBrokerInstance(address);
      
      updateBrokerActivity(address);

      // List services
      let services;
      try {
        services = await brokerSession.broker.inference.listService();
      } catch (error: any) {
        logError('Failed to list services', error, { address });
        return this.getDefaultModels();
      }

      const models = services
        .filter((service: any) => Object.values(OFFICIAL_PROVIDERS).includes(service.provider))
        .map((service: any) => {
          const modelName = Object.entries(OFFICIAL_PROVIDERS)
            .find(([_, addr]) => addr === service.provider)?.[0] || 'Unknown';

          return {
            id: modelName === 'llama-3.3-70b-instruct' ? 'llama' : 'deepseek',
            name: modelName,
            provider: service.provider,
            costPerQuery: 'Free on Testnet',
            features: modelName === 'llama-3.3-70b-instruct' 
              ? ['fast', 'conversational', 'general-purpose']
              : ['detailed', 'analytical', 'reasoning'],
            available: true
          };
        });

      logOperation('get_models', address, true, { modelsCount: models.length });

      return models.length > 0 ? models : this.getDefaultModels();

    } catch (error) {
      logError('Get models failed', error as Error, { address });
      throw new ComputeBackendError(
        `Failed to get available models: ${(error as Error).message}`,
        500,
        'GET_MODELS_FAILED'
      );
    }
  }

  /**
   * Acknowledge provider (required before first use)
   */
  async acknowledgeProvider(address: string, providerAddress: string): Promise<void> {
    try {
      const brokerSession = await this.getBrokerInstance(address);
      
      updateBrokerActivity(address);

      logOperation('acknowledge_provider_start', address, false, { provider: providerAddress });

      await brokerSession.broker.inference.acknowledgeProviderSigner(providerAddress);
      
      logOperation('acknowledge_provider_success', address, true, { provider: providerAddress });

    } catch (error) {
      logError('Acknowledge provider failed', error as Error, { address, provider: providerAddress });
      throw new ComputeBackendError(
        `Failed to acknowledge provider: ${(error as Error).message}`,
        500,
        'ACKNOWLEDGE_PROVIDER_FAILED'
      );
    }
  }

  /**
   * Get broker instance for a user
   */
  private async getBrokerInstance(address: string): Promise<BrokerSession> {
    const session = getBrokerSession(address);
    
    if (!session || !session.initialized) {
      throw new ComputeBackendError(
        'Broker not initialized. Please initialize broker first.',
        400,
        'BROKER_NOT_INITIALIZED'
      );
    }

    return session;
  }

  /**
   * Cleanup broker session
   */
  async cleanupBroker(address: string): Promise<void> {
    try {
      removeBrokerSession(address);
      logOperation('cleanup_broker', address, true);
    } catch (error) {
      logError('Cleanup broker failed', error as Error, { address });
    }
  }

  /**
   * Get default models when service listing fails
   */
  private getDefaultModels() {
    return [
      {
        id: 'llama',
        name: 'llama-3.3-70b-instruct',
        provider: OFFICIAL_PROVIDERS['llama-3.3-70b-instruct'],
        costPerQuery: 'Free on Testnet',
        features: ['fast', 'conversational', 'general-purpose'],
        available: true
      },
      {
        id: 'deepseek',
        name: 'deepseek-r1-70b',
        provider: OFFICIAL_PROVIDERS['deepseek-r1-70b'],
        costPerQuery: 'Free on Testnet',
        features: ['detailed', 'analytical', 'reasoning'],
        available: true
      }
    ];
  }

  /**
   * Get broker info for debugging
   */
  async getBrokerInfo(address: string) {
    try {
      const session = getBrokerSession(address);
      
      if (!session) {
        return {
          initialized: false,
          message: 'Broker not found'
        };
      }

      let balance = 'unknown';
      try {
        const balanceInfo = await this.getBalance(address);
        balance = balanceInfo.formatted;
      } catch (error) {
        // Ignore balance errors
      }
      
      return {
        initialized: session.initialized,
        lastUsed: session.lastUsed,
        balance,
        walletAddress: address
      };

    } catch (error) {
      logError('Get broker info failed', error as Error, { address });
      return {
        initialized: false,
        error: (error as Error).message
      };
    }
  }
} 