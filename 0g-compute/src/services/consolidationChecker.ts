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
   * @param intervalMinutes - Check interval in minutes (default: 60)
   */
  public startChecker(intervalMinutes: number = 60): void {
    if (this.isRunning) {
      if (process.env.TEST_ENV === 'true') {
        console.log('⚠️  Consolidation checker is already running');
      }
      return;
    }

    this.isRunning = true;
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Run initial check
    this.performConsolidationCheck();
    
    // Set up recurring checks
    this.intervalId = setInterval(() => {
      this.performConsolidationCheck();
    }, intervalMs);

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
   */
  public async performConsolidationCheck(): Promise<ConsolidationCheck[]> {
    const results: ConsolidationCheck[] = [];
    
    try {
      const brokers = DatabaseService.getAllBrokersForConsolidationCheck();
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const currentYear = String(currentDate.getFullYear());

      if (process.env.TEST_ENV === 'true') {
        console.log(`🔍 Checking consolidation for ${brokers.length} brokers (current: ${currentMonth}, year: ${currentYear})`);
      }

      for (const broker of brokers) {
        const consolidationDate = new Date(broker.consolidation_date);
        const consolidationMonth = `${consolidationDate.getFullYear()}-${String(consolidationDate.getMonth() + 1).padStart(2, '0')}`;
        const consolidationYear = String(consolidationDate.getFullYear());

        const needsMonthLearning = consolidationMonth !== currentMonth && broker.month_learn === 'noneed';
        const needsYearLearning = consolidationYear !== currentYear && broker.year_learn === 'noneed';

        if (needsMonthLearning || needsYearLearning) {
          const monthStatus = needsMonthLearning ? 'need' : undefined;
          const yearStatus = needsYearLearning ? 'need' : undefined;

          DatabaseService.updateConsolidationStatus(
            broker.walletAddress, 
            monthStatus, 
            yearStatus
          );

          if (process.env.TEST_ENV === 'true') {
            console.log(`📅 Updated consolidation for ${broker.walletAddress}: month=${monthStatus || broker.month_learn}, year=${yearStatus || broker.year_learn}`);
          }
        }

        results.push({
          walletAddress: broker.walletAddress,
          needsMonthLearning,
          needsYearLearning,
          currentMonth,
          currentYear,
          consolidationMonth,
          consolidationYear
        });
      }

      if (process.env.TEST_ENV === 'true') {
        const monthUpdates = results.filter(r => r.needsMonthLearning).length;
        const yearUpdates = results.filter(r => r.needsYearLearning).length;
        console.log(`✅ Consolidation check completed: ${monthUpdates} month updates, ${yearUpdates} year updates`);
      }

      return results;
    } catch (error) {
      if (process.env.TEST_ENV === 'true') {
        console.error('❌ Error during consolidation check:', error);
      }
      throw error;
    }
  }

  /**
   * Get checker status
   */
  public getStatus(): { isRunning: boolean; intervalId: number | null } {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId ? Number(this.intervalId) : null
    };
  }

  /**
   * Reset a broker's consolidation date (useful for testing or manual reset)
   */
  public resetBrokerConsolidationDate(walletAddress: string): void {
    try {
      DatabaseService.updateConsolidationStatus(walletAddress, 'noneed', 'noneed');
      
      // Update consolidation_date to current date
      const stmt = DatabaseService['db'].prepare(`
        UPDATE user_brokers 
        SET consolidation_date = datetime('now'), updatedAt = datetime('now') 
        WHERE walletAddress = ?
      `);
      stmt.run(walletAddress);

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