'use client';

import React, { CSSProperties } from 'react';
import { Home, Upload, History, Settings, X, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, isMobile, onClose }: SidebarProps) => {
  const { theme, debugLog } = useTheme();
  
  // Compute sidebar styles based on state
  const sidebarStyle: CSSProperties = {
    width: '240px',
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
    transition: 'transform 0.3s ease',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    boxShadow: isMobile && isOpen ? '0 0 15px rgba(0, 0, 0, 0.1)' : 'none',
    overflowY: 'auto'
  };
  
  const handleLogoClick = (): void => {
    debugLog('Logo clicked - navigating to home');
    // TODO: Add navigation
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
      
      {/* Logo/Brand Section */}
      <div 
        style={{ 
          padding: '0 20px', 
          marginBottom: '30px',
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
          marginBottom: '15px',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/logo.png" 
            alt="Dreamscape Logo" 
            style={{
              width: '140px',
              height: '140px',
              objectFit: 'contain'
            }}
          />
        </div>
        
        <span style={{
          fontSize: '13px',
          color: theme.text.secondary,
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Your Personal AI Dream Agent
        </span>
      </div>
      
      {/* Navigation Items */}
      <div style={{ flex: 1 }}>
        <SidebarItem 
          icon={<Home size={18} />} 
          label="Home" 
          to="/"
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<User size={18} />} 
          label="My Agent" 
          to="/agent"
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<Upload size={18} />} 
          label="Upload Dream" 
          to="/upload"
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<History size={18} />} 
          label="Dream History" 
          to="/history"
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<Settings size={18} />} 
          label="Settings" 
          to="/settings"
          onClick={isMobile ? onClose : undefined}
        />
      </div>
      
      {/* Footer */}
      <div style={{ 
        padding: '0 20px', 
        marginTop: '20px',
        borderTop: `1px solid ${theme.border}`,
        paddingTop: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.8,
          fontSize: '12px',
          color: theme.text.secondary
        }}>
          <span>Powered by 0G Network</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 