import React, { useEffect, useRef } from 'react';
import { TerminalLine } from '../machines/types';

interface MinimalOutputProps {
  lines: TerminalLine[];
  welcomeLines: TerminalLine[];
}

const colors = {
  pearl: '#F0F0F0',
  silver: '#8A8A8A',
  slate: '#2D2D2D',
  success: '#22D3EE',
  error: '#F97316'
};

export const MinimalOutput: React.FC<MinimalOutputProps> = ({ lines, welcomeLines }) => {
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTo({
        top: outputRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [lines]);

  const getLineStyle = (type: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      marginBottom: '0.5rem',
      animation: 'fadeInLine 0.3s ease'
    };

    switch(type) {
      case 'system':
        return { ...baseStyle, color: colors.silver, fontSize: '13px', opacity: 0.7 };
      case 'input':
        return { ...baseStyle, color: colors.pearl, fontWeight: 400 };
      case 'output':
        return { ...baseStyle, color: colors.pearl, opacity: 0.9 };
      case 'error':
        return { ...baseStyle, color: colors.error, opacity: 0.8 };
      case 'success':
        return { ...baseStyle, color: colors.success, opacity: 0.8 };
      default:
        return { ...baseStyle, color: colors.pearl };
    }
  };

  const formatContent = (line: TerminalLine) => {
    // Clean, minimal formatting
    if (typeof line.content === 'string') {
      // Remove any command prefixes for cleaner look
      let content = line.content;
      if (content.startsWith('$ ')) {
        return (
          <>
            <span style={{ opacity: 0.5 }}>$ </span>
            <span style={{ fontWeight: 400 }}>{content.substring(2)}</span>
          </>
        );
      }
      return content;
    }
    return line.content;
  };

  const outputAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem',
    paddingBottom: 0,
    color: colors.pearl,
    fontFamily: 'Inter, -apple-system, "SF Pro Display", system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: 300,
    lineHeight: 1.8,
    letterSpacing: '0.02em'
  };

  return (
    <>
      <style jsx global>{`
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

        /* Custom Scrollbar */
        .minimal-output::-webkit-scrollbar {
          width: 8px;
        }
        
        .minimal-output::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .minimal-output::-webkit-scrollbar-thumb {
          background: ${colors.slate};
          border-radius: 4px;
        }
        
        .minimal-output::-webkit-scrollbar-thumb:hover {
          background: ${colors.silver};
        }
      `}</style>

      <div ref={outputRef} style={outputAreaStyle} className="minimal-output">
        {/* Welcome messages */}
        {welcomeLines.map((line, index) => (
          <div 
            key={`welcome-${index}`} 
            style={getLineStyle(line.type)}
          >
            {formatContent(line)}
          </div>
        ))}
        
        {/* Add spacing after welcome */}
        {welcomeLines.length > 0 && lines.length > 0 && (
          <div style={{ height: '1rem' }} />
        )}
        
        {/* Command lines */}
        {lines.map((line, index) => (
          <div 
            key={`line-${index}`} 
            style={getLineStyle(line.type)}
          >
            {formatContent(line)}
          </div>
        ))}
      </div>
    </>
  );
};