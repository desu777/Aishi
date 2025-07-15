'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CommandProcessor } from '../../commands/CommandProcessor';
import { TerminalLine } from '../../commands/types';
import { useAgentMint } from '../../../hooks/agentHooks/useAgentMint';
import { useAgentRead } from '../../../hooks/agentHooks/useAgentRead';

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
  const [lines, setLines] = useState<TerminalLine[]>([
    { 
      type: 'system', 
      content: 'Last login: Fri Dec 13 14:27:54 on dreamscape', 
      timestamp: Date.now() 
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMintName, setPendingMintName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandProcessorRef = useRef(new CommandProcessor());
  
  // Agent hooks
  const { mintAgent, isLoading: isMinting, error: mintError, resetMint, isWalletConnected, hasCurrentBalance, isCorrectNetwork } = useAgentMint();
  const { hasAgent, agentData, isLoading: isLoadingAgent } = useAgentRead();

  // Generate dynamic title based on agent status
  const getTerminalTitle = (): string => {
    if (hasAgent && agentData?.agentName) {
      return `${agentData.agentName} — zeroG — 80x24`;
    }
    return title || "Agent Dashboard — zeroG — 80x24";
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

  // Handle command input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeEnhancedCommand(currentInput);
      setCurrentInput('');
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
        currentUser: 'user'
      });

      // Handle special clear command
      if (result.output === '__CLEAR__') {
        setLines([]);
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
        {/* Terminal Lines */}
        {lines.map((line, index) => (
          <div key={index} style={{
            marginBottom: '2px',
            color: line.type === 'system' ? colors.system : 
                   line.type === 'input' ? colors.prompt :
                   line.type === 'error' ? '#ff6b6b' :
                   line.type === 'success' ? '#51cf66' :
                   line.type === 'warning' ? '#ffd43b' :
                   line.type === 'info' ? theme.accent.primary :
                   colors.text,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {line.content}
          </div>
        ))}

        {/* Current Input Line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '4px'
        }}>
          <span style={{ color: colors.prompt, marginRight: '8px' }}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: colors.text,
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

        {/* Cursor blink effect */}
        <style jsx>{`
          input::placeholder {
            color: ${colors.system};
            opacity: 0.6;
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CleanTerminal;