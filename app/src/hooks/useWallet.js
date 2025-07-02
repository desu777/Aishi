'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { galileoTestnet } from '../config/chains';
import { useTheme } from '../contexts/ThemeContext';

export const useWallet = () => {
  const { debugLog } = useTheme();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, connectors, error: connectError, isLoading, pendingConnector } = useConnect();
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
  const connectWallet = async () => {
    debugLog('Opening connect modal');
    if (openConnectModal) {
      openConnectModal();
    }
  };
  
  // Disconnect wallet function
  const disconnectWallet = async () => {
    debugLog('Disconnecting wallet', { address });
    disconnect();
  };
  
  // Switch to 0G network
  const switchToOGNetwork = async () => {
    debugLog('Switching to 0G Galileo network');
    try {
      await switchChain({ chainId: galileoTestnet.id });
    } catch (error) {
      debugLog('Failed to switch network', error);
      throw error;
    }
  };
  
  // Open account modal
  const openAccount = () => {
    debugLog('Opening account modal');
    if (openAccountModal) {
      openAccountModal();
    }
  };
  
  // Open chain modal
  const openChain = () => {
    debugLog('Opening chain modal');
    if (openChainModal) {
      openChainModal();
    }
  };
  
  // Get network name from env or fallback
  const getNetworkName = () => {
    if (chainId === galileoTestnet.id) {
      return process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '0G';
    }
    return 'Unknown Network';
  };
  
  // Get network display name
  const getNetworkDisplayName = () => {
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
    isLoading,
    
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