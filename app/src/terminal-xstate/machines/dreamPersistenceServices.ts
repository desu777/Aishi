/**
 * @fileoverview Dream Machine Persistence Services
 * @description Services for file management, storage upload, and contract updates
 */

import { fromPromise } from 'xstate';
import { AIResponse } from '../types/contextTypes';
import { StandardDreamFields } from '../services/dreamDataValidator';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamMachine] ${message}`, data || '');
  }
};

// Service: Manage dream file
export const fileManagementService = fromPromise(async ({ input }: { input: {
  aiResponse: AIResponse;
  agentName: string;
  currentRootHash?: string;
}}) => {
  debugLog('📁 Starting file management service', {
    agentName: input.agentName,
    hasCurrentHash: !!input.currentRootHash,
    dreamId: input.aiResponse.dreamData?.id
  });
  
  try {
    // Dynamic import to prevent circular dependencies
    const { manageDailyDreamsFile } = await import('../services/dreamFileManager');
    
    // Convert AI response to StandardDreamFields
    const dreamData: StandardDreamFields = {
      id: input.aiResponse.dreamData?.id || Date.now(),
      date: input.aiResponse.dreamData?.date || new Date().toISOString().split('T')[0],
      timestamp: input.aiResponse.dreamData?.timestamp || Math.floor(Date.now() / 1000),
      emotions: input.aiResponse.dreamData?.emotions || [],
      symbols: input.aiResponse.dreamData?.symbols || [],
      themes: input.aiResponse.dreamData?.themes || [],
      intensity: input.aiResponse.dreamData?.intensity || 5,
      lucidity: input.aiResponse.dreamData?.lucidity || 3,
      archetypes: input.aiResponse.dreamData?.archetypes || [],
      recurring_from: input.aiResponse.dreamData?.recurring_from || [],
      personality_impact: input.aiResponse.dreamData?.personality_impact,
      sleep_quality: input.aiResponse.dreamData?.sleep_quality,
      recall_clarity: input.aiResponse.dreamData?.recall_clarity,
      dream_type: input.aiResponse.dreamData?.dreamType || 'neutral'
    };
    
    const result = await manageDailyDreamsFile(
      input.agentName,
      dreamData,
      input.currentRootHash
    );
    
    if (!result.success) {
      throw new Error(`File management failed: ${result.error}`);
    }
    
    debugLog('✅ File management completed', {
      fileName: result.fileName,
      isNewFile: result.isNewFile,
      totalDreams: result.metadata?.totalDreamsCount
    });
    
    return {
      data: result.data,
      fileName: result.fileName
    };
  } catch (error) {
    debugLog('[ERROR] File management failed', { error: String(error) });
    throw error;
  }
});

// Service: Upload to storage
export const storageUploadService = fromPromise(async ({ input }: { input: {
  data: StandardDreamFields[];
  fileName: string;
}}) => {
  debugLog('☁️ Starting storage upload service', {
    fileName: input.fileName,
    dreamsCount: input.data?.length || 0
  });
  
  try {
    // Dynamic import to prevent circular dependencies
    const { uploadDreamDataSecurely } = await import('../services/dreamStorageUploader');
    
    const result = await uploadDreamDataSecurely(
      input.data,
      input.fileName,
      {
        enableVerification: true,
        maxRetries: 3,
        retryDelay: 1000,
        verificationTimeout: 10000
      }
    );
    
    if (!result.success || !result.rootHash) {
      throw new Error(`Storage upload failed: ${result.error || 'No root hash returned'}`);
    }
    
    debugLog('✅ Storage upload completed', {
      rootHash: result.rootHash.substring(0, 10) + '...',
      verified: result.verified,
      uploadTime: result.metadata?.uploadTime
    });

    return {
      rootHash: result.rootHash,
      verified: result.verified
    };
  } catch (error) {
    debugLog('[ERROR] Storage upload failed', { error: String(error) });
    throw error;
  }
});

// Service: Update contract
export const contractUpdateService = fromPromise(async ({ input }: { input: {
  tokenId: number;
  rootHash: string;
  personalityImpact?: any;
  dreamCount: number;
}}) => {
  debugLog('⛓️ Starting contract update service', {
    tokenId: input.tokenId,
    rootHash: input.rootHash.substring(0, 10) + '...',
    hasPersonalityImpact: !!input.personalityImpact,
    dreamCount: input.dreamCount
  });
  
  try {
    // Dynamic import to prevent circular dependencies
    const { updateDreamContract } = await import('../services/dreamContractUpdater');
    
    const result = await updateDreamContract(
      input.tokenId,
      input.rootHash,
      input.personalityImpact,
      input.dreamCount
    );
    
    if (!result.success) {
      throw new Error(`Contract update failed: ${result.error}`);
    }
    
    debugLog('✅ Contract update completed', {
      txHash: result.txHash?.substring(0, 10) + '...',
      isEvolutionDream: result.isEvolutionDream
    });
    
    return {
      txHash: result.txHash,
      isEvolutionDream: result.isEvolutionDream
    };
  } catch (error) {
    debugLog('[ERROR] Contract update failed', { error: String(error) });
    throw error;
  }
});

// Service: Dream persistence orchestrator (for backwards compatibility)
export const dreamPersistenceService = fromPromise(async ({ input }: { input: any }) => {
  debugLog('Starting dream persistence protocol', {
    agentName: input.agentProfile?.name,
    dreamId: input.aiResponse?.dreamData?.id
  });
  
  try {
    // Dynamic import to prevent circular dependencies
    const { executeDreamPersistenceProtocol } = await import('../services/dreamPersistenceOrchestrator');
    
    const result = await executeDreamPersistenceProtocol(input);
    
    debugLog('[SUCCESS] Dream persistence completed', {
      rootHash: result.rootHash?.substring(0, 10) + '...',
      txHash: result.txHash?.substring(0, 10) + '...',
      isEvolution: result.isEvolutionDream,
      totalTime: result.metadata?.totalTime
    });
    
    return {
      rootHash: result.rootHash,
      txHash: result.txHash,
      isEvolutionDream: result.isEvolutionDream,
      persistenceResult: result
    };
  } catch (error) {
    debugLog('[ERROR] Dream persistence failed', { error: String(error) });
    throw error;
  }
});