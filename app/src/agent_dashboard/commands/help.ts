import { Command, TerminalLine } from './types';

// Helper function to format help output with enhanced colors
export function formatHelpOutput(): TerminalLine[] {
  const timestamp = Date.now();
  
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
      content: '  agent-info - Display core agent information in cyberpunk style',
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
      type: 'help-command',
      content: '  month-learn - Process monthly consolidation of dreams and conversations',
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