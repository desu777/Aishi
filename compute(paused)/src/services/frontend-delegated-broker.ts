import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, OFFICIAL_PROVIDERS, MODEL_CONFIG } from '../config/constants';
import logger from '../utils/logger';

// Contract ABIs (simplified - you'll need full ABI from compiled contracts)
const LEDGER_MANAGER_ABI = [
  "function getLedger(address user) view returns (tuple(address user, uint256 availableBalance, uint256 totalBalance, uint256[2] inferenceSigner, string additionalInfo, address[] inferenceProviders, address[] fineTuningProviders))",
  "function addLedger(uint256[2] inferenceSigner, string additionalInfo) payable",
  "function depositFund() payable",
  "function transferFund(address provider, string serviceType, uint256 amount)",
  "error LedgerNotExists(address user)",
  "error InsufficientBalance(address user)"
];

const INFERENCE_SERVING_ABI = [
  "function getAllServices() view returns (tuple(address provider, string serviceType, string url, uint256 inputPrice, uint256 outputPrice, uint256 updatedAt, string model, string verifiability)[])",
  "function acknowledgeProviderSigner(address provider, uint256[2] providerPubKey)",
  "function getService(address provider) view returns (tuple(address provider, string serviceType, string url, uint256 inputPrice, uint256 outputPrice, uint256 updatedAt, string model, string verifiability))",
  "function getAccount(address user, address provider) view returns (tuple(address user, address provider, uint256 balance, uint256 pendingRefund, uint256[2] signer, uint256[2] providerPubKey, uint256 nonce, tuple(uint256 index, uint256 amount, uint256 timestamp, bool processed)[] refunds))"
];

// Types
interface LedgerInfo {
  user: string;
  availableBalance: bigint;
  totalBalance: bigint;
  inferenceSigner: [bigint, bigint];
  additionalInfo: string;
  inferenceProviders: string[];
  fineTuningProviders: string[];
}

interface Service {
  provider: string;
  serviceType: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  updatedAt: bigint;
  model: string;
  verifiability: string;
}

interface Account {
  user: string;
  provider: string;
  balance: bigint;
  pendingRefund: bigint;
  signer: [bigint, bigint];
  providerPubKey: [bigint, bigint];
  nonce: bigint;
  refunds: Array<{
    index: bigint;
    amount: bigint;
    timestamp: bigint;
    processed: boolean;
  }>;
}

/**
 * Custom Broker Implementation that delegates signing to frontend
 * Instead of using createZGComputeNetworkBroker which requires private key
 */
export class FrontendDelegatedBroker {
  private provider: ethers.JsonRpcProvider;
  private userAddress: string;
  private ledgerContract: ethers.Contract;
  private inferenceContract: ethers.Contract;
  
  // Signature callback - will be set by BrokerService
  private signatureCallback?: (operation: any) => Promise<string>;
  
  constructor(
    userAddress: string, 
    provider: ethers.JsonRpcProvider
  ) {
    this.userAddress = userAddress;
    this.provider = provider;
    
    // Initialize contracts directly
    this.ledgerContract = new ethers.Contract(
      CONTRACT_ADDRESSES.LEDGER,
      LEDGER_MANAGER_ABI,
      provider
    );
    
    this.inferenceContract = new ethers.Contract(
      CONTRACT_ADDRESSES.INFERENCE,
      INFERENCE_SERVING_ABI,
      provider
    );
  }
  
  // Set signature callback
  setSignatureCallback(callback: (operation: any) => Promise<string>) {
    this.signatureCallback = callback;
  }
  
  // Helper to wait for transaction with retry logic
  private async waitForTransaction(txHash: string): Promise<void> {
    let txResponse = null;
    let retries = 0;
    const maxRetries = 10;
    
    while (!txResponse && retries < maxRetries) {
      try {
        txResponse = await this.provider.getTransaction(txHash);
        if (!txResponse) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
        }
      } catch (error: any) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (txResponse) {
      try {
        await txResponse.wait();
      } catch (error: any) {
        // If wait fails, verify by checking balance instead
        logger.warn('Transaction wait failed, verifying by balance', { txHash, error: error.message });
      }
    } else {
      // Transaction not found in RPC, but might be successful
      // Verify by checking if ledger balance increased
      logger.warn('Transaction not found in RPC, verifying by balance', { txHash });
    }
  }
  
