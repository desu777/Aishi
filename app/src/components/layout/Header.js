'use client';

import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ConnectButton from '../wallet/ConnectButton';
import WalletStatus from '../wallet/WalletStatus';

const Header = ({ toggleSidebar, isMobile }) => {
  const { theme, debugLog } = useTheme();
  
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px',
        borderBottom: `1px solid ${theme.border}`,
        gap: '10px',
        position: 'relative',
        zIndex: 10,
        backgroundColor: theme.bg.main
      }}
    >
      {/* Top row - Menu button, search, and wallet */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flex: 1
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
          
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.bg.card,
            borderRadius: '12px',
            padding: '8px 12px',
            border: `1px solid ${theme.border}`,
            minWidth: isMobile ? '200px' : '300px',
            maxWidth: isMobile ? '250px' : '400px',
            flex: 1
          }}>
            <Search size={16} color={theme.text.secondary} />
            <input
              type="text"
              placeholder="Search dreams, agents..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: theme.text.primary,
                marginLeft: '8px',
                flex: 1,
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.parentElement.style.borderColor = theme.accent.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.parentElement.style.borderColor = theme.border;
              }}
            />
          </div>
        </div>
        
        {/* Wallet Connect Button */}
        <ConnectButton />
      </div>
      
      {/* Wallet Status (shows when connecting or if there are issues) */}
      <WalletStatus />
    </div>
  );
};

export default Header; 