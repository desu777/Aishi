'use client';

import React from 'react';
import { TerminalHeader } from './TerminalHeader';
import { TerminalOutput } from './TerminalOutput';
import { CommandInput } from './CommandInput';
import { useTerminal } from '../hooks/useTerminal';

interface TerminalProps {
  darkMode?: boolean;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  darkMode = true,
  title,
  width = '100%',
  height = '600px',
  className = ''
}) => {
  const { context, send, isProcessing } = useTerminal();

  const handleInputChange = (value: string) => {
    send({ type: 'INPUT.CHANGE', value });
  };

  const handleSubmit = () => {
    send({ type: 'INPUT.SUBMIT' });
  };

  const handleHistoryUp = () => {
    send({ type: 'HISTORY.UP' });
  };

  const handleHistoryDown = () => {
    send({ type: 'HISTORY.DOWN' });
  };

  const handleClear = () => {
    send({ type: 'CLEAR' });
  };

  const handleTerminalClick = (e: React.MouseEvent) => {
    // Focus input when clicking anywhere in terminal
    const input = e.currentTarget.querySelector('input');
    input?.focus();
  };

  const colors = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    text: darkMode ? '#e0e0e0' : '#333333',
    border: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  };

  return (
    <div 
      className={`terminal-container ${className}`}
      onClick={handleTerminalClick}
      style={{
        width,
        height,
        fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'text'
      }}
    >
      <TerminalHeader title={title} darkMode={darkMode} />
      
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.bg,
          color: colors.text,
          overflow: 'hidden'
        }}
      >
        <TerminalOutput 
          lines={context.lines}
          welcomeLines={context.welcomeLines}
          darkMode={darkMode}
        />
        
        <CommandInput
          value={context.currentInput}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onHistoryUp={handleHistoryUp}
          onHistoryDown={handleHistoryDown}
          onClear={handleClear}
          disabled={isProcessing}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};