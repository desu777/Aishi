import { ethers } from 'ethers';
import { createZGComputeNetworkBroker, ZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { networkConfig } from '../config/env';
import { CONTRACT_ADDRESSES, OFFICIAL_PROVIDERS } from '../config/constants';
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

/**
 * Broker Service - Manages 0G Compute Network broker instances
 * Based on working test-compute.ts implementation
 */
export class BrokerService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(networkConfig.computeRpcUrl);
  }

  /**
   * Initialize broker account for a user
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

      // Create a temporary wallet for broker operations
      // Note: We don't store private keys, just use them for broker initialization
      const randomPrivateKey = ethers.hexlify(ethers.randomBytes(32));
      const wallet = new ethers.Wallet(randomPrivateKey, this.provider);

      // Create broker instance (similar to test-compute.ts)
      const broker = await createZGComputeNetworkBroker(
        wallet,
        CONTRACT_ADDRESSES.LEDGER,
        CONTRACT_ADDRESSES.INFERENCE,
        CONTRACT_ADDRESSES.FINE_TUNING
      );

      // Try to create ledger account
      let ledgerInfo;
      try {
        ledgerInfo = await broker.ledger.getLedger();
        logOperation('init_broker_ledger_exists', address, true);
      } catch (error: any) {
        if (error.message.includes('LedgerNotExists')) {
          // Create new ledger with initial funding
          await broker.ledger.addLedger(0.1); // 0.1 OG initial funding
          ledgerInfo = await broker.ledger.getLedger();
          logOperation('init_broker_ledger_created', address, true, { initialFunding: 0.1 });
        } else {
          throw error;
        }
      }

      // Cache broker session
      const brokerSession: BrokerSession = {
        broker,
        wallet,
        initialized: true,
        lastUsed: new Date()
      };
      setBrokerSession(address, brokerSession);

      logOperation('init_broker_success', address, true, {
        ledgerBalance: ethers.formatEther(ledgerInfo.ledgerInfo[0])
      });

      return {
        success: true,
        brokerAddress: address,
        message: 'Broker initialized successfully'
      };

    } catch (error) {
      logError('Broker initialization failed', error as Error, { address });
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

      const ledgerInfo = await brokerSession.broker.ledger.getLedger();
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
      
      updateBrokerActivity(address);

      // Get current balance
      const currentBalance = await brokerSession.broker.ledger.getLedger();
      const currentFormatted = parseFloat(ethers.formatEther(currentBalance.ledgerInfo[0]));

      logOperation('fund_account_start', address, false, { 
        amount: amountNum, 
        currentBalance: currentFormatted 
      });

      // Add funds to ledger
      await brokerSession.broker.ledger.depositFund(amountNum);

      // Get updated balance
      const newBalance = await brokerSession.broker.ledger.getLedger();
      const newFormatted = ethers.formatEther(newBalance.ledgerInfo[0]);

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

      // List services from contract (like in test-compute.ts)
      const services = await brokerSession.broker.inference.listService();

      const models = services
        .filter((service: any) => Object.values(OFFICIAL_PROVIDERS).includes(service.provider))
        .map((service: any) => {
          const modelName = Object.entries(OFFICIAL_PROVIDERS)
            .find(([_, addr]) => addr === service.provider)?.[0] || 'Unknown';

          return {
            id: modelName === 'llama-3.3-70b-instruct' ? 'llama' : 'deepseek',
            name: modelName,
            provider: service.provider,
            costPerQuery: `${ethers.formatEther(service.inputPrice || 0)}-${ethers.formatEther(service.outputPrice || 0)} OG`,
            features: modelName === 'llama-3.3-70b-instruct' 
              ? ['fast', 'conversational', 'general-purpose']
              : ['detailed', 'analytical', 'reasoning'],
            available: true
          };
        });

      logOperation('get_models', address, true, { modelsCount: models.length });

      return models;

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

      // Acknowledge provider (like in test-compute.ts)
      try {
        await brokerSession.broker.inference.acknowledgeProviderSigner(providerAddress);
        logOperation('acknowledge_provider_success', address, true, { provider: providerAddress });
      } catch (error: any) {
        if (error.message.includes('already acknowledged')) {
          logOperation('acknowledge_provider_exists', address, true, { provider: providerAddress });
        } else {
          throw error;
        }
      }

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

      const balance = await this.getBalance(address);
      
      return {
        initialized: session.initialized,
        lastUsed: session.lastUsed,
        balance: balance.formatted,
        walletAddress: session.wallet?.address || 'unknown'
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