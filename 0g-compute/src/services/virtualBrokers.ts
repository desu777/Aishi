import database, { UserBroker, Transaction } from '../database/database';
import masterWallet from './masterWallet';

export interface BrokerInfo {
  walletAddress: string;
  balance: number;
  masterWalletAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundRequest {
  walletAddress: string;
  amount: number;
  txHash?: string;
}

export interface BalanceInfo {
  walletAddress: string;
  balance: number;
  masterWalletAddress: string;
  transactions: Transaction[];
}

export class VirtualBrokersService {
  
  /**
   * CREATE - Creates a new virtual broker for user
   */
  async createBroker(walletAddress: string): Promise<BrokerInfo> {
    try {
      // Validate wallet address format
      if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid wallet address format');
      }

      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if broker already exists
      const existingBroker = database.getBroker(normalizedAddress);
      if (existingBroker) {
        throw new Error('Broker already exists for this wallet address');
      }

      // Create new broker
      const broker = database.createBroker(normalizedAddress);
      
      // Add creation transaction
      database.addTransaction({
        walletAddress: normalizedAddress,
        type: 'deposit',
        amount: 0,
        description: 'Virtual broker created',
        txHash: undefined
      });

      if (process.env.TEST_ENV === 'true') {
        console.log(`🆕 Virtual broker created for: ${walletAddress}`);
      }

      return {
        walletAddress: broker.walletAddress,
        balance: broker.balance,
        masterWalletAddress: masterWallet.getWalletAddress(),
        createdAt: broker.createdAt,
        updatedAt: broker.updatedAt
      };
    } catch (error: any) {
      console.error('❌ Error creating virtual broker:', error.message);
      throw error;
    }
  }

