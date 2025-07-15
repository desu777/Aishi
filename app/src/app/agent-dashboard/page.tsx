'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import CleanTerminal from '../../agent_dashboard/components/terminal/CleanTerminal';
import ThemeToggle from '../../agent_dashboard/components/ui/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { Command } from 'lucide-react';

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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            <div style={{
              backgroundColor: theme.bg.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: 'clamp(20px, 5vw, 32px)',
              width: 'clamp(300px, 90vw, 500px)',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.3s ease'
            }}>
              <h3 style={{
                margin: '0 0 clamp(16px, 4vw, 24px) 0',
                color: theme.text.primary,
                fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Available Commands
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(12px, 3vw, 16px)'
              }}>
                {/* Mint Command */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: 'clamp(12px, 3vw, 16px)',
                  backgroundColor: theme.bg.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}>
                  <code style={{
                    color: theme.accent.primary,
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}>
                    mint &lt;name&gt;
                  </code>
                  <span style={{
                    color: theme.text.secondary,
                    fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    lineHeight: '1.4'
                  }}>
                    Mint a new AI dream agent with the specified name
                  </span>
                </div>
                
                {/* Clear Command */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: 'clamp(12px, 3vw, 16px)',
                  backgroundColor: theme.bg.panel,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}>
                  <code style={{
                    color: theme.accent.primary,
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}>
                    clear
                  </code>
                  <span style={{
                    color: theme.text.secondary,
                    fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
                    lineHeight: '1.4'
                  }}>
                    Clear terminal output and command history
                  </span>
                </div>
              </div>
              
              {/* Close hint */}
              <div style={{
                marginTop: 'clamp(16px, 4vw, 24px)',
                padding: 'clamp(8px, 2vw, 12px)',
                backgroundColor: theme.bg.main,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                color: theme.text.secondary
              }}>
                Press <kbd style={{
                  backgroundColor: theme.bg.panel,
                  color: theme.text.primary,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  fontFamily: 'monospace'
                }}>Esc</kbd> or click outside to close
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