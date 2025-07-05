import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import type { ZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class MasterWalletService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private broker: ZGComputeNetworkBroker | null = null;
  private isInitialized = false;
  private isRefilling = false;

  constructor() {
    const privateKey = process.env.MASTER_WALLET_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai';

    if (!privateKey) {
      throw new Error('MASTER_WALLET_KEY is required in environment variables');
    }

    if (privateKey.length !== 64) {
      throw new Error('MASTER_WALLET_KEY must be 64 characters (without 0x prefix)');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    if (process.env.TEST_ENV === 'true') {
      console.log('🔑 Master Wallet initialized:', this.wallet.address);
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (process.env.TEST_ENV === 'true') {
        console.log('🔄 Initializing Master Wallet broker...');
      }

      // Create 0G Compute broker
      this.broker = await createZGComputeNetworkBroker(this.wallet);
      
      // Ensure ledger exists
      await this.ensureLedgerExists();
      
      // Check and refill if needed
      await this.checkAndRefill();
      
      this.isInitialized = true;
      
      if (process.env.TEST_ENV === 'true') {
        console.log('✅ Master Wallet broker initialized successfully');
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize Master Wallet:', error.message);
      throw error;
    }
  }

  private async ensureLedgerExists(): Promise<void> {
    if (!this.broker) {
      throw new Error('Broker not initialized');
    }

    try {
      const ledgerInfo = await this.broker.ledger.getLedger();
      const balance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`💰 Master Wallet ledger balance: ${balance} OG`);
      }
    } catch (error: any) {
      if (error.message.includes('LedgerNotExists')) {
        if (process.env.TEST_ENV === 'true') {
          console.log('🆕 Creating Master Wallet ledger...');
        }
        
        const initialAmount = parseFloat(process.env.AUTO_REFILL_AMOUNT || '0.5');
        await this.broker.ledger.addLedger(initialAmount);
        
        if (process.env.TEST_ENV === 'true') {
          console.log(`✅ Master Wallet ledger created with ${initialAmount} OG`);
        }
      } else {
        throw error;
      }
    }
  }

  async checkAndRefill(): Promise<void> {
    if (!this.broker || this.isRefilling) {
      return;
    }

    try {
      const ledgerInfo = await this.broker.ledger.getLedger();
      const balance = parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
      const threshold = parseFloat(process.env.AUTO_REFILL_THRESHOLD || '0.1');
      const refillAmount = parseFloat(process.env.AUTO_REFILL_AMOUNT || '0.5');

      if (balance < threshold) {
        if (process.env.TEST_ENV === 'true') {
          console.log(`⚠️  Master Wallet balance low: ${balance} OG < ${threshold} OG`);
          console.log(`🔄 Auto-refilling with ${refillAmount} OG...`);
        }

        this.isRefilling = true;
        
        try {
          await this.broker.ledger.depositFund(refillAmount);
          
          const newLedgerInfo = await this.broker.ledger.getLedger();
          const newBalance = parseFloat(ethers.formatEther(newLedgerInfo.ledgerInfo[0]));
          
          if (process.env.TEST_ENV === 'true') {
            console.log(`✅ Master Wallet refilled. New balance: ${newBalance} OG`);
          }
        } finally {
          this.isRefilling = false;
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to check/refill Master Wallet:', error.message);
      this.isRefilling = false;
    }
  }

  async getWalletBalance(): Promise<number> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return parseFloat(ethers.formatEther(balance));
  }

  async getLedgerBalance(): Promise<number> {
    if (!this.broker) {
      throw new Error('Broker not initialized');
    }

    const ledgerInfo = await this.broker.ledger.getLedger();
    return parseFloat(ethers.formatEther(ledgerInfo.ledgerInfo[0]));
  }

  getBroker(): ZGComputeNetworkBroker {
    if (!this.broker) {
      throw new Error('Broker not initialized. Call initialize() first.');
    }
    return this.broker;
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  async getWalletInfo(): Promise<{
    address: string;
    ethBalance: number;
    ledgerBalance: number;
  }> {
    const [ethBalance, ledgerBalance] = await Promise.all([
      this.getWalletBalance(),
      this.getLedgerBalance()
    ]);

    return {
      address: this.wallet.address,
      ethBalance,
      ledgerBalance
    };
  }

  // Monitor incoming transactions to Master Wallet
  async startTransactionMonitor(onTransaction: (from: string, amount: number, txHash: string) => void): Promise<void> {
    if (process.env.TEST_ENV === 'true') {
      console.log('👁️  Starting transaction monitor for Master Wallet...');
    }

    this.provider.on('block', async (blockNumber) => {
      try {
        const block = await this.provider.getBlock(blockNumber, true);
        if (!block || !block.transactions) return;

        for (const tx of block.transactions) {
          if (typeof tx === 'string') continue;
          
          // Type guard for transaction object
          const transaction = tx as ethers.TransactionResponse;
          
          if (transaction.to?.toLowerCase() === this.wallet.address.toLowerCase() && transaction.value && transaction.value > 0) {
            const amount = parseFloat(ethers.formatEther(transaction.value));
            const from = transaction.from;
            const txHash = transaction.hash;

            if (process.env.TEST_ENV === 'true') {
              console.log(`💰 Incoming transaction detected: ${amount} OG from ${from}`);
            }

            onTransaction(from, amount, txHash);
          }
        }
      } catch (error: any) {
        console.error('❌ Error monitoring transactions:', error.message);
      }
    });
  }

  async stopTransactionMonitor(): Promise<void> {
    this.provider.removeAllListeners('block');
    
    if (process.env.TEST_ENV === 'true') {
      console.log('🛑 Transaction monitor stopped');
    }
  }

  async cleanup(): Promise<void> {
    await this.stopTransactionMonitor();
    this.isInitialized = false;
    this.broker = null;
  }
}

export default new MasterWalletService(); 