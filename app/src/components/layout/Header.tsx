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
  
  // Scroll listener for dynamic header transparency
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px',
        borderBottom: scrolled ? `1px solid ${theme.border}` : 'none',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: scrolled ? theme.bg.main : 'rgba(10, 10, 10, 0.3)',
        backdropFilter: scrolled ? 'none' : 'blur(10px)',
        transition: 'all 0.3s ease'
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