import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface UserBroker {
  id?: number;
  walletAddress: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id?: number;
  walletAddress: string;
  type: 'deposit' | 'withdrawal' | 'ai_query';
  amount: number;
  description: string;
  txHash?: string;
  createdAt: string;
}

class DatabaseService {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || './data/brokers.db';
    
    // Create directory if it doesn't exist
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeTables();
    
    if (process.env.TEST_ENV === 'true') {
      console.log('💾 Database initialized at:', dbPath);
    }
  }

  private initializeTables(): void {
    // Create user_brokers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_brokers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        walletAddress TEXT UNIQUE NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table for audit trail
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        walletAddress TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'ai_query')),
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        txHash TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_brokers_wallet 
      ON user_brokers(walletAddress)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_transactions_wallet 
      ON transactions(walletAddress)
    `);

    if (process.env.TEST_ENV === 'true') {
      console.log('✅ Database tables initialized');
    }
  }

  // User Broker Management
  createBroker(walletAddress: string): UserBroker {
    const stmt = this.db.prepare(`
      INSERT INTO user_brokers (walletAddress, balance, createdAt, updatedAt) 
      VALUES (?, 0, datetime('now'), datetime('now'))
    `);
    
    try {
      const result = stmt.run(walletAddress);
      
      if (process.env.TEST_ENV === 'true') {
        console.log(`🆕 Created broker for wallet: ${walletAddress}`);
      }
      
      return this.getBroker(walletAddress)!;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Broker already exists for wallet: ${walletAddress}`);
      }
      throw error;
    }
  }

  getBroker(walletAddress: string): UserBroker | null {
    const stmt = this.db.prepare(`
      SELECT * FROM user_brokers WHERE walletAddress = ?
    `);
    
    return stmt.get(walletAddress) as UserBroker | null;
  }

  updateBalance(walletAddress: string, newBalance: number): void {
    const stmt = this.db.prepare(`
      UPDATE user_brokers 
      SET balance = ?, updatedAt = datetime('now') 
      WHERE walletAddress = ?
    `);
    
    const result = stmt.run(newBalance, walletAddress);
    
    if (result.changes === 0) {
      throw new Error(`No broker found for wallet: ${walletAddress}`);
    }
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`💰 Updated balance for ${walletAddress}: ${newBalance.toFixed(8)} OG`);
    }
  }

  addToBalance(walletAddress: string, amount: number): number {
    const broker = this.getBroker(walletAddress);
    if (!broker) {
      throw new Error(`No broker found for wallet: ${walletAddress}`);
    }
    
    const newBalance = broker.balance + amount;
    this.updateBalance(walletAddress, newBalance);
    
    return newBalance;
  }

  subtractFromBalance(walletAddress: string, amount: number): number {
    const broker = this.getBroker(walletAddress);
    if (!broker) {
      throw new Error(`No broker found for wallet: ${walletAddress}`);
    }
    
    if (broker.balance < amount) {
      throw new Error(`Insufficient balance. Required: ${amount}, Available: ${broker.balance}`);
    }
    
    const newBalance = broker.balance - amount;
    this.updateBalance(walletAddress, newBalance);
    
    return newBalance;
  }

  // Transaction Management
  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const stmt = this.db.prepare(`
      INSERT INTO transactions (walletAddress, type, amount, description, txHash, createdAt) 
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(
      transaction.walletAddress,
      transaction.type,
      transaction.amount,
      transaction.description,
      transaction.txHash || null
    );
    
    const newTransaction: Transaction = {
      id: result.lastInsertRowid as number,
      ...transaction,
      createdAt: new Date().toISOString()
    };
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`📝 Added transaction: ${transaction.type} ${transaction.amount.toFixed(8)} OG for ${transaction.walletAddress}`);
    }
    
    return newTransaction;
  }

  getTransactions(walletAddress: string, limit: number = 10): Transaction[] {
    const stmt = this.db.prepare(`
      SELECT * FROM transactions 
      WHERE walletAddress = ? 
      ORDER BY createdAt DESC 
      LIMIT ?
    `);
    
    return stmt.all(walletAddress, limit) as Transaction[];
  }

  // Statistics
  getTotalBrokers(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM user_brokers`);
    return (stmt.get() as any).count;
  }

  getTotalBalance(): number {
    const stmt = this.db.prepare(`SELECT SUM(balance) as total FROM user_brokers`);
    const result = stmt.get() as any;
    return result.total || 0;
  }

  // Cleanup
  close(): void {
    this.db.close();
  }
}

export default new DatabaseService(); 