import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = false 
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{
      marginBottom: 'clamp(12px, 3vw, 16px)',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.bg.panel,
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: 'clamp(12px, 3vw, 16px)',
          backgroundColor: 'transparent',
          border: 'none',
          color: theme.text.primary,
          fontSize: 'clamp(1rem, 3.5vw, 1.1rem)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          zIndex: 2
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.bg.main;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span style={{ color: theme.accent.primary }}>{title}</span>
      </button>
      
      {isOpen && (
        <div style={{
          padding: 'clamp(12px, 3vw, 16px)',
          paddingTop: 0,
          animation: 'slideDown 0.25s ease',
          position: 'relative',
          zIndex: 1,
          animationFillMode: 'forwards'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};