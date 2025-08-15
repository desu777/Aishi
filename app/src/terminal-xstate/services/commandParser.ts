/**
 * @fileoverview Command Parser for XState Terminal
 * @description Parses and validates terminal commands for the aishiOS system
 */

export interface ParsedCommand {
  command: string;
  args: string[];
  rawInput: string;
  isValid: boolean;
  error?: string;
}

export type CommandType = 
  | 'dream'
  | 'info'
  | 'stats'
  | 'mint'
  | 'memory'
  | 'personality'
  | 'chat'
  | 'help'
  | 'clear'
  | 'status'
  | 'broker'
  | 'model'
  | 'unknown';

// Available commands with descriptions
export const AVAILABLE_COMMANDS: Record<CommandType, string> = {
  dream: 'Process and analyze a dream with your agent',
  info: 'Display agent information and traits',
  stats: 'Show agent statistics and progress',
  mint: 'Create a new AI agent NFT',
  memory: 'Access agent memory and consolidation tools',
  personality: 'View agent personality matrix',
  chat: 'Start a conversation with your agent',
  help: 'Show available commands',
  clear: 'Clear terminal screen',
  status: 'Show system and agent status',
  broker: 'Manage broker operations',
  model: 'Select AI model for processing',
  unknown: 'Unknown command'
};

// Command aliases for user convenience
const COMMAND_ALIASES: Record<string, CommandType> = {
  'd': 'dream',
  'i': 'info',
  's': 'stats',
  'm': 'mint',
  'mem': 'memory',
  'p': 'personality',
  'c': 'chat',
  'h': 'help',
  'cls': 'clear',
  '?': 'help'
};

/**
 * Parses raw input into a structured command
 */
export function parseCommand(input: string): ParsedCommand {
  const trimmedInput = input.trim();
  
  // Empty input
  if (!trimmedInput) {
    return {
      command: '',
      args: [],
      rawInput: input,
      isValid: false,
      error: 'Empty command'
    };
  }

  // Split into command and arguments
  const parts = trimmedInput.split(/\s+/);
  const commandStr = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Check if it's a direct command or alias
  let commandType: CommandType = 'unknown';
  
  if (commandStr in AVAILABLE_COMMANDS) {
    commandType = commandStr as CommandType;
  } else if (commandStr in COMMAND_ALIASES) {
    commandType = COMMAND_ALIASES[commandStr];
  }

  // Validate command
  const isValid = commandType !== 'unknown';

  return {
    command: commandType,
    args,
    rawInput: input,
    isValid,
    error: isValid ? undefined : `Unknown command: ${commandStr}. Type 'help' for available commands.`
  };
}

/**
 * Validates command arguments based on command type
 */
export function validateCommandArgs(command: CommandType, args: string[]): { valid: boolean; error?: string } {
  switch (command) {
    case 'mint':
      if (args.length === 0) {
        return { valid: false, error: 'Agent name required. Usage: mint <name>' };
      }
      if (args[0].length > 32) {
        return { valid: false, error: 'Agent name too long (max 32 characters)' };
      }
      return { valid: true };

    case 'info':
    case 'stats':
    case 'memory':
    case 'personality':
    case 'status':
      // Optional agent ID argument
      if (args.length > 1) {
        return { valid: false, error: 'Too many arguments. Usage: ' + command + ' [agentId]' };
      }
      return { valid: true };

    case 'dream':
      // No arguments needed - will wait for dream input
      if (args.length > 0) {
        return { valid: false, error: 'Dream command takes no arguments. Just type "dream" and press Enter.' };
      }
      return { valid: true };

    case 'chat':
      // Optional message to start chat
      return { valid: true };

    case 'model':
      // Model selection argument
      if (args.length === 0) {
        return { valid: false, error: 'Model ID required. Usage: model <modelId>' };
      }
      return { valid: true };

    case 'broker':
      // Broker subcommands
      if (args.length === 0) {
        return { valid: false, error: 'Broker action required. Usage: broker <fund|status|withdraw>' };
      }
      const brokerActions = ['fund', 'status', 'withdraw'];
      if (!brokerActions.includes(args[0])) {
        return { valid: false, error: `Invalid broker action. Available: ${brokerActions.join(', ')}` };
      }
      return { valid: true };

    case 'help':
    case 'clear':
      // No arguments needed
      if (args.length > 0) {
        return { valid: false, error: `Command '${command}' takes no arguments` };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

/**
 * Gets help text for a specific command
 */
export function getCommandHelp(command: CommandType): string {
  const description = AVAILABLE_COMMANDS[command];
  
  switch (command) {
    case 'mint':
      return `${description}\nUsage: mint <name>\nExample: mint Aurora`;
    case 'info':
      return `${description}\nUsage: info [agentId]\nExample: info or info 123`;
    case 'dream':
      return `${description}\nUsage: dream\nThen describe your dream when prompted`;
    case 'chat':
      return `${description}\nUsage: chat [initial message]\nExample: chat Hello!`;
    case 'broker':
      return `${description}\nUsage: broker <fund|status|withdraw>\nExample: broker fund`;
    case 'model':
      return `${description}\nUsage: model <modelId>\nExample: model gpt-4`;
    default:
      return description;
  }
}

/**
 * Formats help output for all commands
 */
export function formatHelpOutput(): string[] {
  const lines: string[] = [
    '╔════════════════════════════════════════════════════╗',
    '║             aishiOS Terminal Commands              ║',
    '╚════════════════════════════════════════════════════╝',
    '',
    'Available commands:',
    ''
  ];

  // Group commands by category
  const categories = {
    'Agent Operations': ['mint', 'info', 'stats', 'personality', 'memory'],
    'Interactions': ['dream', 'chat'],
    'System': ['broker', 'model', 'status'],
    'Terminal': ['help', 'clear']
  };

  for (const [category, commands] of Object.entries(categories)) {
    lines.push(`[${category}]`);
    for (const cmd of commands) {
      const description = AVAILABLE_COMMANDS[cmd as CommandType];
      const aliases = Object.entries(COMMAND_ALIASES)
        .filter(([_, value]) => value === cmd)
        .map(([key]) => key);
      
      const aliasText = aliases.length > 0 ? ` (${aliases.join(', ')})` : '';
      lines.push(`  ${cmd}${aliasText} - ${description}`);
    }
    lines.push('');
  }

  lines.push('Type "<command> -h" for detailed help on a specific command');
  
  return lines;
}

/**
 * Checks if input is requesting help for a command
 */
export function isHelpRequest(input: string): { isHelp: boolean; command?: CommandType } {
  const parts = input.trim().split(/\s+/);
  
  if (parts.length === 2 && (parts[1] === '-h' || parts[1] === '--help')) {
    const cmd = parseCommand(parts[0]);
    if (cmd.isValid) {
      return { isHelp: true, command: cmd.command as CommandType };
    }
  }
  
  return { isHelp: false };
}

/**
 * Suggests commands based on partial input (for autocomplete)
 */
export function suggestCommands(partialInput: string): CommandType[] {
  if (!partialInput) return [];
  
  const lower = partialInput.toLowerCase();
  const suggestions: CommandType[] = [];
  
  // Check direct commands
  for (const cmd of Object.keys(AVAILABLE_COMMANDS)) {
    if (cmd !== 'unknown' && cmd.startsWith(lower)) {
      suggestions.push(cmd as CommandType);
    }
  }
  
  // Check aliases
  for (const [alias, cmd] of Object.entries(COMMAND_ALIASES)) {
    if (alias.startsWith(lower) && !suggestions.includes(cmd)) {
      suggestions.push(cmd);
    }
  }
  
  return suggestions;
}