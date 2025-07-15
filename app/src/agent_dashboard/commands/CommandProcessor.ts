import { Command, CommandResult, CommandContext, TerminalLine } from './types';
import { mintCommand } from './mint';

export class CommandProcessor {
  private commands: Map<string, Command> = new Map();
  private pendingConfirmation: {
    onConfirm: () => Promise<CommandResult>;
    onCancel: () => CommandResult;
  } | null = null;

  constructor() {
    this.registerCommand(mintCommand);
  }

  private registerCommand(command: Command) {
    this.commands.set(command.name, command);
  }

  async executeCommand(
    input: string, 
    context: CommandContext
  ): Promise<CommandResult> {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      return {
        success: false,
        output: '',
        type: 'info'
      };
    }

    // Handle confirmation responses
    if (this.pendingConfirmation) {
      if (trimmedInput.toLowerCase() === 'yes' || trimmedInput.toLowerCase() === 'y') {
        const confirmation = this.pendingConfirmation;
        this.pendingConfirmation = null;
        return await confirmation.onConfirm();
      } else if (trimmedInput.toLowerCase() === 'no' || trimmedInput.toLowerCase() === 'n') {
        const confirmation = this.pendingConfirmation;
        this.pendingConfirmation = null;
        return confirmation.onCancel();
      } else {
        return {
          success: false,
          output: 'Please answer yes/no (y/n)',
          type: 'warning'
        };
      }
    }

    // Handle clear command specially
    if (trimmedInput.toLowerCase() === 'clear') {
      return {
        success: true,
        output: '__CLEAR__', // Special marker for terminal to clear
        type: 'system'
      };
    }

    // Parse command and arguments
    const parts = trimmedInput.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.commands.get(commandName);
    
    if (!command) {
      return {
        success: false,
        output: `Command '${commandName}' not found. Type 'help' for available commands.`,
        type: 'error'
      };
    }

    try {
      const result = await command.handler(args, context);
      
      // Handle confirmation requirement
      if (result.requiresConfirmation && result.onConfirm && result.onCancel) {
        this.pendingConfirmation = {
          onConfirm: result.onConfirm,
          onCancel: result.onCancel
        };
      }
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        output: `Error executing command: ${error.message || error}`,
        type: 'error'
      };
    }
  }

  getAvailableCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  hasPendingConfirmation(): boolean {
    return this.pendingConfirmation !== null;
  }
}