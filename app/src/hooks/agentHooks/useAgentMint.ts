'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useChainId, useBalance, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, decodeEventLog } from 'viem';
import { useTheme } from '../../contexts/ThemeContext';
import { galileoTestnet } from '../../config/chains';
import AishiAgentABI from '../../abi/AishiAgentABI.json';

// Error parsing utility for viem errors
const parseViemError = (error: any): string => {
  // Check for contract revert errors
  if (error?.message?.includes('execution reverted')) {
    // Extract revert reason with multiple patterns
    let revertReason = null;
    
    // Try different patterns for revert reason extraction
    const patterns = [
      /execution reverted: (.+?)(?:\n|$)/,
      /execution reverted with reason: (.+?)(?:\n|$)/,
      /revert (.+?)(?:\n|$)/,
      /reverted with reason string '(.+?)'/,
      /reverted with custom error '(.+?)'/
    ];
    
    for (const pattern of patterns) {
      const match = error.message.match(pattern);
      if (match) {
        revertReason = match[1].trim();
        break;
      }
    }
    
    if (revertReason) {
      // Map contract errors to user-friendly messages
      switch (revertReason) {
        case 'Wallet already has an agent':
          return 'Your wallet already owns an agent. Each wallet can only mint one agent.';
        case 'Insufficient payment':
          return 'Insufficient payment sent. Please ensure you have 0.1 OG for the minting fee.';
        case 'Agent name too long':
          return 'Agent name is too long. Please choose a shorter name.';
        case 'Agent name cannot be empty':
          return 'Agent name cannot be empty. Please enter a valid name.';
        case 'Minting is paused':
          return 'Agent minting is temporarily paused. Please try again later.';
        case 'Max supply reached':
          return 'Maximum number of agents has been reached. No more agents can be minted.';
        default:
          return `Contract error: ${revertReason}`;
      }
    } else {
      // Fallback if we can't extract the reason
      return 'Transaction failed due to contract requirements not being met.';
    }
  }
  
  // Check for user rejection
  if (error?.message?.includes('User rejected') || error?.name === 'UserRejectedRequestError') {
    return 'Transaction was rejected by user.';
  }
  
  // Check for insufficient funds
  if (error?.message?.includes('insufficient funds')) {
    return 'Insufficient funds in your wallet to complete the transaction.';
  }
  
  // Check for network/connection errors
  if (error?.message?.includes('network') || error?.message?.includes('connection')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  // Check for gas estimation errors
  if (error?.message?.includes('gas')) {
    return 'Gas estimation failed. The transaction may fail or network may be congested.';
  }
  
  // Check for timeout errors
  if (error?.message?.includes('timeout')) {
    return 'Transaction timeout. Please try again or increase gas price.';
  }
  
  // Default fallback
  return error?.message || 'An unexpected error occurred during minting.';
};

// Contract configuration imported from JSON
const contractConfig = {
  address: AishiAgentABI.address as `0x${string}`,
  abi: AishiAgentABI.abi,
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
  isWaitingForReceipt: boolean;
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
    txHash: '',
    isWaitingForReceipt: false
  });

  // Check if on correct network (0G Galileo Testnet)
  const isCorrectNetwork = chainId === parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16601');

  // Wait for transaction receipt
  const { data: receipt, isLoading: isReceiptLoading, error: receiptError } = useWaitForTransactionReceipt({
    hash: state.txHash as `0x${string}`,
    query: {
      enabled: !!state.txHash && !state.tokenId,
    },
  });

  // Process receipt when available
  useEffect(() => {
    if (receipt && !state.tokenId) {
      try {
        // Find Minted event in logs
        const mintedEvent = receipt.logs.find(log => {
          try {
            const decoded = decodeEventLog({
              abi: contractConfig.abi,
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === 'Minted';
          } catch {
            return false;
          }
        });

        if (mintedEvent) {
          const decoded = decodeEventLog({
            abi: contractConfig.abi,
            data: mintedEvent.data,
            topics: mintedEvent.topics,
          });
          
          const tokenId = (decoded.args as any)._tokenId as bigint;
          
          setState(prev => ({
            ...prev,
            tokenId: tokenId,
            isLoading: false,
            isWaitingForReceipt: false,
            error: ''
          }));
          
          debugLog('Agent minted successfully', { 
            tokenId: tokenId.toString(), 
            txHash: state.txHash 
          });
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isWaitingForReceipt: false,
            error: 'Minted event not found in transaction receipt'
          }));
        }
      } catch (error: any) {
        const errorMessage = parseViemError(error);
        debugLog('Error parsing receipt', { 
          error: errorMessage, 
          originalError: error.message,
          errorType: error.name || 'Unknown'
        });
        setState(prev => ({
          ...prev,
          isLoading: false,
          isWaitingForReceipt: false,
          error: errorMessage
        }));
      }
    }
  }, [receipt, state.tokenId, state.txHash]);

  // Handle receipt error
  useEffect(() => {
    if (receiptError) {
      const errorMessage = parseViemError(receiptError);
      debugLog('Receipt error', { 
        error: errorMessage, 
        originalError: receiptError.message,
        errorType: receiptError.name || 'Unknown'
      });
      setState(prev => ({
        ...prev,
        isLoading: false,
        isWaitingForReceipt: false,
        error: errorMessage
      }));
    }
  }, [receiptError]);

  // Reset mint state
  const resetMint = () => {
    setState({
      isLoading: false,
      error: '',
      tokenId: null,
      txHash: '',
      isWaitingForReceipt: false
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
      txHash: '',
      isWaitingForReceipt: false
    }));

    try {
      debugLog('Starting agent mint', { agentName, address });

      // Call mintAgent function on contract
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

      debugLog('Mint transaction sent, waiting for receipt...', { txHash, agentName });

      setState(prev => ({
        ...prev,
        isLoading: false,
        isWaitingForReceipt: true,
        txHash: txHash
      }));

      return {
        success: true,
        txHash: txHash
      };

    } catch (error: any) {
      const errorMessage = parseViemError(error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isWaitingForReceipt: false,
        error: errorMessage
      }));

      debugLog('Mint transaction failed', { 
        error: errorMessage, 
        originalError: error?.message || error,
        errorType: error?.name || 'Unknown'
      });

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
    isWaitingForReceipt: state.isWaitingForReceipt || isReceiptLoading,
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