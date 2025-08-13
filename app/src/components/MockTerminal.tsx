'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

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

  const mockLines = [
    { type: 'input', content: '$ aishi --version', delay: 0 },
    { type: 'success', content: 'Aishi v2.0 - Your inner AI (愛) companion', delay: 100 },
    { type: 'system', content: 'Built on 0G Network • Decentralized AI Infrastructure', delay: 200 },
    { type: 'empty', content: '', delay: 300 },
    { type: 'input', content: '$ dream-analyze --last', delay: 400 },
    { type: 'processing', content: '◉ Processing dream essence...', delay: 500 },
    { type: 'info', content: '✓ Personality traits evolving: +2 creativity, +1 empathy', delay: 600 },
    { type: 'empty', content: '', delay: 700 },
    { type: 'input', content: '$ chat --start --model shizuku', delay: 800 },
    { type: 'processing', content: '◉ Initializing Live2D companion...', delay: 900 },
    { type: 'success', content: '✓ Shizuku is ready to chat!', delay: 1000 },
    { type: 'empty', content: '', delay: 1100 },
    { type: 'input', content: '$ memory-status', delay: 1200 },
    { type: 'info', content: 'Daily memories: 42 | Monthly consolidations: 3', delay: 1300 },
    { type: 'info', content: 'Next consolidation: 2 days remaining', delay: 1400 },
    { type: 'empty', content: '', delay: 1500 },
    { type: 'input', content: '$ agent-info', delay: 1600 },
    { type: 'system', content: 'Agent #1337 • Intelligence: Level 7 • Dreams: 156', delay: 1700 },
    { type: 'success', content: 'Aishi is revolutionizing AI companionship_', delay: 1800 }
  ];

  const getLineColor = (type: string) => {
    switch(type) {
      case 'input': return colors.pearl;
      case 'success': return colors.success;
      case 'info': return colors.accent;
      case 'processing': return colors.accent;
      case 'system': return colors.silver;
      case 'error': return colors.error;
      default: return colors.pearl;
    }
  };

  return (
    <div style={{
      width,
      height,
      background: colors.glassBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${colors.borderSubtle}`,
      borderRadius: '20px',
      padding: '2rem',
      fontFamily: 'Inter, -apple-system, "SF Pro Display", system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: 300,
      lineHeight: 1.8,
      letterSpacing: '0.02em',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: `
        0 20px 60px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.02)
      `,
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Mock terminal lines - similar to MinimalOutput */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        color: colors.pearl
      }}>
        {mockLines.map((line, index) => (
          <div
            key={index}
            style={{
              color: getLineColor(line.type),
              marginBottom: line.type === 'empty' ? '0.5rem' : '0.5rem',
              opacity: 0,
              animation: `fadeInLine 0.3s ease forwards`,
              animationDelay: `${line.delay}ms`
            }}
          >
            {line.type === 'input' && line.content.startsWith('$ ') ? (
              <>
                <span style={{ opacity: 0.5 }}>$ </span>
                <span style={{ fontWeight: 400 }}>{line.content.substring(2)}</span>
              </>
            ) : (
              line.content
            )}
            {/* Add blinking cursor to last line */}
            {index === mockLines.length - 1 && (
              <span style={{
                animation: 'blink 1s infinite',
                marginLeft: '2px',
                opacity: 0.8
              }}>
                |
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bottom command bar area (mock) */}
      <div style={{
        borderTop: `1px solid ${colors.borderSubtle}`,
        paddingTop: '1.5rem',
        marginTop: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ color: colors.silver, fontSize: '14px', opacity: 0.5 }}>{'>'}</span>
          <span style={{ 
            color: colors.silver, 
            fontSize: '14px', 
            opacity: 0.5,
            fontStyle: 'italic'
          }}>
            Enter command...
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInLine {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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