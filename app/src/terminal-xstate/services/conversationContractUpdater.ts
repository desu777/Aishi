// @ts-nocheck
/**
 * @fileoverview Conversation Contract Updater for Terminal XState
 * @description Updates smart contract with conversation records
 */

import { galileoTestnet } from '../../config/chains';
import { getViemProvider, getViemSigner } from '../../lib/0g/fees';
import type { PublicClient, WalletClient } from 'viem';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[ConversationContractUpdater] ${message}`, data || '');
  }
};

// Context types from contract
enum ContextType {
  DREAM_DISCUSSION = 0,
  GENERAL_CHAT = 1,
  PERSONALITY_QUERY = 2,
  THERAPEUTIC = 3,
  ADVICE_SEEKING = 4
}

/**
 * Map conversation type string to contract enum
 */
function mapConversationType(type: string): ContextType {
  switch (type) {
    case 'dream_discussion':
      return ContextType.DREAM_DISCUSSION;
    case 'general_chat':
      return ContextType.GENERAL_CHAT;
    case 'personality_query':
      return ContextType.PERSONALITY_QUERY;
    case 'therapeutic':
      return ContextType.THERAPEUTIC;
    case 'advice_seeking':
      return ContextType.ADVICE_SEEKING;
    default:
      return ContextType.GENERAL_CHAT;
  }
}

/**
 * Update contract with conversation record
 */
export async function updateConversationContract(
  tokenId: number,
  conversationHash: string,
  conversationType: string
) {
  debugLog('Updating conversation contract', {
    tokenId,
    conversationHash: conversationHash ? conversationHash.substring(0, 10) + '...' : 'undefined',
    conversationType
  });

  try {
    // Get contract config
    const { getContractConfig } = await import('../../hooks/agentHooks/config/contractConfig');
    const contractConfig = getContractConfig();

    // Get providers
    const [publicClient, publicErr] = await getViemProvider();
    if (!publicClient || publicErr) {
      throw new Error(`PublicClient error: ${publicErr?.message || 'No public client available'}`);
    }

    const [walletClient, walletErr] = await getViemSigner();
    if (!walletClient || walletErr) {
      throw new Error(`WalletClient error: ${walletErr?.message || 'No wallet client available'}`);
    }

    // Get account from walletClient
    const [account] = await walletClient.getAddresses();
    if (!account) {
      throw new Error('No account available');
    }

    // Map conversation type to contract enum
    const contextType = mapConversationType(conversationType);

    debugLog('Preparing contract call', {
      contractAddress: contractConfig.address,
      contextType,
      account: account
    });

    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: 'recordConversation',
      args: [tokenId, conversationHash as `0x${string}`, contextType],
      account: account,
      chain: galileoTestnet
    });

    debugLog('Contract simulation successful');

    // Execute the transaction with explicit chain and account
    const txHash = await walletClient.writeContract({
      ...request,
      chain: galileoTestnet,
      account: account
    });

    debugLog('Transaction submitted', { txHash });

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1
    });

    debugLog('Transaction confirmed', {
      txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    });

    if (receipt.status !== 'success') {
      throw new Error('Transaction failed');
    }

    return {
      success: true,
      txHash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString()
    };

  } catch (error) {
    debugLog('Error updating conversation contract', { error: String(error) });
    
    // Check if it's a specific error
    if (String(error).includes('User rejected')) {
      throw new Error('Transaction rejected by user');
    } else if (String(error).includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction');
    } else if (String(error).includes('not the owner')) {
      throw new Error('You are not the owner of this agent');
    }
    
    throw error;
  }
}