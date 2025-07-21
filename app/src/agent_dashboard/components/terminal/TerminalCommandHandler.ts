import { TerminalLine } from '../../commands/types';
import { CommandProcessor } from '../../commands/CommandProcessor';
import { DreamWorkflowDependencies } from './TerminalDreamWorkflow';

export interface CommandHandlerDependencies {
  // State setters
  setIsLoading: (val: boolean) => void;
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setDreamInputMode: (val: boolean) => void;
  setDreamInputText: (val: string) => void;
  setWaitingForChatConfirm: (val: boolean) => void;
  setPendingMintName: (val: string | null) => void;
  setMonthLearnMode: (val: boolean) => void;
  setIsProcessingMonthLearn: (val: boolean) => void;
  setYearLearnMode: (val: boolean) => void;
  setIsProcessingYearLearn: (val: boolean) => void;
  
  // Functions & refs
  addLine: (line: TerminalLine) => void;
  commandProcessorRef: React.MutableRefObject<CommandProcessor>;
  
  // Hook functions - useAgentMint
  mintAgent: (name: string) => Promise<any>;
  
  // Agent data & status
  agentData: any;
  dashboardData: any;
  wallet: any;
  isWalletConnected: boolean;
  hasCurrentBalance: boolean;
  isCorrectNetwork: boolean;
  hasAgent: boolean;
  
  // Pending states
  pendingMintName: string | null;
  pendingDreamSave: any;
  
  // Debug
  debugLog: (message: string, data?: any) => void;
  
  // Workflow dependencies
  dreamWorkflowDeps: DreamWorkflowDependencies;
  handleDreamSaveConfirmation: (confirmed: boolean, deps: DreamWorkflowDependencies) => Promise<void>;
  
  // Format functions
  formatAgentInfo: (data: any) => string;
  formatAgentStats: (data: any) => string;
  formatSystemStatus: (data: any) => string;
  formatMemoryStatus: (data: any) => string;
  formatHelpOutput: () => TerminalLine[];
}

export const saveCommandToHistory = (command: string, deps: CommandHandlerDependencies) => {
  const { setCommandHistory, debugLog } = deps;
  
  const trimmedCommand = command.trim();
  if (!trimmedCommand || trimmedCommand === 'clear') return;

  setCommandHistory(prev => {
    // Remove duplicates and add to end
    const newHistory = prev.filter(cmd => cmd !== trimmedCommand);
    newHistory.push(trimmedCommand);
    
    // Keep max 50 entries
    const limitedHistory = newHistory.slice(-50);
    
    // Save to localStorage
    try {
      localStorage.setItem('dreamscape-terminal-history', JSON.stringify(limitedHistory));
    } catch (error) {
      debugLog('Failed to save command history:', error);
    }
    
    return limitedHistory;
  });
};

