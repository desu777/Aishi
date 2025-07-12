'use client';

import { getProvider, getSigner } from '../../../lib/0g/fees';
import { uploadFileComplete } from '../../../lib/0g/uploader';
import { Contract } from 'ethers';
import frontendContracts from '../../../abi/frontend-contracts.json';

// Schemat JSON dla konsolidacji miesięcznej snów
export interface MonthlyDreamConsolidation {
  month: number;           // 1-12
  year: number;            // 2024+
  total_dreams: number;    // Liczba snów w miesiącu
  period: string;          // "January 2024"
  
  // Dominujące wzorce
  dominant_themes: string[];           // ["anxiety", "transformation", "relationships"]
  dominant_emotions: string[];         // ["fear", "joy", "curiosity"]
  dominant_symbols: string[];          // ["water", "flying", "animals"]
  
  // Statystyki
  average_intensity: number;           // 1-10
  average_lucidity: number;            // 1-5
  intensity_trend: 'increasing' | 'decreasing' | 'stable';
  lucidity_trend: 'increasing' | 'decreasing' | 'stable';
  
  // Analiza rozwoju
  personality_evolution: {
    creativity_shift: number;          // -10 do +10
    analytical_shift: number;          // -10 do +10
    empathy_shift: number;             // -10 do +10
    intuition_shift: number;           // -10 do +10
    resilience_shift: number;          // -10 do +10
    curiosity_shift: number;           // -10 do +10
    dominant_growth_area: string;      // "creativity" | "empathy" | etc.
  };
  
  // Kluczowe insighty
  key_insights: string[];              // Najważniejsze odkrycia z miesiąca
  recurring_patterns: string[];        // Powtarzające się wzorce
  breakthrough_moments: string[];      // Przełomowe momenty
  
  // Esencja miesiąca
  monthly_essence: string;             // Głębokie podsumowanie miesiąca
  growth_summary: string;              // Podsumowanie rozwoju osobistego
  
  // Metadane
  created_at: string;                  // ISO timestamp
  consolidation_version: string;       // "1.0"
}

// Schemat JSON dla konsolidacji miesięcznej konwersacji
export interface MonthlyConversationConsolidation {
  month: number;           
  year: number;            
  total_conversations: number;
  period: string;          
  
  // Dominujące tematy i tony
  dominant_topics: string[];           // ["dream_interpretation", "personal_growth", "relationships"]
  dominant_emotional_tones: string[];  // ["supportive", "analytical", "empathetic"]
  conversation_types: string[];        // ["therapeutic", "advice_seeking", "general_chat"]
  
  // Kluczowe insighty z konwersacji
  key_insights: string[];              // Najważniejsze odkrycia z rozmów
  recurring_themes: string[];          // Powtarzające się tematy
  emotional_patterns: string[];        // Wzorce emocjonalne w rozmowach
  
  // Analiza relacji z agentem
  relationship_evolution: {
    trust_level: number;               // 1-10
    emotional_depth: number;           // 1-10
    communication_style: string;       // "formal" | "casual" | "intimate"
    preferred_topics: string[];        // Ulubione tematy użytkownika
  };
  
  // Esencja miesiąca konwersacji
  monthly_essence: string;             
  relationship_summary: string;        // Podsumowanie rozwoju relacji
  
  // Metadane
  created_at: string;                  
  consolidation_version: string;       
}

// Konfiguracja storage - używamy doors.md
const STORAGE_CONFIG = {
  storageRpc: process.env.NEXT_PUBLIC_TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  l1Rpc: process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai'
};

// Debug log helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[ConsolidationService] ${message}`, data || '');
  }
};

/**
 * Tworzy prompt do LLM dla konsolidacji miesięcznej snów
 */
