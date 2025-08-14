/**
 * @fileoverview Automated consolidation status checker for virtual brokers
 * @description Periodically checks and updates consolidation status for all brokers.
 * Tracks monthly and yearly learning requirements based on consolidation dates.
 */

import DatabaseService from '../database/database';

interface ConsolidationCheck {
  walletAddress: string;
  needsMonthLearning: boolean;
  needsYearLearning: boolean;
  currentMonth: string;
  currentYear: string;
  consolidationMonth: string;
  consolidationYear: string;
}

class ConsolidationCheckerService {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Start the consolidation checker with specified interval
   * @param {number} intervalMinutes - Check interval in minutes (default: 60)
   */
  public startChecker(intervalMinutes: number = 60): void {
    if (this.isRunning) {
      if (process.env.TEST_ENV === 'true') {
        console.log('⚠️  Consolidation checker is already running');
      }
      return;
    }

    this.isRunning = true;
    const intervalMilliseconds = intervalMinutes * 60 * 1000;
    
    this.performConsolidationCheck();
    
    this.intervalId = setInterval(() => {
      this.performConsolidationCheck();
    }, intervalMilliseconds);

    if (process.env.TEST_ENV === 'true') {
      console.log(`📅 Consolidation checker started (interval: ${intervalMinutes} minutes)`);
    }
  }

  /**
   * Stop the consolidation checker
   */
  public stopChecker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;

    if (process.env.TEST_ENV === 'true') {
      console.log('🛑 Consolidation checker stopped');
    }
  }

  /**
   * Manually trigger consolidation check
   * @returns {Promise<ConsolidationCheck[]>} Array of consolidation check results
   */
  public async performConsolidationCheck(): Promise<ConsolidationCheck[]> {
    const consolidationResults: ConsolidationCheck[] = [];
    
    try {
      const allBrokers = DatabaseService.getAllBrokersForConsolidationCheck();
      const currentDate = new Date();
      const currentMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const currentYearString = String(currentDate.getFullYear());

      if (process.env.TEST_ENV === 'true') {
        console.log(`🔍 Checking consolidation for ${allBrokers.length} brokers (current: ${currentMonthString}, year: ${currentYearString}`);
      }

      for (const brokerRecord of allBrokers) {
        const brokerConsolidationDate = new Date(brokerRecord.consolidation_date);
        const brokerConsolidationMonth = `${brokerConsolidationDate.getFullYear()}-${String(brokerConsolidationDate.getMonth() + 1).padStart(2, '0')}`;
        const brokerConsolidationYear = String(brokerConsolidationDate.getFullYear());

        const requiresMonthlyUpdate = brokerConsolidationMonth !== currentMonthString && brokerRecord.month_learn === 'noneed';
        const requiresYearlyUpdate = brokerConsolidationYear !== currentYearString && brokerRecord.year_learn === 'noneed';

        if (requiresMonthlyUpdate || requiresYearlyUpdate) {
          const monthlyStatus = requiresMonthlyUpdate ? 'need' : undefined;
          const yearlyStatus = requiresYearlyUpdate ? 'need' : undefined;

          DatabaseService.updateConsolidationStatus(
            brokerRecord.walletAddress, 
            monthlyStatus, 
            yearlyStatus
          );

          if (process.env.TEST_ENV === 'true') {
            console.log(`📅 Updated consolidation for ${brokerRecord.walletAddress}: month=${monthlyStatus || brokerRecord.month_learn}, year=${yearlyStatus || brokerRecord.year_learn}`);
          }
        }

        consolidationResults.push({
          walletAddress: brokerRecord.walletAddress,
          needsMonthLearning: requiresMonthlyUpdate,
          needsYearLearning: requiresYearlyUpdate,
          currentMonth: currentMonthString,
          currentYear: currentYearString,
          consolidationMonth: brokerConsolidationMonth,
          consolidationYear: brokerConsolidationYear
        });
      }

      if (process.env.TEST_ENV === 'true') {
        const monthlyUpdateCount = consolidationResults.filter(result => result.needsMonthLearning).length;
        const yearlyUpdateCount = consolidationResults.filter(result => result.needsYearLearning).length;
        console.log(`✅ Consolidation check completed: ${monthlyUpdateCount} month updates, ${yearlyUpdateCount} year updates`);
      }

      return consolidationResults;
    } catch (error) {
      if (process.env.TEST_ENV === 'true') {
        console.error('❌ Error during consolidation check:', error);
      }
      throw error;
    }
  }

  /**
   * Get checker status
   * @returns {Object} Status object with running state and interval ID
   */
  public getStatus(): { isRunning: boolean; intervalId: number | null } {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId ? Number(this.intervalId) : null
    };
  }

  /**
   * Reset a broker's consolidation date (useful for testing or manual reset)
   * @param {string} walletAddress - Wallet address to reset
   */
  public resetBrokerConsolidationDate(walletAddress: string): void {
    try {
      DatabaseService.updateConsolidationStatus(walletAddress, 'noneed', 'noneed');
      
      /* Direct database access for consolidation date update */
      const updateStatement = DatabaseService['db'].prepare(`
        UPDATE user_brokers 
        SET consolidation_date = datetime('now'), updatedAt = datetime('now') 
        WHERE walletAddress = ?
      `);
      updateStatement.run(walletAddress);

      if (process.env.TEST_ENV === 'true') {
        console.log(`🔄 Reset consolidation date for ${walletAddress}`);
      }
    } catch (error) {
      if (process.env.TEST_ENV === 'true') {
        console.error(`❌ Error resetting consolidation for ${walletAddress}:`, error);
      }
      throw error;
    }
  }
}

export default new ConsolidationCheckerService(); 