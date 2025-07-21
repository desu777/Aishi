import { useState, useRef } from 'react';
import { TerminalLine } from '../../commands/types';
import { CommandProcessor } from '../../commands/CommandProcessor';

export interface TerminalState {
  // Terminal display state
  lines: TerminalLine[];
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  welcomeLines: TerminalLine[];
  setWelcomeLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  
  // Input state
  currentInput: string;
  setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
  commandHistory: string[];
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
  historyIndex: number;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  isValidCommand: boolean;
  setIsValidCommand: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSystemLoading: boolean;
  setIsSystemLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isInitialized: boolean;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Mint state
  pendingMintName: string | null;
  setPendingMintName: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Dream workflow state
  dreamInputMode: boolean;
  setDreamInputMode: React.Dispatch<React.SetStateAction<boolean>>;
  dreamInputText: string;
  setDreamInputText: React.Dispatch<React.SetStateAction<string>>;
  processingDream: boolean;
  setProcessingDream: React.Dispatch<React.SetStateAction<boolean>>;
  pendingDreamSave: any;
  setPendingDreamSave: React.Dispatch<React.SetStateAction<any>>;
  thinkingTimer: number;
  setThinkingTimer: React.Dispatch<React.SetStateAction<number>>;
  savingDream: boolean;
  setSavingDream: React.Dispatch<React.SetStateAction<boolean>>;
  evolvingDream: boolean;
  setEvolvingDream: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Chat workflow state
  chatInputMode: boolean;
  setChatInputMode: React.Dispatch<React.SetStateAction<boolean>>;
  waitingForChatConfirm: boolean;
  setWaitingForChatConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  chatSession: any;
  setChatSession: React.Dispatch<React.SetStateAction<any>>;
  chatMessages: any[];
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  isInitializingChat: boolean;
  setIsInitializingChat: React.Dispatch<React.SetStateAction<boolean>>;
  isSendingMessage: boolean;
  setIsSendingMessage: React.Dispatch<React.SetStateAction<boolean>>;
  waitingForTrainConfirm: boolean;
  setWaitingForTrainConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  isSavingConversation: boolean;
  setIsSavingConversation: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Month learn workflow state
  monthLearnMode: boolean;
  setMonthLearnMode: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessingMonthLearn: boolean;
  setIsProcessingMonthLearn: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Year learn workflow state
  yearLearnMode: boolean;
  setYearLearnMode: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessingYearLearn: boolean;
  setIsProcessingYearLearn: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Animation state
  dotsPattern: number;
  setDotsPattern: React.Dispatch<React.SetStateAction<number>>;
  thinkingMessageId: number | null;
  setThinkingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  learningMessageId: number | null;
  setLearningMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  evolutionMessageId: number | null;
  setEvolutionMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  
  // Mobile state
  isMobile: boolean;
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Refs
  inputRef: React.RefObject<HTMLInputElement>;
  terminalRef: React.RefObject<HTMLDivElement>;
  commandProcessorRef: React.MutableRefObject<CommandProcessor>;
  dotsTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  
  // Helper functions
  addLine: (line: TerminalLine) => void;
}

export const useTerminalState = (): TerminalState => {
  // Terminal display state
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [welcomeLines, setWelcomeLines] = useState<TerminalLine[]>([]);
  
  // Input state
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isValidCommand, setIsValidCommand] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSystemLoading, setIsSystemLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Mint state
  const [pendingMintName, setPendingMintName] = useState<string | null>(null);
  
  // Dream workflow state
  const [dreamInputMode, setDreamInputMode] = useState(false);
  const [dreamInputText, setDreamInputText] = useState('');
  const [processingDream, setProcessingDream] = useState(false);
  const [pendingDreamSave, setPendingDreamSave] = useState<any>(null);
  const [thinkingTimer, setThinkingTimer] = useState(0);
  const [savingDream, setSavingDream] = useState(false);
  const [evolvingDream, setEvolvingDream] = useState(false);
  
  // Chat workflow state
  const [chatInputMode, setChatInputMode] = useState(false);
  const [waitingForChatConfirm, setWaitingForChatConfirm] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isInitializingChat, setIsInitializingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [waitingForTrainConfirm, setWaitingForTrainConfirm] = useState(false);
  const [isSavingConversation, setIsSavingConversation] = useState(false);
  
  // Month learn workflow state
  const [monthLearnMode, setMonthLearnMode] = useState(false);
  const [isProcessingMonthLearn, setIsProcessingMonthLearn] = useState(false);
  
  // Year learn workflow state
  const [yearLearnMode, setYearLearnMode] = useState(false);
  const [isProcessingYearLearn, setIsProcessingYearLearn] = useState(false);
  
  // Animation state
  const [dotsPattern, setDotsPattern] = useState(0); // 0='.', 1='..', 2='...', 3=''
  const [thinkingMessageId, setThinkingMessageId] = useState<number | null>(null);
  const [learningMessageId, setLearningMessageId] = useState<number | null>(null);
  const [evolutionMessageId, setEvolutionMessageId] = useState<number | null>(null);
  
  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandProcessorRef = useRef(new CommandProcessor());
  const dotsTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper functions
  const addLine = (line: TerminalLine) => {
    setLines(prev => [...prev, line]);
  };
  
  return {
    // Terminal display state
    lines,
    setLines,
    welcomeLines,
    setWelcomeLines,
    
    // Input state
    currentInput,
    setCurrentInput,
    commandHistory,
    setCommandHistory,
    historyIndex,
    setHistoryIndex,
    isValidCommand,
    setIsValidCommand,
    
    // Loading states
    isLoading,
    setIsLoading,
    isSystemLoading,
    setIsSystemLoading,
    isInitialized,
    setIsInitialized,
    
    // Mint state
    pendingMintName,
    setPendingMintName,
    
    // Dream workflow state
    dreamInputMode,
    setDreamInputMode,
    dreamInputText,
    setDreamInputText,
    processingDream,
    setProcessingDream,
    pendingDreamSave,
    setPendingDreamSave,
    thinkingTimer,
    setThinkingTimer,
    savingDream,
    setSavingDream,
    evolvingDream,
    setEvolvingDream,
    
    // Chat workflow state
    chatInputMode,
    setChatInputMode,
    waitingForChatConfirm,
    setWaitingForChatConfirm,
    chatSession,
    setChatSession,
    chatMessages,
    setChatMessages,
    isInitializingChat,
    setIsInitializingChat,
    isSendingMessage,
    setIsSendingMessage,
    waitingForTrainConfirm,
    setWaitingForTrainConfirm,
    isSavingConversation,
    setIsSavingConversation,
    
    // Month learn workflow state
    monthLearnMode,
    setMonthLearnMode,
    isProcessingMonthLearn,
    setIsProcessingMonthLearn,
    
    // Year learn workflow state
    yearLearnMode,
    setYearLearnMode,
    isProcessingYearLearn,
    setIsProcessingYearLearn,
    
    // Animation state
    dotsPattern,
    setDotsPattern,
    thinkingMessageId,
    setThinkingMessageId,
    learningMessageId,
    setLearningMessageId,
    evolutionMessageId,
    setEvolutionMessageId,
    
    // Mobile state
    isMobile,
    setIsMobile,
    
    // Refs
    inputRef,
    terminalRef,
    commandProcessorRef,
    dotsTimerRef,
    
    // Helper functions
    addLine
  };
};