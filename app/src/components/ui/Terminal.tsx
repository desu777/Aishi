'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface TerminalProps {
  darkMode?: boolean;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'system';
  content: string;
  timestamp?: number;
}

const Terminal: React.FC<TerminalProps> = ({
  darkMode = true,
  title = "Agent Dashboard — zsh — 80x24",
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
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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
      executeCommand(currentInput);
      setCurrentInput('');
    }
  };

  // Execute command
  const executeCommand = async (command: string) => {
    const trimmedCommand = command.trim();
    
    // Add input to history
    setLines(prev => [...prev, { 
      type: 'input', 
      content: `$ ${trimmedCommand}`,
      timestamp: Date.now()
    }]);

    if (!trimmedCommand) return;

    setIsLoading(true);

    // Simulate command processing
    setTimeout(() => {
      let output = '';
      
      switch (trimmedCommand.toLowerCase()) {
        case 'help':
          output = `Available commands:
  help        - Show this help message
  status      - Check agent status
  clear       - Clear terminal
  whoami      - Show current user
  ls          - List available functions
  agent info  - Show agent information`;
          break;
          
        case 'status':
          output = `🧠 Dream Agent Status:
├─ Agent: Not initialized
├─ Network: 0G Galileo Testnet
├─ Wallet: Connected
└─ Status: Ready to mint`;
          break;
          
        case 'clear':
          setLines([]);
          setIsLoading(false);
          return;
          
        case 'whoami':
          output = 'dreamscape-user@0xdreamscape';
          break;
          
        case 'ls':
          output = `analyze    history    insights    mint       status
dreams     patterns   evolution   backup     help`;
          break;
          
        case 'agent info':
          output = `🚫 No agent found for current wallet.
Run 'mint' to create your dream agent.`;
          break;
          
        default:
          if (trimmedCommand.startsWith('echo ')) {
            output = trimmedCommand.substring(5);
          } else {
            output = `zsh: command not found: ${trimmedCommand}`;
          }
      }
      
      setLines(prev => [...prev, { 
        type: 'output', 
        content: output,
        timestamp: Date.now()
      }]);
      setIsLoading(false);
    }, 200 + Math.random() * 800); // Realistic delay
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

  debugLog('Terminal rendered', { darkMode, linesCount: lines.length });

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
           {title}
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
                   line.type === 'input' ? colors.prompt : colors.text,
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

export default Terminal; 