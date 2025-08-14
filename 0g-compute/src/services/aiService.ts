import OpenAI from 'openai';
import '../config/envLoader';
import masterWallet from './masterWallet';
import virtualBrokers from './virtualBrokers';

// Constants
const DEFAULT_MODEL = process.env.MODEL_PICKED || "llama-3.3-70b-instruct";
const PROVIDER_TIMEOUT = 30000; // 30 seconds
const BALANCE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
const MIN_BALANCE_THRESHOLD = 0.0001;
const MIN_PROFIT_MARGIN = 0.00001;
const MAX_PROFIT_MARGIN = 0.0005;
const SERVICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for discovered services

export interface DiscoveredService {
  provider: string;
  model: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  verifiability: string;
  serviceType: string;
  updatedAt: bigint;
  isAvailable: boolean;
}

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
  private discoveredServices: Map<string, DiscoveredService> = new Map();
  private lastDiscoveryTime: number = 0;

  async initialize(): Promise<void> {
    try {
      // Log default model configuration
      console.log(`🎯 Default Model Configuration: ${DEFAULT_MODEL}`);
      
      // Initialize master wallet
      await masterWallet.initialize();
      
      // Discover available AI services
      await this.discoverAndCacheServices();
      
      if (process.env.TEST_ENV === 'true') {
        console.log('🤖 AI Service initialized successfully');
        console.log(`📋 Discovered ${this.discoveredServices.size} models from 0G Network`);
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize AI Service:', error.message);
      throw error;
    }
  }

  private async discoverAndCacheServices(): Promise<void> {
    // Check if cache is still valid
    const now = Date.now();
    if (this.lastDiscoveryTime && (now - this.lastDiscoveryTime) < SERVICE_CACHE_TTL) {
      if (process.env.TEST_ENV === 'true') {
        console.log('🔄 Using cached service discovery');
      }
      return;
    }

    try {
      const broker = masterWallet.getBroker();
      const services = await broker.inference.listService();
      
      // Clear old services
      this.discoveredServices.clear();
      
      // Debug logging: show all discovered service types
      if (process.env.TEST_ENV === 'true') {
        const serviceTypes = services.map(s => s.serviceType).filter((v, i, a) => a.indexOf(v) === i);
        console.log(`🔍 Discovered service types: ${serviceTypes.join(', ')}`);
        console.log(`📊 Total services found: ${services.length}`);
      }
      
      // Filter AI models - support both 'inference' (legacy) and 'chatbot' (new API)
      for (const service of services) {
        if ((service.serviceType === 'inference' || service.serviceType === 'chatbot') && service.model) {
          const discoveredService: DiscoveredService = {
            provider: service.provider,
            model: service.model,
            url: service.url,
            inputPrice: service.inputPrice,
            outputPrice: service.outputPrice,
            verifiability: service.verifiability || 'none',
            serviceType: service.serviceType,
            updatedAt: service.updatedAt,
            isAvailable: true
          };
          
          this.discoveredServices.set(service.model, discoveredService);
          
          // Try to acknowledge the provider
          await this.acknowledgeProvider(service.provider, service.model);
        }
      }
      
      this.availableServices = services;
      this.lastDiscoveryTime = now;
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`🔍 Discovered ${this.discoveredServices.size} inference models from ${services.length} total services`);
        console.log(`📋 Available models: ${Array.from(this.discoveredServices.keys()).join(', ')}`);
      }
    } catch (error: any) {
      console.error('❌ Failed to discover AI services:', error.message);
      // Don't throw - we can still use Gemini as fallback
    }
  }

  private async acknowledgeProvider(providerAddress: string, modelName: string): Promise<void> {
    if (this.acknowledgedProviders.has(providerAddress)) {
      return;
    }
    
    try {
      const broker = masterWallet.getBroker();
      await broker.inference.acknowledgeProviderSigner(providerAddress);
      this.acknowledgedProviders.add(providerAddress);
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ Acknowledged provider for ${modelName}: ${providerAddress}`);
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

  async analyzeDream(request: AIRequest): Promise<AIResponse> {
    const { userWalletAddress, query, model = DEFAULT_MODEL } = request;
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (!userWalletAddress || !userWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid wallet address format');
      }

      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      // Refresh discovery if needed
      await this.discoverAndCacheServices();
      
      // Get provider address from discovered services
      const service = this.discoveredServices.get(model);
      if (!service) {
        // List available models for error message
        const availableModels = Array.from(this.discoveredServices.keys());
        throw new Error(`Model not available: ${model}. Available models: ${availableModels.join(', ') || 'No models discovered. Using Gemini fallback.'}`);
      }
      
      const providerAddress = service.provider;

      // Log selected model
      console.log(`🎯 Selected Model: ${model} (Provider: ${providerAddress})`);
      if (process.env.TEST_ENV === 'true') {
        console.log(`🔑 Service URL: ${service.url}`);
        console.log(`💰 Input Price: ${service.inputPrice.toString()}`);
      }

      // Estimate cost for pre-check (user needs some minimum balance)
      const estimatedCost = virtualBrokers.estimateQueryCost(query, model);
      
      // Check if user has sufficient balance for estimated cost
      const hasBalance = await virtualBrokers.hasBalance(userWalletAddress, estimatedCost);
      if (!hasBalance) {
        const balance = await virtualBrokers.checkBalance(userWalletAddress);
        throw new Error(`Insufficient balance. Estimated cost: ${estimatedCost} OG, Available: ${balance.balance} OG`);
      }

      // Check and refill master wallet if needed
      await masterWallet.checkAndRefill();

      // Get initial Master Wallet balance for dynamic cost calculation
      const initialBalance = await masterWallet.getLedgerBalance();
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`💰 Initial Master Wallet balance: ${initialBalance} OG`);
        console.log(`📊 Estimated cost: ${estimatedCost} OG`);
      }

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

      // Get final Master Wallet balance for dynamic cost calculation
      const finalBalance = await masterWallet.getLedgerBalance();
      const realCost = Math.max(0, initialBalance - finalBalance); // Ensure non-negative
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`💰 Final Master Wallet balance: ${finalBalance} OG`);
        console.log(`💸 Real cost calculated: ${realCost} OG`);
        console.log(`🔒 Verification Status: ${isValid ? 'Valid ✅' : 'Invalid ❌'}`);
      }

      // Deduct real cost from user balance (we already checked they have estimated cost)
      // If real cost > estimated cost, user might go negative, but we'll handle this
      try {
        await virtualBrokers.deductFunds(
          userWalletAddress, 
          realCost, 
          `AI Query: ${model} - "${query.substring(0, 50)}..." (Real cost: ${realCost} OG)`
        );
      } catch (balanceError: any) {
        // If user doesn't have enough for real cost, deduct what they have
        const userBalance = await virtualBrokers.checkBalance(userWalletAddress);
        const deductedAmount = Math.min(realCost, userBalance.balance);
        
        if (deductedAmount > 0) {
          await virtualBrokers.deductFunds(
            userWalletAddress, 
            deductedAmount, 
            `AI Query: ${model} - "${query.substring(0, 50)}..." (Partial payment: ${deductedAmount}/${realCost} OG)`
          );
        }
        
        console.warn(`⚠️  User ${userWalletAddress} had insufficient balance for real cost: ${realCost} OG. Deducted: ${deductedAmount} OG`);
      }

      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ AI query completed for ${userWalletAddress} in ${responseTime}ms`);
        console.log(`💸 Real cost deducted: ${realCost} OG`);
      }

      return {
        response: aiResponse,
        model: actualModel,
        cost: realCost,
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
      
      throw {
        error: error.message,
        responseTime: responseTime,
        model: model,
        isValid: false
      };
    }
  }



  async getAvailableModels(): Promise<{
    models: string[];
    services: any[];
  }> {
    // Refresh discovery if needed
    await this.discoverAndCacheServices();
    
    const models = Array.from(this.discoveredServices.keys());
    const services = Array.from(this.discoveredServices.values()).map(service => ({
      provider: service.provider,
      model: service.model,
      serviceType: service.serviceType,
      url: service.url,
      inputPrice: service.inputPrice.toString(),
      outputPrice: service.outputPrice.toString(),
      verifiability: service.verifiability,
      isAvailable: service.isAvailable
    }));
    
    return { models, services };
  }

  async discoverServices(): Promise<DiscoveredService[]> {
    // Refresh discovery
    await this.discoverAndCacheServices();
    
    // Return discovered services as array
    return Array.from(this.discoveredServices.values());
  }

  /**
   * Get service by provider address
   * @param providerAddress - Provider address to lookup
   * @returns DiscoveredService or null if not found
   */
  async getServiceByProviderAddress(providerAddress: string): Promise<DiscoveredService | null> {
    // Ensure services are discovered
    await this.discoverAndCacheServices();
    
    // Find service by provider address
    for (const service of this.discoveredServices.values()) {
      if (service.provider.toLowerCase() === providerAddress.toLowerCase()) {
        return service;
      }
    }
    
    return null;
  }

  /**
   * Get service by model name (for backward compatibility)
   * @param modelName - Model name to lookup
   * @returns DiscoveredService or null if not found
   */
  async getServiceByModelName(modelName: string): Promise<DiscoveredService | null> {
    // Ensure services are discovered
    await this.discoverAndCacheServices();
    
    // Find service by model name
    return this.discoveredServices.get(modelName) || null;
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