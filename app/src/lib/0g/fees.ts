/**
 * @fileoverview Fee calculation and provider utilities using viem
 * @description Provides fee estimation and provider/signer management for 0G Network
 * using modern viem/wagmi stack instead of ethers
 */

import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  custom,
  parseEther,
  formatEther,
  parseUnits,
  type PublicClient,
  type WalletClient,
  type Address,
  type Account
} from 'viem';
import { galileoTestnet } from '../../config/chains';
import { getEthersProviderForZeroG, getEthersSignerForZeroG } from './adapter/viemAdapter';
import { ethers } from 'ethers';

/**
 * Gets a viem public client for reading from the blockchain
 * @returns Promise with PublicClient or error
 */
export async function getViemProvider(): Promise<[PublicClient | null, Error | null]> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai';
    const publicClient = createPublicClient({
      chain: galileoTestnet,
      transport: http(rpcUrl)
    }) as PublicClient;
    return [publicClient, null];
  } catch (error) {
    console.error('Failed to create public client:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Gets a viem wallet client for signing transactions
 * @returns Promise with WalletClient or error
 */
export async function getViemSigner(): Promise<[WalletClient | null, Error | null]> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet connection available');
    }

    const walletClient = createWalletClient({
      chain: galileoTestnet,
      transport: custom(window.ethereum)
    });

    // Request account access if needed
    const accounts = await walletClient.requestAddresses();
    if (!accounts || accounts.length === 0) {
      return [null, new Error('No accounts available')];
    }

    return [walletClient, null];
  } catch (error) {
    console.error('Failed to get wallet client:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Legacy function for ethers compatibility - will be removed after full migration
 * @deprecated Use getViemProvider instead
 */
export async function getProvider(): Promise<[ethers.JsonRpcProvider | null, Error | null]> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai';
    const provider = getEthersProviderForZeroG(rpcUrl, galileoTestnet.id);
    return [provider, null];
  } catch (error) {
    console.error('Failed to get provider:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Legacy function for ethers compatibility - will be removed after full migration
 * @deprecated Use getViemSigner instead
 */
export async function getSigner(provider: ethers.JsonRpcProvider): Promise<[ethers.Signer | null, Error | null]> {
  try {
    const signer = await getEthersSignerForZeroG(galileoTestnet.id);
    return [signer, null];
  } catch (error) {
    console.error('Failed to get signer:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

export interface FeeInfo {
  storageFee: bigint;
  gasFee: bigint;
  totalFee: bigint;
  rawTotalFee: bigint;
  isLoading: boolean;
  formatted: {
    storageFee: string;
    gasFee: string;
    totalFee: string;
  };
  usd: {
    storageFee: string;
    gasFee: string;
    totalFee: string;
  };
}

/**
 * Calculate basic storage fees for a file
 * Using viem's parseEther and formatEther functions
 * @param fileSize File size in bytes
 * @returns Fee information
 */
export function calculateBasicStorageFee(fileSize: number): FeeInfo {
  // Basic fee calculation (0.1 OG per MB as example)
  const baseFeePer1MB = parseEther('0.1'); // 0.1 OG per MB
  const fileSizeInMB = Math.max(fileSize / (1024 * 1024), 0.001); // Min 0.001 MB
  
  const storageFee = BigInt(Math.ceil(Number(baseFeePer1MB) * fileSizeInMB));
  const gasFee = parseEther('0.01'); // Estimated gas fee
  const totalFee = storageFee + gasFee;

  // Mock USD prices (in real app, fetch from API)
  const ogPriceUSD = 0.10; // $0.10 per OG token

  return {
    storageFee,
    gasFee,
    totalFee,
    rawTotalFee: totalFee,
    isLoading: false,
    formatted: {
      storageFee: formatEther(storageFee),
      gasFee: formatEther(gasFee),
      totalFee: formatEther(totalFee)
    },
    usd: {
      storageFee: (Number(formatEther(storageFee)) * ogPriceUSD).toFixed(4),
      gasFee: (Number(formatEther(gasFee)) * ogPriceUSD).toFixed(4),
      totalFee: (Number(formatEther(totalFee)) * ogPriceUSD).toFixed(4)
    }
  };
}

/**
 * Get current gas price from network using viem
 * @returns Gas price in wei
 */
export async function getCurrentGasPrice(): Promise<bigint> {
  try {
    const [publicClient, error] = await getViemProvider();
    if (!publicClient || error) return parseUnits('20', 9); // Default 20 gwei
    
    const gasPrice = await publicClient.getGasPrice();
    return gasPrice || parseUnits('20', 9);
  } catch (error) {
    console.warn('Failed to get gas price, using default:', error);
    return parseUnits('20', 9);
  }
}

/**
 * Validate if user has sufficient balance for fees using viem
 * @param userAddress User's wallet address
 * @param requiredFee Required fee amount
 * @returns Whether user has sufficient balance
 */
export async function validateSufficientBalance(
  userAddress: string, 
  requiredFee: bigint
): Promise<boolean> {
  try {
    const [publicClient, error] = await getViemProvider();
    if (!publicClient || error) return false;

    const balance = await publicClient.getBalance({
      address: userAddress as Address
    });
    return balance >= requiredFee;
  } catch (error) {
    console.error('Failed to check balance:', error);
    return false;
  }
}