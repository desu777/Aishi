'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import CleanTerminal from './components/terminal/CleanTerminal';
import ThemeToggle from './components/ui/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
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
            title={isMobile ? "Agent — zsh" : "Agent Dashboard — zsh — 80x24"}
          />
        </div>

        {/* Commands Panel */}
        {showCommands && (
          <div style={{
            marginTop: 'clamp(12px, 3vw, 20px)',
            padding: 'clamp(12px, 3vw, 16px)',
            borderRadius: '8px',
            backgroundColor: theme.bg.card,
            border: `1px solid ${theme.border}`,
            animation: 'fadeIn 0.3s ease'
          }}>
            <h3 style={{
              margin: '0 0 clamp(8px, 2vw, 12px) 0',
              color: theme.text.primary,
              fontSize: 'clamp(1rem, 3vw, 1.1rem)'
            }}>
              Available Commands
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(8px, 2vw, 12px)',
              fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
              color: theme.text.secondary
            }}>
              <div style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: theme.bg.panel,
                border: `1px solid ${theme.border}`
              }}>
                <strong style={{ color: theme.accent.primary }}>Agent Commands:</strong>
                <br />
                <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                  mint, info, stats, chat
                </span>
              </div>
              <div style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: theme.bg.panel,
                border: `1px solid ${theme.border}`
              }}>
                <strong style={{ color: theme.accent.primary }}>System Commands:</strong>
                <br />
                <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                  status, clear, help
                </span>
              </div>
              <div style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: theme.bg.panel,
                border: `1px solid ${theme.border}`
              }}>
                <strong style={{ color: theme.accent.primary }}>Memory Commands:</strong>
                <br />
                <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                  memory, consolidate
                </span>
              </div>
            </div>
            <div style={{
              marginTop: '12px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: theme.bg.panel,
              border: `1px solid ${theme.border}`,
              fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
              color: theme.text.secondary
            }}>
              <strong style={{ color: theme.accent.primary }}>Note:</strong> Commands will be integrated with real agent functionality. Type any command to see current status.
            </div>
          </div>
        )}

        {/* Quick Commands - Only show when commands panel is closed */}
        {!showCommands && (
          <div style={{
            marginTop: 'clamp(12px, 3vw, 20px)',
            padding: 'clamp(12px, 3vw, 16px)',
            borderRadius: '8px',
            backgroundColor: theme.bg.card,
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              margin: '0 0 clamp(8px, 2vw, 12px) 0',
              color: theme.text.primary,
              fontSize: 'clamp(1rem, 3vw, 1.1rem)'
            }}>
              Quick Commands
            </h3>
            <div style={{
              display: 'flex',
              gap: 'clamp(6px, 2vw, 12px)',
              flexWrap: 'wrap'
            }}>
              {['clear', 'help', 'status'].map((cmd) => (
                <span
                  key={cmd}
                  style={{
                    padding: 'clamp(3px, 1vw, 4px) clamp(6px, 2vw, 8px)',
                    borderRadius: '4px',
                    backgroundColor: theme.bg.panel,
                    color: theme.accent.primary,
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    fontFamily: 'monospace'
                  }}
                >
                  {cmd}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
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