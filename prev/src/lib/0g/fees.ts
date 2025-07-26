import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';

/**
 * Gets provider for 0G network
 * @returns Provider and potential error
 */
export async function getProvider(): Promise<[ethers.JsonRpcProvider | null, Error | null]> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return [provider, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Gets signer from wallet connection
 * @param provider The provider instance
 * @returns Signer and potential error
 */
export async function getSigner(provider: ethers.JsonRpcProvider): Promise<[ethers.Signer | null, Error | null]> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet connection available');
    }

    const web3Provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await web3Provider.getSigner();
    return [signer, null];
  } catch (error) {
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
 * @param fileSize File size in bytes
 * @returns Fee information
 */
export function calculateBasicStorageFee(fileSize: number): FeeInfo {
  // Basic fee calculation (0.1 OG per MB as example)
  const baseFeePer1MB = ethers.parseEther('0.1'); // 0.1 OG per MB
  const fileSizeInMB = Math.max(fileSize / (1024 * 1024), 0.001); // Min 0.001 MB
  
  const storageFee = BigInt(Math.ceil(fileSizeInMB * Number(baseFeePer1MB)));
  const gasFee = ethers.parseEther('0.01'); // Estimated gas fee
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
      storageFee: ethers.formatEther(storageFee),
      gasFee: ethers.formatEther(gasFee),
      totalFee: ethers.formatEther(totalFee)
    },
    usd: {
      storageFee: (Number(ethers.formatEther(storageFee)) * ogPriceUSD).toFixed(4),
      gasFee: (Number(ethers.formatEther(gasFee)) * ogPriceUSD).toFixed(4),
      totalFee: (Number(ethers.formatEther(totalFee)) * ogPriceUSD).toFixed(4)
    }
  };
}

/**
 * Get current gas price from network
 * @returns Gas price in wei
 */
export async function getCurrentGasPrice(): Promise<bigint> {
  try {
    const [provider] = await getProvider();
    if (!provider) return ethers.parseUnits('20', 'gwei'); // Default 20 gwei

    const feeData = await provider.getFeeData();
    return feeData.gasPrice || ethers.parseUnits('20', 'gwei');
  } catch (error) {
    console.warn('Failed to get gas price, using default:', error);
    return ethers.parseUnits('20', 'gwei');
  }
}

/**
 * Validate if user has sufficient balance for fees
 * @param userAddress User's wallet address
 * @param requiredFee Required fee amount
 * @returns Whether user has sufficient balance
 */
export async function validateSufficientBalance(
  userAddress: string, 
  requiredFee: bigint
): Promise<boolean> {
  try {
    const [provider] = await getProvider();
    if (!provider) return false;

    const balance = await provider.getBalance(userAddress);
    return balance >= requiredFee;
  } catch (error) {
    console.error('Failed to check balance:', error);
    return false;
  }
} 