export const createDreamConsolidationPrompt = (
  dreams: any[],
  month: number,
  year: number,
  agentPersonality: any
): string => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const period = `${monthNames[month - 1]} ${year}`;
  
  return `You are an advanced AI dream analyst performing monthly consolidation of dreams. 
Your task is to analyze ALL dreams from ${period} and create a comprehensive monthly essence.

AGENT PERSONALITY CONTEXT:
- Creativity: ${agentPersonality.creativity}/100
- Analytical: ${agentPersonality.analytical}/100  
- Empathy: ${agentPersonality.empathy}/100
- Intuition: ${agentPersonality.intuition}/100
- Resilience: ${agentPersonality.resilience}/100
- Curiosity: ${agentPersonality.curiosity}/100
- Dominant Mood: ${agentPersonality.dominantMood}
- Response Style: ${agentPersonality.responseStyle}

DREAMS TO CONSOLIDATE (${dreams.length} dreams):
${dreams.map(dream => `
Dream #${dream.id} (${dream.date}):
- Emotions: ${dream.emotions?.join(', ') || 'none'}
- Symbols: ${dream.symbols?.join(', ') || 'none'}
- Intensity: ${dream.intensity}/10
- Lucidity: ${dream.lucidity_level}/5
- AI Analysis: ${dream.ai_analysis || 'No analysis'}
`).join('\n')}

CONSOLIDATION TASK:
1. Analyze ALL dreams for patterns, themes, and evolution
2. Track emotional and symbolic progressions throughout the month
3. Identify personality shifts and growth areas
4. Extract the deepest insights and breakthrough moments
5. Create a profound monthly essence that captures the dreamer's journey

OUTPUT FORMAT - Return exactly one JSON object:

\`\`\`json
{
  "month": ${month},
  "year": ${year},
  "total_dreams": ${dreams.length},
  "period": "${period}",
  "dominant_themes": ["theme1", "theme2", "theme3"],
  "dominant_emotions": ["emotion1", "emotion2", "emotion3"],
  "dominant_symbols": ["symbol1", "symbol2", "symbol3"],
  "average_intensity": 0.0,
  "average_lucidity": 0.0,
  "intensity_trend": "increasing|decreasing|stable",
  "lucidity_trend": "increasing|decreasing|stable",
  "personality_evolution": {
    "creativity_shift": 0,
    "analytical_shift": 0,
    "empathy_shift": 0,
    "intuition_shift": 0,
    "resilience_shift": 0,
    "curiosity_shift": 0,
    "dominant_growth_area": "creativity"
  },
  "key_insights": ["insight1", "insight2", "insight3"],
  "recurring_patterns": ["pattern1", "pattern2"],
  "breakthrough_moments": ["moment1", "moment2"],
  "monthly_essence": "Deep philosophical reflection on the month's dream journey...",
  "growth_summary": "Summary of personal growth and evolution...",
  "created_at": "${new Date().toISOString()}",
  "consolidation_version": "1.0"
}
\`\`\`

CRITICAL: Only return the JSON object, no additional text. Be profound and insightful.`;
};

/**
 * Tworzy prompt do LLM dla konsolidacji miesięcznej konwersacji
 */
export const createConversationConsolidationPrompt = (
  conversations: any[],
  month: number,
  year: number,
  agentPersonality: any
): string => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const period = `${monthNames[month - 1]} ${year}`;
  
  return `You are an advanced AI conversation analyst performing monthly consolidation of conversations.
Your task is to analyze ALL conversations from ${period} and create a comprehensive monthly essence.

AGENT PERSONALITY CONTEXT:
- Creativity: ${agentPersonality.creativity}/100
- Analytical: ${agentPersonality.analytical}/100  
- Empathy: ${agentPersonality.empathy}/100
- Intuition: ${agentPersonality.intuition}/100
- Resilience: ${agentPersonality.resilience}/100
- Curiosity: ${agentPersonality.curiosity}/100
- Dominant Mood: ${agentPersonality.dominantMood}
- Response Style: ${agentPersonality.responseStyle}

CONVERSATIONS TO CONSOLIDATE (${conversations.length} conversations):
${conversations.map(conv => `
Conversation #${conv.id} (${conv.date}):
- Topic: ${conv.topic || 'General'}
- Emotional Tone: ${conv.emotional_tone || 'neutral'}
- Key Insights: ${conv.key_insights?.join(', ') || 'none'}
- Analysis: ${conv.analysis || 'No analysis'}
`).join('\n')}

CONSOLIDATION TASK:
1. Analyze ALL conversations for patterns, topics, and relationship evolution
2. Track emotional development and communication patterns
3. Identify recurring themes and user preferences
4. Extract the deepest insights about the relationship development
5. Create a profound monthly essence of the human-agent relationship

OUTPUT FORMAT - Return exactly one JSON object:

\`\`\`json
{
  "month": ${month},
  "year": ${year},
  "total_conversations": ${conversations.length},
  "period": "${period}",
  "dominant_topics": ["topic1", "topic2", "topic3"],
  "dominant_emotional_tones": ["tone1", "tone2", "tone3"],
  "conversation_types": ["type1", "type2", "type3"],
  "key_insights": ["insight1", "insight2", "insight3"],
  "recurring_themes": ["theme1", "theme2"],
  "emotional_patterns": ["pattern1", "pattern2"],
  "relationship_evolution": {
    "trust_level": 0,
    "emotional_depth": 0,
    "communication_style": "formal",
    "preferred_topics": ["topic1", "topic2"]
  },
  "monthly_essence": "Deep reflection on the month's conversation journey...",
  "relationship_summary": "Summary of relationship development...",
  "created_at": "${new Date().toISOString()}",
  "consolidation_version": "1.0"
}
\`\`\`

CRITICAL: Only return the JSON object, no additional text. Be profound and insightful.`;
};

