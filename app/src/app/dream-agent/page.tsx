'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Terminal from '../../components/ui/Terminal';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function AgentDashboard() {
  const { theme, debugLog } = useTheme();
  const [darkMode, setDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
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

          {/* Theme Toggle - moved under text */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg.card,
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
              e.currentTarget.style.backgroundColor = theme.bg.card;
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Terminal */}
        <div style={{
          width: '100%',
          height: 'clamp(400px, 60vh, 70vh)',
          minHeight: '350px'
        }}>
          <Terminal 
            darkMode={darkMode}
            width="100%"
            height="100%"
            title={isMobile ? "Agent — zsh" : "Agent Dashboard — zsh — 80x24"}
          />
        </div>

        {/* Quick Commands */}
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
            {['help', 'status', 'agent info', 'clear'].map((cmd) => (
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
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
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