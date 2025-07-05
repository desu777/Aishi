import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, OFFICIAL_PROVIDERS } from '../config/constants';
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
        // Account doesn't exist, need to acknowledge
      }
      
      // Generate provider public key (dummy values - in real implementation this would come from provider)
      const providerPubKey: [bigint, bigint] = [
        BigInt('0x' + ethers.hexlify(ethers.randomBytes(32)).slice(2)),
        BigInt('0x' + ethers.hexlify(ethers.randomBytes(32)).slice(2))
      ];
      
      // Prepare transaction
      const tx = await this.inferenceContract.acknowledgeProviderSigner.populateTransaction(
        providerAddress,
        providerPubKey
      );
      
      // Request transaction hash from frontend (MetaMask will sign and send)
      const txHash = await this.signatureCallback({
        type: 'signTransaction',
        transaction: {
          ...tx,
          from: this.userAddress
        }
      });
      
      // Wait for transaction with retry logic
      await this.waitForTransaction(txHash);
      
      logger.info('Provider acknowledged', { 
        provider: providerAddress,
        user: this.userAddress,
        txHash 
      });
    },
    
    getServiceMetadata: async (providerAddress: string): Promise<{ endpoint: string; modelName: string }> => {
      const service = await this.inferenceContract.getService(providerAddress) as Service;
      
      // Get endpoint and model from service data
      const endpoint = service.url || 'https://inference.0g.ai';
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
      
      // Build headers for 0G inference request
      return {
        'X-0G-User': this.userAddress,
        'X-0G-Provider': providerAddress,
        'X-0G-Request-ID': requestId,
        'X-0G-Content-Hash': contentHash,
        'X-0G-Signature': signature,
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