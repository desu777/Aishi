import { Command, TerminalLine } from './types';

// Helper function to format help output with enhanced colors
export function formatHelpOutput(): TerminalLine[] {
  const timestamp = Date.now();
  const isTestMode = process.env.NEXT_PUBLIC_DREAM_TEST === 'true';
  
  return [
    {
      type: 'info',
      content: 'Available commands:',
      timestamp
    },
    {
      type: 'system',
      content: '',
      timestamp
    },
    {
      type: 'help-command',
      content: '  mint <name> - Mint a new AI dream agent',
      timestamp
    },
    {
      type: 'help-command', 
      content: '  info       - Display comprehensive agent information',
      timestamp
    },
    {
      type: 'help-command',
      content: '  stats      - Display comprehensive agent statistics',
      timestamp
    },
    {
      type: 'help-command',
      content: '  status     - Display system health and connectivity status',
      timestamp
    },
    {
      type: 'help-command',
      content: '  memory     - Display memory system information and status',
      timestamp
    },
    {
      type: 'help-command',
      content: '  dream      - Analyze your dream with AI (interactive mode)',
      timestamp
    },
    {
      type: 'help-command',
      content: '  chat       - Start a conversation with your AI agent',
      timestamp
    },
    {
      type: 'system',
      content: '',
      timestamp
    },
    {
      type: 'info',
      content: 'Consolidation commands:',
      timestamp
    },
    {
      type: 'help-command',
      content: '  consolidate         - Trigger monthly consolidation (dreams + conversations)',
      timestamp
    },
    {
      type: 'help-command',
      content: '  memory-core         - Create yearly memory core (+5 INT bonus)',
      timestamp
    },
    {
      type: 'help-command',
      content: '  consolidation-status - Check consolidation needs and availability',
      timestamp
    },
    {
      type: 'system',
      content: '',
      timestamp
    },
    {
      type: 'info',
      content: '0G Compute broker commands:',
      timestamp
    },
    {
      type: 'help-command',
      content: '  create-broker - Create a new 0G compute broker',
      timestamp
    },
    {
      type: 'help-command',
      content: '  check-balance - Check broker balance and transactions',
      timestamp
    },
    {
      type: 'help-command',
      content: '  fund-broker <amount> - Fund broker with specified amount',
      timestamp
    },
    {
      type: 'system',
      content: '',
      timestamp
    },
    ...(isTestMode ? [
      {
        type: 'info' as const,
        content: 'Test commands (DEBUG MODE):',
        timestamp
      },
      {
        type: 'help-command' as const,
        content: '  test-mock-monthly   - Generate monthly mock data for testing',
        timestamp
      },
      {
        type: 'help-command' as const,
        content: '  test-mock-yearly    - Generate yearly mock data for testing',
        timestamp
      },
      {
        type: 'help-command' as const,
        content: '  test-consolidation  - Test monthly consolidation with mock data',
        timestamp
      },
      {
        type: 'help-command' as const,
        content: '  test-memory-core    - Test yearly memory core with mock data',
        timestamp
      },
      {
        type: 'help-command' as const,
        content: '  reset-test          - Reset test mode state',
        timestamp
      },
      {
        type: 'system' as const,
        content: '',
        timestamp
      }
    ] : []),
    {
      type: 'info',
      content: 'System commands:',
      timestamp
    },
    {
      type: 'help-command',
      content: '  help       - Show this help message',
      timestamp
    },
    {
      type: 'help-command',
      content: '  clear      - Clear the terminal screen',
      timestamp
    },
    {
      type: 'system',
      content: '',
      timestamp
    },
    {
      type: 'system',
      content: 'Usage: <command> [arguments]',
      timestamp
    }
  ];
}