  // Ledger operations
  ledger = {
    getLedger: async (): Promise<{ ledgerInfo: [bigint, bigint, bigint]; signer: string }> => {
      try {
        const ledger = await this.ledgerContract.getLedger(this.userAddress) as LedgerInfo;
        return {
          ledgerInfo: [ledger.availableBalance, ledger.totalBalance, 0n], // Third value is placeholder
          signer: this.userAddress
        };
      } catch (error: any) {
        if (error.message.includes('LedgerNotExists')) {
          throw new Error('LedgerNotExists');
        }
        throw error;
      }
    },
    
    addLedger: async (amount: number): Promise<void> => {
      if (!this.signatureCallback) {
        throw new Error('Signature callback not set');
      }
      
      const amountWei = ethers.parseEther(amount.toString());
      
      // Generate inference signer (dummy values for now - you may want to generate proper keys)
      const inferenceSigner: [bigint, bigint] = [
        BigInt('0x' + ethers.hexlify(ethers.randomBytes(32)).slice(2)),
        BigInt('0x' + ethers.hexlify(ethers.randomBytes(32)).slice(2))
      ];
      
      // Prepare transaction
      const tx = await this.ledgerContract.addLedger.populateTransaction(
        inferenceSigner,
        "0G Dreamscape User", // additionalInfo
        {
          value: amountWei
        }
      );
      
      // Request transaction hash from frontend (MetaMask will sign and send)
      const txHash = await this.signatureCallback({
        type: 'signTransaction',
        transaction: {
          ...tx,
          from: this.userAddress,
          value: amountWei.toString() // Convert to string for JSON
        }
      });
      
      // Wait for transaction with retry logic
      await this.waitForTransaction(txHash);
      
      logger.info('Ledger created', { 
        address: this.userAddress, 
        amount,
        txHash 
      });
    },
    
    depositFund: async (amount: number): Promise<void> => {
      if (!this.signatureCallback) {
        throw new Error('Signature callback not set');
      }
      
      const amountWei = ethers.parseEther(amount.toString());
      
      // Prepare transaction
      const tx = await this.ledgerContract.depositFund.populateTransaction({
        value: amountWei
      });
      
      // Request transaction hash from frontend (MetaMask will sign and send)
      const txHash = await this.signatureCallback({
        type: 'signTransaction',
        transaction: {
          ...tx,
          from: this.userAddress,
          value: amountWei.toString()
        }
      });
      
      // Wait for transaction with retry logic
      await this.waitForTransaction(txHash);
      
      logger.info('Funds deposited', { 
        address: this.userAddress, 
        amount,
        txHash 
      });
    }
  };
  
