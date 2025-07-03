'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { galileoTestnet } from '../config/chains';
import { useTheme } from '../contexts/ThemeContext';
import type { Address } from 'viem';
import { WalletState } from '../types';

export const useWallet = (): WalletState & {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchToOGNetwork: () => Promise<void>;
  openAccount: () => void;
  openChain: () => void;
  connectError: Error | null;
  debugLog: (message: string, data?: any) => void;
} => {
  const { debugLog } = useTheme();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  // RainbowKit modals
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  
  // Shortened address for display
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  
  // Check if on correct network (0G Galileo)
  const isCorrectNetwork = chainId === galileoTestnet.id;
  
  // Connect wallet function
  const connectWallet = async (): Promise<void> => {
    debugLog('Opening connect modal');
    if (openConnectModal) {
      openConnectModal();
    }
  };
  
  // Disconnect wallet function
  const disconnectWallet = async (): Promise<void> => {
    debugLog('Disconnecting wallet', { address });
    disconnect();
  };
  
  // Switch to 0G network
  const switchToOGNetwork = async (): Promise<void> => {
    debugLog('Switching to 0G Galileo network');
    try {
      await switchChain({ chainId: galileoTestnet.id });
    } catch (error) {
      debugLog('Failed to switch network', error);
      throw error;
    }
  };
  
  // Open account modal
  const openAccount = (): void => {
    debugLog('Opening account modal');
    if (openAccountModal) {
      openAccountModal();
    }
  };
  
  // Open chain modal
  const openChain = (): void => {
    debugLog('Opening chain modal');
    if (openChainModal) {
      openChainModal();
    }
  };
  
  // Get network name from env or fallback
  const getNetworkName = (): string => {
    if (chainId === galileoTestnet.id) {
      return process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '0G';
    }
    return 'Unknown Network';
  };
  
  // Get network display name
  const getNetworkDisplayName = (): string => {
    if (chainId === galileoTestnet.id) {
      return process.env.NEXT_PUBLIC_CHAIN_NAME || '0G Galileo';
    }
    return 'Unknown Network';
  };
  
  return {
    // Connection state
    address,
    shortAddress,
    isConnected,
    isConnecting,
    isDisconnected,
    isLoading: isPending,
    
    // Network state
    chainId,
    isCorrectNetwork,
    networkName: getNetworkName(),
    networkDisplayName: getNetworkDisplayName(),
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToOGNetwork,
    openAccount,
    openChain,
    
    // Errors
    connectError,
    
    // Utils
    debugLog,
    
    // Chain config (from env)
    chainConfig: {
      id: galileoTestnet.id,
      name: galileoTestnet.name,
      currency: galileoTestnet.nativeCurrency,
      isTestnet: galileoTestnet.testnet
    }
  };
}; 