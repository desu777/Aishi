'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ConnectButton from '../wallet/ConnectButton';
import WalletStatus from '../wallet/WalletStatus';

interface HeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

const Header = ({ toggleSidebar, isMobile }: HeaderProps) => {
  const { theme, debugLog } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  
  // Scroll listener for dynamic header transparency
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };
    
    // Check if sidebar is collapsed from localStorage
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    setSidebarWidth(collapsed ? 80 : 240);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px',
        paddingLeft: !isMobile ? `${sidebarWidth + 20}px` : '20px',
        boxShadow: scrolled 
          ? `0 1px 3px rgba(0, 0, 0, 0.1), inset 0 -1px 0 rgba(139, 92, 246, 0.1)` 
          : 'none',
        gap: '10px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
        backgroundColor: scrolled 
          ? 'rgba(10, 10, 10, 0.4)' 
          : 'rgba(10, 10, 10, 0.2)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(8px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease, padding-left 0.3s ease'
      }}
    >
      {/* Top row - Menu button and wallet */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Menu button on mobile */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.text.primary,
              padding: '8px'
            }}
          >
            <Menu size={24} />
          </button>
        )}
        
        {/* Spacer for desktop when no menu button */}
        {!isMobile && <div />}
        
        {/* Wallet Connect Button */}
        <ConnectButton />
      </div>
      
      {/* Wallet Status (shows when connecting or if there are issues) */}
      <WalletStatus />
    </div>
  );
};

export default Header; 