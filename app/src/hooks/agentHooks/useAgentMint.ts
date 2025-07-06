'use client';

import { useState } from 'react';
import { useWriteContract, useAccount, useChainId, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { useTheme } from '../../contexts/ThemeContext';
import { galileoTestnet } from '../../config/chains';
import contractData from '../../abi/frontend-contracts.json';

// Contract configuration imported from JSON
const contractConfig = {
  address: contractData.galileo.DreamscapeAgent.address as `0x${string}`,
  abi: contractData.galileo.DreamscapeAgent.abi,
} as const;

// Types from ABI
interface MintResult {
  success: boolean;
  tokenId?: bigint;
  txHash?: string;
  error?: string;
}

interface MintState {
  isLoading: boolean;
  error: string;
  tokenId: bigint | null;
  txHash: string;
}

/**
 * Hook for minting Dream Agents using wagmi v2
 * Integrates with wallet validation and provides comprehensive state management
 */
export function useAgentMint() {
  const { debugLog } = useTheme();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();
  const { data: balance } = useBalance({
    address: address
  });
  
  // Local state for mint operation
  const [state, setState] = useState<MintState>({
    isLoading: false,
    error: '',
    tokenId: null,
    txHash: ''
  });

  // Check if on correct network (0G Galileo Testnet)
  const isCorrectNetwork = chainId === parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16601');

  // Reset mint state
  const resetMint = () => {
    setState({
      isLoading: false,
      error: '',
      tokenId: null,
      txHash: ''
    });
    debugLog('Mint state reset');
  };

  // Main mint function
  const mintAgent = async (agentName: string): Promise<MintResult> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    if (!isCorrectNetwork) {
      const error = 'Wrong network. Please switch to 0G Galileo Testnet';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    if (!agentName || agentName.trim().length === 0) {
      const error = 'Agent name cannot be empty';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    // Check if user has sufficient balance for minting fee (0.1 OG)
    const mintingFee = parseEther('0.1');
    if (balance && balance.value < mintingFee) {
      const error = `Insufficient balance. Need 0.1 OG for minting fee. Current: ${balance.formatted} ${balance.symbol}`;
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: '',
      tokenId: null,
      txHash: ''
    }));

    try {
      debugLog('Starting agent mint', { agentName, address });

      // Call mintAgent function on contract
      // Function signature: mintAgent(bytes[] proofs, string[] descriptions, string agentName, address to)
      // Contract requires MINTING_FEE = 0.1 OG
      const txHash = await writeContractAsync({
        ...contractConfig,
        functionName: 'mintAgent',
        account: address,
        chain: galileoTestnet,
        value: parseEther('0.1'), // MINTING_FEE = 0.1 OG
        args: [
          [], // proofs: empty array for testing
          [], // descriptions: empty array
          agentName.trim(), // agentName: user input
          address // to: user address
        ]
      });

      debugLog('Mint transaction sent', { txHash, agentName });

      setState(prev => ({
        ...prev,
        isLoading: false,
        txHash: txHash
      }));

      // Note: We don't get tokenId directly from writeContract
      // We would need to wait for transaction receipt and parse events
      // For now, just return success
      return {
        success: true,
        txHash: txHash
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Mint transaction failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      debugLog('Mint transaction failed', { error: errorMessage });

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Get explorer URL for transaction
  const getTransactionUrl = (txHash: string) => {
    const explorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://chainscan-galileo.0g.ai';
    return `${explorerUrl}/tx/${txHash}`;
  };

  return {
    // State
    isLoading: state.isLoading || isPending,
    error: state.error,
    tokenId: state.tokenId,
    txHash: state.txHash,

    // Actions
    mintAgent,
    resetMint,
    
    // Utils
    getTransactionUrl,
    
    // Wallet state (from existing hooks)
    isWalletConnected: isConnected,
    walletAddress: address,
    isCorrectNetwork,
    
    // Balance info
    currentBalance: balance,
    hasCurrentBalance: balance && balance.value >= parseEther('0.1'),
    
    // Contract info
    contractAddress: contractConfig.address,
    chainId: chainId
  };
} 