/**
 * Wysyła dreams do LLM i otrzymuje skonsolidowane podsumowanie
 */
export const consolidateDreamsWithLLM = async (
  dreams: any[],
  month: number,
  year: number,
  agentPersonality: any,
  walletAddress: string
): Promise<{ success: boolean; data?: MonthlyDreamConsolidation; error?: string }> => {
  try {
    debugLog('Starting dream consolidation with LLM', { 
      dreamsCount: dreams.length, 
      month, 
      year 
    });

    const prompt = createDreamConsolidationPrompt(dreams, month, year, agentPersonality);
    
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
      throw new Error(apiResult.error || 'Dream consolidation failed');
    }

    const aiResponseText = apiResult.data.response;
    debugLog('LLM response received', { responseLength: aiResponseText.length });

    // Parse JSON response
    const jsonMatch = aiResponseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON block found in LLM response');
    }

    const consolidatedData = JSON.parse(jsonMatch[1]) as MonthlyDreamConsolidation;
    
    debugLog('Dream consolidation completed', {
      totalDreams: consolidatedData.total_dreams,
      dominantThemes: consolidatedData.dominant_themes,
      monthlyEssence: consolidatedData.monthly_essence.substring(0, 100) + '...'
    });

    return { success: true, data: consolidatedData };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Dream consolidation failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
};

/**
 * Wysyła conversations do LLM i otrzymuje skonsolidowane podsumowanie
 */
export const consolidateConversationsWithLLM = async (
  conversations: any[],
  month: number,
  year: number,
  agentPersonality: any,
  walletAddress: string
): Promise<{ success: boolean; data?: MonthlyConversationConsolidation; error?: string }> => {
  try {
    debugLog('Starting conversation consolidation with LLM', { 
      conversationsCount: conversations.length, 
      month, 
      year 
    });

    const prompt = createConversationConsolidationPrompt(conversations, month, year, agentPersonality);
    
    // Wywołanie LLM
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
      throw new Error(apiResult.error || 'Conversation consolidation failed');
    }

    const aiResponseText = apiResult.data.response;
    debugLog('LLM response received', { responseLength: aiResponseText.length });

    // Parse JSON response
    const jsonMatch = aiResponseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error('No JSON block found in LLM response');
    }

    const consolidatedData = JSON.parse(jsonMatch[1]) as MonthlyConversationConsolidation;
    
    debugLog('Conversation consolidation completed', {
      totalConversations: consolidatedData.total_conversations,
      dominantTopics: consolidatedData.dominant_topics,
      monthlyEssence: consolidatedData.monthly_essence.substring(0, 100) + '...'
    });

    return { success: true, data: consolidatedData };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Conversation consolidation failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
};

/**
 * Zapisuje skonsolidowane dane do 0G Storage (APPEND PATTERN)
 * Pobiera istniejące konsolidacje, appenduje nowe na TOP tablicy i zapisuje zaktualizowany plik
 */
