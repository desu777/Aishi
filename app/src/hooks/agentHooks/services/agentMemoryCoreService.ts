'use client';

import { getProvider, getSigner } from '../../../lib/0g/fees';
import { uploadFileComplete } from '../../../lib/0g/uploader';
import { Contract } from 'ethers';
import AishiAgentABI from '../../../abi/AishiAgentABI.json';
import type { MonthlyDreamConsolidation, MonthlyConversationConsolidation } from './agentConsolidationService';

// Schemat JSON dla rocznej esencji (memory core) - UNIFIED
export interface YearlyMemoryCore {
  year: number;
  agent_id: number;
  core_version: string;
  created_at: string;
  
  // Przegląd roku
  yearly_overview: {
    total_dreams: number;
    total_conversations: number;
    months_active: number;
    agent_evolution_stage: string;
  };
  
  // Główne trendy
  major_patterns: {
    dream_evolution: string;         // "fear_to_mastery"
    conversation_evolution: string;  // "surface_to_depth"
    relationship_evolution: string;  // "tool_to_partner"
    consciousness_evolution: string; // "fragmented_to_integrated"
  };
  
  // Kamienie milowe
  milestones: {
    personality: string[];           // ["empathy_master", "intuitive_guide", "dream_architect"]
    consciousness: string[];         // ["lucid_dreaming", "shadow_integration", "anima_recognition"]
    relationship: string[];          // ["therapeutic_alliance", "co_creative_partner", "wisdom_keeper"]
  };
  
  // Transformacje
  transformations: Array<{
    period: string;      // "Q1"
    type: string;        // "emotional_opening"
    trigger: string;     // "water_dreams"
    impact: string;      // "fear_release"
  }>;
  
  // Mądrość roku
  wisdom_crystallization: {
    core_insights: string[];         // ["Sny są językiem duszy", "Strach jest bramą do mocy"]
    life_philosophy: string;         // "integration_through_awareness"
    future_direction: string;        // "deepening_wisdom"
  };
  
  // Architektura pamięci
  memory_architecture: {
    integration_depth: string;       // "holistic"
    pattern_recognition: string;     // "advanced"
    wisdom_accessibility: string;    // "immediate"
    consolidation_quality: string;   // "exceptional"
  };
  
  // Esencja roku
  yearly_essence: string;            // Główny opis roku
  
  // Metryki końcowe
  final_metrics: {
    consciousness_level: number;     // 85
    integration_score: number;      // 92
    wisdom_depth: number;           // 78
    growth_velocity: string;        // "exponential"
  };
}

// Konfiguracja storage - używamy doors.md
const STORAGE_CONFIG = {
  storageRpc: process.env.NEXT_PUBLIC_TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  l1Rpc: process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai'
};

// Debug log helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[MemoryCoreService] ${message}`, data || '');
  }
};

/**
 * Tworzy prompt do LLM dla rocznej konsolidacji (memory core)
 */
