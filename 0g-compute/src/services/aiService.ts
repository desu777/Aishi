import OpenAI from 'openai';
import dotenv from 'dotenv';
import masterWallet from './masterWallet';
import virtualBrokers from './virtualBrokers';

// Load environment variables
dotenv.config();

// Constants
const DEFAULT_MODEL = "deepseek-r1-70b";
const PROVIDER_TIMEOUT = 30000; // 30 seconds
const BALANCE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
const MIN_BALANCE_THRESHOLD = 0.0001;
const MIN_PROFIT_MARGIN = 0.00001;
const MAX_PROFIT_MARGIN = 0.0005;

// Official 0G providers
const OFFICIAL_PROVIDERS: Record<string, string> = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
};

export interface AIRequest {
  userWalletAddress: string;
  query: string;
  model?: string;
}

export interface AIResponse {
  response: string;
  model: string;
  cost: number;
  chatId: string;
  responseTime: number;
  isValid: boolean;
}

export class AIService {
  private availableServices: any[] = [];
  private acknowledgedProviders: Set<string> = new Set();

  async initialize(): Promise<void> {
    try {
      // Initialize master wallet
      await masterWallet.initialize();
      
      // Discover available AI services
      await this.discoverServices();
      
      // Acknowledge default providers
      await this.acknowledgeDefaultProviders();
      
      if (process.env.TEST_ENV === 'true') {
        console.log('🤖 AI Service initialized successfully');
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize AI Service:', error.message);
      throw error;
    }
  }

  private async discoverServices(): Promise<void> {
    try {
      const broker = masterWallet.getBroker();
      this.availableServices = await broker.inference.listService();
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`🔍 Discovered ${this.availableServices.length} AI services`);
      }
    } catch (error: any) {
      console.error('❌ Failed to discover AI services:', error.message);
      throw error;
    }
  }

  private async acknowledgeDefaultProviders(): Promise<void> {
    const broker = masterWallet.getBroker();
    
    for (const [modelName, providerAddress] of Object.entries(OFFICIAL_PROVIDERS)) {
      if (this.acknowledgedProviders.has(providerAddress)) {
        continue;
      }
      
      try {
        await broker.inference.acknowledgeProviderSigner(providerAddress);
        this.acknowledgedProviders.add(providerAddress);
        
        if (process.env.TEST_ENV === 'true') {
          console.log(`✅ Acknowledged provider: ${modelName} (${providerAddress})`);
        }
      } catch (error: any) {
        if (error.message.includes('already acknowledged')) {
          this.acknowledgedProviders.add(providerAddress);
          
          if (process.env.TEST_ENV === 'true') {
            console.log(`✅ Provider already acknowledged: ${modelName}`);
          }
        } else {
          console.error(`⚠️  Failed to acknowledge provider ${modelName}:`, error.message);
        }
      }
    }
  }

  async analyzeDream(request: AIRequest): Promise<AIResponse> {
    const { userWalletAddress, query, model = 'deepseek-r1-70b' } = request;
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (!userWalletAddress || !userWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid wallet address format');
      }

      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      // Get provider address
      const providerAddress = OFFICIAL_PROVIDERS[model as keyof typeof OFFICIAL_PROVIDERS];
      if (!providerAddress) {
        throw new Error(`Unsupported model: ${model}. Available models: ${Object.keys(OFFICIAL_PROVIDERS).join(', ')}`);
      }

      // Estimate cost
      const estimatedCost = this.estimateCost(query, model);
      
      // Check if user has sufficient balance
      const hasBalance = await virtualBrokers.hasBalance(userWalletAddress, estimatedCost);
      if (!hasBalance) {
        const balance = await virtualBrokers.checkBalance(userWalletAddress);
        throw new Error(`Insufficient balance. Required: ${estimatedCost} OG, Available: ${balance.balance} OG`);
      }

      // Deduct estimated cost from user balance
      await virtualBrokers.deductFunds(
        userWalletAddress, 
        estimatedCost, 
        `AI Query: ${model} - "${query.substring(0, 50)}..."`
      );

      // Check and refill master wallet if needed
      await masterWallet.checkAndRefill();

      // Get service metadata
      const broker = masterWallet.getBroker();
      const { endpoint, model: actualModel } = await broker.inference.getServiceMetadata(providerAddress);

      // Generate authentication headers
      const headers = await broker.inference.getRequestHeaders(providerAddress, query);

      // Create OpenAI client
      const openai = new OpenAI({
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
        console.log(`🤖 Sending AI query for ${userWalletAddress}: ${query.substring(0, 100)}...`);
        console.log(`⏳ Using model: ${actualModel}`);
        console.log(`⏳ Endpoint: ${endpoint}`);
      }

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: query }],
        model: actualModel,
      }, {
        headers: requestHeaders,
      });

      const aiResponse = completion.choices[0].message.content || '';
      const chatId = completion.id;
      const responseTime = Date.now() - startTime;

      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ AI query completed in ${responseTime}ms`);
        console.log(`🆔 Chat ID: ${chatId}`);
        console.log(`🤖 AI Response: ${aiResponse.substring(0, 200)}...`);
      }

      // Process response and verify
      const isValid = await broker.inference.processResponse(
        providerAddress,
        aiResponse,
        chatId
      );

      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ AI query completed for ${userWalletAddress} in ${responseTime}ms`);
        console.log(`🔒 Verification Status: ${isValid ? 'Valid ✅' : 'Invalid ❌'}`);
      }

      this.log(`Estimated cost from provider: ${estimatedCost} OG`);

      // Fee is now the direct estimated cost
      const fee = estimatedCost;

      return {
        response: aiResponse,
        model: actualModel,
        cost: estimatedCost,
        chatId: chatId,
        responseTime: responseTime,
        isValid: !!isValid // Convert null to false
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      console.error(`❌ AI query failed for ${userWalletAddress}:`, error.message);
      
      if (process.env.TEST_ENV === 'true') {
        console.error(`🔧 Error details:`, error.stack);
      }
      
      // If error occurred after deduction, we might want to refund
      // For now, we'll keep the deduction as a "failed query" fee
      
      throw {
        error: error.message,
        responseTime: responseTime,
        model: model,
        isValid: false
      };
    }
  }

  private estimateCost(query: string, model: string): number {
    // Basic cost estimation - in production this would be more sophisticated
    const baseCosts = {
      'llama-3.3-70b-instruct': 0.001,  // 0.001 OG per query
      'deepseek-r1-70b': 0.002,        // 0.002 OG per query
    };

    const baseCost = baseCosts[model as keyof typeof baseCosts] || 0.001;
    const lengthMultiplier = Math.max(1, query.length / 100);
    
    return baseCost * lengthMultiplier;
  }

  async getAvailableModels(): Promise<{
    models: string[];
    services: any[];
  }> {
    return {
      models: Object.keys(OFFICIAL_PROVIDERS),
      services: this.availableServices.map(service => ({
        provider: service.provider,
        serviceType: service.serviceType,
        url: service.url,
        inputPrice: service.inputPrice,
        outputPrice: service.outputPrice,
        verifiability: service.verifiability,
        isOfficial: Object.values(OFFICIAL_PROVIDERS).includes(service.provider)
      }))
    };
  }

  async getServiceStatus(): Promise<{
    totalServices: number;
    acknowledgedProviders: number;
    masterWalletBalance: number;
    isReady: boolean;
  }> {
    try {
      const walletInfo = await masterWallet.getWalletInfo();
      
      return {
        totalServices: this.availableServices.length,
        acknowledgedProviders: this.acknowledgedProviders.size,
        masterWalletBalance: walletInfo.ledgerBalance,
        isReady: this.availableServices.length > 0 && this.acknowledgedProviders.size > 0
      };
    } catch (error: any) {
      console.error('❌ Failed to get service status:', error.message);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    this.availableServices = [];
    this.acknowledgedProviders.clear();
    await masterWallet.cleanup();
  }

  private log(message: string, data?: any) {
    console.log(`[AI SERVICE] ${message}`, data || "");
  }

  async getBalance(walletAddress: string): Promise<any> {
    const balance = await masterWallet.getWalletInfo();
    return { balance };
  }
}

export default new AIService(); 