/**
 * @fileoverview Dream Contract Updater for XState Terminal
 * @description Updates smart contract with dream data and personality evolution
 */

import { Contract } from 'ethers';
import { getProvider, getSigner } from '../../lib/0g/fees';
import { getContractConfig } from './contractService';
import { EvolutionFields, clampToContractRanges } from './dreamDataValidator';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamContractUpdater] ${message}`, data || '');
  }
};

/**
 * Contract update result interface
 */
export interface ContractUpdateResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  blockNumber?: number;
  isEvolutionDream?: boolean;
  metadata?: {
    tokenId: number;
    dreamHash: string;
    updateTime: number;
    confirmationTime?: number;
  };
}

/**
 * Contract personality impact structure (matches ABI)
 */
interface ContractPersonalityImpact {
  creativityChange: number;    // int8 (-10 to +10)
  analyticalChange: number;    // int8 (-10 to +10)  
  empathyChange: number;       // int8 (-10 to +10)
  intuitionChange: number;     // int8 (-10 to +10)
  resilienceChange: number;    // int8 (-10 to +10)
  curiosityChange: number;     // int8 (-10 to +10)
  moodShift: string;          // string (cannot be empty)
  evolutionWeight: number;     // uint8 (1-100)
  newFeatures: Array<{
    name: string;             // string (cannot be empty)
    description: string;      // string (cannot be empty)
    intensity: number;        // uint8 (1-100)
    addedAt: number;         // uint256 (timestamp)
  }>;                        // max 2 features
}

/**
 * Main function to update dream contract with conditional personality evolution
 */
export async function updateDreamContract(
  tokenId: number,
  dreamHash: string,
  personalityImpact?: EvolutionFields['personalityImpact'],
  dreamCount?: number
): Promise<ContractUpdateResult> {
  const updateStartTime = Date.now();
  const isEvolutionDream = !!personalityImpact;

  debugLog('Starting contract update', {
    tokenId,
    dreamHash: dreamHash.substring(0, 10) + '...',
    isEvolutionDream,
    dreamCount,
    hasPersonalityImpact: !!personalityImpact
  });

  try {
    // Validate inputs
    const validationResult = validateContractInputs(tokenId, dreamHash, personalityImpact);
    if (!validationResult.isValid) {
      throw new Error(`Contract input validation failed: ${validationResult.error}`);
    }

    // Get contract instance
    const contract = await getContractInstance();
    
    // Prepare personality impact data
    const contractImpact = preparePersonalityImpact(personalityImpact, isEvolutionDream);

    debugLog('Prepared contract data', {
      contractAddress: contract.target,
      impactData: {
        moodShift: contractImpact.moodShift,
        evolutionWeight: contractImpact.evolutionWeight,
        newFeaturesCount: contractImpact.newFeatures.length,
        isMinimalImpact: !isEvolutionDream
      }
    });

    // Execute transaction
    const txResult = await executeContractTransaction(
      contract,
      tokenId,
      dreamHash,
      contractImpact,
      isEvolutionDream
    );

    const totalTime = Date.now() - updateStartTime;

    debugLog('Contract update completed successfully', {
      txHash: txResult.txHash?.substring(0, 10) + '...',
      gasUsed: txResult.gasUsed,
      blockNumber: txResult.blockNumber,
      totalTime,
      isEvolutionDream
    });

    return {
      success: true,
      txHash: txResult.txHash,
      gasUsed: txResult.gasUsed,
      blockNumber: txResult.blockNumber,
      isEvolutionDream,
      metadata: {
        tokenId,
        dreamHash,
        updateTime: totalTime,
        confirmationTime: txResult.confirmationTime
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const totalTime = Date.now() - updateStartTime;
    
    debugLog('Contract update failed', { 
      error: errorMessage,
      totalTime,
      tokenId,
      isEvolutionDream
    });

    return {
      success: false,
      error: errorMessage,
      isEvolutionDream,
      metadata: {
        tokenId,
        dreamHash,
        updateTime: totalTime
      }
    };
  }
}

/**
 * Get contract instance with provider and signer
 */
async function getContractInstance(): Promise<Contract> {
  debugLog('Getting contract instance');

  // Get provider
  const [provider, providerErr] = await getProvider();
  if (!provider || providerErr) {
    throw new Error(`Provider error: ${providerErr?.message || 'No provider available'}`);
  }

  // Get signer
  const [signer, signerErr] = await getSigner(provider);
  if (!signer || signerErr) {
    throw new Error(`Signer error: ${signerErr?.message || 'No signer available'}`);
  }

  // Get contract configuration
  const contractConfig = getContractConfig();
  
  debugLog('Contract configuration loaded', {
    address: contractConfig.address,
    network: contractConfig.network,
    chainId: contractConfig.chainId
  });

  // Create contract instance
  const contract = new Contract(contractConfig.address, contractConfig.abi, signer);

  debugLog('Contract instance created successfully');
  return contract;
}

/**
 * Execute the contract transaction
 */
async function executeContractTransaction(
  contract: Contract,
  tokenId: number,
  dreamHash: string,
  personalityImpact: ContractPersonalityImpact,
  isEvolutionDream: boolean
): Promise<{
  txHash: string;
  gasUsed?: string;
  blockNumber?: number;
  confirmationTime?: number;
}> {
  const transactionStartTime = Date.now();

  debugLog('Executing processDailyDream transaction', {
    tokenId,
    dreamHash: dreamHash.substring(0, 10) + '...',
    isEvolutionDream
  });

  // Call processDailyDream function
  const tx = await contract.processDailyDream(
    tokenId,
    dreamHash,
    personalityImpact
  );

  debugLog('Transaction sent, waiting for confirmation', { 
    txHash: tx.hash.substring(0, 10) + '...' 
  });

  // Wait for confirmation
  const receipt = await tx.wait();
  const confirmationTime = Date.now() - transactionStartTime;

  debugLog('Transaction confirmed', {
    txHash: tx.hash.substring(0, 10) + '...',
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed?.toString(),
    confirmationTime
  });

  return {
    txHash: tx.hash,
    gasUsed: receipt.gasUsed?.toString(),
    blockNumber: receipt.blockNumber,
    confirmationTime
  };
}

/**
 * Prepare personality impact data for contract
 */
function preparePersonalityImpact(
  personalityImpact: EvolutionFields['personalityImpact'] | undefined,
  isEvolutionDream: boolean
): ContractPersonalityImpact {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (isEvolutionDream && personalityImpact) {
    debugLog('Preparing evolution dream personality impact');
    
    // Clamp values to contract ranges and validate
    const clampedImpact = clampToContractRanges(personalityImpact);
    
    // Add timestamps to new features
    const featuresWithTimestamp = clampedImpact.newFeatures.map(feature => ({
      name: feature.name,
      description: feature.description,
      intensity: feature.intensity,
      addedAt: currentTimestamp
    }));

    return {
      creativityChange: clampedImpact.creativityChange,
      analyticalChange: clampedImpact.analyticalChange,
      empathyChange: clampedImpact.empathyChange,
      intuitionChange: clampedImpact.intuitionChange,
      resilienceChange: clampedImpact.resilienceChange,
      curiosityChange: clampedImpact.curiosityChange,
      moodShift: clampedImpact.moodShift,
      evolutionWeight: clampedImpact.evolutionWeight,
      newFeatures: featuresWithTimestamp
    };
  } else {
    debugLog('Preparing standard dream minimal personality impact');
    
    // Create minimal impact for standard dreams
    return {
      creativityChange: 0,
      analyticalChange: 0,
      empathyChange: 0,
      intuitionChange: 0,
      resilienceChange: 0,
      curiosityChange: 0,
      moodShift: 'neutral',
      evolutionWeight: 1, // Minimal weight
      newFeatures: [] // No new features
    };
  }
}

/**
 * Validate contract inputs
 */
function validateContractInputs(
  tokenId: number,
  dreamHash: string,
  personalityImpact?: EvolutionFields['personalityImpact']
): { isValid: boolean; error?: string } {
  // Validate tokenId
  if (typeof tokenId !== 'number' || tokenId <= 0 || !Number.isInteger(tokenId)) {
    return { isValid: false, error: 'TokenId must be a positive integer' };
  }

  // Validate dreamHash
  if (typeof dreamHash !== 'string' || dreamHash.length === 0) {
    return { isValid: false, error: 'DreamHash must be a non-empty string' };
  }

  if (!dreamHash.startsWith('0x') || dreamHash.length !== 66) {
    return { isValid: false, error: 'DreamHash must be a valid bytes32 hex string (0x + 64 chars)' };
  }

  // Validate personalityImpact if provided
  if (personalityImpact) {
    // Basic validation - detailed validation is done in the validator
    if (typeof personalityImpact !== 'object') {
      return { isValid: false, error: 'PersonalityImpact must be an object' };
    }

    if (typeof personalityImpact.moodShift !== 'string' || personalityImpact.moodShift.trim().length === 0) {
      return { isValid: false, error: 'PersonalityImpact moodShift must be a non-empty string' };
    }

    if (typeof personalityImpact.evolutionWeight !== 'number' || 
        personalityImpact.evolutionWeight < 1 || 
        personalityImpact.evolutionWeight > 100) {
      return { isValid: false, error: 'PersonalityImpact evolutionWeight must be between 1 and 100' };
    }
  }

  return { isValid: true };
}

/**
 * Check if agent can process dream today (optional validation)
 */
export async function canProcessDreamToday(tokenId: number): Promise<{
  canProcess: boolean;
  error?: string;
  cooldownRemaining?: number;
}> {
  debugLog('Checking if agent can process dream today', { tokenId });

  try {
    const contract = await getContractInstance();
    
    // Call canProcessDreamToday view function
    const canProcess = await contract.canProcessDreamToday(tokenId);
    
    debugLog('Dream processing check completed', { tokenId, canProcess });
    
    return { canProcess };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Dream processing check failed', { error: errorMessage });
    
    // If the check fails, we assume processing is allowed (fail-safe)
    return { 
      canProcess: true, 
      error: errorMessage 
    };
  }
}

/**
 * Get current agent memory for context
 */
export async function getAgentMemory(tokenId: number): Promise<{
  success: boolean;
  memory?: any;
  error?: string;
}> {
  debugLog('Getting agent memory', { tokenId });

  try {
    const contract = await getContractInstance();
    
    // Call getAgentMemory view function
    const memory = await contract.getAgentMemory(tokenId);
    
    debugLog('Agent memory retrieved', { 
      tokenId,
      hasMemoryCore: memory.memoryCoreHash !== '0x0000000000000000000000000000000000000000000000000000000000000000',
      hasDailyDreams: memory.currentDreamDailyHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
    });
    
    return { 
      success: true, 
      memory: {
        memoryCoreHash: memory.memoryCoreHash,
        currentDreamDailyHash: memory.currentDreamDailyHash,
        currentConvDailyHash: memory.currentConvDailyHash,
        lastDreamMonthlyHash: memory.lastDreamMonthlyHash,
        lastConvMonthlyHash: memory.lastConvMonthlyHash,
        lastConsolidation: memory.lastConsolidation?.toString(),
        currentMonth: memory.currentMonth,
        currentYear: memory.currentYear
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Failed to get agent memory', { error: errorMessage });
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Estimate gas for the transaction (useful for UI feedback)
 */
export async function estimateGasForDreamUpdate(
  tokenId: number,
  dreamHash: string,
  personalityImpact?: EvolutionFields['personalityImpact']
): Promise<{
  success: boolean;
  gasEstimate?: string;
  error?: string;
}> {
  debugLog('Estimating gas for dream update', { tokenId, isEvolution: !!personalityImpact });

  try {
    const contract = await getContractInstance();
    const contractImpact = preparePersonalityImpact(personalityImpact, !!personalityImpact);
    
    // Estimate gas
    const gasEstimate = await contract.processDailyDream.estimateGas(
      tokenId,
      dreamHash,
      contractImpact
    );
    
    debugLog('Gas estimation completed', { 
      gasEstimate: gasEstimate.toString(),
      isEvolution: !!personalityImpact
    });
    
    return { 
      success: true, 
      gasEstimate: gasEstimate.toString() 
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Gas estimation failed', { error: errorMessage });
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}