export const executeCommand = async (command: string, deps: CommandHandlerDependencies) => {
  const {
    addLine, setIsLoading, setLines, setDreamInputMode, setDreamInputText,
    setWaitingForChatConfirm, setPendingMintName, setMonthLearnMode, setIsProcessingMonthLearn,
    setYearLearnMode, setIsProcessingYearLearn,
    commandProcessorRef, wallet, agentData, dashboardData, isWalletConnected, isCorrectNetwork,
    hasAgent, hasCurrentBalance, formatAgentInfo, formatAgentStats,
    formatSystemStatus, formatMemoryStatus, formatHelpOutput
  } = deps;

  const trimmedCommand = command.trim();
  
  // Add input to history
  addLine({ 
    type: 'input', 
    content: `$ ${trimmedCommand}`,
    timestamp: Date.now()
  });

  if (!trimmedCommand) return;

  try {
    setIsLoading(true);
    
    const result = await commandProcessorRef.current.executeCommand(trimmedCommand, {
      addLine,
      setLoading: setIsLoading,
      currentUser: wallet.address || undefined
    });

    // Handle special clear command - only clear user commands, keep welcome
    if (result.output === '__CLEAR__') {
      setLines([]);
      setIsLoading(false);
      return;
    }

    // Handle dream input mode
    if (result.output === 'DREAM_INPUT_MODE') {
      setDreamInputMode(true);
      setDreamInputText('');
      addLine({
        type: 'info',
        content: 'Dream input mode activated. Describe your dream and press Enter to analyze.',
        timestamp: Date.now()
      });
      addLine({
        type: 'system',
        content: 'Press Escape to cancel dream input mode.',
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    // Handle chat input mode
    if (result.output === 'CHAT_INPUT_MODE') {
      setWaitingForChatConfirm(true);
      addLine({
        type: 'info',
        content: 'Do u wanna chat with your agent? y/n',
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    // Handle month learn mode
    if (result.output === 'MONTH_LEARN_MODE') {
      setMonthLearnMode(true);
      setIsProcessingMonthLearn(true);
      addLine({
        type: 'info',
        content: 'Starting monthly consolidation workflow...',
        timestamp: Date.now()
      });
      addLine({
        type: 'system',
        content: 'This will consolidate your dreams and conversations from this month.',
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    // Handle year learn mode
    if (result.output === 'YEAR_LEARN_MODE') {
      setYearLearnMode(true);
      setIsProcessingYearLearn(true);
      addLine({
        type: 'info',
        content: 'Starting yearly consolidation workflow...',
        timestamp: Date.now()
      });
      addLine({
        type: 'system',
        content: 'This will consolidate your entire year into a memory core.',
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    // Handle special info/stats/status/memory commands
    if (result.output === 'AGENT_INFO_REQUEST') {
      const infoOutput = formatAgentInfo(dashboardData);
      addLine({
        type: 'info',
        content: infoOutput,
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    if (result.output === 'AGENT_STATS_REQUEST') {
      const statsOutput = formatAgentStats(dashboardData);
      addLine({
        type: 'info',
        content: statsOutput,
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    if (result.output === 'SYSTEM_STATUS_REQUEST') {
      const statusOutput = formatSystemStatus(dashboardData);
      addLine({
        type: 'info',
        content: statusOutput,
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    if (result.output === 'MEMORY_STATUS_REQUEST') {
      const memoryOutput = formatMemoryStatus(dashboardData);
      addLine({
        type: 'info',
        content: memoryOutput,
        timestamp: Date.now()
      });
      setIsLoading(false);
      return;
    }

    if (result.output === 'HELP_COMMAND_REQUEST') {
      const helpLines = formatHelpOutput();
      setLines(prev => [...prev, ...helpLines]);
      setIsLoading(false);
      return;
    }

    // Handle mint command specifically
    if (trimmedCommand.startsWith('mint ') && result.requiresConfirmation) {
      const agentName = trimmedCommand.split(' ').slice(1).join(' ');
      
      // Check wallet and agent status first
      if (!isWalletConnected) {
        addLine({
          type: 'error',
          content: 'Wallet not connected. Please connect your wallet first.',
          timestamp: Date.now()
        });
        setIsLoading(false);
        return;
      }

      if (!isCorrectNetwork) {
        addLine({
          type: 'error', 
          content: 'Wrong network. Please switch to 0G Galileo Testnet.',
          timestamp: Date.now()
        });
        setIsLoading(false);
        return;
      }

      if (hasAgent && agentData) {
        addLine({
          type: 'info',
          content: `You already have an agent: "${agentData.agentName}" (Token ID: ${agentData.intelligenceLevel})`,
          timestamp: Date.now()
        });
        setIsLoading(false);
        return;
      }

      if (!hasCurrentBalance) {
        addLine({
          type: 'error',
          content: 'Insufficient balance. You need 0.1 OG to mint an agent.',
          timestamp: Date.now()
        });
        setIsLoading(false);
        return;
      }

      // Show confirmation prompt
      addLine({
        type: 'system',
        content: `Ready to mint agent "${agentName}"? This will cost 0.1 OG. Type y/n to confirm.`,
        timestamp: Date.now()
      });
      
      setPendingMintName(agentName);
      setIsLoading(false);
      return;
    }

    // Display regular command output
    if (result.output && result.output !== '__CLEAR__') {
      addLine({
        type: result.type || 'output',
        content: result.output,
        timestamp: Date.now()
      });
    }
    
    setIsLoading(false);
  } catch (error: any) {
    addLine({
      type: 'error',
      content: `Command failed: ${error.message || error}`,
      timestamp: Date.now()
    });
    setIsLoading(false);
  }
};

export const executeEnhancedCommand = async (command: string, deps: CommandHandlerDependencies) => {
  const {
    pendingDreamSave, pendingMintName, addLine, dreamWorkflowDeps,
    handleDreamSaveConfirmation
  } = deps;

  const trimmedCommand = command.trim().toLowerCase();
  
  // Handle dream save confirmation
  if (pendingDreamSave) {
    if (trimmedCommand === 'yes' || trimmedCommand === 'y') {
      await handleDreamSaveConfirmation(true, dreamWorkflowDeps);
      return;
    } else if (trimmedCommand === 'no' || trimmedCommand === 'n') {
      await handleDreamSaveConfirmation(false, dreamWorkflowDeps);
      return;
    } else {
      addLine({
        type: 'warning',
        content: 'Please answer yes/no (y/n)',
        timestamp: Date.now()
      });
      return;
    }
  }

  // Handle mint confirmation
  if (pendingMintName) {
    if (trimmedCommand === 'yes' || trimmedCommand === 'y') {
      await handleMintConfirmation(true, deps);
      return;
    } else if (trimmedCommand === 'no' || trimmedCommand === 'n') {
      await handleMintConfirmation(false, deps);
      return;
    } else {
      addLine({
        type: 'warning',
        content: 'Please answer yes/no (y/n)',
        timestamp: Date.now()
      });
      return;
    }
  }
  
  await executeCommand(command, deps);
};

export const handleMintConfirmation = async (confirmed: boolean, deps: CommandHandlerDependencies) => {
  const { pendingMintName, setPendingMintName, addLine, setIsLoading, mintAgent } = deps;

  if (!pendingMintName) return;
  
  if (confirmed) {
    addLine({
      type: 'success',
      content: 'new era of your life begins now . . .',
      timestamp: Date.now()
    });
    
    try {
      setIsLoading(true);
      const result = await mintAgent(pendingMintName);
      
      if (result.success) {
        addLine({
          type: 'success', 
          content: `Agent "${pendingMintName}" minted successfully!`,
          timestamp: Date.now()
        });
        
        if (result.txHash) {
          addLine({
            type: 'info',
            content: `Transaction: ${result.txHash}`,
            timestamp: Date.now()
          });
        }
      } else {
        addLine({
          type: 'error',
          content: `Minting failed: ${result.error}`,
          timestamp: Date.now()
        });
      }
    } catch (error: any) {
      addLine({
        type: 'error',
        content: `Minting error: ${error.message || error}`,
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
      setPendingMintName(null);
    }
  } else {
    addLine({
      type: 'info',
      content: 'Mint cancelled',
      timestamp: Date.now()
    });
    setPendingMintName(null);
  }
};