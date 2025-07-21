import { Command, CommandResult } from './types';

// Check consolidation availability
const checkConsolidationAvailability = async (walletAddress: string): Promise<{
  canUseMonthLearn: boolean;
  canUseYearLearn: boolean;
  error?: string;
}> => {
  const isMonthTestMode = process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true';
  const isYearTestMode = process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true';
  
  // In test mode, always allow commands
  if (isMonthTestMode && isYearTestMode) {
    return { canUseMonthLearn: true, canUseYearLearn: true };
  }
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_URL}/consolidation/${walletAddress}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Broker not found - allow in test mode only
        return { 
          canUseMonthLearn: isMonthTestMode, 
          canUseYearLearn: isYearTestMode,
          error: response.status === 404 ? 'No consolidation data available. Use test mode or ensure your broker exists.' : undefined
        };
      }
      throw new Error('Failed to check consolidation status');
    }
    
    const data = await response.json();
    if (data.success && data.data) {
      return {
        canUseMonthLearn: isMonthTestMode || data.data.month_learn === 'need',
        canUseYearLearn: isYearTestMode || data.data.year_learn === 'need'
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error: any) {
    return { 
      canUseMonthLearn: isMonthTestMode, 
      canUseYearLearn: isYearTestMode,
      error: error.message || 'Failed to check consolidation status'
    };
  }
};

export const yearLearnCommand: Command = {
  name: 'year-learn',
  description: 'Process yearly consolidation of dreams and conversations into memory core',
  usage: 'year-learn',
  handler: async (args, context) => {
    // Sprawdzenie czy agent istnieje
    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    // Check if year-learn is available
    const availability = await checkConsolidationAvailability(context.currentUser);
    
    if (!availability.canUseYearLearn) {
      const isTestMode = process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true';
      const testModeInfo = isTestMode ? '' : ' Use NEXT_PUBLIC_YEAR_LEARN_TEST=true for testing.';
      
      return {
        success: false,
        output: `Yearly consolidation not available.${testModeInfo}${availability.error ? ` Error: ${availability.error}` : ''}`,
        type: 'error'
      };
    }

    // Komenda year-learn przełącza terminal w tryb year learn workflow
    return {
      success: true,
      output: 'YEAR_LEARN_MODE',
      type: 'info'
    };
  }
};