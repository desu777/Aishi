'use client';

import React, { ReactNode, MouseEvent, CSSProperties } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  to?: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, to, isCollapsed, onClick }: SidebarItemProps) => {
  const { theme, debugLog } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if current route is active
  const isActive = active !== undefined ? active : (to === '/' ? pathname === '/' : pathname.startsWith(to || ''));
  
  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    padding: isCollapsed ? '12px' : '12px 20px',
    cursor: 'pointer',
    backgroundColor: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
    color: isActive ? '#8B5CF6' : theme.text.secondary,
    borderLeft: isActive ? `3px solid #8B5CF6` : '3px solid transparent',
    borderRadius: isCollapsed ? '8px' : '0 8px 8px 0',
    transition: 'all 0.3s ease-in-out',
    textDecoration: 'none',
    margin: isCollapsed ? '4px 8px' : '2px 0',
    position: 'relative',
    willChange: 'transform, background-color, box-shadow',
    // Dodajemy subtelny cień dla aktywnego elementu
    boxShadow: isActive ? `0 0 15px rgba(139, 92, 246, 0.15)` : 'none'
  };
  
  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    debugLog('Sidebar item clicked', { label, to, currentPath: pathname });
    
    if (to) {
      e.preventDefault();
      router.push(to);
    }
    if (onClick) onClick();
  };
  
  return (
    <div 
      style={itemStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isActive) {
          // Hover effect z fioletowym podświetleniem
          e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
          e.currentTarget.style.color = '#8B5CF6';
          e.currentTarget.style.transform = 'translateX(3px)';
          e.currentTarget.style.boxShadow = `0 0 20px rgba(139, 92, 246, 0.2)`;
          // Dodajemy subtelny border glow
          if (isCollapsed) {
            e.currentTarget.style.border = `1px solid rgba(139, 92, 246, 0.3)`;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          // Powrót do normalnego stanu
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = theme.text.secondary;
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'none';
          if (isCollapsed) {
            e.currentTarget.style.border = 'none';
          }
        }
      }}
      // Dodajemy tooltip dla collapsed items
      title={isCollapsed ? label : undefined}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '18px',
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </div>
      {!isCollapsed && (
        <span style={{ 
          marginLeft: '10px', 
          fontSize: '14px',
          transition: 'all 0.3s ease',
          fontWeight: isActive ? '500' : 'normal'
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default SidebarItem; 