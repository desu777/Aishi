'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import toast from 'react-hot-toast';
import { galileoTestnet } from '../../../config/chains';
import { getContractConfig, MINTING_FEE, MAX_NAME_LENGTH, MAX_AGENTS } from '../config/contractConfig';

export function useMintAgent() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  
  // Get contract configuration
  const contractConfig = getContractConfig();
  
  // Form state
  const [agentName, setAgentName] = useState('');
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState('');
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);

  // Check if wallet already has an agent
  const { data: existingTokenId } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'ownerToTokenId',
    args: address ? [address] : undefined,
  });

  // Check if name exists
  const { data: nameExists, refetch: refetchNameExists } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'nameExists',
    args: agentName ? [agentName] : undefined,
  });

  // Get total agents for stats
  const { data: totalAgents } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: 'totalAgents',
  });

  // Mint transaction
  const { 
    writeContractAsync, 
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();

  // Wait for transaction
  const { 
    isLoading: isTxLoading, 
    isSuccess: isTxSuccess,
    error: txError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Name validation
  useEffect(() => {
    if (!agentName) {
      setNameError('');
      return;
    }

    const validateName = async () => {
      setIsCheckingName(true);
      
      // Length check
      if (agentName.length > MAX_NAME_LENGTH) {
        setNameError(`Name too long (${agentName.length}/${MAX_NAME_LENGTH})`);
        setIsCheckingName(false);
        return;
      }

      // Check if name is taken
      if (agentName.length > 0) {
        await refetchNameExists();
        if (nameExists) {
          setNameError('Name already taken');
        } else {
          setNameError('');
        }
      }
      
      setIsCheckingName(false);
    };

    const timeoutId = setTimeout(validateName, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [agentName, nameExists, refetchNameExists]);

  // Success handler
  useEffect(() => {
    if (isTxSuccess && txHash) {
      setShowSuccess(true);
      const tokenId = Number(totalAgents || 0) + 1;
      setMintedTokenId(tokenId);
      toast.success('Agent created successfully!');
    }
  }, [isTxSuccess, txHash, totalAgents]);

  // Handle mint
  const handleMint = async () => {
    if (!address || !agentName || nameError) return;

    try {
      await writeContractAsync({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'mintAgent',
        args: [
          [], // empty proofs
          [], // empty descriptions
          agentName,
          address
        ],
        value: MINTING_FEE,
        account: address,
        chain: galileoTestnet,
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to mint agent');
    }
  };

  // Share on X (Twitter)
  const shareOnX = () => {
    const tweet = `Just created my Aishi Agent "${agentName}"! 🤖✨\n\nReady to explore dreams and evolve personality.\n\n#Aishi #Web3`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`);
  };

  // Reset state
  const reset = () => {
    setAgentName('');
    setNameError('');
    setShowSuccess(false);
    setMintedTokenId(null);
    resetWrite();
  };

  // Check if user can mint
  const hasExistingAgent = existingTokenId && Number(existingTokenId) > 0;
  const hasInsufficientBalance = balance && balance.value < MINTING_FEE;
  const canMint = isConnected && !hasExistingAgent && !hasInsufficientBalance && 
                  agentName && !nameError && !isCheckingName;

  // Transaction status
  const isProcessing = isWritePending || isTxLoading;

  // Calculate remaining agents
  const agentsRemaining = MAX_AGENTS - Number(totalAgents || 0);
  const agentsMinted = Number(totalAgents || 0);

  return {
    // State
    agentName,
    setAgentName,
    nameError,
    isCheckingName,
    showSuccess,
    mintedTokenId,
    
    // Wallet & Balance
    address,
    isConnected,
    balance,
    hasExistingAgent,
    hasInsufficientBalance,
    existingTokenId,
    
    // Stats
    totalAgents: agentsMinted,
    agentsRemaining,
    maxAgents: MAX_AGENTS,
    
    // Transaction
    isProcessing,
    writeError,
    txError,
    txHash,
    isTxSuccess,
    
    // Actions
    handleMint,
    shareOnX,
    reset,
    canMint,
    
    // Constants
    MINTING_FEE,
    MAX_NAME_LENGTH,
    CONTRACT_ADDRESS: contractConfig.address,
  };
}