import React, { useEffect, useRef } from 'react';
import { TerminalLine } from '../machines/types';

interface TerminalOutputProps {
  lines: TerminalLine[];
  welcomeLines: TerminalLine[];
  darkMode?: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ 
  lines, 
  welcomeLines,
  darkMode = true 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'success': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'info': return darkMode ? '#e0e0e0' : '#333333';
      case 'system': return '#6b7280';
      case 'input': return '#8B5CF6';
      case 'help-command': return darkMode ? '#ffffff' : '#000000';
      case 'info-labeled': return darkMode ? '#e0e0e0' : '#333333';
      default: return darkMode ? '#e0e0e0' : '#333333';
    }
  };

  const renderLine = (line: TerminalLine, index: number) => {
    // Handle special formatting for info-labeled type
    if (line.type === 'info-labeled' && typeof line.content === 'string') {
      const segments = line.content.split(' | ');
      return (
        <div 
          key={`line-${index}-${line.timestamp}`}
          style={{
            marginBottom: '2px',
            color: getLineColor(line.type),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {segments.map((segment, idx) => (
            <span key={idx}>
              {segment.includes(':') ? (
                <>
                  <span style={{ color: '#8B5CF6' }}>
                    {segment.split(':')[0]}:
                  </span>
                  <span>
                    {segment.substring(segment.indexOf(':') + 1)}
                  </span>
                </>
              ) : (
                <span>{segment}</span>
              )}
              {idx < segments.length - 1 && (
                <span style={{ color: '#8B5CF6' }}> | </span>
              )}
            </span>
          ))}
        </div>
      );
    }

    // Handle help-command formatting
    if (line.type === 'help-command' && typeof line.content === 'string') {
      const parts = line.content.split(' - ');
      if (parts.length === 2) {
        return (
          <div 
            key={`line-${index}-${line.timestamp}`}
            style={{
              marginBottom: '2px',
              color: getLineColor(line.type),
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            <span style={{ color: '#8B5CF6' }}>{parts[0]}</span>
            <span> - {parts[1]}</span>
          </div>
        );
      }
    }

    return (
      <div 
        key={`line-${index}-${line.timestamp}`}
        style={{
          marginBottom: '2px',
          color: getLineColor(line.type),
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {line.content}
      </div>
    );
  };

  return (
    <div 
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'clamp(8px, 3vw, 16px)',
        fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        fontSize: 'clamp(15px, 4vw, 18px)',
        lineHeight: '1.4'
      }}
    >
      {/* Welcome lines */}
      {welcomeLines.map((line, index) => renderLine(line, index))}
      
      {/* Separator if we have both welcome and regular lines */}
      {welcomeLines.length > 0 && lines.length > 0 && (
        <div style={{ marginBottom: '8px' }} />
      )}
      
      {/* Regular lines */}
      {lines.map((line, index) => renderLine(line, index + welcomeLines.length))}
    </div>
  );
};