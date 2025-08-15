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
  brokerRef: any; // ActorRef from XState
  modelRef: any; // ActorRef from XState
  agentRef: any; // ActorRef from XState for agent synchronization
  dreamRef: any; // ActorRef from XState for dream workflow
  selectedModel: string | null;
  // Dream workflow state
  isDreamActive: boolean;
  dreamStatus: string | null;
  // Last parsed command for state transitions
  lastParsedCommand: string | null;
}

// Events the terminal can receive
export type TerminalEvent =
  | { type: 'INPUT.CHANGE'; value: string }
  | { type: 'INPUT.SUBMIT' }
  | { type: 'HISTORY.UP' }
  | { type: 'HISTORY.DOWN' }
  | { type: 'CLEAR' }
  | { type: 'INITIALIZE' }
  | { type: 'UPDATE_MODEL'; modelId: string }
  | { type: 'INITIALIZE_BROKER'; walletAddress: string }
  | { type: 'SYNC_AGENT'; walletAddress: string; provider: any }
  | { type: 'APPEND_LINES'; lines: TerminalLine[] }
  | { type: 'UPDATE_STATUS'; status: string }
  | { type: 'DREAM.COMPLETE' };