import React from 'react';
import { Terminal } from '../../../terminal-xstate/components/Terminal';

interface TerminalModalProps {
  isTerminalOpen: boolean;
  setIsTerminalOpen: (open: boolean) => void;
  darkMode: boolean;
  isMobile: boolean;
  theme: any;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ 
  isTerminalOpen, 
  setIsTerminalOpen, 
  darkMode, 
  isMobile, 
  theme 
}) => {
  if (!isTerminalOpen) return null;

  return (
    <div 
      className="terminal-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'terminalModalIn 0.3s ease',
        padding: isMobile ? '0' : '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsTerminalOpen(false);
        }
      }}
    >
      {/* Terminal Container */}
      <div 
        className="terminal-container"
        style={{
          width: isMobile ? '100%' : 'clamp(800px, 90vw, 1200px)',
          height: isMobile ? '100%' : 'clamp(500px, 80vh, 800px)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {/* Terminal Content */}
        <div style={{
          width: '100%',
          height: '100%'
        }}>
          <Terminal 
            darkMode={darkMode}
            width="100%"
            height="100%"
          />
        </div>
      </div>
      
      {/* Close Button - Floating */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1501
      }}>
        <button
          onClick={() => setIsTerminalOpen(false)}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: theme.bg.card,
            border: `1px solid ${theme.border}`,
            color: theme.text.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.accent.primary;
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.card;
            e.currentTarget.style.color = theme.text.primary;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};