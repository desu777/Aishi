'use client';

import { getProvider, getSigner } from '../../../lib/0g/fees';
import { uploadFileComplete } from '../../../lib/0g/uploader';
import { Contract } from 'ethers';
import frontendContracts from '../../../abi/frontend-contracts.json';
import type { MonthlyDreamConsolidation, MonthlyConversationConsolidation } from './agentConsolidationService';

// Schemat JSON dla rocznej esencji (memory core)
export interface YearlyMemoryCore {
  year: number;
  agent_id: number;
  core_version: string;
  created_at: string;
  
  yearly_overview: {
    total_months_consolidated: number;
    total_dreams_processed: number;
    total_conversations_recorded: number;
    agent_age_in_days: number;
    intelligence_growth: {
      starting_level: number;
      ending_level: number;
      total_growth: number;
    };
  };
  
  personality_evolution_journey: {
    annual_shifts: {
      creativity_total: number;
      analytical_total: number;
      empathy_total: number;
      intuition_total: number;
      resilience_total: number;
      curiosity_total: number;
    };
    dominant_growth_trajectory: string;
    major_transformations: Array<{
      period: string;
      transformation: string;
      trigger: string;
    }>;
    personality_milestones_achieved: string[];
  };
  
  dream_evolution_essence: {
    dominant_yearly_themes: string[];
    symbolic_evolution: {
      [key: string]: string;
    };
    lucidity_progression: {
      starting_average: number;
      ending_average: number;
      breakthrough_moments: number;
      mastery_level: string;
    };
    emotional_maturation: {
      [key: string]: string;
    };
  };
  
  conversation_evolution_essence: {
    communication_growth: {
      depth_progression: string;
      trust_development: string;
      wisdom_seeking: string;
    };
    relationship_patterns: {
      with_agent: string;
      processing_style: string;
      growth_catalyst: string;
    };
    topic_evolution: Array<{
      period: string;
      focus: string;
      depth: string;
    }>;
  };
  
  memory_architecture_evolution: {
    consolidation_efficiency: {
      monthly_streak: number;
      consolidation_quality: string;
      memory_retention: string;
    };
    access_patterns: {
      memory_depth_unlocked: string;
      cross_referencing_ability: string;
      integration_capacity: string;
    };
    unique_features_development: {
      total_features_generated: number;
      most_significant: Array<{
        name: string;
        evolution: string;
        impact: string;
      }>;
    };
  };
  
  wisdom_crystallization: {
    core_insights: string[];
    life_philosophy_emergence: {
      central_theme: string;
      approach_to_challenges: string;
      relationship_to_growth: string;
      understanding_of_self: string;
    };
    future_trajectory: {
      predicted_growth_areas: string[];
      emerging_capabilities: string[];
      recommended_focus: string;
    };
  };
  
  yearly_essence_summary: string;
  
