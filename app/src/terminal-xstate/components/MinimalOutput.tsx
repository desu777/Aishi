import React, { useEffect, useRef, useState } from 'react';
import { TerminalLine } from '../machines/types';
import { CollapsibleText } from './CollapsibleText';

interface MinimalOutputProps {
  lines: TerminalLine[];
  welcomeLines: TerminalLine[];
  agentStatus?: string;
  agentName?: string | null;
  syncProgress?: string;
}

const colors = {
  pearl: '#F0F0F0',
  silver: '#8A8A8A',
  slate: '#2D2D2D',
  success: '#22D3EE',
  error: '#F97316',
  warning: '#FCD34D'
};

const MinimalOutputComponent: React.FC<MinimalOutputProps> = ({ 
  lines, 
  welcomeLines, 
  agentStatus = 'uninitialized',
  agentName,
  syncProgress 
}) => {
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
      case 'warning':
        return { ...baseStyle, color: colors.warning, opacity: 0.9 };
      default:
        return { ...baseStyle, color: colors.pearl };
    }
  };

  const formatTextWithAgentName = (content: string): React.ReactNode => {
    // Parse and format agent name in "~ name :" format
    const agentNameRegex = /~ ([^:]+) :/;
    const match = content.match(agentNameRegex);
    if (match) {
      const beforeAgent = content.substring(0, match.index);
      const agentName = match[1];
      const afterAgent = content.substring((match.index || 0) + match[0].length);
      
      return (
        <>
          {beforeAgent}
          <span style={{ color: colors.silver, opacity: 0.7 }}>~ </span>
          <span style={{ color: '#8B5CF6', fontWeight: 500 }}>{agentName}</span>
          <span style={{ color: colors.silver, opacity: 0.7 }}> : </span>
          {afterAgent}
        </>
      );
    }
    return content;
  };
  
  const formatContent = (line: TerminalLine) => {
    // Clean, minimal formatting
    if (typeof line.content === 'string') {
      let content = line.content;
      
      // Handle command prefixes
      if (content.startsWith('$ ')) {
        return (
          <>
            <span style={{ opacity: 0.5 }}>$ </span>
            <span style={{ fontWeight: 400 }}>{content.substring(2)}</span>
          </>
        );
      }
      
      // Check if this is a dream input or agent response (needs collapsing)
      const isDreamInput = line.type === 'input' && content.startsWith('~');
      const isAgentResponse = line.type === 'info' && content.includes('~ ') && content.includes(' :');
      const isPulsatingQuestion = content.includes('Do u wanna train');
      
      // Apply pulsating animation for training question
      if (isPulsatingQuestion) {
        return (
          <span className="pulsating-text">
            {formatTextWithAgentName(content)}
          </span>
        );
      }
      
      // Use CollapsibleText for long content
      if ((isDreamInput || isAgentResponse) && content.length > 400) {
        return (
          <CollapsibleText
            text={content}
            maxLength={400}
            formatContent={formatTextWithAgentName}
          />
        );
      }
      
      return formatTextWithAgentName(content);
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
        
        @keyframes pulsate {
          0%, 100% {
            opacity: 1;
            text-shadow: 0 0 4px #8B5CF6;
          }
          50% {
            opacity: 0.8;
            text-shadow: 0 0 12px #8B5CF6, 0 0 20px #8B5CF620;
          }
        }
        
        .pulsating-text {
          animation: pulsate 2s ease-in-out infinite;
          color: #8B5CF6;
          font-weight: 500;
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
        {/* Command lines only - status moved to AIOrb */}
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

export const MinimalOutput = React.memo(MinimalOutputComponent);