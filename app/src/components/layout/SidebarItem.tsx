'use client';

import React, { ReactNode, MouseEvent, CSSProperties } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  to?: string;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, to, onClick }: SidebarItemProps) => {
  const { theme, debugLog } = useTheme();
  
  // TODO: Replace with actual router logic
  const isActive = active !== undefined ? active : false;
  
  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    backgroundColor: isActive ? theme.bg.panel : 'transparent',  // Z /client
    color: isActive ? theme.accent.primary : theme.text.secondary,
    borderLeft: isActive ? `3px solid ${theme.accent.primary}` : '3px solid transparent',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    margin: '2px 0'
  };
  
  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    debugLog('Sidebar item clicked', { label, to });
    
    if (to) {
      e.preventDefault();
      // TODO: Add navigation logic
      console.log(`Navigate to: ${to}`);
    }
    if (onClick) onClick();
  };
  
  return (
    <div 
      style={itemStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = theme.bg.panel;
          e.currentTarget.style.color = theme.text.primary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = theme.text.secondary;
        }
      }}
    >
      {icon}
      <span style={{ marginLeft: '10px', fontSize: '14px' }}>
        {label}
      </span>
    </div>
  );
};

export default SidebarItem; 