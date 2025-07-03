'use client';

import React, { CSSProperties } from 'react';
import { Home, Upload, History, Settings, X, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isOpen, isMobile, isCollapsed, onClose, onToggleCollapse }: SidebarProps) => {
  const { theme, debugLog } = useTheme();
  const router = useRouter();
  
  // Compute sidebar styles based on state
  const sidebarStyle: CSSProperties = {
    width: isCollapsed ? '80px' : '240px',
    backgroundColor: theme.bg.card,      // Z /client
    borderRight: `1px solid ${theme.border}`,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: isMobile ? 'fixed' : 'fixed',
    top: 0,
    left: 0,
    zIndex: 50,
    transition: 'all 0.3s ease',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    boxShadow: isMobile && isOpen ? '0 0 15px rgba(0, 0, 0, 0.1)' : 'none',
    overflowY: 'auto'
  };
  
  const handleLogoClick = (): void => {
    debugLog('Logo clicked - navigating to home');
    router.push('/');
    if (isMobile) onClose();
  };

  return (
    <div style={sidebarStyle}>
      {/* Close button (mobile only) */}
      {isMobile && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: theme.text.secondary,
            cursor: 'pointer',
            zIndex: 2,
            padding: '8px'
          }}
        >
          <X size={20} />
        </button>
      )}

      {/* Collapse button (desktop only) */}
      {!isMobile && (
        <button
          onClick={onToggleCollapse}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: theme.bg.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            color: theme.text.primary,
            cursor: 'pointer',
            zIndex: 2,
            padding: '6px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.accent.primary;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.panel;
            e.currentTarget.style.color = theme.text.primary;
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}
      
      {/* Logo/Brand Section */}
      <div 
        style={{ 
          padding: isCollapsed ? '0 10px' : '0 20px', 
          paddingTop: isCollapsed ? '60px' : '50px', // Więcej miejsca gdy collapsed
          marginBottom: isCollapsed ? '20px' : '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={handleLogoClick}
      >
        {/* Dream Agent Avatar */}
        <div style={{ 
          position: 'relative', 
          marginBottom: isCollapsed ? '10px' : '15px',
          width: isCollapsed ? '40px' : '120px',
          height: isCollapsed ? '40px' : '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/logo.png" 
            alt="Dreamscape Logo" 
            style={{
              width: isCollapsed ? '40px' : '140px',
              height: isCollapsed ? '40px' : '140px',
              objectFit: 'contain',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
        
        {!isCollapsed && (
          <span style={{
            fontSize: '13px',
            color: theme.text.secondary,
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Your Personal AI Dream Agent
          </span>
        )}
      </div>
      
      {/* Navigation Items */}
      <div style={{ flex: 1 }}>
        <SidebarItem 
          icon={<Home size={18} />} 
          label="Home" 
          to="/"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<User size={18} />} 
          label="Agent Dashboard" 
          to="/dream-agent"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<Upload size={18} />} 
          label="Upload Dream" 
          to="/upload"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<History size={18} />} 
          label="Dream History" 
          to="/history"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<Settings size={18} />} 
          label="Settings" 
          to="/settings"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
      </div>
      
      {/* Footer */}
      <div style={{ 
        paddingLeft: isCollapsed ? '10px' : '20px',
        paddingRight: isCollapsed ? '10px' : '20px',
        paddingBottom: '0',
        paddingTop: '20px',
        marginTop: '20px',
        borderTop: `1px solid ${theme.border}`
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '8px',
          opacity: 0.8,
          fontSize: isCollapsed ? '10px' : '12px',
          color: theme.text.secondary,
          transition: 'all 0.3s ease'
        }}>
          {isCollapsed ? (
            <span style={{ 
              writingMode: 'vertical-rl' as any,
              textOrientation: 'mixed' as any,
              fontSize: '10px',
              lineHeight: '1.2'
            }}>
              0G
            </span>
          ) : (
            <span>Powered by 0G Network</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 