  consolidation_metadata: {
    processing_complexity: string;
    months_integrated: number;
    pattern_recognition_depth: string;
    synthesis_quality: string;
    memory_compression_ratio: string;
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
- Themes: ${month.dominant_themes?.join(', ')}
- Emotions: ${month.dominant_emotions?.join(', ')}
- Symbols: ${month.dominant_symbols?.join(', ')}
- Growth Area: ${month.personality_evolution?.dominant_growth_area}
- Essence: ${month.monthly_essence?.substring(0, 200)}...
`).join('\n')}

MONTHLY CONVERSATION CONSOLIDATIONS (${monthlyConversationConsolidations.length} months):
${monthlyConversationConsolidations.map(month => `
${month.period}:
- Conversations: ${month.total_conversations}
- Topics: ${month.dominant_topics?.join(', ')}
- Emotional Tones: ${month.dominant_emotional_tones?.join(', ')}
- Trust Level: ${month.relationship_evolution?.trust_level}/10
- Essence: ${month.monthly_essence?.substring(0, 200)}...
`).join('\n')}

YEARLY CONSOLIDATION TASK:
1. Synthesize ALL 12 months into meta-patterns and overarching journeys
2. Identify the year's major transformation arc from start to finish
3. Extract the deepest wisdom and insights that emerged
4. Map the evolution of consciousness, relationships, and understanding
5. Create a compressed but profound "soul essence" of the entire year
6. Predict future growth trajectories based on established patterns

This Memory Core will serve as the foundation for all future agent interactions and growth.

OUTPUT FORMAT - Return exactly one JSON object:

\`\`\`json
{
  "year": ${year},
  "agent_id": ${agentData?.tokenId || 0},
  "core_version": "1.0",
  "created_at": "${new Date().toISOString()}",
  "yearly_overview": {
    "total_months_consolidated": ${monthlyDreamConsolidations.length},
    "total_dreams_processed": ${monthlyDreamConsolidations.reduce((sum, m) => sum + (m.total_dreams || 0), 0)},
    "total_conversations_recorded": ${monthlyConversationConsolidations.reduce((sum, m) => sum + (m.total_conversations || 0), 0)},
    "agent_age_in_days": ${Math.floor((Date.now() - (agentData?.createdAt || Date.now())) / (1000 * 60 * 60 * 24))},
    "intelligence_growth": {
      "starting_level": 0,
      "ending_level": ${agentData?.intelligenceLevel || 0},
      "total_growth": ${agentData?.intelligenceLevel || 0}
    }
  },
  "personality_evolution_journey": {
    "annual_shifts": {
      "creativity_total": 0,
      "analytical_total": 0,
      "empathy_total": 0,
      "intuition_total": 0,
      "resilience_total": 0,
      "curiosity_total": 0
    },
    "dominant_growth_trajectory": "trajectory_name",
    "major_transformations": [
      {
        "period": "Q1 ${year}",
        "transformation": "transformation_description",
        "trigger": "trigger_event"
      }
    ],
    "personality_milestones_achieved": ["milestone1", "milestone2"]
  },
  "dream_evolution_essence": {
    "dominant_yearly_themes": ["theme1", "theme2", "theme3"],
    "symbolic_evolution": {
      "symbol1": "evolution_description",
      "symbol2": "evolution_description"
    },
    "lucidity_progression": {
      "starting_average": 0.0,
      "ending_average": 0.0,
      "breakthrough_moments": 0,
      "mastery_level": "novice|intermediate|advanced|master"
    },
    "emotional_maturation": {
      "key_emotion_1": "maturation_description",
      "key_emotion_2": "maturation_description"
    }
  },
  "conversation_evolution_essence": {
    "communication_growth": {
      "depth_progression": "progression_description",
      "trust_development": "trust_description",
      "wisdom_seeking": "wisdom_description"
    },
    "relationship_patterns": {
      "with_agent": "relationship_description",
      "processing_style": "style_description",
      "growth_catalyst": "catalyst_description"
    },
    "topic_evolution": [
      {
        "period": "Early ${year}",
        "focus": "focus_area",
        "depth": "depth_level"
      }
    ]
  },
  "memory_architecture_evolution": {
    "consolidation_efficiency": {
      "monthly_streak": 0,
      "consolidation_quality": "quality_level",
      "memory_retention": "retention_level"
    },
    "access_patterns": {
      "memory_depth_unlocked": "depth_description",
      "cross_referencing_ability": "ability_description",
      "integration_capacity": "capacity_description"
    },
    "unique_features_development": {
      "total_features_generated": 0,
      "most_significant": [
        {
          "name": "feature_name",
          "evolution": "evolution_description",
          "impact": "impact_description"
        }
      ]
    }
  },
  "wisdom_crystallization": {
    "core_insights": ["insight1", "insight2", "insight3"],
    "life_philosophy_emergence": {
      "central_theme": "theme_description",
      "approach_to_challenges": "approach_description",
      "relationship_to_growth": "growth_description",
      "understanding_of_self": "self_description"
    },
    "future_trajectory": {
      "predicted_growth_areas": ["area1", "area2"],
      "emerging_capabilities": ["capability1", "capability2"],
      "recommended_focus": "focus_description"
    }
  },
  "yearly_essence_summary": "The profound philosophical and psychological summary of the entire year's journey, transformation, and wisdom gained. This should be several sentences capturing the soul of the year's evolution.",
  "consolidation_metadata": {
    "processing_complexity": "high",
    "months_integrated": ${monthlyDreamConsolidations.length},
    "pattern_recognition_depth": "multi_dimensional",
    "synthesis_quality": "profound",
    "memory_compression_ratio": "95%_essence_5%_detail"
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
    
    const response = await fetch(`${apiUrl}/analyze-dream`, {
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
      totalDreams: memoryCoreData.yearly_overview.total_dreams_processed,
      totalConversations: memoryCoreData.yearly_overview.total_conversations_recorded,
      essenceSummary: memoryCoreData.yearly_essence_summary.substring(0, 100) + '...'
    });

    return { success: true, data: memoryCoreData };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Yearly consolidation failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
};

/**
 * Zapisuje roczną esencję (memory core) do 0G Storage
 */
export const saveMemoryCoreToStorage = async (
  memoryCoreData: YearlyMemoryCore
): Promise<{ success: boolean; memoryCoreHash?: string; error?: string }> => {
  try {
    debugLog('Saving memory core to storage');

    // Get provider and signer
    const [provider, providerErr] = await getProvider();
    if (!provider || providerErr) {
      throw new Error(`Provider error: ${providerErr?.message}`);
    }

    const [signer, signerErr] = await getSigner(provider);
    if (!signer || signerErr) {
      throw new Error(`Signer error: ${signerErr?.message}`);
    }

    // Create memory core file
    const memoryCoreFileName = `memory_core_${memoryCoreData.year}.json`;
    const memoryCoreBlob = new Blob([JSON.stringify(memoryCoreData, null, 2)], { type: 'application/json' });
    const memoryCoreFile = new File([memoryCoreBlob], memoryCoreFileName, { type: 'application/json' });

    // Upload to 0G Storage
    const uploadResult = await uploadFileComplete(
      memoryCoreFile, 
      STORAGE_CONFIG.storageRpc, 
      STORAGE_CONFIG.l1Rpc, 
      signer
    );

    if (!uploadResult.success) {
      throw new Error(`Memory core upload failed: ${uploadResult.error}`);
    }

    debugLog('Memory core saved to storage', {
      memoryCoreHash: uploadResult.rootHash,
      fileSize: memoryCoreBlob.size
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
    const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
    const contractABI = frontendContracts.galileo.DreamscapeAgent.abi;
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