import React from 'react';

interface CommandItemProps {
  command: string;
  description: string;
  theme: any;
}

export const CommandItem: React.FC<CommandItemProps> = ({ command, description, theme }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: 'clamp(8px, 2vw, 12px)',
      backgroundColor: theme.bg.main,
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    }}>
      <code style={{
        color: theme.accent.primary,
        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 'bold'
      }}>
        {command}
      </code>
      <span style={{
        color: theme.text.secondary,
        fontSize: 'clamp(0.75rem, 2vw, 0.8rem)',
        lineHeight: '1.4'
      }}>
        {description}
      </span>
    </div>
  );
};