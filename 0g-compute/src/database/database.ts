import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import '../config/envLoader';

export interface UserBroker {
  id?: number;
  walletAddress: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  consolidation_date: string;
  month_learn: 'need' | 'noneed';
  year_learn: 'need' | 'noneed';
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

  private addConsolidationColumns(): void {
    // Check if consolidation columns exist, if not add them
    try {
      const tableInfo = this.db.pragma('table_info(user_brokers)');
      const columnNames = tableInfo.map((col: any) => col.name);
      
      if (!columnNames.includes('consolidation_date')) {
        this.db.exec(`
          ALTER TABLE user_brokers 
          ADD COLUMN consolidation_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        
        if (process.env.TEST_ENV === 'true') {
          console.log('✅ Added consolidation_date column to user_brokers');
        }
      }
      
      if (!columnNames.includes('month_learn')) {
        this.db.exec(`
          ALTER TABLE user_brokers 
          ADD COLUMN month_learn TEXT NOT NULL DEFAULT 'noneed'
        `);
        
        if (process.env.TEST_ENV === 'true') {
          console.log('✅ Added month_learn column to user_brokers');
        }
      }
      
      if (!columnNames.includes('year_learn')) {
        this.db.exec(`
          ALTER TABLE user_brokers 
          ADD COLUMN year_learn TEXT NOT NULL DEFAULT 'noneed'
        `);
        
        if (process.env.TEST_ENV === 'true') {
          console.log('✅ Added year_learn column to user_brokers');
        }
      }
    } catch (error) {
      if (process.env.TEST_ENV === 'true') {
        console.error('❌ Error adding consolidation columns:', error);
      }
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
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        consolidation_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        month_learn TEXT NOT NULL DEFAULT 'noneed' CHECK (month_learn IN ('need', 'noneed')),
        year_learn TEXT NOT NULL DEFAULT 'noneed' CHECK (year_learn IN ('need', 'noneed'))
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

    // Add new columns to existing tables if they don't exist
    this.addConsolidationColumns();

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

  // Consolidation Management
  updateConsolidationStatus(walletAddress: string, monthLearn?: 'need' | 'noneed', yearLearn?: 'need' | 'noneed'): void {
    const updates: string[] = [];
    const values: any[] = [];

    if (monthLearn) {
      updates.push('month_learn = ?');
      values.push(monthLearn);
    }
    
    if (yearLearn) {
      updates.push('year_learn = ?');
      values.push(yearLearn);
    }
    
    if (updates.length === 0) return;

    updates.push('updatedAt = datetime(\'now\')');
    values.push(walletAddress);

    const stmt = this.db.prepare(`
      UPDATE user_brokers 
      SET ${updates.join(', ')} 
      WHERE walletAddress = ?
    `);
    
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      throw new Error(`No broker found for wallet: ${walletAddress}`);
    }
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`📅 Updated consolidation status for ${walletAddress}: month=${monthLearn}, year=${yearLearn}`);
    }
  }

  getConsolidationStatus(walletAddress: string): { consolidation_date: string; month_learn: string; year_learn: string } | null {
    const stmt = this.db.prepare(`
      SELECT consolidation_date, month_learn, year_learn 
      FROM user_brokers 
      WHERE walletAddress = ?
    `);
    
    return stmt.get(walletAddress) as { consolidation_date: string; month_learn: string; year_learn: string } | null;
  }

  getAllBrokersForConsolidationCheck(): Array<{ walletAddress: string; consolidation_date: string; month_learn: string; year_learn: string }> {
    const stmt = this.db.prepare(`
      SELECT walletAddress, consolidation_date, month_learn, year_learn 
      FROM user_brokers
    `);
    
    return stmt.all() as Array<{ walletAddress: string; consolidation_date: string; month_learn: string; year_learn: string }>;
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