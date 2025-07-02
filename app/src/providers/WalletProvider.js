'use client';

import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useTheme } from '../contexts/ThemeContext';
import { galileoTestnet } from '../config/chains';

// Create a client for TanStack Query
const queryClient = new QueryClient();

// Configure chains and providers for wagmi with only 0G Galileo Testnet
const config = getDefaultConfig({
  appName: 'Dreamscape - AI Dream Agent',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '34121ad34d9bc22e1afc6f45f72b3fdd',
  chains: [galileoTestnet],
  ssr: false,
});

// Custom avatar component for dream theme
const CustomAvatar = ({ size }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }}
    >
      🧠
    </div>
  );
};

// Main Wallet Provider
export const WalletProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProviderWrapper>
          {children}
        </RainbowKitProviderWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Inner component that uses theme context
const RainbowKitProviderWrapper = ({ children }) => {
  const { theme, debugLog } = useTheme();
  
  // Create Dreamscape violet theme for RainbowKit
  const dreamscapeTheme = darkTheme({
    accentColor: theme.accent.primary,        // Violet
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
  });
  
  // Custom theme overrides for Dreamscape
  const customTheme = {
    ...dreamscapeTheme,
    colors: {
      ...dreamscapeTheme.colors,
      accentColor: theme.accent.primary,      // #8B5CF6
      accentColorForeground: 'white',
      actionButtonBorder: theme.border,
      actionButtonBorderMobile: theme.border,
      actionButtonSecondaryBackground: theme.bg.card,
      closeButton: theme.text.secondary,
      closeButtonBackground: theme.bg.panel,
      connectButtonBackground: theme.accent.primary,
      connectButtonBackgroundError: '#ff4d4f',
      connectButtonInnerBackground: theme.bg.card,
      connectButtonText: 'white',
      connectButtonTextError: 'white',
      connectionIndicator: theme.accent.primary,
      downloadBottomCardBackground: theme.bg.card,
      downloadTopCardBackground: theme.bg.panel,
      error: '#ff4d4f',
      generalBorder: theme.border,
      generalBorderDim: theme.border,
      menuItemBackground: theme.bg.card,
      modalBackdrop: 'rgba(0, 0, 0, 0.8)',
      modalBackground: theme.bg.card,
      modalBorder: theme.border,
      modalText: theme.text.primary,
      modalTextDim: theme.text.secondary,
      modalTextSecondary: theme.text.secondary,
      profileAction: theme.bg.panel,
      profileActionHover: theme.bg.main,
      profileForeground: theme.bg.card,
      selectedOptionBorder: theme.accent.primary,
      standby: theme.text.secondary,
    }
  };
  
  debugLog('RainbowKit theme configured with Dreamscape colors');
  
  return (
    <RainbowKitProvider 
      theme={customTheme}
      avatar={CustomAvatar}
      modalSize="compact"
      initialChain={galileoTestnet.id}
      showRecentTransactions={true}
    >
      {children}
    </RainbowKitProvider>
  );
}; 