/**
 * @fileoverview Terminal System Header Component
 * @description Clean, minimalist header showing system info and agent sync status
 */

import React from 'react';

interface TerminalSystemHeaderProps {
  agentName: string | null;
  isLoading: boolean;
}

const colors = {
  accent: '#8B5CF6',
  silver: '#8A8A8A',
  borderSubtle: 'rgba(255, 255, 255, 0.05)'
};

export const TerminalSystemHeader: React.FC<TerminalSystemHeaderProps> = ({ 
  agentName, 
  isLoading 
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: `1px solid ${colors.borderSubtle}`,
      gap: '1rem',
      background: 'rgba(0, 0, 0, 0.2)'
    }}>
      {/* Logo */}
      <img 
        src="/logo_clean.png" 
        alt="Aishi"
        style={{ 
          height: '32px',
          width: 'auto',
          objectFit: 'contain',
          opacity: 0.9
        }} 
      />
      
      {/* System Info */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          color: colors.accent,
          fontSize: '1.1rem',
          fontWeight: '600',
          fontFamily: 'monospace',
          letterSpacing: '0.05em'
        }}>
          aishiOS v1.0
        </div>
        <div style={{ 
          color: colors.silver,
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          opacity: 0.8
        }}>
          Synced: {isLoading ? 'Loading...' : (agentName || 'No Agent')}
        </div>
      </div>
    </div>
  );
};