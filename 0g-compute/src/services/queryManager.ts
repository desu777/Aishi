import { ethers } from 'ethers';
import aiService from './aiService';
import virtualBrokers from './virtualBrokers';
import masterWallet from './masterWallet';
import database from '../database/database';

interface QueryTask {
  id: string;
  userWalletAddress: string;
  query: string;
  model: string;
  timestamp: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

export class QueryManagerService {
  private queue: Array<QueryTask> = [];
  private processing = false;
  private maxConcurrent = parseInt(process.env.MAX_CONCURRENT_QUERIES || '10');
  private activeQueries = 0;

  constructor() {
    // Start queue processor
    this.startQueueProcessor();
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🎯 Query Manager initialized with max ${this.maxConcurrent} concurrent queries`);
    }
  }

  /**
   * Add query to processing queue - this is now the main entry point
   * @param userWalletAddress - User's wallet address
   * @param query - Query text to process
   * @param modelId - Model ID from frontend (can be model name or will be resolved to provider address)
   */
  async processQuery(userWalletAddress: string, query: string, modelId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const task: QueryTask = {
        id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userWalletAddress,
        query,
        model: modelId || process.env.MODEL_PICKED || 'llama-3.3-70b-instruct',
        timestamp: Date.now(),
        resolve,
        reject
      };

      this.queue.push(task);

      if (process.env.TEST_ENV === 'true') {
        console.log(`📥 Added query ${task.id} to queue. Queue length: ${this.queue.length}`);
        console.log(`🎯 Model requested: ${task.model}`);
      }
    });
  }

  /**
   * Process queries from queue with concurrency control
   */
  private async startQueueProcessor(): Promise<void> {
    setInterval(async () => {
      // Process multiple queries if we have capacity
      while (this.queue.length > 0 && this.activeQueries < this.maxConcurrent) {
        const task = this.queue.shift();
        if (!task) break;

        this.activeQueries++;

        if (process.env.TEST_ENV === 'true') {
          console.log(`🔄 Processing query ${task.id}. Active: ${this.activeQueries}/${this.maxConcurrent}`);
        }

        // Process query atomically (async, don't wait)
        this.processQueryAtomically(task)
          .then(result => {
            task.resolve(result);
          })
          .catch(error => {
            task.reject(error);
          })
          .finally(() => {
            this.activeQueries--;
            
            if (process.env.TEST_ENV === 'true') {
              console.log(`✅ Completed query ${task.id}. Active: ${this.activeQueries}/${this.maxConcurrent}`);
            }
          });
      }
    }, 50); // Check queue every 50ms for faster processing
  }

  /**
   * Process single query atomically to prevent race conditions
   */
  private async processQueryAtomically(task: QueryTask): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (!task.userWalletAddress || !task.userWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid wallet address format');
      }

      if (!task.query || task.query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      // Log selected model
      console.log(`🎯 Selected Model: ${task.model} (Query ID: ${task.id})`);

      // Resolve model to provider address using dynamic discovery
      let providerAddress: string;
      let modelName: string;

      // First, try to get service by model name (for backward compatibility and new models)
      const serviceByModel = await aiService.getServiceByModelName(task.model);
      if (serviceByModel) {
        providerAddress = serviceByModel.provider;
        modelName = serviceByModel.model;
        
        if (process.env.TEST_ENV === 'true') {
          console.log(`✅ Model resolved by name: ${task.model} → ${providerAddress}`);
        }
      } else {
        // Fallback to hardcoded providers for known models
        const FALLBACK_PROVIDERS: Record<string, string> = {
          "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
          "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
        };

        providerAddress = FALLBACK_PROVIDERS[task.model as keyof typeof FALLBACK_PROVIDERS];
        modelName = task.model;
        
        if (!providerAddress) {
          const availableServices = await aiService.discoverServices();
          const availableModels = availableServices.map(s => s.model).concat(Object.keys(FALLBACK_PROVIDERS));
          throw new Error(`Model not available: ${task.model}. Available models: ${availableModels.join(', ')}`);
        }

        if (process.env.TEST_ENV === 'true') {
          console.log(`⚠️  Model resolved by fallback: ${task.model} → ${providerAddress}`);
        }
      }

      // Estimate cost for pre-check
      const estimatedCost = virtualBrokers.estimateQueryCost(task.query, task.model);
      
      // ATOMIC OPERATION: Check and reserve user balance
      const reservationSuccess = await this.atomicBalanceReservation(task.userWalletAddress, estimatedCost, task.id);
      if (!reservationSuccess) {
        const balance = await virtualBrokers.checkBalance(task.userWalletAddress);
        throw new Error(`Insufficient balance. Estimated cost: ${estimatedCost} OG, Available: ${balance.balance} OG`);
      }

      // Check and refill master wallet if needed
      await masterWallet.checkAndRefill();

      // ATOMIC OPERATION: Execute AI query with balance tracking
      const result = await this.executeAIQueryWithTracking(task, providerAddress, estimatedCost);

      const responseTime = Date.now() - startTime;
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ Query ${task.id} completed atomically in ${responseTime}ms`);
      }

