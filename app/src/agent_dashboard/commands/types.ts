import { ReactNode } from 'react';

export interface CommandResult {
  success: boolean;
  output: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'system';
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
  onConfirm?: () => Promise<CommandResult>;
  onCancel?: () => CommandResult;
}

export interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'success' | 'error' | 'warning' | 'info' | 'help-command' | 'info-labeled';
  content: string | ReactNode;
  timestamp: number;
}

export interface CommandContext {
  addLine: (line: TerminalLine) => void;
  setLoading: (loading: boolean) => void;
  currentUser?: string;
}

export type CommandHandler = (
  args: string[], 
  context: CommandContext
) => Promise<CommandResult>;

export interface Command {
  name: string;
  description: string;
  usage: string;
  handler: CommandHandler;
}