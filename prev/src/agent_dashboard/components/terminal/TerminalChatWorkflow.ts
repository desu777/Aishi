import { TerminalLine } from '../../commands/types';

export interface ChatWorkflowDependencies {
  // State setters
  setIsInitializingChat: (val: boolean) => void;
  setIsSendingMessage: (val: boolean) => void;
  setIsSavingConversation: (val: boolean) => void;
  setChatInputMode: (val: boolean) => void;
  setWaitingForChatConfirm: (val: boolean) => void;
  setWaitingForTrainConfirm: (val: boolean) => void;
  setChatSession: (val: any) => void;
  setChatMessages: (val: any[]) => void;
  
  // Functions
  addLine: (line: TerminalLine) => void;
  
  // Chat hook functions
  initializeTerminalChatSession: (agentData: any) => Promise<boolean>;
  sendTerminalMessage: (message: string) => Promise<string | null>;
  saveTerminalConversation: () => Promise<boolean>;
  resetTerminalSession: () => void;
  clearTerminalChatError: () => void;
  
  // Chat hook data
  terminalChatSession: any;
  terminalChatMessages: any[];
  terminalChatError: string | null;
  
  // Agent data
  agentData: any;
}

export const initializeChatSession = async (deps: ChatWorkflowDependencies) => {
  const {
    setIsInitializingChat, setChatInputMode, setChatSession, setChatMessages,
    addLine, initializeTerminalChatSession, terminalChatSession, terminalChatMessages,
    terminalChatError, agentData
  } = deps;

  setIsInitializingChat(true);
  
  try {
    // Use the real terminal chat hook
    const success = await initializeTerminalChatSession(agentData);
    
    if (success) {
      setChatInputMode(true);
      setChatSession(terminalChatSession);
      setChatMessages(terminalChatMessages);
      
      addLine({
        type: 'success',
        content: `Chat session initialized with ${agentData?.agentName || 'Agent'}`,
        timestamp: Date.now()
      });
    } else {
      throw new Error(terminalChatError || 'Unknown initialization error');
    }
  } catch (error) {
    addLine({
      type: 'error',
      content: `Failed to initialize chat session: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: Date.now()
    });
  } finally {
    setIsInitializingChat(false);
  }
};

export const sendChatMessage = async (message: string, deps: ChatWorkflowDependencies) => {
  const {
    terminalChatSession, setIsSendingMessage, addLine, sendTerminalMessage,
    terminalChatMessages, setChatMessages, terminalChatError, agentData
  } = deps;

  if (!terminalChatSession) return;
  
  setIsSendingMessage(true);
  
  // Add user message to terminal
  addLine({
    type: 'input',
    content: `~ ${message}`,
    timestamp: Date.now()
  });
  
  try {
    // Use the real terminal chat hook to send message
    const agentResponse = await sendTerminalMessage(message);
    
    if (agentResponse) {
      // Add agent response to terminal
      addLine({
        type: 'output',
        content: `${agentData?.agentName || 'Agent'}: ${agentResponse}`,
        timestamp: Date.now()
      });
      
      // Update local chat messages from hook
      setChatMessages(terminalChatMessages);
    } else {
      throw new Error(terminalChatError || 'No response received');
    }
    
  } catch (error) {
    addLine({
      type: 'error',
      content: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: Date.now()
    });
  } finally {
    setIsSendingMessage(false);
  }
};

export const saveConversationFromTerminal = async (deps: ChatWorkflowDependencies) => {
  const {
    setIsSavingConversation, addLine, saveTerminalConversation,
    terminalChatError, agentData
  } = deps;

  setIsSavingConversation(true);
  
  try {
    // Use the real terminal chat hook to save conversation
    const success = await saveTerminalConversation();
    
    if (success) {
      addLine({
        type: 'success',
        content: `${agentData?.agentName || 'Agent'} learned from this conversation!`,
        timestamp: Date.now()
      });
      
      exitChatMode(deps);
    } else {
      throw new Error(terminalChatError || 'Unknown save error');
    }
  } catch (error) {
    addLine({
      type: 'error',
      content: `Failed to save conversation: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: Date.now()
    });
  } finally {
    setIsSavingConversation(false);
  }
};

export const exitChatMode = (deps: ChatWorkflowDependencies) => {
  const {
    setChatInputMode, setWaitingForChatConfirm, setWaitingForTrainConfirm,
    setChatSession, setChatMessages, setIsInitializingChat, setIsSendingMessage,
    setIsSavingConversation, resetTerminalSession, clearTerminalChatError, addLine
  } = deps;

  setChatInputMode(false);
  setWaitingForChatConfirm(false);
  setWaitingForTrainConfirm(false);
  setChatSession(null);
  setChatMessages([]);
  setIsInitializingChat(false);
  setIsSendingMessage(false);
  setIsSavingConversation(false);
  
  // Reset the terminal chat session
  resetTerminalSession();
  clearTerminalChatError();
  
  addLine({
    type: 'system',
    content: 'Chat session ended',
    timestamp: Date.now()
  });
};