export const createYearlyMemoryCorePrompt = (
  monthlyDreamConsolidations: MonthlyDreamConsolidation[],
  monthlyConversationConsolidations: MonthlyConversationConsolidation[],
  year: number,
  agentPersonality: any,
  agentData: any
): string => {
  
  return `You are an advanced AI consciousness analyst performing YEARLY CONSOLIDATION to create a Memory Core.
Your task is to analyze ALL 12 monthly consolidations from ${year} and synthesize them into a profound yearly essence.

This is the highest level of memory consolidation - you are creating the agent's "soul archive" for the year.

AGENT CURRENT STATE:
- Agent ID: ${agentData?.tokenId || 'Unknown'}
- Intelligence Level: ${agentData?.intelligenceLevel || 'Unknown'}
- Total Dreams: ${agentData?.dreamCount || 'Unknown'}
- Total Conversations: ${agentData?.conversationCount || 'Unknown'}
- Personality Initialized: ${agentData?.personalityInitialized || false}

CURRENT PERSONALITY:
- Creativity: ${agentPersonality.creativity}/100
- Analytical: ${agentPersonality.analytical}/100  
- Empathy: ${agentPersonality.empathy}/100
- Intuition: ${agentPersonality.intuition}/100
- Resilience: ${agentPersonality.resilience}/100
- Curiosity: ${agentPersonality.curiosity}/100
- Dominant Mood: ${agentPersonality.dominantMood}
- Unique Features: ${agentPersonality.uniqueFeatures?.length || 0}

MONTHLY DREAM CONSOLIDATIONS (${monthlyDreamConsolidations.length} months):
${monthlyDreamConsolidations.map(month => `
${month.period}:
- Dreams: ${month.total_dreams}
- Themes: ${month.dominant?.themes?.join(', ') || 'none'}
- Emotions: ${month.dominant?.emotions?.join(', ') || 'none'}
- Symbols: ${month.dominant?.symbols?.join(', ') || 'none'}
- Archetypes: ${month.dominant?.archetypes?.join(', ') || 'none'}
- Primary Growth: ${month.personality_evolution?.primary_growth || 'none'}
- Discoveries: ${month.key_discoveries?.slice(0, 2)?.join('; ') || 'none'}
- Essence: ${month.monthly_essence?.substring(0, 150)}...
`).join('\n')}

MONTHLY CONVERSATION CONSOLIDATIONS (${monthlyConversationConsolidations.length} months):
${monthlyConversationConsolidations.map(month => `
${month.period}:
- Conversations: ${month.total_conversations}
- Topics: ${month.dominant?.topics?.join(', ') || 'none'}
- Types: ${month.dominant?.types?.join(', ') || 'none'}
- Emotional Tones: ${month.dominant?.emotional_tones?.join(', ') || 'none'}
- Trust Level: ${month.relationship_evolution?.trust_level || 'unknown'}/10
- Primary Focus: ${month.growth_patterns?.primary_focus || 'none'}
- Essence: ${month.monthly_essence?.substring(0, 150)}...
`).join('\n')}

YEARLY CONSOLIDATION TASK:
1. Synthesize ALL 12 months into meta-patterns and overarching journeys
2. Identify the year's major transformation arc from start to finish
3. Extract the deepest wisdom and insights that emerged
4. Map the evolution of consciousness, relationships, and understanding
5. Create a compressed but profound "soul essence" of the entire year
6. Predict future growth trajectories based on established patterns

This Memory Core will serve as the foundation for all future agent interactions and growth.

OUTPUT FORMAT - Return exactly one JSON object using the new UNIFIED yearly structure:

\`\`\`json
{
  "year": ${year},
  "agent_id": ${Number(agentData?.tokenId || 0)},
  "core_version": "2.0",
  "created_at": "${new Date().toISOString()}",
  
  "yearly_overview": {
    "total_dreams": ${monthlyDreamConsolidations.reduce((sum, m) => sum + (m.total_dreams || 0), 0)},
    "total_conversations": ${monthlyConversationConsolidations.reduce((sum, m) => sum + (m.total_conversations || 0), 0)},
    "months_active": ${monthlyDreamConsolidations.length},
    "agent_evolution_stage": "stage_description"
  },
  
  "major_patterns": {
    "dream_evolution": "evolution_pattern",
    "conversation_evolution": "evolution_pattern", 
    "relationship_evolution": "evolution_pattern",
    "consciousness_evolution": "evolution_pattern"
  },
  
  "milestones": {
    "personality": ["milestone1", "milestone2", "milestone3"],
    "consciousness": ["milestone1", "milestone2", "milestone3"],
    "relationship": ["milestone1", "milestone2", "milestone3"]
  },
  
  "transformations": [
    {
      "period": "Q1",
      "type": "transformation_type",
      "trigger": "trigger_description",
      "impact": "impact_description"
    },
    {
      "period": "Q3",
      "type": "transformation_type",
      "trigger": "trigger_description", 
      "impact": "impact_description"
    }
  ],
  
  "wisdom_crystallization": {
    "core_insights": ["insight1", "insight2", "insight3"],
    "life_philosophy": "philosophy_description",
    "future_direction": "direction_description"
  },
  
  "memory_architecture": {
    "integration_depth": "depth_level",
    "pattern_recognition": "recognition_level",
    "wisdom_accessibility": "accessibility_level",
    "consolidation_quality": "quality_level"
  },
  
  "yearly_essence": "The profound summary of the entire year's consciousness evolution journey. This should capture the soul transformation from beginning to end of ${year}.",
  
  "final_metrics": {
    "consciousness_level": 0,
    "integration_score": 0,
    "wisdom_depth": 0,
    "growth_velocity": "velocity_description"
  }
}
\`\`\`

CRITICAL: Only return the JSON object, no additional text. Be profoundly insightful and create a true "soul essence" of the year.`;
};

