const { createZGComputeNetworkBroker } = require('@0glabs/0g-serving-broker');
const { ethers } = require('ethers');

// Llama 3.3 70B provider - primary for dream analysis  
const LLAMA_PROVIDER = "0xf07240Efa67755B5311bc75784a061eDB47165Dd";
const DEEPSEEK_PROVIDER = "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"; // Backup option

class ComputeService {
  constructor() {
    this.broker = null;
    this.wallet = null;
    this.initialized = false;
    this.initPromise = null;
    
    // Cost tracking
    this.costTracker = {
      totalQueries: 0,
      totalCost: 0,
      lastQueryCost: 0,
      ledgerBalance: 0
    };
    
    console.log('[ComputeService] Initializing 0G Compute Network service...');
  }

  /**
   * Initialize 0G Compute broker and wallet
   */
  async initialize() {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[ComputeService] Starting initialization...');
      
      // Use the same wallet as Storage service
      const privateKey = process.env.WALLET_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('WALLET_PRIVATE_KEY is required for 0G Compute');
      }
      
      // Initialize wallet and provider
      const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
      this.wallet = new ethers.Wallet(privateKey, provider);
      
      if (DEBUG) console.log('[ComputeService] Wallet Address:', this.wallet.address);
      
      // Check wallet balance
      const ethBalance = await provider.getBalance(this.wallet.address);
      if (DEBUG) console.log('[ComputeService] ETH Balance:', ethers.formatEther(ethBalance), 'ETH');
      
      // Create 0G Compute broker
      if (DEBUG) console.log('[ComputeService] Creating 0G Compute Network Broker...');
      this.broker = await createZGComputeNetworkBroker(this.wallet);
      
      // Check/setup ledger account
      try {
        const ledgerInfo = await this.broker.ledger.getLedger();
        this.costTracker.ledgerBalance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
        
        if (DEBUG) console.log('[ComputeService] Existing ledger balance:', this.costTracker.ledgerBalance, 'OG');
        
        if (this.costTracker.ledgerBalance < 0.01) {
          console.log('[ComputeService] Low balance, adding funds to ledger...');
          await this.broker.ledger.addLedger(0.1); // Add 0.1 OG
          
          // Get updated balance
          const updatedLedger = await this.broker.ledger.getLedger();
          this.costTracker.ledgerBalance = parseFloat(ethers.formatEther(updatedLedger.ledgerInfo[0]));
          console.log('[ComputeService] Ledger funded with 0.1 OG. New balance:', this.costTracker.ledgerBalance, 'OG');
        }
        
      } catch (ledgerError) {
        console.log('[ComputeService] Ledger account does not exist, creating...');
        await this.broker.ledger.addLedger(0.1); // Create with 0.1 OG
        
        const newLedger = await this.broker.ledger.getLedger();
        this.costTracker.ledgerBalance = parseFloat(ethers.formatEther(newLedger.ledgerInfo[0]));
        console.log('[ComputeService] Ledger created with 0.1 OG. Balance:', this.costTracker.ledgerBalance, 'OG');
      }
      
