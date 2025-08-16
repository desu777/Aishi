/**
 * @fileoverview Dream Persistence Orchestrator for XState Terminal  
 * @description Main orchestrator for the complete dream persistence protocol
 */

import { validateDreamDataSchema, ValidationResult, StandardDreamFields, EvolutionFields } from './dreamDataValidator';
import { manageDailyDreamsFile, FileManagementResult } from './dreamFileManager';
import { uploadDreamDataSecurely, SecureUploadResult } from './dreamStorageUploader';
import { updateDreamContract, ContractUpdateResult } from './dreamContractUpdater';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamPersistenceOrchestrator] ${message}`, data || '');
  }
};

/**
 * Complete persistence protocol result
 */
export interface PersistenceProtocolResult {
  success: boolean;
  error?: string;
  
  // Stage results
  validation?: ValidationResult;
  fileManagement?: FileManagementResult;
  storageUpload?: SecureUploadResult;
  contractUpdate?: ContractUpdateResult;
  
  // Final outputs
  rootHash?: string;
  txHash?: string;
  isEvolutionDream?: boolean;
  
  // Metadata
  metadata?: {
    totalTime: number;
    stageTimings: {
      validation: number;
      fileManagement: number;
      storageUpload: number;
      contractUpdate: number;
    };
    agentName: string;
    dreamId: number;
    dreamsCount: number;
  };
}

/**
 * Input data for the persistence protocol
 */
export interface PersistenceProtocolInput {
  // AI Response data (Block 2)
  aiResponseBlock2: any;
  
  // Agent context
  tokenId: number;
  agentName: string;
  dreamCount: number;
  currentRootHash?: string;
  
  // Optional configuration
  config?: {
    enableVerification?: boolean;
    maxRetries?: number;
    skipContractUpdate?: boolean; // For testing
  };
}

/**
 * Main orchestrator function - executes complete persistence protocol
 */
export async function executeDreamPersistenceProtocol(
  input: PersistenceProtocolInput
): Promise<PersistenceProtocolResult> {
  const protocolStartTime = Date.now();
  const stageTimings = { validation: 0, fileManagement: 0, storageUpload: 0, contractUpdate: 0 };
  
  debugLog('🚀 Starting Dream Persistence Protocol', {
    tokenId: input.tokenId,
    agentName: input.agentName,
    dreamCount: input.dreamCount,
    nextDreamId: input.dreamCount + 1,
    isEvolutionDream: (input.dreamCount + 1) % 5 === 0,
    hasCurrentHash: !!input.currentRootHash
  });

  try {
    // ====== STAGE 1: VALIDATION ======
    debugLog('📋 STAGE 1: Validating dream data schema');
    const validationStart = Date.now();
    
    const validationResult = validateDreamDataSchema(
      input.aiResponseBlock2,
      input.dreamCount
    );
    
    stageTimings.validation = Date.now() - validationStart;
    
    if (!validationResult.isValid) {
      debugLog('❌ Validation failed', { errors: validationResult.errors });
      return {
        success: false,
        error: `Validation failed: ${validationResult.errors.join(', ')}`,
        validation: validationResult,
        metadata: {
          totalTime: Date.now() - protocolStartTime,
          stageTimings,
          agentName: input.agentName,
          dreamId: input.dreamCount + 1,
          dreamsCount: 0
        }
      };
    }

    debugLog('✅ Validation successful', {
      warnings: validationResult.warnings?.length || 0,
      hasPersonalityImpact: !!validationResult.validatedData?.personalityImpact
    });

    // ====== STAGE 2: FILE MANAGEMENT ======
    debugLog('📁 STAGE 2: Managing daily dreams file');
    const fileManagementStart = Date.now();
    
    const fileManagementResult = await manageDailyDreamsFile(
      input.agentName,
      validationResult.validatedData!.dreamData,
      input.currentRootHash
    );
    
    stageTimings.fileManagement = Date.now() - fileManagementStart;
    
    if (!fileManagementResult.success || !fileManagementResult.data || !fileManagementResult.fileName) {
      debugLog('❌ File management failed', { error: fileManagementResult.error });
      return {
        success: false,
        error: `File management failed: ${fileManagementResult.error}`,
        validation: validationResult,
        fileManagement: fileManagementResult,
        metadata: {
          totalTime: Date.now() - protocolStartTime,
          stageTimings,
          agentName: input.agentName,
          dreamId: input.dreamCount + 1,
          dreamsCount: 0
        }
      };
    }

    debugLog('✅ File management successful', {
      fileName: fileManagementResult.fileName,
      dreamsCount: fileManagementResult.data.length,
      isNewFile: fileManagementResult.isNewFile
    });

    // ====== STAGE 3: STORAGE UPLOAD ======
    debugLog('☁️ STAGE 3: Uploading to 0G Storage');
    const storageUploadStart = Date.now();
    
    const uploadResult = await uploadDreamDataSecurely(
      fileManagementResult.data,
      fileManagementResult.fileName,
      {
        enableVerification: input.config?.enableVerification ?? true,
        maxRetries: input.config?.maxRetries ?? 3
      }
    );
    
    stageTimings.storageUpload = Date.now() - storageUploadStart;
    
    if (!uploadResult.success || !uploadResult.rootHash) {
      debugLog('❌ Storage upload failed', { error: uploadResult.error });
      return {
        success: false,
        error: `Storage upload failed: ${uploadResult.error}`,
        validation: validationResult,
        fileManagement: fileManagementResult,
        storageUpload: uploadResult,
        metadata: {
          totalTime: Date.now() - protocolStartTime,
          stageTimings,
          agentName: input.agentName,
          dreamId: input.dreamCount + 1,
          dreamsCount: fileManagementResult.data.length
        }
      };
    }

    debugLog('✅ Storage upload successful', {
      rootHash: uploadResult.rootHash.substring(0, 10) + '...',
      verified: uploadResult.verified,
      fileSize: uploadResult.metadata?.fileSize
    });

    // ====== STAGE 4: CONTRACT UPDATE ======
    if (input.config?.skipContractUpdate) {
      debugLog('⚠️ Skipping contract update (test mode)');
      
      return {
        success: true,
        validation: validationResult,
        fileManagement: fileManagementResult,
        storageUpload: uploadResult,
        rootHash: uploadResult.rootHash,
        isEvolutionDream: !!validationResult.validatedData?.personalityImpact,
        metadata: {
          totalTime: Date.now() - protocolStartTime,
          stageTimings,
          agentName: input.agentName,
          dreamId: input.dreamCount + 1,
          dreamsCount: fileManagementResult.data.length
        }
      };
    }

    debugLog('⛓️ STAGE 4: Updating smart contract');
    const contractUpdateStart = Date.now();
    
    const contractUpdateResult = await updateDreamContract(
      input.tokenId,
      uploadResult.rootHash,
      validationResult.validatedData?.personalityImpact,
      input.dreamCount
    );
    
    stageTimings.contractUpdate = Date.now() - contractUpdateStart;
    
    if (!contractUpdateResult.success) {
      debugLog('❌ Contract update failed', { error: contractUpdateResult.error });
      
      // Note: At this point, storage upload was successful but contract update failed
      // The data is persisted in storage but not recorded in blockchain
      // This is a partial success scenario
      return {
        success: false,
        error: `Contract update failed: ${contractUpdateResult.error}`,
        validation: validationResult,
        fileManagement: fileManagementResult,
        storageUpload: uploadResult,
        contractUpdate: contractUpdateResult,
        rootHash: uploadResult.rootHash, // Storage succeeded
        metadata: {
          totalTime: Date.now() - protocolStartTime,
          stageTimings,
          agentName: input.agentName,
          dreamId: input.dreamCount + 1,
          dreamsCount: fileManagementResult.data.length
        }
      };
    }

    debugLog('✅ Contract update successful', {
      txHash: contractUpdateResult.txHash?.substring(0, 10) + '...',
      gasUsed: contractUpdateResult.gasUsed,
      isEvolutionDream: contractUpdateResult.isEvolutionDream
    });

    // ====== PROTOCOL COMPLETED SUCCESSFULLY ======
    const totalTime = Date.now() - protocolStartTime;
    
    debugLog('🎉 Dream Persistence Protocol completed successfully!', {
      totalTime,
      rootHash: uploadResult.rootHash.substring(0, 10) + '...',
      txHash: contractUpdateResult.txHash?.substring(0, 10) + '...',
      isEvolutionDream: contractUpdateResult.isEvolutionDream,
      dreamsCount: fileManagementResult.data.length
    });

    return {
      success: true,
      validation: validationResult,
      fileManagement: fileManagementResult,
      storageUpload: uploadResult,
      contractUpdate: contractUpdateResult,
      rootHash: uploadResult.rootHash,
      txHash: contractUpdateResult.txHash,
      isEvolutionDream: contractUpdateResult.isEvolutionDream,
      metadata: {
        totalTime,
        stageTimings,
        agentName: input.agentName,
        dreamId: input.dreamCount + 1,
        dreamsCount: fileManagementResult.data.length
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const totalTime = Date.now() - protocolStartTime;
    
    debugLog('💥 Dream Persistence Protocol failed with unexpected error', {
      error: errorMessage,
      totalTime,
      stageTimings
    });

    return {
      success: false,
      error: `Protocol failed: ${errorMessage}`,
      metadata: {
        totalTime,
        stageTimings,
        agentName: input.agentName,
        dreamId: input.dreamCount + 1,
        dreamsCount: 0
      }
    };
  }
}

/**
 * Validate protocol input before execution
 */
export function validateProtocolInput(input: PersistenceProtocolInput): {
  isValid: boolean;
  error?: string;
} {
  if (!input.aiResponseBlock2) {
    return { isValid: false, error: 'AI response block 2 is required' };
  }

  if (typeof input.tokenId !== 'number' || input.tokenId <= 0) {
    return { isValid: false, error: 'Valid tokenId is required' };
  }

  if (typeof input.agentName !== 'string' || input.agentName.trim().length === 0) {
    return { isValid: false, error: 'Agent name is required' };
  }

  if (typeof input.dreamCount !== 'number' || input.dreamCount < 0) {
    return { isValid: false, error: 'Valid dream count is required' };
  }

  return { isValid: true };
}

/**
 * Get protocol status summary for UI/logging
 */
export function getProtocolStatusSummary(result: PersistenceProtocolResult): {
  status: 'success' | 'partial' | 'failed';
  completedStages: string[];
  failedStage?: string;
  summary: string;
} {
  const completedStages: string[] = [];
  let failedStage: string | undefined;

  if (result.validation?.isValid) completedStages.push('validation');
  else if (result.validation) failedStage = 'validation';

  if (result.fileManagement?.success) completedStages.push('fileManagement');
  else if (result.fileManagement) failedStage = 'fileManagement';

  if (result.storageUpload?.success) completedStages.push('storageUpload');
  else if (result.storageUpload) failedStage = 'storageUpload';

  if (result.contractUpdate?.success) completedStages.push('contractUpdate');
  else if (result.contractUpdate) failedStage = 'contractUpdate';

  let status: 'success' | 'partial' | 'failed';
  let summary: string;

  if (result.success) {
    status = 'success';
    summary = `Dream persisted successfully. ${completedStages.length}/4 stages completed.`;
  } else if (result.storageUpload?.success && !result.contractUpdate?.success) {
    status = 'partial';
    summary = `Dream saved to storage but contract update failed. Data is preserved.`;
  } else {
    status = 'failed';
    summary = `Dream persistence failed at ${failedStage} stage.`;
  }

  return {
    status,
    completedStages,
    failedStage,
    summary
  };
}

/**
 * Test function for protocol validation (useful for debugging)
 */
export async function testProtocol(): Promise<PersistenceProtocolResult> {
  const testInput: PersistenceProtocolInput = {
    aiResponseBlock2: {
      analysis: "Test dream analysis",
      dreamData: {
        id: 999999,
        date: new Date().toISOString().split('T')[0],
        timestamp: Math.floor(Date.now() / 1000),
        emotions: ["test_emotion"],
        symbols: ["test_symbol"],
        intensity: 5,
        lucidity: 3
      }
    },
    tokenId: 1,
    agentName: "TestAgent",
    dreamCount: 0,
    config: {
      skipContractUpdate: true, // Skip contract for testing
      enableVerification: false,
      maxRetries: 1
    }
  };

  debugLog('🧪 Running protocol test');
  return await executeDreamPersistenceProtocol(testInput);
}

/**
 * Get protocol performance metrics
 */
export function getProtocolMetrics(result: PersistenceProtocolResult): {
  totalTime: number;
  averageStageTime: number;
  slowestStage: string;
  fastestStage: string;
  efficiency: number; // 0-1 score based on success rate and time
} {
  if (!result.metadata?.stageTimings) {
    return {
      totalTime: 0,
      averageStageTime: 0,
      slowestStage: 'unknown',
      fastestStage: 'unknown',
      efficiency: 0
    };
  }

  const timings = result.metadata.stageTimings;
  const times = Object.values(timings);
  const totalTime = result.metadata.totalTime;
  const averageStageTime = times.reduce((a, b) => a + b, 0) / times.length;

  const slowestStage = Object.entries(timings).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const fastestStage = Object.entries(timings).reduce((a, b) => a[1] < b[1] ? a : b)[0];

  // Calculate efficiency: success rate + speed factor
  const successRate = result.success ? 1 : (result.storageUpload?.success ? 0.7 : 0.3);
  const speedFactor = Math.max(0.1, Math.min(1, 10000 / totalTime)); // Normalize to 0.1-1
  const efficiency = (successRate * 0.7) + (speedFactor * 0.3);

  return {
    totalTime,
    averageStageTime,
    slowestStage,
    fastestStage,
    efficiency: Math.round(efficiency * 100) / 100
  };
}
