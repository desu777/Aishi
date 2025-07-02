'use client';

import React from 'react';
import { Wallet, AlertTriangle, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../hooks/useWallet';

const ConnectButton = () => {
  const { theme, debugLog } = useTheme();
  const { 
    address, 
    shortAddress, 
    isConnected, 
    isConnecting, 
    isCorrectNetwork,
    networkDisplayName,
    connectWallet, 
    openAccount,
    switchToOGNetwork 
  } = useWallet();
  
  // If not connected, show connect button
  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: theme.accent.primary,
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '10px 16px',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          boxShadow: `0 0 10px rgba(139, 92, 246, 0.3)`,
          opacity: isConnecting ? 0.7 : 1,
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isConnecting) {
            e.currentTarget.style.backgroundColor = theme.dream.purple;
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = `0 4px 15px rgba(139, 92, 246, 0.4)`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isConnecting) {
            e.currentTarget.style.backgroundColor = theme.accent.primary;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 0 10px rgba(139, 92, 246, 0.3)`;
          }
        }}
      >
        {isConnecting ? (
          <>
            <div 
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            Connecting...
          </>
        ) : (
          <>
            <Wallet size={16} />
            Connect Wallet
          </>
        )}
      </button>
    );
  }
  
  // If connected but wrong network, show switch network button
  if (!isCorrectNetwork) {
    return (
      <button
        onClick={switchToOGNetwork}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ff4d4f',  // Red for warning
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '10px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          boxShadow: `0 0 10px rgba(255, 77, 79, 0.3)`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ff7875';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ff4d4f';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <AlertTriangle size={16} />
        Switch to {process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '0G'} Network
      </button>
    );
  }
  
  // If connected and correct network, show account button
  return (
    <button
      onClick={openAccount}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: theme.bg.card,
        color: theme.text.primary,
        border: `1px solid ${theme.accent.primary}`,
        borderRadius: '12px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        boxShadow: `0 0 10px rgba(139, 92, 246, 0.2)`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.bg.panel;
        e.currentTarget.style.borderColor = theme.dream.purple;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.bg.card;
        e.currentTarget.style.borderColor = theme.accent.primary;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: theme.gradients.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px'
      }}>
        🧠
      </div>
      
      {/* Address */}
      <span>{shortAddress}</span>
      
      {/* Network indicator */}
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: theme.accent.primary,
        boxShadow: `0 0 4px ${theme.accent.primary}`
      }} />
    </button>
  );
};

export default ConnectButton; 