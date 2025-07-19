'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { validateCommand, generateDots, checkIfMobile, getTerminalColors } from './TerminalUtils';
import { useTerminalState } from './useTerminalState';
import { executeDreamAnalysis, handleDreamSaveConfirmation, type DreamWorkflowDependencies } from './TerminalDreamWorkflow';
import { initializeChatSession, sendChatMessage, saveConversationFromTerminal, exitChatMode, type ChatWorkflowDependencies } from './TerminalChatWorkflow';
import { saveCommandToHistory, executeCommand, executeEnhancedCommand, handleMintConfirmation, type CommandHandlerDependencies } from './TerminalCommandHandler';
import { FaBrain, FaClock, FaCheckCircle, FaTimesCircle, FaSave } from 'react-icons/fa';
import { CommandProcessor } from '../../commands/CommandProcessor';
import { TerminalLine } from '../../commands/types';
import { useAgentMint } from '../../../hooks/agentHooks/useAgentMint';
import { useAgentRead } from '../../../hooks/agentHooks/useAgentRead';
import { useAgentDashboard } from '../../../hooks/useAgentDashboard';
import { useWallet } from '../../../hooks/useWallet';
import { useBrokerBalance } from '../../../hooks/useBrokerBalance';
import { formatAgentInfo } from '../../commands/info';
import { formatAgentStats } from '../../commands/stats';
import { formatSystemStatus } from '../../commands/status';
import { formatMemoryStatus } from '../../commands/memory';
import { formatHelpOutput } from '../../commands/help';
// Dream analysis hooks
import { useAgentDream } from '../../../hooks/agentHooks/useAgentDream';
import { useAgentPrompt } from '../../../hooks/agentHooks/useAgentPrompt';
import { useAgentAI } from '../../../hooks/agentHooks/useAgentAI';
// Chat hooks
import { useAgentChatTerminal } from '../../../hooks/agentHooks/useAgentChatTerminal';

interface TerminalProps {
  darkMode?: boolean;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
}

// TerminalLine is now imported from types

