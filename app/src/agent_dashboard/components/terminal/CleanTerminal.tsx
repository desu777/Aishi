'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaBrain, FaDatabase, FaClock, FaLink, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [welcomeLines, setWelcomeLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSystemLoading, setIsSystemLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingMintName, setPendingMintName] = useState<string | null>(null);
  const [isValidCommand, setIsValidCommand] = useState(false);
  // Dream input mode state
  const [dreamInputMode, setDreamInputMode] = useState(false);
  const [dreamInputText, setDreamInputText] = useState('');
  const [processingDream, setProcessingDream] = useState(false);
  const [pendingDreamSave, setPendingDreamSave] = useState<any>(null);
  const [thinkingTimer, setThinkingTimer] = useState(0);
  const [savingDream, setSavingDream] = useState(false);
  const [evolvingDream, setEvolvingDream] = useState(false);
  const [dotsPattern, setDotsPattern] = useState(0); // 0='.', 1='..', 2='...', 3=''
  const [thinkingMessageId, setThinkingMessageId] = useState<number | null>(null);
  const [learningMessageId, setLearningMessageId] = useState<number | null>(null);
  const [evolutionMessageId, setEvolutionMessageId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandProcessorRef = useRef(new CommandProcessor());
  const dotsTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Expose wallet context to global window for commands
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__DREAMSCAPE_WALLET_CONTEXT__ = wallet;
    }
  }, [wallet]);

  // Check if mobile for shorter title
  const [isMobile, setIsMobile] = useState(false);
  
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
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
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
    const patterns = ['.', '..', '...', ''];
    return patterns[dotsPattern];
  };

  // Start/stop dots animation
  useEffect(() => {
    if (processingDream || savingDream || evolvingDream) {
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
  }, [processingDream, savingDream, evolvingDream]);

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

  // Save command to history and localStorage
  const saveCommandToHistory = useCallback((command: string) => {
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
  }, [debugLog]);

  // Handle keyboard input including arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Dream input mode handling
    if (dreamInputMode) {
      if (e.key === 'Enter') {
        if (currentInput.trim()) {
          // Start dream analysis workflow
          executeDreamAnalysis(currentInput.trim());
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
        saveCommandToHistory(currentInput);
      }
      executeEnhancedCommand(currentInput);
      setCurrentInput('');
      setIsValidCommand(false);
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
        setIsValidCommand(validateCommand(commandHistory[newIndex]));
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
          setIsValidCommand(validateCommand(commandHistory[newIndex]));
        }
      }
    } else if (e.key === 'Escape') {
      setCurrentInput('');
      setIsValidCommand(false);
      setHistoryIndex(-1);
    }
  };

  // Validate command in real-time
  const validateCommand = (input: string): boolean => {
    const trimmed = input.trim();
    if (!trimmed) return false;
    
    // System commands
    if (['clear', 'help'].includes(trimmed.toLowerCase())) return true;
    
    // Regular commands
    const parts = trimmed.split(' ');
    const commandName = parts[0].toLowerCase();
    
    return commandProcessorRef.current.getAvailableCommands().some(cmd => cmd.name === commandName);
  };

  // Handle input changes (reset history when typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);
    setIsValidCommand(validateCommand(value));
    
    if (historyIndex !== -1) {
      setHistoryIndex(-1); // Exit history mode when typing
    }
  };

  // Add line to terminal
  const addLine = (line: TerminalLine) => {
    setLines(prev => [...prev, line]);
  };

  // Execute command using CommandProcessor
  const executeCommand = async (command: string) => {
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

        // Store the agent name for confirmation
        setPendingMintName(agentName);
        
        addLine({
          type: 'info',
          content: `Ready to mint agent "${agentName}"`,
          timestamp: Date.now()
        });
        
        addLine({
          type: 'warning',
          content: 'are u sure? yes/no',
          timestamp: Date.now()
        });
      } else if (result.requiresConfirmation && result.confirmationPrompt) {
        // General confirmation flow for all commands (not just mint)
        addLine({
          type: result.type,
          content: result.output,
          timestamp: Date.now()
        });
        
        addLine({
          type: 'warning',
          content: result.confirmationPrompt,
          timestamp: Date.now()
        });
      } else if (result.output) {
        addLine({
          type: result.type,
          content: result.output,
          timestamp: Date.now()
        });
      }
      
    } catch (error: any) {
      addLine({
        type: 'error',
        content: `Error: ${error.message || error}`,
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mint confirmation
  const handleMintConfirmation = async (confirmed: boolean) => {
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
            content: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheckCircle style={{ color: '#22C55E' }} />
                Agent "{pendingMintName}" minted successfully!
              </span>
            ),
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
            content: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTimesCircle style={{ color: '#EF4444' }} />
                Minting failed: {result.error}
              </span>
            ),
            timestamp: Date.now()
          });
        }
      } catch (error: any) {
        addLine({
          type: 'error',
          content: (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaTimesCircle style={{ color: '#EF4444' }} />
              Minting error: {error.message || error}
            </span>
          ),
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

  // Dream analysis workflow - simplified UX
  const executeDreamAnalysis = async (dreamInput: string) => {
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

  // Handler for dream save confirmation
  const handleDreamSaveConfirmation = async (confirmed: boolean) => {
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

  // Enhanced command execution to handle mint confirmation
  const executeEnhancedCommand = async (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();
    
    // Handle dream save confirmation
    if (pendingDreamSave) {
      if (trimmedCommand === 'yes' || trimmedCommand === 'y') {
        await handleDreamSaveConfirmation(true);
        return;
      } else if (trimmedCommand === 'no' || trimmedCommand === 'n') {
        await handleDreamSaveConfirmation(false);
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
        await handleMintConfirmation(true);
        return;
      } else if (trimmedCommand === 'no' || trimmedCommand === 'n') {
        await handleMintConfirmation(false);
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
    
    await executeCommand(command);
  };

  // Terminal colors based on mode
  const terminalColors = {
    dark: {
      bg: '#1e1e1e',
      text: '#ffffff',
      prompt: theme.accent.primary,
      system: '#8a8a8a',
      border: '#3a3a3a'
    },
    light: {
      bg: '#ffffff',
      text: '#000000', 
      prompt: theme.accent.primary,
      system: '#6a6a6a',
      border: '#d1d1d1'
    }
  };

  const colors = darkMode ? terminalColors.dark : terminalColors.light;

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
              {(processingDream || savingDream || evolvingDream) ? <FaBrain /> : dreamInputMode ? '~' : '$'}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading || processingDream || savingDream || evolvingDream}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: dreamInputMode ? theme.accent.primary : (isValidCommand ? theme.accent.primary : colors.text),
                fontSize: 'clamp(15px, 4vw, 18px)',
                fontFamily: 'inherit',
                flex: 1,
                caretColor: theme.accent.primary,
                opacity: (isLoading || processingDream || savingDream || evolvingDream) ? 0.5 : 1
              }}
              placeholder={
                processingDream ? `${agentData?.agentName || 'Agent'} is thinking${getDots()}` :
                evolvingDream ? `${agentData?.agentName || 'Agent'} is evolving${getDots()}` :
                savingDream ? `${agentData?.agentName || 'Agent'} is learning${getDots()}` :
                isLoading ? 'Processing...' :
                pendingDreamSave ? 'Answer y/n to train agent...' :
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
        <style jsx>{`
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