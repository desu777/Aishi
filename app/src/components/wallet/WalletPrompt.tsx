'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface WalletPromptProps {
  message?: string;
  style?: React.CSSProperties;
}

export default function WalletPrompt({ 
  message = 'Connect your wallet to mint your agent',
  style 
}: WalletPromptProps) {
  const { theme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center',
      ...style
    }}>
      <p style={{
        fontSize: '18px',
        fontWeight: '500',
        color: theme.accent.primary,
        margin: 0,
        lineHeight: 1.5,
      }}>
        {message}
      </p>
    </div>
  );
}