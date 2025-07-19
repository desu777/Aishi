import { Command, CommandResult } from './types';

// Test commands - only available when NEXT_PUBLIC_DREAM_TEST=true
const isTestMode = process.env.NEXT_PUBLIC_DREAM_TEST === 'true';

export const testMockMonthlyCommand: Command = {
  name: 'test-mock-monthly',
  description: 'Generate monthly mock data for testing',
  usage: 'test-mock-monthly',
  hidden: !isTestMode,
  handler: async (args, context) => {
    if (!isTestMode) {
      return {
        success: false,
        output: 'Test commands are not available in production mode.',
        type: 'error'
      };
    }

    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    if (!context.effectiveTokenId) {
      return {
        success: false,
        output: 'No agent found. Please mint an agent first using: mint <name>',
        type: 'error'
      };
    }

    return {
      success: true,
      output: 'TEST_MOCK_MONTHLY_MODE',
      type: 'info'
    };
  }
};

export const testMockYearlyCommand: Command = {
  name: 'test-mock-yearly',
  description: 'Generate yearly mock data for testing',
  usage: 'test-mock-yearly',
  hidden: !isTestMode,
  handler: async (args, context) => {
    if (!isTestMode) {
      return {
        success: false,
        output: 'Test commands are not available in production mode.',
        type: 'error'
      };
    }

    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    if (!context.effectiveTokenId) {
      return {
        success: false,
        output: 'No agent found. Please mint an agent first using: mint <name>',
        type: 'error'
      };
    }

    return {
      success: true,
      output: 'TEST_MOCK_YEARLY_MODE',
      type: 'info'
    };
  }
};

export const testConsolidationCommand: Command = {
  name: 'test-consolidation',
  description: 'Test monthly consolidation with mock data',
  usage: 'test-consolidation',
  hidden: !isTestMode,
  handler: async (args, context) => {
    if (!isTestMode) {
      return {
        success: false,
        output: 'Test commands are not available in production mode.',
        type: 'error'
      };
    }

    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    if (!context.effectiveTokenId) {
      return {
        success: false,
        output: 'No agent found. Please mint an agent first using: mint <name>',
        type: 'error'
      };
    }

    return {
      success: true,
      output: 'TEST_CONSOLIDATION_MODE',
      type: 'info'
    };
  }
};

export const testMemoryCoreCommand: Command = {
  name: 'test-memory-core',
  description: 'Test yearly memory core with mock data',
  usage: 'test-memory-core',
  hidden: !isTestMode,
  handler: async (args, context) => {
    if (!isTestMode) {
      return {
        success: false,
        output: 'Test commands are not available in production mode.',
        type: 'error'
      };
    }

    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    if (!context.effectiveTokenId) {
      return {
        success: false,
        output: 'No agent found. Please mint an agent first using: mint <name>',
        type: 'error'
      };
    }

    return {
      success: true,
      output: 'TEST_MEMORY_CORE_MODE',
      type: 'info'
    };
  }
};

export const resetTestCommand: Command = {
  name: 'reset-test',
  description: 'Reset test mode state',
  usage: 'reset-test',
  hidden: !isTestMode,
  handler: async (args, context) => {
    if (!isTestMode) {
      return {
        success: false,
        output: 'Test commands are not available in production mode.',
        type: 'error'
      };
    }

    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    if (!context.effectiveTokenId) {
      return {
        success: false,
        output: 'No agent found. Please mint an agent first using: mint <name>',
        type: 'error'
      };
    }

    return {
      success: true,
      output: 'RESET_TEST_MODE',
      type: 'info'
    };
  }
};