const { ethers } = require('ethers');

/**
 * Fee Calculation Service - Based on 0gdrive advanced fee calculation
 * Provides real-time storage and gas fee estimation for 0G Storage uploads
 */
class FeeCalculationService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC || 'https://evmrpc-testnet.0g.ai');
    this.signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
    
    // Flow contract addresses for different networks
    this.networkConfigs = {
      standard: {
        name: 'Standard',
        flowAddress: process.env.STANDARD_FLOW_ADDRESS || '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628',
        storageRpc: process.env.STANDARD_STORAGE_RPC || 'https://indexer-storage-testnet-standard.0g.ai',
        description: 'Lower cost, slower processing'
      },
      turbo: {
        name: 'Turbo',
        flowAddress: process.env.TURBO_FLOW_ADDRESS || '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628',
        storageRpc: process.env.TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
        description: 'Higher cost, faster processing'
      }
    };
    
    // Default to turbo for Dreamscape (current behavior)
    this.currentNetwork = process.env.STORAGE_NETWORK || 'turbo';
    
    console.log(`[FeeCalculationService] Initialized with ${this.currentNetwork} network`);
  }

  /**
   * Get flow contract instance for current network
   */
  getFlowContract() {
    const config = this.networkConfigs[this.currentNetwork];
    
    // Simplified Flow contract ABI - key functions only
    const flowABI = [
      "function market() view returns (address)",
      "function submit((uint256 length, bytes tags, (bytes32 root, uint256 height) nodes)) payable",
      "function pricePerSector() view returns (uint256)"
    ];
    
    return new ethers.Contract(config.flowAddress, flowABI, this.signer);
  }

  /**
   * Get market contract instance  
   */
  getMarketContract(marketAddress) {
    const marketABI = [
      "function pricePerSector() view returns (uint256)"
    ];
    
    return new ethers.Contract(marketAddress, marketABI, this.provider);
  }

  /**
   * Calculate storage price based on submission data
   * Simplified version of 0G SDK calculatePrice function
   */
  calculateStoragePrice(submissionLength, pricePerSector) {
    // Calculate number of sectors needed (each sector is typically 256 bytes)
    const SECTOR_SIZE = 256;
    const sectors = Math.ceil(submissionLength / SECTOR_SIZE);
    
    return BigInt(sectors) * pricePerSector;
  }

  /**
   * Get progressive fee multiplier based on retry attempt
   * @param {number} retryAttempt - Current retry attempt (0, 1, 2)
   * @returns {number} Fee multiplier
   */
  getProgressiveFeeMultiplier(retryAttempt = 0) {
    const multipliers = [1.2, 1.5, 2.0]; // 1/3, 2/3, 3/3 as requested
    const maxAttempt = multipliers.length - 1;
    
    const attempt = Math.min(retryAttempt, maxAttempt);
    const multiplier = multipliers[attempt];
    
    console.log(`[FeeCalculationService] Progressive fee - Attempt ${attempt + 1}/3, Multiplier: ${multiplier}x`);
    return multiplier;
  }

  /**
   * Calculate comprehensive fees for file upload with retry support
   * @param {number} dataSize - Size of data to upload in bytes
   * @param {Object} options - Calculation options
   * @param {number} options.retryAttempt - Current retry attempt (0, 1, 2)
   * @returns {Promise<Object>} Fee breakdown with costs and recommendations
   */
  async calculateUploadFees(dataSize, options = {}) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    const retryAttempt = options.retryAttempt || 0;
    
    try {
      if (DEBUG) console.log(`[FeeCalculationService] Calculating fees for ${dataSize} bytes (attempt ${retryAttempt + 1})`);
      
      // Get flow contract for current network
      const flowContract = this.getFlowContract();
      const config = this.networkConfigs[this.currentNetwork];
      
      // 1. Get market address and price per sector
      const marketAddr = await flowContract.market();
      const market = this.getMarketContract(marketAddr);
      const pricePerSector = await market.pricePerSector();
      
      if (DEBUG) console.log(`[FeeCalculationService] Market: ${marketAddr}, Price per sector: ${pricePerSector.toString()}`);
      
      // 2. Calculate storage fee
      const storageFee = this.calculateStoragePrice(dataSize, pricePerSector);
      
      // 3. Get current gas price with progressive multiplier
      const feeData = await this.provider.getFeeData();
      const baseGasPrice = feeData.gasPrice || BigInt(20000000000); // 20 gwei fallback
      
      // Apply progressive gas multiplier for retry attempts
      const progressiveMultiplier = this.getProgressiveFeeMultiplier(retryAttempt);
      const optimizedGasPrice = BigInt(Math.floor(Number(baseGasPrice) * progressiveMultiplier));
      
      if (DEBUG) console.log(`[FeeCalculationService] Base gas price: ${ethers.formatUnits(baseGasPrice, 'gwei')} gwei, Progressive multiplier: ${progressiveMultiplier}x, Final: ${ethers.formatUnits(optimizedGasPrice, 'gwei')} gwei`);
      
      // 4. Estimate gas for upload transaction
      let gasEstimate;
      try {
        // Create mock submission for gas estimation
        const mockSubmission = {
          length: dataSize,
          tags: '0x' + Date.now().toString(16),
          nodes: [] // Simplified for estimation
        };
        
        gasEstimate = await flowContract.submit.estimateGas(mockSubmission, { 
          value: storageFee 
        });
        
        if (DEBUG) console.log(`[FeeCalculationService] Gas estimate: ${gasEstimate.toString()}`);
        
      } catch (estimateError) {
        // Fallback gas estimate based on data size
        const baseGas = 100000; // Base transaction cost
        const dataGas = Math.ceil(dataSize / 1024) * 5000; // ~5k gas per KB
        gasEstimate = BigInt(baseGas + dataGas);
        
        if (DEBUG) console.log(`[FeeCalculationService] Using fallback gas estimate: ${gasEstimate.toString()}`);
      }
      
      // 5. Calculate total costs
      const gasFee = gasEstimate * optimizedGasPrice;
      const totalFee = storageFee + gasFee;
      
      // 6. Build comprehensive fee info
      const feeInfo = {
        network: this.currentNetwork,
        networkConfig: config,
        
        // Raw values (converted to string for JSON serialization)
        raw: {
          storageFee: storageFee.toString(),
          gasFee: gasFee.toString(),
          totalFee: totalFee.toString(),
          gasEstimate: gasEstimate.toString(),
          gasPrice: optimizedGasPrice.toString(),
          pricePerSector: pricePerSector.toString()
        },
        
        // Human readable values (ETH)
        formatted: {
          storageFee: ethers.formatEther(storageFee),
          gasFee: ethers.formatEther(gasFee),
          totalFee: ethers.formatEther(totalFee),
          gasPrice: ethers.formatUnits(optimizedGasPrice, 'gwei') + ' gwei'
        },
        
        // USD estimates (approximate)
        usd: {
          storageFee: this.convertToUSD(storageFee),
          gasFee: this.convertToUSD(gasFee),
          totalFee: this.convertToUSD(totalFee)
        },
        
        // Calculation metadata
        metadata: {
          dataSize,
          sectors: Math.ceil(dataSize / 256),
          gasMultiplier: progressiveMultiplier,
          estimationMethod: gasEstimate > BigInt(200000) ? 'contract' : 'fallback',
          timestamp: Date.now()
        }
      };
      
      if (DEBUG) {
        console.log(`[FeeCalculationService] Fee calculation completed:`);
        console.log(`  Storage: ${feeInfo.formatted.storageFee} OG (~$${feeInfo.usd.storageFee})`);
        console.log(`  Gas: ${feeInfo.formatted.gasFee} OG (~$${feeInfo.usd.gasFee})`);
        console.log(`  Total: ${feeInfo.formatted.totalFee} OG (~$${feeInfo.usd.totalFee})`);
      }
      
      return feeInfo;
      
    } catch (error) {
      console.error('[FeeCalculationService] Fee calculation failed:', error);
      
      // Return fallback fee structure
      return this.getFallbackFees(dataSize);
    }
  }

  /**
   * Convert 0G token amount to approximate USD
   * @param {BigInt} ogAmount - Amount in wei
   * @returns {string} USD estimate
   */
  convertToUSD(ogAmount) {
    // Approximate 0G price - in production, fetch from price API
    const OG_PRICE_USD = parseFloat(process.env.OG_PRICE_USD || '0.10'); // $0.10 estimate
    const ogValue = parseFloat(ethers.formatEther(ogAmount));
    return (ogValue * OG_PRICE_USD).toFixed(6);
  }

  /**
   * Get fallback fees when calculation fails
   */
  getFallbackFees(dataSize) {
    const fallbackStorageFee = BigInt(Math.ceil(dataSize / 1024) * 1000000000000000); // ~0.001 OG per KB
    const fallbackGasFee = BigInt('50000000000000000'); // 0.05 OG
    const totalFee = fallbackStorageFee + fallbackGasFee;
    
    return {
      network: this.currentNetwork,
      fallback: true,
      
      raw: {
        storageFee: fallbackStorageFee.toString(),
        gasFee: fallbackGasFee.toString(),
        totalFee: totalFee.toString()
      },
      
      formatted: {
        storageFee: ethers.formatEther(fallbackStorageFee),
        gasFee: ethers.formatEther(fallbackGasFee),
        totalFee: ethers.formatEther(totalFee)
      },
      
      usd: {
        storageFee: this.convertToUSD(fallbackStorageFee),
        gasFee: this.convertToUSD(fallbackGasFee),
        totalFee: this.convertToUSD(totalFee)
      },
      
      metadata: {
        dataSize,
        warning: 'Using fallback fee calculation'
      }
    };
  }

  /**
   * Get network recommendations based on file size and usage
   */
  getNetworkRecommendation(dataSize, urgency = 'normal') {
    const recommendations = {
      small: { size: '< 1MB', network: 'standard', reason: 'Low cost for small files' },
      medium: { size: '1-10MB', network: urgency === 'high' ? 'turbo' : 'standard', reason: 'Balanced cost/speed' },
      large: { size: '> 10MB', network: 'turbo', reason: 'Faster processing for large files' }
    };
    
    if (dataSize < 1024 * 1024) return recommendations.small;
    if (dataSize < 10 * 1024 * 1024) return recommendations.medium;
    return recommendations.large;
  }

  /**
   * Switch network configuration
   */
  switchNetwork(networkType) {
    if (!this.networkConfigs[networkType]) {
      throw new Error(`Unknown network type: ${networkType}`);
    }
    
    this.currentNetwork = networkType;
    console.log(`[FeeCalculationService] Switched to ${networkType} network`);
  }

  /**
   * Get optimized upload options with calculated fees and retry support
   */
  async getOptimizedUploadOptions(dataSize, options = {}) {
    const feeInfo = await this.calculateUploadFees(dataSize, options);
    const recommendation = this.getNetworkRecommendation(dataSize, options.urgency);
    
    // Build optimized upload options - use BigInt value for fee
    const storageFeeAsBigInt = BigInt(feeInfo.raw.storageFee);
    
    const uploadOptions = {
      taskSize: 10,
      expectedReplica: 1,
      finalityRequired: options.waitForFinality !== false, // Default true (unlike our current false)
      tags: this.generateUniqueTag(),
      skipTx: false, // Use transaction layer for better reliability
      fee: storageFeeAsBigInt // Use calculated fee instead of BigInt(0)
    };
    
    return {
      uploadOptions,
      feeInfo,
      recommendation,
      network: this.networkConfigs[this.currentNetwork],
      retryAttempt: options.retryAttempt || 0
    };
  }

  /**
   * Generate unique tag for upload
   */
  generateUniqueTag() {
    const timestamp = Date.now();
    const randomValue = Math.floor(Math.random() * 1000000);
    const combinedValue = timestamp + randomValue;
    const hexString = combinedValue.toString(16);
    const paddedHex = hexString.length % 2 === 0 ? hexString : '0' + hexString;
    return '0x' + paddedHex;
  }
}

module.exports = FeeCalculationService; 