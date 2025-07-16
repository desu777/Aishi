'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CommandProcessor } from '../../commands/CommandProcessor';
import { TerminalLine } from '../../commands/types';
import { useAgentMint } from '../../../hooks/agentHooks/useAgentMint';
import { useAgentRead } from '../../../hooks/agentHooks/useAgentRead';
import { useAgentDashboard } from '../../../hooks/useAgentDashboard';
import { useWallet } from '../../../hooks/useWallet';
import { formatAgentInfo } from '../../commands/info';
import { formatAgentStats } from '../../commands/stats';
import { formatSystemStatus } from '../../commands/status';
import { formatMemoryStatus } from '../../commands/memory';
import { formatHelpOutput } from '../../commands/help';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandProcessorRef = useRef(new CommandProcessor());
  
  // Agent hooks
  const { mintAgent, isLoading: isMinting, error: mintError, resetMint, isWalletConnected, hasCurrentBalance, isCorrectNetwork } = useAgentMint();
  const { hasAgent, agentData, isLoading: isLoadingAgent } = useAgentRead();
  const dashboardData = useAgentDashboard();
  
  // Wallet hook for broker commands
  const wallet = useWallet();
  
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
      const memoryAccess = agentData.memoryAccess?.monthsAccessible || 0;
      
      messages.push({
        type: 'info-labeled',
        content: `Network: 0G Galileo | Mood: ${dominantMood} | Memory: ${memoryAccess} months`,
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
  }, [hasAgent, agentData, isLoadingAgent]);

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
    
    return commandProcessorRef.current.commands.has(commandName);
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
            content: `✅ Agent "${pendingMintName}" minted successfully!`,
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
            content: `❌ Minting failed: ${result.error}`,
            timestamp: Date.now()
          });
        }
      } catch (error: any) {
        addLine({
          type: 'error',
          content: `❌ Minting error: ${error.message || error}`,
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

  // Enhanced command execution to handle mint confirmation
  const executeEnhancedCommand = async (command: string) => {
    const trimmedCommand = command.trim().toLowerCase();
    
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
        fontFamily: '"SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
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
            <span style={{ color: theme.accent.primary, marginRight: '8px' }}>$</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={false}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isValidCommand ? theme.accent.primary : colors.text,
                fontSize: 'clamp(15px, 4vw, 18px)',
                fontFamily: 'inherit',
                flex: 1,
                caretColor: theme.accent.primary
              }}
              placeholder={isLoading ? 'Processing...' : 'Type a command...'}
            />
            {isLoading && (
              <span style={{
                color: colors.system,
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                marginLeft: '8px'
              }}>
                ⏳
              </span>
            )}
          </div>
        )}

        {/* Cursor blink effect and loading animation */}
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
        `}</style>
      </div>
    </div>
  );
};

export default CleanTerminal;