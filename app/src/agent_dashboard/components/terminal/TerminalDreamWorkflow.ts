import { TerminalLine } from '../../commands/types';

export interface DreamWorkflowDependencies {
  // State setters
  setDreamInputMode: (val: boolean) => void;
  setProcessingDream: (val: boolean) => void;
  setSavingDream: (val: boolean) => void;
  setEvolvingDream: (val: boolean) => void;
  setCurrentInput: (val: string) => void;
  setPendingDreamSave: (val: any) => void;
  setLearningMessageId: (val: number | null) => void;
  setEvolutionMessageId: (val: number | null) => void;
  
  // Functions
  addLine: (line: TerminalLine) => void;
  
  // Hook functions
  setDreamText: (text: string) => void;
  buildDreamContext: (tokenId: number, agentData: any, dreamInput: string) => Promise<any>;
  buildDreamAnalysisPrompt: (context: any) => any;
  sendDreamAnalysis: (promptResult: any) => Promise<any>;
  processStorageAndContract: (tokenId: number, aiResult: any) => Promise<any>;
  resetDream: () => void;
  resetAI: () => void;
  
  // Agent data
  agentData: any;
  effectiveTokenId: number;
  isWalletConnected: boolean;
  isCorrectNetwork: boolean;
  hasAgent: boolean;
  
  // Debug
  debugLog: (message: string, data?: any) => void;
  
  // Pending state
  pendingDreamSave: any;
}

export const executeDreamAnalysis = async (dreamInput: string, deps: DreamWorkflowDependencies) => {
  const {
    setDreamInputMode, setProcessingDream, setCurrentInput, setPendingDreamSave,
    addLine, setDreamText, buildDreamContext, buildDreamAnalysisPrompt,
    sendDreamAnalysis, resetDream, resetAI, agentData, effectiveTokenId,
    isWalletConnected, isCorrectNetwork, hasAgent, debugLog
  } = deps;

  // Exit dream input mode and enter processing mode
  setDreamInputMode(false);
  setProcessingDream(true);
  
  // Add dream input to terminal
  addLine({
    type: 'input',
    content: `~ ${dreamInput}`,
    timestamp: Date.now()
  });

  // Clear input immediately and add explicit thinking message
  setCurrentInput('');
  
  // Thinking message now only in input placeholder - no terminal message

  // Set dream text for useAgentDream (for future reference)
  setDreamText(dreamInput);

  // Check preconditions
  if (!isWalletConnected) {
    addLine({
      type: 'error',
      content: 'Wallet not connected. Please connect your wallet first.',
      timestamp: Date.now()
    });
    setProcessingDream(false);
    return;
  }

  if (!isCorrectNetwork) {
    addLine({
      type: 'error',
      content: 'Wrong network. Please switch to 0G Galileo Testnet.',
      timestamp: Date.now()
    });
    setProcessingDream(false);
    return;
  }

  if (!hasAgent || !agentData || !effectiveTokenId || effectiveTokenId <= 0) {
    addLine({
      type: 'error',
      content: 'No agent found or invalid token ID. Please mint an agent first.',
      timestamp: Date.now()
    });
    setProcessingDream(false);
    return;
  }

  if (!dreamInput.trim()) {
    addLine({
      type: 'error',
      content: 'Dream text cannot be empty.',
      timestamp: Date.now()
    });
    setProcessingDream(false);
    return;
  }

  try {
    debugLog('Dream analysis workflow started', {
      effectiveTokenId,
      dreamInputLength: dreamInput.length,
      hasAgentData: !!agentData,
      agentName: agentData?.agentName,
      dreamCount: agentData?.dreamCount?.toString()
    });

    // Show agent thinking message instead of technical details
    // No separate building context messages - handled by thinking animation

    // Combine all data from useAgentRead (like in DreamAnalysisSection)
    const combinedAgentData = agentData ? {
      ...agentData,
      memory: {
        ...agentData.memory,
        memoryDepth: 'current month only', // Default fallback
        monthsAccessible: 1
      }
    } : undefined;

    const context = await buildDreamContext(effectiveTokenId, combinedAgentData, dreamInput);
    
    if (!context) {
      addLine({
        type: 'error',
        content: 'Failed to build context.',
        timestamp: Date.now()
      });
      setProcessingDream(false);
      return;
    }

    // Analysis step is now part of thinking animation - no separate message

    const promptResult = buildDreamAnalysisPrompt(context);

    const aiResult = await sendDreamAnalysis(promptResult);
    
    if (!aiResult) {
      addLine({
        type: 'error',
        content: 'AI analysis failed.',
        timestamp: Date.now()
      });
      setProcessingDream(false);
      return;
    }

    // Display only AI analysis content (no technical dream data)
    addLine({
      type: 'info',
      content: `${agentData?.agentName}: ${aiResult.fullAnalysis}`,
      timestamp: Date.now()
    });

    // Ask for confirmation to save with agent-focused message
    addLine({
      type: 'system',
      content: `Do u wanna train ${agentData?.agentName} with your dream? Type y/n`,
      timestamp: Date.now()
    });

    // Set pending save data and exit processing mode
    setPendingDreamSave({
      effectiveTokenId,
      aiResult,
      agentName: agentData?.agentName
    });
    setProcessingDream(false);

  } catch (error: any) {
    addLine({
      type: 'error',
      content: `Dream analysis failed: ${error.message || error}`,
      timestamp: Date.now()
    });
    // Reset on error
    setProcessingDream(false);
    resetDream();
    resetAI();
  }
};

export const handleDreamSaveConfirmation = async (confirmed: boolean, deps: DreamWorkflowDependencies) => {
  const {
    pendingDreamSave, setPendingDreamSave, setSavingDream, setEvolvingDream,
    setCurrentInput, setLearningMessageId, setEvolutionMessageId,
    addLine, processStorageAndContract, resetDream, resetAI
  } = deps;

  if (!pendingDreamSave) return;

  if (confirmed) {
    setSavingDream(true);
    
    // Clear input immediately when saving starts
    setCurrentInput('');
    
    // Learning message now only in input placeholder - no terminal message

    // Evolution message now only in input placeholder - no terminal message
    // Set evolution state after a delay to show learning -> evolving transition
    setTimeout(() => {
      setEvolvingDream(true);
      setSavingDream(false); // Switch from learning to evolving
    }, 1200);

    const storageResult = await processStorageAndContract(
      pendingDreamSave.effectiveTokenId, 
      pendingDreamSave.aiResult
    );
    
    if (!storageResult.success) {
      addLine({
        type: 'error',
        content: `Failed to save dream: ${storageResult.error}`,
        timestamp: Date.now()
      });
    } else {
      // Final success message
      addLine({
        type: 'success',
        content: `${pendingDreamSave.agentName} has learned from your dream!`,
        timestamp: Date.now()
      });
    }
    
    setSavingDream(false);
    setEvolvingDream(false);

    // Reset and clean up
    resetDream();
    resetAI();
  } else {
    addLine({
      type: 'info',
      content: 'Dream not saved.',
      timestamp: Date.now()
    });
    // Reset without saving
    resetDream();
    resetAI();
  }

  setSavingDream(false);
  setEvolvingDream(false);
  setPendingDreamSave(null);
  setLearningMessageId(null);
  setEvolutionMessageId(null);
};