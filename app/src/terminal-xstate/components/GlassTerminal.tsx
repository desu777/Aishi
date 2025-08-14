'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MinimalOutput } from './MinimalOutput';
import { PremiumCommandBar } from './PremiumCommandBar';
import { TerminalSystemHeader } from './TerminalSystemHeader';
import { useTerminal } from '../hooks/useTerminal';
import { useTerminalAgent } from '../hooks/useTerminalAgent';
import { zIndex } from '../../styles/zIndex';
import { useAccount } from 'wagmi';

interface GlassTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel?: string;
}

// Premium color palette
const colors = {
  noir: '#0A0A0A',
  charcoal: '#1A1A1A',
  slate: '#2D2D2D',
  silver: '#8A8A8A',
  pearl: '#F0F0F0',
  accent: '#8B5CF6',
  accentMuted: 'rgba(139, 92, 246, 0.1)',
  glassBg: 'rgba(26, 26, 26, 0.7)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)'
};

export const GlassTerminal: React.FC<GlassTerminalProps> = ({ isOpen, onClose, selectedModel }) => {
  const { context, send, state, brokerRef, modelRef } = useTerminal();
  const { agentName, isLoading: agentLoading } = useTerminalAgent();
  const { address, isConnected } = useAccount();
  const [orbState, setOrbState] = useState<'uninitialized' | 'idle' | 'processing' | 'success' | 'error'>('idle');
  
  // Map XState states to orb visual states
  useEffect(() => {
    if (state.matches('uninitialized')) {
      setOrbState('uninitialized');
    } else if (state.matches('processing')) {
      setOrbState('processing');
    } else if (state.matches('idle')) {
      setOrbState('idle');
    }
  }, [state]);

  // Handle command submission
  const handleSubmit = useCallback(() => {
    if (context.currentInput.trim()) {
      send({ type: 'INPUT.SUBMIT' });
      
      // Brief success state for visual feedback
      setOrbState('processing');
      setTimeout(() => {
        setOrbState('success');
        setTimeout(() => setOrbState('idle'), 500);
      }, 1000);
    }
  }, [context.currentInput, send]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    send({ type: 'INPUT.CHANGE', value });
  }, [send]);

  // Handle history navigation
  const handleHistoryUp = useCallback(() => {
    send({ type: 'HISTORY.UP' });
  }, [send]);

  const handleHistoryDown = useCallback(() => {
    send({ type: 'HISTORY.DOWN' });
  }, [send]);

  // Handle clear
  const handleClear = useCallback(() => {
    send({ type: 'CLEAR' });
  }, [send]);

  // Initialize broker when wallet is connected
  useEffect(() => {
    if (isConnected && address && brokerRef) {
      // Send initialize event to broker actor
      brokerRef.send({ type: 'INITIALIZE', walletAddress: address });
    }
  }, [isConnected, address, brokerRef]);
  
  // Update model in terminal when selectedModel changes
  useEffect(() => {
    if (selectedModel && modelRef) {
      modelRef.send({ type: 'SELECT_MODEL', modelId: selectedModel });
    }
  }, [selectedModel, modelRef]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Inline styles for glass terminal
  const glassTerminalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 10, 10, 0.4)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.terminal,
    animation: 'fadeIn 0.3s ease'
  };

  const terminalBodyStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: '1200px',
    height: '85vh',
    background: colors.glassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: `
      0 20px 60px rgba(0, 0, 0, 0.3),
      inset 0 0 0 1px rgba(255, 255, 255, 0.02)
    `,
    animation: 'slideUp 0.4s ease'
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: colors.slate,
    border: `1px solid ${colors.borderSubtle}`,
    color: colors.silver,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s ease',
    zIndex: 10
  };


  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={glassTerminalStyle}>
        <div style={terminalBodyStyle}>
          {/* Close Button */}
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="Close terminal"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.accentMuted;
              e.currentTarget.style.color = colors.pearl;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.slate;
              e.currentTarget.style.color = colors.silver;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Terminal Header */}
          <TerminalSystemHeader 
            agentName={agentName}
            isLoading={agentLoading}
            selectedModel={selectedModel}
            terminalState={state}
            brokerRef={brokerRef}
            modelRef={modelRef}
          />

          {/* Minimal Output */}
          <MinimalOutput 
            lines={context.lines}
            welcomeLines={context.welcomeLines}
          />

          {/* Premium Command Bar */}
          <PremiumCommandBar
            value={context.currentInput}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onHistoryUp={handleHistoryUp}
            onHistoryDown={handleHistoryDown}
            onClear={handleClear}
            disabled={state.matches('processing')}
          />
        </div>
      </div>
    </>
  );
};