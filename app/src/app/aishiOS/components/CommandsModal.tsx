import React from 'react';
import { CommandItem } from './CommandItem';
import { CollapsibleSection } from './CollapsibleSection';

interface CommandsModalProps {
  showCommands: boolean;
  setShowCommands: (show: boolean) => void;
  theme: any;
}

export const CommandsModal: React.FC<CommandsModalProps> = ({ 
  showCommands, 
  setShowCommands, 
  theme 
}) => {
  if (!showCommands) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowCommands(false);
        }
      }}
    >
      <div className="commands-modal" style={{
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        width: 'clamp(700px, 90vw, 900px)',
        height: 'clamp(500px, 70vh, 80vh)',
        maxWidth: '90vw',
        maxHeight: '80vh',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        animation: 'slideIn 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1001
      }}>
        {/* Video Background - Desktop only */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="commands-video"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
            opacity: 0.3
          }}
        >
          <source src="/pendi-bg.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        
        {/* Commands Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          padding: 'clamp(20px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          isolation: 'isolate'
        }}>
          <h3 style={{
            margin: '0 0 clamp(16px, 4vw, 24px) 0',
            color: theme.text.primary,
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Available Commands
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 2vw, 12px)',
            flex: 1
          }}>
            {/* Agent Commands Section */}
            <CollapsibleSection title="Agent Commands" defaultOpen={false}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 2vw, 12px)'
              }}>
                <CommandItem 
                  command="mint <name>"
                  description="Mint a new AI dream agent with the specified name"
                  theme={theme}
                />
                <CommandItem 
                  command="agent-info"
                  description="Display core agent information in cyberpunk style"
                  theme={theme}
                />
                <CommandItem 
                  command="personality"
                  description="Display personality of your agent"
                  theme={theme}
                />
                <CommandItem 
                  command="status"
                  description="Display system health and connectivity status"
                  theme={theme}
                />
                <CommandItem 
                  command="memory"
                  description="Display memory system information and status"
                  theme={theme}
                />
                <CommandItem 
                  command="dream"
                  description="Analyze your dream with AI - interactive dream input mode"
                  theme={theme}
                />
                <CommandItem 
                  command="chat"
                  description="Start a conversation with your AI agent - interactive chat mode"
                  theme={theme}
                />
              </div>
            </CollapsibleSection>

            {/* Broker Commands Section */}
            <CollapsibleSection title="Broker Commands" defaultOpen={false}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 2vw, 12px)'
              }}>
                <CommandItem 
                  command="create-broker"
                  description="Create a new 0G compute broker"
                  theme={theme}
                />
                <CommandItem 
                  command="check-balance"
                  description="Check broker balance and transaction history"
                  theme={theme}
                />
                <CommandItem 
                  command="fund-broker <amount>"
                  description="Fund broker with specified amount of 0G tokens"
                  theme={theme}
                />
              </div>
            </CollapsibleSection>

            {/* System Commands Section */}
            <CollapsibleSection title="System Commands" defaultOpen={false}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 2vw, 12px)'
              }}>
                <CommandItem 
                  command="help"
                  description="Show available commands and usage information"
                  theme={theme}
                />
                <CommandItem 
                  command="clear"
                  description="Clear terminal output and command history"
                  theme={theme}
                />
              </div>
            </CollapsibleSection>
          </div>
          
          {/* Close hint */}
          <div style={{
            marginTop: 'clamp(16px, 4vw, 24px)',
            padding: 'clamp(8px, 2vw, 12px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
            color: theme.text.secondary
          }}>
            Press <kbd style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: theme.text.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: "'JetBrains Mono', monospace"
            }}>Esc</kbd> or click outside to close
          </div>
        </div>
      </div>
    </div>
  );
};