      return {
        ...result,
        responseTime,
        queryId: task.id
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      console.error(`❌ Query ${task.id} failed:`, error.message);
      
      // Release any reserved balance on error
      await this.releaseReservedBalance(task.userWalletAddress, task.id);
      
      throw {
        error: error.message,
        responseTime: responseTime,
        model: task.model,
        queryId: task.id,
        isValid: false
      };
    }
  }

  /**
   * Atomically reserve user balance to prevent race conditions
   */
  private async atomicBalanceReservation(userAddress: string, amount: number, queryId: string): Promise<boolean> {
    try {
      const normalizedAddress = userAddress.toLowerCase();
      
      // Get current broker state
      const broker = database.getBroker(normalizedAddress);
      if (!broker || broker.balance < amount) {
        return false;
      }

      // Atomically update balance and record transaction
      try {
        const newBalance = broker.balance - amount;
        database.updateBalance(normalizedAddress, newBalance);
        
        // Record reservation
        database.addTransaction({
          walletAddress: normalizedAddress,
          type: 'ai_query',
          amount: amount,
          description: `Balance reserved for query ${queryId}`,
          txHash: undefined
        });

        if (process.env.TEST_ENV === 'true') {
          console.log(`💰 Reserved ${amount.toFixed(8)} OG for query ${queryId}. New balance: ${newBalance.toFixed(8)} OG`);
        }

        return true;
      } catch (updateError: any) {
        console.error(`❌ Failed to update balance for query ${queryId}:`, updateError.message);
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Failed to reserve balance for query ${queryId}:`, error.message);
      return false;
    }
  }

  /**
   * Execute AI query with Master Wallet balance tracking
   */
  private async executeAIQueryWithTracking(task: QueryTask, providerAddress: string, estimatedCost: number): Promise<any> {
    // Get initial Master Wallet balance
    const initialBalance = await masterWallet.getLedgerBalance();
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`💰 Initial Master Wallet balance: ${initialBalance.toFixed(8)} OG (Query: ${task.id})`);
    }

    // Get service metadata
    const broker = masterWallet.getBroker();
    const { endpoint, model: actualModel } = await broker.inference.getServiceMetadata(providerAddress);

    // Generate authentication headers
    const headers = await broker.inference.getRequestHeaders(providerAddress, task.query);

    // Create OpenAI client
    const openai = new (await import('openai')).default({
      baseURL: endpoint,
      apiKey: '',
    });

    // Prepare headers
    const requestHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        requestHeaders[key] = value;
      }
    });

    // Send query to AI service
    if (process.env.TEST_ENV === 'true') {
      console.log(`🤖 Sending AI query ${task.id}: ${task.query.substring(0, 100)}...`);
      console.log(`⏳ Using model: ${actualModel}`);
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: task.query }],
      model: actualModel,
    }, {
      headers: requestHeaders,
    });

    const aiResponse = completion.choices[0].message.content || '';
    const chatId = completion.id;

    // Process response and verify
    const isValid = await broker.inference.processResponse(
      providerAddress,
      aiResponse,
      chatId
    );

    // Get final Master Wallet balance and calculate real cost
    const finalBalance = await masterWallet.getLedgerBalance();
    const realCost = Math.max(0, initialBalance - finalBalance);
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`💰 Final Master Wallet balance: ${finalBalance.toFixed(8)} OG (Query: ${task.id})`);
      console.log(`💸 Real cost calculated: ${realCost.toFixed(8)} OG (Query: ${task.id})`);
    }

    // Adjust user balance based on real cost vs estimated cost
    await this.adjustUserBalance(task.userWalletAddress, estimatedCost, realCost, task.id);

    return {
      response: aiResponse,
      model: actualModel,
      cost: realCost,
      chatId: chatId,
      isValid: !!isValid
    };
  }

  /**
   * Adjust user balance based on real cost vs estimated cost
   */
  private async adjustUserBalance(userAddress: string, estimatedCost: number, realCost: number, queryId: string): Promise<void> {
    const difference = realCost - estimatedCost;
    
    if (Math.abs(difference) < 0.000001) {
      // Costs are essentially the same, no adjustment needed
      if (process.env.TEST_ENV === 'true') {
        console.log(`💱 No balance adjustment needed for query ${queryId}`);
      }
      return;
    }

    try {
      if (difference > 0) {
        // Real cost was higher - deduct additional amount
        await virtualBrokers.deductFunds(
          userAddress,
          difference,
          `Additional cost for query ${queryId}: ${difference} OG`
        );
        
        if (process.env.TEST_ENV === 'true') {
          console.log(`💸 Deducted additional ${difference.toFixed(8)} OG for query ${queryId}`);
        }
      } else {
        // Real cost was lower - refund difference
        await database.addToBalance(userAddress.toLowerCase(), Math.abs(difference));
        
        database.addTransaction({
          walletAddress: userAddress.toLowerCase(),
          type: 'deposit',
          amount: Math.abs(difference),
          description: `Refund for query ${queryId}: ${Math.abs(difference)} OG`,
          txHash: undefined
        });
        
        if (process.env.TEST_ENV === 'true') {
          console.log(`💰 Refunded ${Math.abs(difference).toFixed(8)} OG for query ${queryId}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to adjust balance for query ${queryId}:`, error.message);
    }
  }

  /**
   * Release reserved balance in case of error
   */
  private async releaseReservedBalance(userAddress: string, queryId: string): Promise<void> {
    try {
      // This would require additional tracking of reservations
      // For now, we'll just log the intent
      if (process.env.TEST_ENV === 'true') {
        console.log(`🔓 Releasing reserved balance for failed query ${queryId}`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to release reserved balance for query ${queryId}:`, error.message);
    }
  }

  /**
   * Get queue status for monitoring
   */
  getQueueStatus(): { queueLength: number; activeQueries: number; maxConcurrent: number } {
    return {
      queueLength: this.queue.length,
      activeQueries: this.activeQueries,
      maxConcurrent: this.maxConcurrent
    };
  }
}

export default new QueryManagerService(); 