  /**
   * FUND - Funds a virtual broker account
   */
  async fundBroker(request: FundRequest): Promise<BrokerInfo> {
    try {
      const { walletAddress, amount, txHash } = request;

      // Validate inputs
      if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid wallet address format');
      }

      if (!amount || amount <= 0) {
        throw new Error('Amount must be positive');
      }

      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if broker exists
      let broker = database.getBroker(normalizedAddress);
      if (!broker) {
        // Auto-create broker if it doesn't exist
        broker = database.createBroker(normalizedAddress);
        
        if (process.env.TEST_ENV === 'true') {
          console.log(`🆕 Auto-created virtual broker for: ${walletAddress}`);
        }
      }

      // Add funds to broker balance
      const newBalance = database.addToBalance(normalizedAddress, amount);
      
      // Record transaction
      database.addTransaction({
        walletAddress: normalizedAddress,
        type: 'deposit',
        amount: amount,
        description: `Deposit ${amount} OG to virtual broker`,
        txHash: txHash
      });

      if (process.env.TEST_ENV === 'true') {
        console.log(`💰 Funded broker ${walletAddress}: +${amount.toFixed(8)} OG = ${newBalance.toFixed(8)} OG`);
      }

      // Get updated broker info
      const updatedBroker = database.getBroker(normalizedAddress)!;
      
      return {
        walletAddress: updatedBroker.walletAddress,
        balance: updatedBroker.balance,
        masterWalletAddress: masterWallet.getWalletAddress(),
        createdAt: updatedBroker.createdAt,
        updatedAt: updatedBroker.updatedAt
      };
    } catch (error: any) {
      console.error('❌ Error funding virtual broker:', error.message);
      throw error;
    }
  }

  /**
   * CHECK_BALANCE - Checks broker balance and transaction history
   */
  async checkBalance(walletAddress: string): Promise<BalanceInfo> {
    try {
      // Validate wallet address format
      if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid wallet address format');
      }

      const normalizedAddress = walletAddress.toLowerCase();
      
      // Get broker info
      const broker = database.getBroker(normalizedAddress);
      if (!broker) {
        throw new Error('No virtual broker found for this wallet address');
      }

      // Get recent transactions
      const transactions = database.getTransactions(normalizedAddress, 20);

      if (process.env.TEST_ENV === 'true') {
        console.log(`📊 Balance check for ${walletAddress}: ${broker.balance.toFixed(8)} OG`);
      }

      return {
        walletAddress: broker.walletAddress,
        balance: broker.balance,
        masterWalletAddress: masterWallet.getWalletAddress(),
        transactions: transactions
      };
    } catch (error: any) {
      console.error('❌ Error checking balance:', error.message);
      throw error;
    }
  }

  /**
   * Deduct funds from broker (for AI queries)
   */
  async deductFunds(walletAddress: string, amount: number, description: string): Promise<number> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if broker exists
      const broker = database.getBroker(normalizedAddress);
      if (!broker) {
        throw new Error('No virtual broker found for this wallet address');
      }

      // Deduct funds
      const newBalance = database.subtractFromBalance(normalizedAddress, amount);
      
      // Record transaction
      database.addTransaction({
        walletAddress: normalizedAddress,
        type: 'ai_query',
        amount: amount,
        description: description,
        txHash: undefined
      });

      if (process.env.TEST_ENV === 'true') {
        console.log(`💸 Deducted ${amount.toFixed(8)} OG from ${walletAddress}: ${newBalance.toFixed(8)} OG remaining`);
      }

      return newBalance;
    } catch (error: any) {
      console.error('❌ Error deducting funds:', error.message);
      throw error;
    }
  }

  /**
   * Check if broker has sufficient balance
   */
  async hasBalance(walletAddress: string, requiredAmount: number): Promise<boolean> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      const broker = database.getBroker(normalizedAddress);
      
      if (!broker) {
        return false;
      }

      return broker.balance >= requiredAmount;
    } catch (error: any) {
      console.error('❌ Error checking balance:', error.message);
      return false;
    }
  }

  /**
   * Get all brokers (admin function)
   */
  async getAllBrokers(): Promise<{
    totalBrokers: number;
    totalBalance: number;
    masterWalletAddress: string;
  }> {
    try {
      const totalBrokers = database.getTotalBrokers();
      const totalBalance = database.getTotalBalance();
      
      return {
        totalBrokers,
        totalBalance,
        masterWalletAddress: masterWallet.getWalletAddress()
      };
    } catch (error: any) {
      console.error('❌ Error getting brokers summary:', error.message);
      throw error;
    }
  }

  /**
   * Auto-fund broker from incoming transaction
   */
  async processFundingTransaction(fromAddress: string, amount: number, txHash: string): Promise<void> {
    try {
      const normalizedAddress = fromAddress.toLowerCase();
      
      // Fund the broker
      await this.fundBroker({
        walletAddress: normalizedAddress,
        amount: amount,
        txHash: txHash
      });

      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ Auto-funded broker ${fromAddress} with ${amount} OG from transaction ${txHash}`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing funding transaction from ${fromAddress}:`, error.message);
      throw error;
    }
  }

  /**
   * Estimate AI query cost (approximate - real cost calculated dynamically)
   * LOWERED COSTS: Based on logs showing 0.00000000 OG real costs
   */
  estimateQueryCost(query: string, model?: string): number {
    // Use MODEL_PICKED from environment or default
    const selectedModel = model || process.env.MODEL_PICKED || 'llama-3.3-70b-instruct';
    
    // SIGNIFICANTLY LOWERED cost estimation - real costs are near zero
    const baseCosts = {
      'llama-3.3-70b-instruct': 0.00001,  // 0.00001 OG per query (100x lower)
      'deepseek-r1-70b': 0.00002,         // 0.00002 OG per query (100x lower)
    };

    const baseCost = baseCosts[selectedModel as keyof typeof baseCosts] || 0.00001;
    // Reduced length multiplier impact
    const lengthMultiplier = Math.max(1, query.length / 10000); // 100x less sensitive to length
    
    const estimatedCost = baseCost * lengthMultiplier;
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`💰 Cost estimation: ${estimatedCost.toFixed(8)} OG (model: ${selectedModel}, length: ${query.length})`);
    }
    
    return estimatedCost;
  }
}

export default new VirtualBrokersService(); 