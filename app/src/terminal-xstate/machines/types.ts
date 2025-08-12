import { ReactNode } from 'react';

// Terminal line types matching the old terminal
export type LineType = 
  | 'input'
  | 'output'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'system'
  | 'help-command'
  | 'info-labeled';

export interface TerminalLine {
  type: LineType;
  content: string | ReactNode;
  timestamp: number;
}

// Context for the terminal machine
export interface TerminalContext {
  lines: TerminalLine[];
  welcomeLines: TerminalLine[];
  currentInput: string;
  commandHistory: string[];
  historyIndex: number;
  isInitialized: boolean;
}

// Events the terminal can receive
export type TerminalEvent =
  | { type: 'INPUT.CHANGE'; value: string }
  | { type: 'INPUT.SUBMIT' }
  | { type: 'HISTORY.UP' }
  | { type: 'HISTORY.DOWN' }
  | { type: 'CLEAR' }
  | { type: 'INITIALIZE' };