export const saveConsolidationToStorage = async (
  tokenId: number,
  dreamConsolidation: MonthlyDreamConsolidation,
  conversationConsolidation: MonthlyConversationConsolidation,
  downloadFile: (hash: string) => Promise<{ success: boolean; data?: ArrayBuffer; error?: string }>
): Promise<{ success: boolean; dreamHash?: string; convHash?: string; error?: string }> => {
  try {
    debugLog('Saving consolidation to storage using APPEND pattern', {
      tokenId,
      dreamMonth: `${dreamConsolidation.year}-${dreamConsolidation.month}`,
      convMonth: `${conversationConsolidation.year}-${conversationConsolidation.month}`
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

    // Get contract to read current monthly hashes
    const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
    const contractABI = frontendContracts.galileo.DreamscapeAgent.abi;
    const contract = new Contract(contractAddress, contractABI, signer);

    const agentMemory = await contract.getAgentMemory(tokenId);
    const currentDreamMonthlyHash = agentMemory.lastDreamMonthlyHash;
    const currentConvMonthlyHash = agentMemory.lastConvMonthlyHash;
    const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

    debugLog('Current monthly hashes from contract', {
      dreamHash: currentDreamMonthlyHash,
      convHash: currentConvMonthlyHash
    });

    // 1. DREAM CONSOLIDATIONS - APPEND PATTERN
    let existingDreamConsolidations: MonthlyDreamConsolidation[] = [];
    
    if (currentDreamMonthlyHash && currentDreamMonthlyHash !== emptyHash) {
      debugLog('Downloading existing dream consolidations', { hash: currentDreamMonthlyHash });
      const downloadResult = await downloadFile(currentDreamMonthlyHash);
      
      if (downloadResult.success && downloadResult.data) {
        try {
          const textDecoder = new TextDecoder('utf-8');
          const jsonText = textDecoder.decode(downloadResult.data);
          const parsedData = JSON.parse(jsonText);
          existingDreamConsolidations = Array.isArray(parsedData) ? parsedData : [];
          debugLog('Existing dream consolidations loaded', { count: existingDreamConsolidations.length });
        } catch (parseError) {
          debugLog('Failed to parse existing dream consolidations, starting fresh', parseError);
          existingDreamConsolidations = [];
        }
      } else {
        debugLog('Failed to download existing dream consolidations, starting fresh', downloadResult.error);
      }
    } else {
      debugLog('No existing dream consolidations, starting fresh array');
    }

    // Append new dream consolidation to TOP of array (newest first)
    const updatedDreamConsolidations = [dreamConsolidation, ...existingDreamConsolidations];
    debugLog('Updated dream consolidations array created', { totalCount: updatedDreamConsolidations.length });

    // 2. CONVERSATION CONSOLIDATIONS - APPEND PATTERN
    let existingConvConsolidations: MonthlyConversationConsolidation[] = [];
    
    if (currentConvMonthlyHash && currentConvMonthlyHash !== emptyHash) {
      debugLog('Downloading existing conversation consolidations', { hash: currentConvMonthlyHash });
      const downloadResult = await downloadFile(currentConvMonthlyHash);
      
      if (downloadResult.success && downloadResult.data) {
        try {
          const textDecoder = new TextDecoder('utf-8');
          const jsonText = textDecoder.decode(downloadResult.data);
          const parsedData = JSON.parse(jsonText);
          existingConvConsolidations = Array.isArray(parsedData) ? parsedData : [];
          debugLog('Existing conversation consolidations loaded', { count: existingConvConsolidations.length });
        } catch (parseError) {
          debugLog('Failed to parse existing conversation consolidations, starting fresh', parseError);
          existingConvConsolidations = [];
        }
      } else {
        debugLog('Failed to download existing conversation consolidations, starting fresh', downloadResult.error);
      }
    } else {
      debugLog('No existing conversation consolidations, starting fresh array');
    }

    // Append new conversation consolidation to TOP of array (newest first)
    const updatedConvConsolidations = [conversationConsolidation, ...existingConvConsolidations];
    debugLog('Updated conversation consolidations array created', { totalCount: updatedConvConsolidations.length });

    // 3. CREATE AND UPLOAD FILES
    const dreamFileName = `dream_consolidations_monthly_${new Date().getFullYear()}.json`;
    const dreamContent = JSON.stringify(updatedDreamConsolidations, null, 2);
    const dreamFile = new File([dreamContent], dreamFileName, { type: 'application/json' });

    const convFileName = `conversation_consolidations_monthly_${new Date().getFullYear()}.json`;
    const convContent = JSON.stringify(updatedConvConsolidations, null, 2);
    const convFile = new File([convContent], convFileName, { type: 'application/json' });

    debugLog('Created new consolidation files', {
      dreamFileSize: dreamFile.size,
      convFileSize: convFile.size,
      dreamFileName,
      convFileName
    });

    // Upload both files
    const [dreamResult, convResult] = await Promise.all([
      uploadFileComplete(dreamFile, STORAGE_CONFIG.storageRpc, STORAGE_CONFIG.l1Rpc, signer),
      uploadFileComplete(convFile, STORAGE_CONFIG.storageRpc, STORAGE_CONFIG.l1Rpc, signer)
    ]);

    if (!dreamResult.success) {
      throw new Error(`Dream consolidation upload failed: ${dreamResult.error}`);
    }

    if (!convResult.success) {
      throw new Error(`Conversation consolidation upload failed: ${convResult.error}`);
    }

    debugLog('Consolidation APPEND completed successfully', {
      dreamHash: dreamResult.rootHash,
      convHash: convResult.rootHash,
      totalDreamConsolidations: updatedDreamConsolidations.length,
      totalConvConsolidations: updatedConvConsolidations.length
    });

    return {
      success: true,
      dreamHash: dreamResult.rootHash,
      convHash: convResult.rootHash
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Consolidation storage failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
};

/**
 * Wywołuje funkcję consolidateMonth w kontrakcie
 */
export const callConsolidateMonth = async (
  tokenId: number,
  dreamHash: string,
  convHash: string,
  month: number,
  year: number
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    debugLog('Calling consolidateMonth contract function', {
      tokenId, 
      dreamHash, 
      convHash, 
      month, 
      year 
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

    // Call consolidateMonth function
    const tx = await contract.consolidateMonth(
      tokenId,
      dreamHash,
      convHash,
      month,
      year
    );

    debugLog('ConsolidateMonth transaction sent', { txHash: tx.hash });

    // Wait for confirmation
    const receipt = await tx.wait();
    
    debugLog('ConsolidateMonth transaction confirmed', { 
      txHash: tx.hash, 
      blockNumber: receipt.blockNumber 
    });

    return { success: true, txHash: tx.hash };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('ConsolidateMonth contract call failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
};

/**
 * Czyści miesięczne pliki - zeruje daily hashe
 */
export const clearMonthlyFiles = async (
  tokenId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    debugLog('Clearing monthly files', { tokenId });

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

    // Create empty files to "clear" the monthly data
    const emptyDreamFile = new File(['[]'], 'empty_dreams.json', { type: 'application/json' });
    const emptyConvFile = new File(['[]'], 'empty_conversations.json', { type: 'application/json' });

    // Upload empty files
    const [dreamResult, convResult] = await Promise.all([
      uploadFileComplete(emptyDreamFile, STORAGE_CONFIG.storageRpc, STORAGE_CONFIG.l1Rpc, signer),
      uploadFileComplete(emptyConvFile, STORAGE_CONFIG.storageRpc, STORAGE_CONFIG.l1Rpc, signer)
    ]);

    if (!dreamResult.success || !convResult.success) {
      throw new Error('Failed to upload empty files');
    }

    // Note: W rzeczywistości, daily hashe zostają automatycznie wyczyszczone przez kontrakt
    // podczas _checkMonthChange() - nie musimy ich ręcznie resetować
    
    debugLog('Monthly files cleared', {
      emptyDreamHash: dreamResult.rootHash,
      emptyConvHash: convResult.rootHash
    });

    return { success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Clear monthly files failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}; 