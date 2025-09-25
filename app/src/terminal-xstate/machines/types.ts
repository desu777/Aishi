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
  | 'help-interactive'
  | 'help-header'
  | 'info-labeled'
  | 'voice-input'
  | 'voice-output';

export interface TerminalLine {
  type: LineType;
  content: string | ReactNode;
  timestamp: number;
  // Additional data for interactive help lines
  command?: string;
  hasTooltip?: boolean;
  tooltip?: string;
  // Voice message data
  audioData?: string; // Base64 encoded audio
  audioBlob?: Blob;
  duration?: number;
  transcript?: string;
  voiceId?: string;
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
  chatRef: any; // ActorRef from XState for chat workflow
  voiceRef: any; // ActorRef from XState for voice control
  selectedModel: string | null;
  // Voice state
  selectedVoice: 'aria' | 'nova' | 'atlas' | 'echo' | null;
  isVoiceEnabled: boolean;
  voiceStatus: string | null;
  isRecording: boolean;
  wasVoiceInput: boolean; // Track if current input came from voice
  // Dream workflow state
  isDreamActive: boolean;
  dreamStatus: string | null;
  // Chat workflow state
  isChatActive: boolean;
  chatStatus: string | null;
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
  | { type: 'DREAM.COMPLETE' }
  | { type: 'CHAT_COMPLETED' }
  | { type: 'END_SESSION' }
  // Voice events
  | { type: 'VOICE.TOGGLE' }
  | { type: 'VOICE.START_RECORDING' }
  | { type: 'VOICE.STOP_RECORDING' }
  | { type: 'VOICE.TRANSCRIBED'; transcript: string; language?: string }
  | { type: 'VOICE.SELECT_VOICE'; voiceId: 'aria' | 'nova' | 'atlas' | 'echo' }
  | { type: 'VOICE.SPEAK'; text: string; emotionalTone?: string }
  | { type: 'VOICE.ERROR'; message: string };