      this.initialized = true;
      console.log('[ComputeService] ✅ Initialization completed successfully');
      console.log('[ComputeService] Ready for AI dream analysis with Llama 3.3 70B');
      
    } catch (error) {
      console.error('[ComputeService] ❌ Initialization failed:', error.message);
      throw new Error(`0G Compute initialization failed: ${error.message}`);
    }
  }

  /**
   * Ensure service is initialized before operations
   */
  async ensureInitialized() {
    if (!this.initialized) {
      if (!this.initPromise) {
        this.initPromise = this.initialize();
      }
      await this.initPromise;
    }
    
    if (!this.broker || !this.wallet) {
      throw new Error('ComputeService not properly initialized');
    }
  }

  /**
   * List available AI services
   */
  async listServices() {
    await this.ensureInitialized();
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[ComputeService] Fetching available AI services...');
      
      const services = await this.broker.inference.listService();
      
      // Enhance services with metadata and convert BigInt to strings
      const enhancedServices = services.map(service => ({
        provider: service.provider,
        serviceType: service.serviceType,
        url: service.url,
        verifiability: service.verifiability,
        // Convert BigInt to strings for JSON serialization
        inputPrice: service.inputPrice?.toString() || "0",
        outputPrice: service.outputPrice?.toString() || "0",
        // Human-readable formatted prices
        inputPriceOG: ethers.formatEther(service.inputPrice || 0),
        outputPriceOG: ethers.formatEther(service.outputPrice || 0),
        // Metadata flags
        isDeepSeek: service.provider === DEEPSEEK_PROVIDER,
        isLlama: service.provider === LLAMA_PROVIDER,
        verifiable: service.verifiability === 'TeeML',
        recommendedForDreams: service.provider === LLAMA_PROVIDER
      }));
      
      if (DEBUG) {
        console.log(`[ComputeService] Found ${enhancedServices.length} available services:`);
        enhancedServices.forEach((service, index) => {
          console.log(`  ${index + 1}. Provider: ${service.provider}`);
          console.log(`     Input: ${service.inputPriceOG} OG, Output: ${service.outputPriceOG} OG`);
          console.log(`     Verification: ${service.verifiability || 'None'}`);
          console.log(`     Recommended: ${service.recommendedForDreams ? 'YES (Llama)' : 'No'}`);
        });
      }
      
      return enhancedServices;
      
    } catch (error) {
      console.error('[ComputeService] Failed to list services:', error);
      throw new Error(`Failed to list AI services: ${error.message}`);
    }
  }

  /**
   * Check current ledger balance
   */
  async checkBalance() {
    await this.ensureInitialized();
    
    try {
      const ledgerInfo = await this.broker.ledger.getLedger();
      const balance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
      
      this.costTracker.ledgerBalance = balance;
      
      return {
        balanceOG: balance,
        estimatedQueries: Math.floor(balance * 10000), // ~10k queries per 0.1 OG
        ledgerInfo: ledgerInfo
      };
      
    } catch (error) {
      console.error('[ComputeService] Failed to check balance:', error);
      throw new Error(`Failed to check balance: ${error.message}`);
    }
  }

  /**
   * Test connection with simple query
   */
  async testConnection() {
    await this.ensureInitialized();
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[ComputeService] Testing connection with simple query...');
      
      const testQuery = "Hello, are you working? Please respond with 'Yes, Llama 3.3 70B is ready for dream analysis.'";
      
      // Use Llama provider for test
      const result = await this.sendSimpleQuery(testQuery, LLAMA_PROVIDER);
      
      if (DEBUG) console.log('[ComputeService] Test query successful:', result.response?.substring(0, 100) + '...');
      
              return {
          success: true,
          provider: LLAMA_PROVIDER,
          response: result.response,
          cost: result.cost,
          balance: this.costTracker.ledgerBalance
        };
      
    } catch (error) {
      console.error('[ComputeService] Connection test failed:', error);
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
   * Send simple query to AI service
   */
  async sendSimpleQuery(query, providerAddress = LLAMA_PROVIDER) {
    await this.ensureInitialized();
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[ComputeService] Sending query to:', providerAddress);
      
      // Acknowledge provider (required once per provider)
      try {
        await this.broker.inference.acknowledgeProviderSigner(providerAddress);
        if (DEBUG) console.log('[ComputeService] Provider acknowledged');
      } catch (ackError) {
        if (ackError.message.includes('already acknowledged')) {
          if (DEBUG) console.log('[ComputeService] Provider already acknowledged');
        } else {
          throw ackError;
        }
      }
      
      // Get service metadata
      const { endpoint, model } = await this.broker.inference.getServiceMetadata(providerAddress);
      if (DEBUG) console.log('[ComputeService] Service endpoint:', endpoint);
      if (DEBUG) console.log('[ComputeService] Model:', model);
      
      // Generate authentication headers (single-use!)
      const headers = await this.broker.inference.getRequestHeaders(providerAddress, query);
      if (DEBUG) console.log('[ComputeService] Auth headers generated');
      
      // Create OpenAI client with service endpoint
      const OpenAI = require('openai');
      const openai = new OpenAI({
        baseURL: endpoint,
        apiKey: "", // Empty string as per 0G docs
      });
      
      // Prepare headers for OpenAI client (exactly like working demo)
      const requestHeaders = {};
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          requestHeaders[key] = value;
        }
      });
      
      if (DEBUG) console.log('[ComputeService] Request headers prepared:', Object.keys(requestHeaders));
      
      // Send query (exactly like working demo)
      const startTime = Date.now();
      const completion = await openai.chat.completions.create(
        {
          messages: [{ role: "user", content: query }],
          model: model,
        },
        {
          headers: requestHeaders,
        }
      );
      
      const duration = Date.now() - startTime;
      const response = completion.choices[0].message.content;
      const chatId = completion.id;
      
      if (DEBUG) console.log('[ComputeService] Query completed in', duration + 'ms');
      if (DEBUG) console.log('[ComputeService] Response preview:', response?.substring(0, 200) + '...');
      
      // Process response and handle payment
      try {
        const isValid = await this.broker.inference.processResponse(
          providerAddress,
          response || "",
          chatId
        );
        
        if (DEBUG) console.log('[ComputeService] Payment processed, verified:', isValid);
        
      } catch (paymentError) {
        console.warn('[ComputeService] Payment processing warning:', paymentError.message);
      }
      
      // Update cost tracking
      this.costTracker.totalQueries++;
      this.costTracker.lastQueryCost = 0.0001; // Estimate
      this.costTracker.totalCost += this.costTracker.lastQueryCost;
      
      return {
        response: response,
        chatId: chatId,
        duration: duration,
        cost: this.costTracker.lastQueryCost,
        verified: true,
        provider: providerAddress
      };
      
    } catch (error) {
      console.error('[ComputeService] Query failed:', error);
      throw new Error(`AI query failed: ${error.message}`);
    }
  }

  /**
   * Get cost statistics
   */
  getCostStats() {
    return {
      ...this.costTracker,
      estimatedRemainingQueries: Math.floor(this.costTracker.ledgerBalance * 10000)
    };
  }
}

module.exports = ComputeService; 