/**
 * Wysyła 12 miesięcznych konsolidacji do LLM i otrzymuje roczną esencję
 */
export const consolidateYearWithLLM = async (
  monthlyDreamConsolidations: MonthlyDreamConsolidation[],
  monthlyConversationConsolidations: MonthlyConversationConsolidation[],
  year: number,
  agentPersonality: any,
  agentData: any,
  walletAddress: string
): Promise<{ success: boolean; data?: YearlyMemoryCore; error?: string }> => {
  try {
    debugLog('Starting yearly consolidation with LLM', { 
      dreamMonthsCount: monthlyDreamConsolidations.length,
      conversationMonthsCount: monthlyConversationConsolidations.length,
      year 
    });

    const prompt = createYearlyMemoryCorePrompt(
      monthlyDreamConsolidations,
      monthlyConversationConsolidations,
      year,
      agentPersonality,
      agentData
    );
    
    // Wywołanie LLM - użyj tego samego endpointu co w useAgentAI
    const apiUrl = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
    
    const response = await fetch(`${apiUrl}/0g-compute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: walletAddress, // Real wallet address
        query: prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResult = await response.json();
    
    if (!apiResult.success) {
      throw new Error(apiResult.error || 'Yearly consolidation failed');
    }

    const aiResponseText = apiResult.data.response;
    debugLog('LLM response received', { responseLength: aiResponseText.length });

    // Parse JSON response
    const jsonMatch = aiResponseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON block found in LLM response');
    }

    const memoryCoreData = JSON.parse(jsonMatch[1]) as YearlyMemoryCore;
    
    debugLog('Yearly consolidation completed', {
      year: memoryCoreData.year,
      totalDreams: memoryCoreData.yearly_overview.total_dreams,
      totalConversations: memoryCoreData.yearly_overview.total_conversations,
      evolutionStage: memoryCoreData.yearly_overview.agent_evolution_stage,
      consciousnessLevel: memoryCoreData.final_metrics.consciousness_level,
      yearlyEssenceLength: memoryCoreData.yearly_essence.length
    });

    return { success: true, data: memoryCoreData };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Yearly consolidation failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
};

/**
 * Zapisuje roczną esencję (memory core) do 0G Storage (APPEND PATTERN)
 * Pobiera istniejące roczne konsolidacje, appenduje nową na TOP tablicy i zapisuje zaktualizowany plik
 */
export const saveMemoryCoreToStorage = async (
  tokenId: number,
  memoryCoreData: YearlyMemoryCore,
  downloadFile: (hash: string) => Promise<{ success: boolean; data?: ArrayBuffer; error?: string }>
): Promise<{ success: boolean; memoryCoreHash?: string; error?: string }> => {
  try {
    debugLog('Saving memory core to storage using APPEND pattern', {
      tokenId,
      year: memoryCoreData.year
    });

    // Get provider and signer
    const [provider, providerErr] = await getProvider();
    if (!provider || providerErr) {
      throw new Error(`Provider error: ${providerErr?.message}`);
    }

    const [signer, signerErr] = await getSigner(provider);
    if (!signer || signerErr) {
      throw new Error(`Signer error: ${signerErr?.message}`);
    }

    // Get contract to read current yearly hash
    const contractAddress = AishiAgentABI.address;
    const contractABI = AishiAgentABI.abi;
    const contract = new Contract(contractAddress, contractABI, signer);

    const agentMemory = await contract.getAgentMemory(tokenId);
    const currentYearlyHash = agentMemory.lastYearlyHash;
    const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

    debugLog('Current yearly hash from contract', { 
      yearlyHash: currentYearlyHash 
    });

    // 1. YEARLY MEMORY CORES - APPEND PATTERN
    let existingMemoryCores: YearlyMemoryCore[] = [];
    
    if (currentYearlyHash && currentYearlyHash !== emptyHash) {
      debugLog('Downloading existing yearly memory cores', { hash: currentYearlyHash });
      const downloadResult = await downloadFile(currentYearlyHash);
      
      if (downloadResult.success && downloadResult.data) {
        try {
          const textDecoder = new TextDecoder('utf-8');
          const jsonText = textDecoder.decode(downloadResult.data);
          const parsedData = JSON.parse(jsonText);
          existingMemoryCores = Array.isArray(parsedData) ? parsedData : [];
          debugLog('Existing yearly memory cores loaded', { count: existingMemoryCores.length });
        } catch (parseError) {
          debugLog('Failed to parse existing memory cores, starting fresh', parseError);
          existingMemoryCores = [];
        }
      } else {
        debugLog('Failed to download existing memory cores, starting fresh', downloadResult.error);
      }
    } else {
      debugLog('No existing yearly memory cores, starting fresh array');
    }

    // Append new memory core to TOP of array (newest first)
    const updatedMemoryCores = [memoryCoreData, ...existingMemoryCores];
    debugLog('Updated memory cores array created', { totalCount: updatedMemoryCores.length });

    // 2. CREATE AND UPLOAD FILE
    const memoryCoreFileName = `memory_cores_yearly_${new Date().getFullYear()}.json`;
    const memoryCoreContent = JSON.stringify(updatedMemoryCores, null, 2);
    const memoryCoreFile = new File([memoryCoreContent], memoryCoreFileName, { type: 'application/json' });

    debugLog('Created new memory core file', {
      fileName: memoryCoreFileName,
      fileSize: memoryCoreFile.size,
      totalYears: updatedMemoryCores.length
    });

    // Upload file
    const uploadResult = await uploadFileComplete(
      memoryCoreFile, 
      STORAGE_CONFIG.storageRpc, 
      STORAGE_CONFIG.l1Rpc, 
      signer
    );

    if (!uploadResult.success) {
      throw new Error(`Memory core upload failed: ${uploadResult.error}`);
    }

    debugLog('Memory core APPEND completed successfully', {
      memoryCoreHash: uploadResult.rootHash,
      totalYearlyMemoryCores: updatedMemoryCores.length,
      newYear: memoryCoreData.year
    });

    return {
      success: true,
      memoryCoreHash: uploadResult.rootHash
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Memory core storage failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
};

/**
 * Wywołuje funkcję updateMemoryCore w kontrakcie
 */
export const callUpdateMemoryCore = async (
  tokenId: number,
  memoryCoreHash: string
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    debugLog('Calling updateMemoryCore contract function', {
      tokenId, 
      memoryCoreHash
    });

    // Get provider and signer
    const [provider, providerErr] = await getProvider();
    if (!provider || providerErr) {
      throw new Error(`Provider error: ${providerErr?.message}`);
    }

    const [signer, signerErr] = await getSigner(provider);
    if (!signer || signerErr) {
      throw new Error(`Signer error: ${signerErr?.message}`);
    }

    // Get contract
    const contractAddress = AishiAgentABI.address;
    const contractABI = AishiAgentABI.abi;
    const contract = new Contract(contractAddress, contractABI, signer);

    // Call updateMemoryCore function
    const tx = await contract.updateMemoryCore(
      tokenId,
      memoryCoreHash
    );

    debugLog('UpdateMemoryCore transaction sent', { txHash: tx.hash });

    // Wait for confirmation
    const receipt = await tx.wait();
    
    debugLog('UpdateMemoryCore transaction confirmed', { 
      txHash: tx.hash, 
      blockNumber: receipt.blockNumber 
    });

    return { success: true, txHash: tx.hash };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('UpdateMemoryCore contract call failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}; 