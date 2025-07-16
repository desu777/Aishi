'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import CleanTerminal from '../../agent_dashboard/components/terminal/CleanTerminal';
import ThemeToggle from '../../agent_dashboard/components/ui/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { Command, ChevronRight, ChevronDown } from 'lucide-react';

// CommandItem Component
interface CommandItemProps {
  command: string;
  description: string;
  theme: any;
}

const CommandItem: React.FC<CommandItemProps> = ({ command, description, theme }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: 'clamp(8px, 2vw, 12px)',
      backgroundColor: theme.bg.main,
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    }}>
      <code style={{
        color: theme.accent.primary,
        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 'bold'
      }}>
        {command}
      </code>
      <span style={{
        color: theme.text.secondary,
        fontSize: 'clamp(0.75rem, 2vw, 0.8rem)',
        lineHeight: '1.4'
      }}>
        {description}
      </span>
    </div>
  );
};

// CollapsibleSection Component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = false 
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{
      marginBottom: 'clamp(12px, 3vw, 16px)',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.bg.panel,
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: 'clamp(12px, 3vw, 16px)',
          backgroundColor: 'transparent',
          border: 'none',
          color: theme.text.primary,
          fontSize: 'clamp(1rem, 3.5vw, 1.1rem)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          zIndex: 2
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.bg.main;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span style={{ color: theme.accent.primary }}>{title}</span>
      </button>
      
      {isOpen && (
        <div style={{
          padding: 'clamp(12px, 3vw, 16px)',
          paddingTop: 0,
          animation: 'slideDown 0.25s ease',
          position: 'relative',
          zIndex: 1,
          animationFillMode: 'forwards'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default function AgentDashboard() {
  const { theme, debugLog } = useTheme();
  const [darkMode, setDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  
  // Debug log na start
  debugLog('Agent Dashboard page loaded');

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    debugLog('Terminal theme toggled', { darkMode: !darkMode });
  };

  const toggleCommands = () => {
    setShowCommands(!showCommands);
    debugLog('Commands panel toggled', { showCommands: !showCommands });
  };

  // Handle escape key to close commands modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCommands) {
        setShowCommands(false);
      }
    };

    if (showCommands) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showCommands]);

  return (
    <Layout>
      <div style={{
        padding: 'clamp(12px, 4vw, 20px)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            fontFamily: "'Orbitron', sans-serif",
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '8px',
            lineHeight: '1.2'
          }}>
            Agent Dashboard
          </h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
            color: theme.text.secondary,
            margin: '0 0 16px 0',
            lineHeight: '1.4'
          }}>
            Terminal interface for your AI dream agent
          </p>

          {/* Theme Toggle & Commands Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
            
            <button
              onClick={toggleCommands}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: showCommands ? theme.bg.panel : theme.bg.card,
                color: theme.text.primary,
                cursor: 'pointer',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.accent.primary;
                e.currentTarget.style.backgroundColor = theme.bg.panel;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.backgroundColor = showCommands ? theme.bg.panel : theme.bg.card;
              }}
            >
              <Command size={16} />
              Commands
            </button>
          </div>
        </div>

        {/* Terminal */}
        <div style={{
          width: '100%',
          height: 'clamp(400px, 60vh, 70vh)',
          minHeight: '350px'
        }}>
          <CleanTerminal 
            darkMode={darkMode}
            width="100%"
            height="100%"
          />
        </div>

        {/* Commands Modal */}
        {showCommands && (
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
                  fontFamily: "'Orbitron', sans-serif",
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
                        command="info"
                        description="Display comprehensive agent information and profile"
                        theme={theme}
                      />
                      <CommandItem 
                        command="stats"
                        description="Display comprehensive agent statistics and metrics"
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
        )}
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-8px);
            zIndex: 1;
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
            zIndex: 1;
          }
        }
        
        @media (max-width: 768px) {
          .commands-modal {
            width: 95vw !important;
            height: 90vh !important;
            background-color: ${theme.bg.card} !important;
          }
          
          .commands-video {
            display: none !important;
          }
          
          .commands-modal > div:nth-child(2) {
            background-color: rgba(0, 0, 0, 0.1) !important;
          }
        }
        
        @media (max-width: 480px) {
          .terminal-container {
            border-radius: 8px !important;
          }
        }
        
        @media (max-width: 320px) {
          .terminal-container {
            border-radius: 6px !important;
          }
        }
      `}</style>
    </Layout>
  );
}