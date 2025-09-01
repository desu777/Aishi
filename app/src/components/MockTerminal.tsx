'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Image from 'next/image';

interface MockTerminalProps {
  width?: string;
  height?: string;
}

// Premium color palette - identical to GlassTerminal
const colors = {
  noir: '#0A0A0A',
  charcoal: '#1A1A1A',
  slate: '#2D2D2D',
  silver: '#8A8A8A',
  pearl: '#F0F0F0',
  accent: '#8B5CF6',
  accentMuted: 'rgba(139, 92, 246, 0.1)',
  glassBg: 'rgba(26, 26, 26, 0.7)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  success: '#22D3EE',
  error: '#F97316'
};

export const MockTerminal: React.FC<MockTerminalProps> = ({ 
  width = '100%', 
  height = '100%' 
}) => {
  const { theme } = useTheme();

  return (
    <div style={{
      width,
      height,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 0G Logo - underneath the blur */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        minWidth: '200px',
        opacity: 0.3,
        zIndex: 0,
        animation: 'pulse 4s ease-in-out infinite'
      }}>
        <Image 
          src="/og.png" 
          alt="0G Network"
          width={600}
          height={600}
          style={{
            width: '100%',
            height: 'auto',
            filter: 'brightness(1.2)'
          }}
        />
      </div>

      {/* Glass terminal overlay */}
      <div style={{
        width: '100%',
        height: '100%',
        background: colors.glassBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: '20px',
        padding: '2rem',
        position: 'relative',
        boxShadow: `
          0 20px 60px rgba(0, 0, 0, 0.3),
          inset 0 0 0 1px rgba(255, 255, 255, 0.02)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
      }}>
        {/* Minimal terminal indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          <span style={{ 
            color: colors.accent, 
            fontSize: '18px',
            fontWeight: 300,
            letterSpacing: '0.1em',
            opacity: 0.8
          }}>
            AISHI TERMINAL
          </span>
        </div>

        {/* Command prompt */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 2rem',
          background: 'rgba(139, 92, 246, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${colors.borderSubtle}`
        }}>
          <span style={{ color: colors.accent, fontSize: '14px', opacity: 0.7 }}>{'>'}</span>
          <span style={{ 
            color: colors.silver, 
            fontSize: '14px', 
            opacity: 0.5,
            fontStyle: 'italic'
          }}>
            Initializing...
          </span>
          <span style={{
            animation: 'blink 1s infinite',
            color: colors.accent,
            opacity: 0.8
          }}>
            |
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MockTerminal;