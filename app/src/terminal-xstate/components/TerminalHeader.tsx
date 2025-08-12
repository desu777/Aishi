import React from 'react';

interface TerminalHeaderProps {
  title?: string;
  darkMode?: boolean;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ 
  title = "AgentOS Terminal — zeroG — 80x24",
  darkMode = true 
}) => {
  return (
    <div 
      style={{
        height: 'clamp(24px, 5vw, 28px)',
        background: darkMode ? '#2d2d2d' : '#f6f6f6',
        borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'clamp(8px, 2vw, 12px)',
        paddingRight: 'clamp(8px, 2vw, 12px)',
        justifyContent: 'space-between'
      }}
    >
      {/* Traffic Lights - Triple Violet Theme (matching old terminal exactly) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(4px, 1.5vw, 8px)',
          flexShrink: 0
        }}
      >
        {/* Light Violet */}
        <div 
          style={{
            width: 'clamp(8px, 2.5vw, 12px)',
            height: 'clamp(8px, 2.5vw, 12px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E9D5FF, #FDF2F8)',
            border: '0.5px solid #E9D5FF',
            boxShadow: '0 0 4px rgba(233, 213, 255, 0.2)'
          }} 
        />
        {/* Medium Violet */}
        <div 
          style={{
            width: 'clamp(8px, 2.5vw, 12px)',
            height: 'clamp(8px, 2.5vw, 12px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6, #E9D5FF)',
            border: '0.5px solid #8B5CF6',
            boxShadow: '0 0 4px rgba(139, 92, 246, 0.2)'
          }} 
        />
        {/* Deep Violet */}
        <div 
          style={{
            width: 'clamp(8px, 2.5vw, 12px)',
            height: 'clamp(8px, 2.5vw, 12px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            border: '0.5px solid #7C3AED',
            boxShadow: '0 0 4px rgba(124, 58, 237, 0.2)'
          }} 
        />
      </div>

      {/* Title */}
      <div 
        style={{
          fontSize: 'clamp(12px, 3vw, 15px)',
          color: darkMode ? '#ffffff' : '#000000',
          fontWeight: '500',
          textAlign: 'center',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingLeft: 'clamp(8px, 2vw, 12px)',
          paddingRight: 'clamp(8px, 2vw, 12px)'
        }}
      >
        {title}
      </div>

      <div style={{ width: 'clamp(32px, 8vw, 60px)' }} />
    </div>
  );
};