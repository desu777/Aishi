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
      content: '  mint       - Mint a new AI dream agent',
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