const CleanTerminal: React.FC<TerminalProps> = ({
  darkMode = true,
  title,
  width = "100%",
  height = "600px",
  className = ""
}) => {
  const { theme, debugLog } = useTheme();
  
  // Use custom terminal state hook
  const terminalState = useTerminalState();
  const {
    lines, setLines, welcomeLines, setWelcomeLines,
    currentInput, setCurrentInput, commandHistory, setCommandHistory,
    historyIndex, setHistoryIndex, isValidCommand, setIsValidCommand,
    isLoading, setIsLoading, isSystemLoading, setIsSystemLoading,
    isInitialized, setIsInitialized, pendingMintName, setPendingMintName,
    dreamInputMode, setDreamInputMode, dreamInputText, setDreamInputText,
    processingDream, setProcessingDream, pendingDreamSave, setPendingDreamSave,
    thinkingTimer, setThinkingTimer, savingDream, setSavingDream,
    evolvingDream, setEvolvingDream, chatInputMode, setChatInputMode,
    waitingForChatConfirm, setWaitingForChatConfirm, chatSession, setChatSession,
    chatMessages, setChatMessages, isInitializingChat, setIsInitializingChat,
    isSendingMessage, setIsSendingMessage, waitingForTrainConfirm, setWaitingForTrainConfirm,
    isSavingConversation, setIsSavingConversation, dotsPattern, setDotsPattern,
    thinkingMessageId, setThinkingMessageId, learningMessageId, setLearningMessageId,
    evolutionMessageId, setEvolutionMessageId, isMobile, setIsMobile,
    inputRef, terminalRef, commandProcessorRef, dotsTimerRef, addLine
  } = terminalState;
  
  // Agent hooks
  const { mintAgent, isLoading: isMinting, error: mintError, resetMint, isWalletConnected, hasCurrentBalance, isCorrectNetwork } = useAgentMint();
  const { hasAgent, agentData, isLoading: isLoadingAgent, effectiveTokenId } = useAgentRead();
  const dashboardData = useAgentDashboard();
  
  // Wallet hook for broker commands
  const wallet = useWallet();
  
  // Broker balance hook
  const { balance: brokerBalance, loading: brokerLoading } = useBrokerBalance();
  
  // Dream analysis hooks
  const { 
    dreamText, 
    setDreamText, 
    isLoadingContext, 
    contextStatus, 
    builtContext, 
    error: dreamError,
    buildDreamContext,
    isUploadingToStorage,
    uploadStatus,
    isProcessingContract,
    contractStatus,
    processStorageAndContract,
    resetDream
  } = useAgentDream();
  
  const { buildDreamAnalysisPrompt } = useAgentPrompt();
  
  const { 
    isLoading: isLoadingAI, 
    error: aiError, 
    aiResponse, 
    parsedResponse, 
    resetAI, 
    sendDreamAnalysis 
  } = useAgentAI();
  
  // Chat terminal hooks
  const {
    session: terminalChatSession,
    isInitializing: isInitializingTerminalChat,
    initializeTerminalChatSession,
    resetTerminalSession,
    messages: terminalChatMessages,
    sendTerminalMessage,
    isSendingMessage: isSendingTerminalMessage,
    saveTerminalConversation,
    isSavingConversation: isSavingTerminalConversation,
    error: terminalChatError,
    clearError: clearTerminalChatError
  } = useAgentChatTerminal(effectiveTokenId);
  
  // Expose wallet context to global window for commands
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__DREAMSCAPE_WALLET_CONTEXT__ = wallet;
    }
  }, [wallet]);

  // Mobile state is now handled by useTerminalState hook
  
  // Load command history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('dreamscape-terminal-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        if (Array.isArray(history)) {
          setCommandHistory(history.slice(-50)); // Keep max 50 entries
        }
      } catch (error) {
        debugLog('Failed to load command history:', error);
      }
    }
  }, [debugLog]);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIfMobile());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build welcome message based on agent status
  const buildWelcomeMessage = useCallback((): TerminalLine[] => {
    const messages: TerminalLine[] = [];
    const timestamp = Date.now();

    if (hasAgent && agentData && !isLoadingAgent) {
      // Agent is ready message
      messages.push({
        type: 'success',
        content: `${agentData.agentName} is ready`,
        timestamp
      });

      // Agent details line
      const intelligenceLevel = Number(agentData.intelligenceLevel);
      const dreamCount = Number(agentData.dreamCount);
      const createdDate = new Date(Number(agentData.createdAt) * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      messages.push({
        type: 'info-labeled',
        content: `Intelligence: ${intelligenceLevel} lvl | Dreams: ${dreamCount} | Created: ${createdDate}`,
        timestamp
      });

      // Network and status line
      const dominantMood = agentData.personality?.dominantMood || 'Unknown';
      const balanceDisplay = brokerLoading ? 'Loading...' : `${brokerBalance.toFixed(4)} OG`;
      
      messages.push({
        type: 'info-labeled',
        content: `Network: 0G Galileo | Mood: ${dominantMood} | Broker Balance: ${balanceDisplay}`,
        timestamp
      });

      // Empty line
      messages.push({
        type: 'system',
        content: '',
        timestamp
      });

      // Help message
      messages.push({
        type: 'system',
        content: "Type 'help' for available commands",
        timestamp
      });
    } else if (isLoadingAgent) {
      // Still loading agent data
      messages.push({
        type: 'system',
        content: 'Loading agent data...',
        timestamp
      });
    } else {
      // No agent found
      messages.push({
        type: 'info',
        content: 'Agent Dashboard is ready',
        timestamp
      });

      messages.push({
        type: 'info-labeled',
        content: 'Network: 0G Galileo | Status: No agent minted',
        timestamp
      });

      // Empty line
      messages.push({
        type: 'system',
        content: '',
        timestamp
      });

      messages.push({
        type: 'system',
        content: "Type 'mint <name>' to create your agent",
        timestamp
      });
    }

    return messages;
  }, [hasAgent, agentData, isLoadingAgent, brokerBalance, brokerLoading]);

  // Progress indicators - monitor dream analysis statuses (DISABLED - replaced with thinking animation)
  // useEffect(() => {
  //   if (contextStatus) {
  //     addLine({
  //       type: 'system',
  //       content: (
  //         <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  //           <FaBrain style={{ color: '#4A90E2' }} />
  //           {contextStatus}
  //         </span>
  //       ),
  //       timestamp: Date.now()
  //     });
  //   }
  // }, [contextStatus]);

  // Storage status monitoring (DISABLED - replaced with unified learning message)
  // useEffect(() => {
  //   if (uploadStatus) {
  //     addLine({
  //       type: 'system',
  //       content: (
  //         <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  //           <FaDatabase style={{ color: '#28A745' }} />
  //           {uploadStatus}
  //         </span>
  //       ),
  //       timestamp: Date.now()
  //     });
  //   }
  // }, [uploadStatus]);

  // Contract status monitoring (DISABLED - replaced with unified evolution message)
  // useEffect(() => {
  //   if (contractStatus) {
  //     addLine({
  //       type: 'system',
  //       content: (
  //         <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  //           <FaLink style={{ color: '#17A2B8' }} />
  //           {contractStatus}
  //         </span>
  //       ),
  //       timestamp: Date.now()
  //     });
  //   }
  // }, [contractStatus]);

  // Error handling for dream workflow
  useEffect(() => {
    if (dreamError) {
      addLine({
        type: 'error',
        content: `Dream Error: ${dreamError}`,
        timestamp: Date.now()
      });
    }
  }, [dreamError]);

  useEffect(() => {
    if (aiError) {
      addLine({
        type: 'error',
        content: `AI Error: ${aiError}`,
        timestamp: Date.now()
      });
    }
  }, [aiError]);

  // System loading sequence with welcome message - runs only once
  useEffect(() => {
    const initializeSystem = async () => {
      // Don't initialize if already initialized
      if (isInitialized) {
        return;
      }
      
      // Wait for 2.5 seconds to show loading animation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Build welcome message
      const welcomeMessages = buildWelcomeMessage();
      
      // Set welcome messages separately
      setWelcomeLines(welcomeMessages);
      setIsSystemLoading(false);
      setIsInitialized(true);
    };

    // Only run if not initialized yet
    if (!isInitialized) {
      initializeSystem();
    }
  }, [hasAgent, agentData, isLoadingAgent, isInitialized, buildWelcomeMessage]);

  // Generate dynamic title based on agent status
  const getTerminalTitle = (): string => {
    if (hasAgent && agentData?.agentName) {
      return isMobile ? `${agentData.agentName}OS — zeroG` : `${agentData.agentName}OS — zeroG — 80x24`;
    }
    return title || (isMobile ? "Agent DashboardOS — zeroG" : "Agent DashboardOS — zeroG — 80x24");
  };

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Thinking animation and timer
  useEffect(() => {
    if (processingDream) {
      const timerInterval = setInterval(() => {
        setThinkingTimer(prev => prev + 1);
      }, 1000);
      
      return () => {
        clearInterval(timerInterval);
      };
    } else {
      setThinkingTimer(0);
    }
  }, [processingDream]);

  // Stable dots animation using useRef timer
  const getDots = () => {
    return generateDots(dotsPattern);
  };

  // Start/stop dots animation
  useEffect(() => {
    if (processingDream || savingDream || evolvingDream || isInitializingChat || isInitializingTerminalChat || isSendingMessage || isSendingTerminalMessage || isSavingConversation || isSavingTerminalConversation) {
      // Start animation
      dotsTimerRef.current = setInterval(() => {
        setDotsPattern(prev => (prev + 1) % 4);
      }, 500);
    } else {
      // Stop animation
      if (dotsTimerRef.current) {
        clearInterval(dotsTimerRef.current);
        dotsTimerRef.current = null;
      }
      setDotsPattern(0); // Reset to '.'
    }

    // Cleanup on unmount
    return () => {
      if (dotsTimerRef.current) {
        clearInterval(dotsTimerRef.current);
      }
    };
  }, [processingDream, savingDream, evolvingDream, isInitializingChat, isInitializingTerminalChat, isSendingMessage, isSendingTerminalMessage, isSavingConversation, isSavingTerminalConversation]);

  // Learning phase cleanup
  useEffect(() => {
    if (!savingDream) {
      setLearningMessageId(null);
    }
  }, [savingDream]);

  // Update thinking message with real-time animation (TEMPORARILY DISABLED TO FIX DUPLICATE)
  // useEffect(() => {
  //   if (processingDream && thinkingMessageId && agentData?.agentName) {
  //     // Update the thinking message line with current animation
  //     setLines(prevLines => 
  //       prevLines.map(line => 
  //         line.timestamp === thinkingMessageId ? {
  //           ...line,
  //           content: (
  //             <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  //               <FaBrain style={{ color: '#8B5CF6' }} />
  //               <span>
  //                 {agentData.agentName} is thinking
  //                 <span className="thinking-dots">{getThinkingAnimation()}</span>
  //               </span>
  //             </span>
  //           )
  //         } : line
  //       )
  //     );
  //   }
  // }, [thinkingAnimation, processingDream, thinkingMessageId, agentData?.agentName, getThinkingAnimation]);


  // Handle keyboard input including arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Chat confirmation handling
    if (waitingForChatConfirm) {
      if (e.key === 'Enter') {
        const answer = currentInput.trim().toLowerCase();
        if (answer === 'y' || answer === 'yes') {
          setWaitingForChatConfirm(false);
          initializeChatSession(chatWorkflowDeps);
        } else if (answer === 'n' || answer === 'no') {
          setWaitingForChatConfirm(false);
          addLine({
            type: 'system',
            content: 'Chat cancelled.',
            timestamp: Date.now()
          });
        } else {
          addLine({
            type: 'warning',
            content: 'Please answer y/n',
            timestamp: Date.now()
          });
        }
        setCurrentInput('');
        return;
      }
      return;
    }

    // Chat train confirmation handling
    if (waitingForTrainConfirm) {
      if (e.key === 'Enter') {
        const answer = currentInput.trim().toLowerCase();
        if (answer === 'y' || answer === 'yes') {
          setWaitingForTrainConfirm(false);
          saveConversationFromTerminal(chatWorkflowDeps);
        } else if (answer === 'n' || answer === 'no') {
          setWaitingForTrainConfirm(false);
          exitChatMode();
        } else {
          addLine({
            type: 'warning',
            content: 'Please answer y/n',
            timestamp: Date.now()
          });
        }
        setCurrentInput('');
        return;
      }
      return;
    }

    // Chat input mode handling
    if (chatInputMode) {
      if (e.key === 'Enter') {
        const message = currentInput.trim();
        if (message === 'end') {
          // End chat and ask about training
          setWaitingForTrainConfirm(true);
          addLine({
            type: 'info',
            content: 'Do u wanna train your agent with this conversation? y/n',
            timestamp: Date.now()
          });
        } else if (message) {
          // Send message to agent
          sendChatMessage(message, chatWorkflowDeps);
        }
        setCurrentInput('');
        return;
      } else if (e.key === 'Escape') {
        // Cancel chat mode
        exitChatMode();
        return;
      }
      // Regular typing in chat mode - no special handling needed
      return;
    }

    // Dream input mode handling
    if (dreamInputMode) {
      if (e.key === 'Enter') {
        if (currentInput.trim()) {
          // Start dream analysis workflow
          executeDreamAnalysis(currentInput.trim(), dreamWorkflowDeps);
        }
        setCurrentInput('');
        return;
      } else if (e.key === 'Escape') {
        // Cancel dream input mode
        setDreamInputMode(false);
        setDreamInputText('');
        setCurrentInput('');
        addLine({
          type: 'system',
          content: 'Dream input mode cancelled.',
          timestamp: Date.now()
        });
        return;
      }
      // Regular typing in dream mode - no special handling needed
      return;
    }

    // Regular command mode handling
    if (e.key === 'Enter') {
      if (currentInput.trim()) {
        saveCommandToHistory(currentInput, commandHandlerDeps);
      }
      executeEnhancedCommand(currentInput, commandHandlerDeps);
      setCurrentInput('');
      setIsValidCommand(false);
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
        setIsValidCommand(validateCommand(commandHistory[newIndex], commandProcessorRef.current));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
          setIsValidCommand(false);
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
          setIsValidCommand(validateCommand(commandHistory[newIndex], commandProcessorRef.current));
        }
      }
    } else if (e.key === 'Escape') {
      setCurrentInput('');
      setIsValidCommand(false);
      setHistoryIndex(-1);
    }
  };


  // Handle input changes (reset history when typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);
    setIsValidCommand(validateCommand(value, commandProcessorRef.current));
    
    if (historyIndex !== -1) {
      setHistoryIndex(-1); // Exit history mode when typing
    }
  };




  // Create dream workflow dependencies
  const dreamWorkflowDeps: DreamWorkflowDependencies = {
    // State setters
    setDreamInputMode, setProcessingDream, setSavingDream, setEvolvingDream,
    setCurrentInput, setPendingDreamSave, setLearningMessageId, setEvolutionMessageId,
    
    // Functions
    addLine,
    
    // Hook functions
    setDreamText, buildDreamContext, buildDreamAnalysisPrompt,
    sendDreamAnalysis, processStorageAndContract, resetDream, resetAI,
    
    // Agent data
    agentData, effectiveTokenId, isWalletConnected, isCorrectNetwork, hasAgent,
    
    // Debug
    debugLog,
    
    // Pending state
    pendingDreamSave
  };

  // Create chat workflow dependencies
  const chatWorkflowDeps: ChatWorkflowDependencies = {
    // State setters
    setIsInitializingChat, setIsSendingMessage, setIsSavingConversation,
    setChatInputMode, setWaitingForChatConfirm, setWaitingForTrainConfirm,
    setChatSession, setChatMessages,
    
    // Functions
    addLine,
    
    // Chat hook functions
    initializeTerminalChatSession, sendTerminalMessage, saveTerminalConversation,
    resetTerminalSession, clearTerminalChatError,
    
    // Chat hook data
    terminalChatSession, terminalChatMessages, terminalChatError,
    
    // Agent data
    agentData
  };

  // Create command handler dependencies
  const commandHandlerDeps: CommandHandlerDependencies = {
    // State setters
    setIsLoading, setLines, setCommandHistory, setDreamInputMode, setDreamInputText,
    setWaitingForChatConfirm, setPendingMintName,
    
    // Functions & refs
    addLine, commandProcessorRef,
    
    // Hook functions
    mintAgent,
    
    // Agent data & status
    agentData, dashboardData, wallet, isWalletConnected, hasCurrentBalance,
    isCorrectNetwork, hasAgent,
    
    // Pending states
    pendingMintName, pendingDreamSave,
    
    // Debug
    debugLog,
    
    // Workflow dependencies
    dreamWorkflowDeps, handleDreamSaveConfirmation,
    
    // Format functions
    formatAgentInfo, formatAgentStats, formatSystemStatus, formatMemoryStatus, formatHelpOutput
  };




  // Get terminal colors based on mode
  const colors = getTerminalColors(darkMode, theme.accent.primary);

  debugLog('CleanTerminal rendered', { darkMode, linesCount: lines.length });

  return (
    <div 
      className={`terminal-container ${className}`}
      style={{
        width,
        height,
        fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg
      }}
    >
      {/* Terminal Header */}
      <div style={{
        height: 'clamp(24px, 5vw, 28px)',
        background: darkMode ? '#2d2d2d' : '#f6f6f6',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'clamp(8px, 2vw, 12px)',
        paddingRight: 'clamp(8px, 2vw, 12px)',
        justifyContent: 'space-between'
      }}>
        {/* Traffic Lights - Triple Violet Theme */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(4px, 1.5vw, 8px)',
          flexShrink: 0
        }}>
          {/* Light Violet */}
          <div style={{
            width: 'clamp(8px, 2.5vw, 12px)',
            height: 'clamp(8px, 2.5vw, 12px)',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.dream.lightPurple}, ${theme.dream.pink})`,
            border: `0.5px solid ${theme.dream.lightPurple}`,
            boxShadow: `0 0 4px ${theme.dream.lightPurple}33`
          }} />
          {/* Medium Violet */}
          <div style={{
            width: 'clamp(8px, 2.5vw, 12px)',
            height: 'clamp(8px, 2.5vw, 12px)',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.dream.lightPurple})`,
            border: `0.5px solid ${theme.accent.primary}`,
            boxShadow: `0 0 4px ${theme.accent.primary}33`
          }} />
          {/* Deep Violet */}
          <div style={{
            width: 'clamp(8px, 2.5vw, 12px)',
            height: 'clamp(8px, 2.5vw, 12px)',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.dream.purple}, ${theme.accent.tertiary})`,
            border: `0.5px solid ${theme.dream.purple}`,
            boxShadow: `0 0 4px ${theme.dream.purple}33`
          }} />
        </div>

        {/* Title */}
        <div style={{
          fontSize: 'clamp(12px, 3vw, 15px)',
          color: darkMode ? '#ffffff' : '#000000',
          fontWeight: '500',
          textAlign: 'center',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingLeft: 'clamp(8px, 2vw, 12px)',
          paddingRight: 'clamp(8px, 2vw, 12px)'
        }}>
          {getTerminalTitle()}
        </div>

        <div style={{ width: 'clamp(32px, 8vw, 60px)' }} /> {/* Responsive spacer */}
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        style={{
          height: 'calc(100% - clamp(24px, 5vw, 28px))',
          padding: 'clamp(8px, 3vw, 16px)',
          backgroundColor: colors.bg,
          color: colors.text,
          fontSize: 'clamp(15px, 4vw, 18px)',
          lineHeight: '1.4',
          overflowY: 'auto',
          cursor: 'text',
          fontFamily: 'inherit'
        }}
      >
        {/* Loading Animation or Terminal Lines */}
        {isSystemLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: colors.system,
            marginBottom: '20px'
          }}>
            <span>Loading</span>
            <span 
              className="loading-dots"
              style={{
                marginLeft: '5px',
                animation: 'loadingDots 1.5s infinite'
              }}
            >
              . . .
            </span>
          </div>
        ) : (
          <>
            {/* Welcome Messages */}
            {welcomeLines.map((line, index) => (
              <div key={`welcome-${index}`} style={{
                marginBottom: '2px',
                color: line.type === 'system' ? '#6b7280' : 
                       line.type === 'input' ? theme.accent.primary :
                       line.type === 'error' ? '#ef4444' :
                       line.type === 'success' ? '#22c55e' :
                       line.type === 'warning' ? '#f59e0b' :
                       line.type === 'info' ? colors.text :
                       line.type === 'help-command' ? '#ffffff' :
                       line.type === 'info-labeled' ? colors.text :
                       colors.text,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {line.type === 'info-labeled' ? (
                  <span>
                    {line.content.split(' | ').map((segment, index) => (
                      <span key={index}>
                        {segment.includes(':') ? (
                          <span>
                            <span style={{ color: theme.accent.primary }}>
                              {segment.split(':')[0]}:
                            </span>
                            <span style={{ color: colors.text }}>
                              {segment.substring(segment.indexOf(':') + 1)}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: colors.text }}>{segment}</span>
                        )}
                        {index < line.content.split(' | ').length - 1 && (
                          <span style={{ color: theme.accent.primary }}> | </span>
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  line.content
                )}
              </div>
            ))}
            
            {/* User Command Lines */}
            {lines.map((line, index) => (
              <div key={`user-${index}`} style={{
                marginBottom: '2px',
                color: line.type === 'system' ? '#6b7280' : 
                       line.type === 'input' ? theme.accent.primary :
                       line.type === 'error' ? '#ef4444' :
                       line.type === 'success' ? '#22c55e' :
                       line.type === 'warning' ? '#f59e0b' :
                       line.type === 'info' ? colors.text :
                       line.type === 'help-command' ? colors.text :
                       line.type === 'info-labeled' ? colors.text :
                       colors.text,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {line.type === 'help-command' ? (
                  <span>
                    <span style={{ color: theme.accent.primary }}>
                      {line.content.split(' - ')[0]}
                    </span>
                    <span style={{ color: colors.text }}>
                      {line.content.includes(' - ') ? ' - ' + line.content.split(' - ')[1] : ''}
                    </span>
                  </span>
                ) : line.type === 'info-labeled' ? (
                  <span>
                    {line.content.split(' | ').map((segment, index) => (
                      <span key={index}>
                        {segment.includes(':') ? (
                          <span>
                            <span style={{ color: theme.accent.primary }}>
                              {segment.split(':')[0]}:
                            </span>
                            <span style={{ color: colors.text }}>
                              {segment.substring(segment.indexOf(':') + 1)}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: colors.text }}>{segment}</span>
                        )}
                        {index < line.content.split(' | ').length - 1 && (
                          <span style={{ color: colors.text }}> | </span>
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  line.content
                )}
              </div>
            ))}
          </>
        )}

        {/* Current Input Line - Hidden during system loading */}
        {!isSystemLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '4px'
          }}>
            <span style={{ color: theme.accent.primary, marginRight: '8px' }}>
              {(processingDream || savingDream || evolvingDream || isInitializingChat || isInitializingTerminalChat || isSendingMessage || isSendingTerminalMessage || isSavingConversation || isSavingTerminalConversation) ? <FaBrain /> : (dreamInputMode || chatInputMode) ? '~' : '$'}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading || processingDream || savingDream || evolvingDream || isInitializingChat || isInitializingTerminalChat || isSendingMessage || isSendingTerminalMessage || isSavingConversation || isSavingTerminalConversation}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: (dreamInputMode || chatInputMode) ? theme.accent.primary : (isValidCommand ? theme.accent.primary : colors.text),
                fontSize: 'clamp(15px, 4vw, 18px)',
                fontFamily: 'inherit',
                flex: 1,
                caretColor: theme.accent.primary,
                opacity: (isLoading || processingDream || savingDream || evolvingDream || isInitializingChat || isInitializingTerminalChat || isSendingMessage || isSendingTerminalMessage || isSavingConversation || isSavingTerminalConversation) ? 0.5 : 1
              }}
              placeholder={
                processingDream ? `${agentData?.agentName || 'Agent'} is thinking${getDots()}` :
                evolvingDream ? `${agentData?.agentName || 'Agent'} is evolving${getDots()}` :
                savingDream ? `${agentData?.agentName || 'Agent'} is learning${getDots()}` :
                (isInitializingChat || isInitializingTerminalChat) ? `${agentData?.agentName || 'Agent'} is initializing session${getDots()}` :
                (isSendingMessage || isSendingTerminalMessage) ? `${agentData?.agentName || 'Agent'} is thinking${getDots()}` :
                (isSavingConversation || isSavingTerminalConversation) ? `${agentData?.agentName || 'Agent'} is learning${getDots()}` :
                isLoading ? 'Processing...' :
                pendingDreamSave ? 'Answer y/n to train agent...' :
                waitingForChatConfirm ? 'Answer y/n to start chat...' :
                waitingForTrainConfirm ? 'Answer y/n to train agent...' :
                chatInputMode ? '(if u wanna end chat type \'end\')' :
                dreamInputMode ? 'Describe your dream...' : 
                'Type a command...'
              }
            />
            {isLoading && (
              <span style={{
                color: colors.system,
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                marginLeft: '8px'
              }}>
                <FaClock style={{ color: '#F59E0B' }} />
              </span>
            )}
          </div>
        )}

        {/* Cursor blink effect and animation styles */}
        <style>{`
          input::placeholder {
            color: ${colors.system};
            opacity: 0.6;
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          @keyframes loadingDots {
            0% { opacity: 0; }
            33% { opacity: 0.5; }
            66% { opacity: 1; }
            100% { opacity: 0; }
          }

          /* Dots animations now handled by JavaScript for better compatibility */
        `}</style>
      </div>
    </div>
  );
};

export default CleanTerminal;