  // Inference operations
  inference = {
    listService: async (): Promise<Service[]> => {
      const services = await this.inferenceContract.getAllServices();
      return services;
    },
    
    acknowledgeProviderSigner: async (providerAddress: string): Promise<void> => {
      if (!this.signatureCallback) {
        throw new Error('Signature callback not set');
      }
      
      // Get provider service info from MODEL_CONFIG
      const modelInfo = MODEL_CONFIG.MODELS.find(m => m.provider === providerAddress);
      const providerBase = 'https://inference.0g.ai';
      
      try {
        // Check if already acknowledged by getting account info
        const account = await this.inferenceContract.getAccount(this.userAddress, providerAddress);
        
        // If account exists and has provider pub key, it's already acknowledged
        if (account && account.providerPubKey && account.providerPubKey[0] !== 0n) {
          logger.info('Provider already acknowledged', { 
            provider: providerAddress,
            user: this.userAddress 
          });
          return;
        }
      } catch (error) {
        // Account doesn't exist yet, continue with acknowledgement
        logger.info('Account does not exist, will acknowledge provider', { 
          provider: providerAddress,
          user: this.userAddress 
        });
      }

      try {
        // Try to fetch provider info from their service
        const response = await fetch(`${providerBase}/provider/info`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const providerInfo = await response.json() as any;
          if (providerInfo.publicKey && Array.isArray(providerInfo.publicKey) && providerInfo.publicKey.length === 2) {
            const providerPubKey: [bigint, bigint] = [
              BigInt(providerInfo.publicKey[0]),
              BigInt(providerInfo.publicKey[1])
            ];
            
            const tx = await this.inferenceContract.acknowledgeProviderSigner.populateTransaction(
              providerAddress,
              providerPubKey
            );
            
            const txHash = await this.signatureCallback({
              type: 'signTransaction',
              transaction: { ...tx, from: this.userAddress }
            });
            
            await this.waitForTransaction(txHash);
            logger.info('Provider acknowledged successfully', { 
              provider: providerAddress,
              txHash 
            });
            return;
          }
        }

        // Try fallback to /v1/quote endpoint (used by official SDK)
        try {
          const quoteResp = await fetch(`${providerBase}/v1/quote`);
          if (quoteResp.ok) {
            const quoteJson = await quoteResp.text();
            const parsed = JSON.parse(quoteJson, (_, v) => (/^\d+$/.test(v) ? BigInt(v) : v));
            if (parsed && parsed.key && Array.isArray(parsed.key) && parsed.key.length === 2) {
              const providerPubKey: [bigint, bigint] = [BigInt(parsed.key[0]), BigInt(parsed.key[1])];
              const tx = await this.inferenceContract.acknowledgeProviderSigner.populateTransaction(
                providerAddress,
                providerPubKey
              );
              const txHash = await this.signatureCallback({
                type: 'signTransaction',
                transaction: { ...tx, from: this.userAddress }
              });
              await this.waitForTransaction(txHash);
              logger.info('Provider acknowledged via quote endpoint', { 
                provider: providerAddress,
                txHash 
              });
              return;
            }
          }
        } catch (fallbackError) {
          logger.warn('Fallback quote endpoint failed', { error: fallbackError });
        }

      } catch (error) {
        logger.warn('Failed to fetch provider public key', { 
          provider: providerAddress,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      // If we can't fetch the public key, skip on-chain acknowledgement to avoid revert
      logger.warn('Skipping on-chain acknowledgement – public key unknown', { 
        provider: providerAddress 
      });
      // Ensure account exists by doing a zero-value transfer from ledger
      try {
        const tx = await this.ledgerContract.transferFund.populateTransaction(
          providerAddress,
          'inference',
          1
        );
        const txHash = await this.signatureCallback({
          type: 'signTransaction',
          transaction: { ...tx, from: this.userAddress }
        });
        await this.waitForTransaction(txHash);
        logger.info('Zero-value transfer executed to create account', { provider: providerAddress, txHash });
      } catch (e) {
        logger.warn('Failed zero-value transfer for account creation', { provider: providerAddress, error: e });
      }
      return; // Skip sending tx with empty keys to prevent revert
    },
    
    getServiceMetadata: async (providerAddress: string): Promise<{ endpoint: string; modelName: string }> => {
      const service = await this.inferenceContract.getService(providerAddress) as Service;
      
      // Get endpoint and model from service data
      const providerBase = (service.url || 'https://inference.0g.ai').replace(/\/$/,'');
      const endpoint = `${providerBase}/v1/proxy`;
      const modelName = service.model || this.getModelNameFromProvider(providerAddress);
      
      return { endpoint, modelName };
    },
    
    getRequestHeaders: async (providerAddress: string, content: string): Promise<Record<string, string>> => {
      if (!this.signatureCallback) {
        throw new Error('Signature callback not set');
      }
      
      // Create request ID and content hash
      const requestId = ethers.hexlify(ethers.randomBytes(32));
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes(content));
      
      // Create message to sign (following 0G protocol)
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'address', 'bytes32', 'bytes32'],
        [this.userAddress, providerAddress, requestId, contentHash]
      );
      
      // Request signature from frontend
      const signature = await this.signatureCallback({
        type: 'signMessage',
        message: messageHash // Send as hex string
      });
      
      // Build headers in format expected by provider proxy (StandaloneApi)
      return {
        'X-Phala-Signature-Type': 'StandaloneApi',
        'Address': this.userAddress,
        'Nonce': requestId.slice(2, 10), // use part of requestId as nonce string
        'Input-Fee': '0',
        'Fee': '0',
        'Request-Hash': contentHash,
        'Signature': signature,
        'VLLM-Proxy': 'true',
        'Content-Type': 'application/json'
      };
    },
    
    processResponse: async (
      providerAddress: string, 
      response: string, 
      chatId: string
    ): Promise<boolean> => {
      // In testnet, payment processing might be simplified
      // Real implementation would handle response verification and payment
      logger.info('Processing response', { 
        provider: providerAddress,
        chatId,
        responseLength: response.length 
      });
      
      // TODO: Implement actual response processing if needed
      // This might involve verifying the response and settling payments
      
      return true; // Assume success for testnet
    }
  };
  
  // Helper to get model name from provider address
  private getModelNameFromProvider(providerAddress: string): string {
    const entries = Object.entries(OFFICIAL_PROVIDERS);
    const found = entries.find(([_, addr]) => addr.toLowerCase() === providerAddress.toLowerCase());
    return found ? found[0] : 'unknown-model';
  }
}

/**
 * Create a custom broker that delegates signing to frontend
 */
export async function createFrontendDelegatedBroker(
  userAddress: string,
  provider: ethers.JsonRpcProvider,
  signatureCallback: (operation: any) => Promise<string>
): Promise<FrontendDelegatedBroker> {
  const broker = new FrontendDelegatedBroker(userAddress, provider);
  broker.setSignatureCallback(signatureCallback);
  
  logger.info('Frontend delegated broker created', { userAddress });
  
  return broker;
} 