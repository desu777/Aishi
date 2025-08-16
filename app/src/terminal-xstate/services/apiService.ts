/**
 * @fileoverview API Service for Terminal XState Dream Analysis
 * @description Handles communication with 0g-compute backend for AI dream analysis
 */

import { AIResponse } from '../types/contextTypes';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[APIService] ${message}`, data || '');
  }
};

interface DreamAPIRequest {
  prompt: string;
  modelId: string;
  walletAddress?: string;
  isEvolutionDream: boolean;
}

interface BackendResponse {
  success: boolean;
  data?: string;
  error?: string;
  metadata?: {
    model?: string;
    responseTime?: number;
    profile?: string;
  };
}

/**
 * Extract JSON blocks from AI response text
 */
function extractJsonBlocks(responseText: string): { fullAnalysis?: any; dreamData?: any } {
  debugLog('Extracting JSON blocks from response', { 
    responseLength: responseText.length 
  });
  
  // Match all JSON code blocks
  const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
  const matches = [...responseText.matchAll(jsonBlockRegex)];
  
  debugLog('Found JSON blocks', { count: matches.length });
  
  if (matches.length === 0) {
    // Try to parse the entire response as JSON
    try {
      const parsed = JSON.parse(responseText);
      return { fullAnalysis: parsed, dreamData: parsed };
    } catch {
      debugLog('No JSON blocks found, treating as plain text');
      return {};
    }
  }
  
  const result: any = {};
  
  // Parse each JSON block
  matches.forEach((match, index) => {
    try {
      const jsonStr = match[1];
      const parsed = JSON.parse(jsonStr);
      
      debugLog(`Parsed JSON block ${index + 1}`, { 
        hasFullAnalysis: !!parsed.full_analysis,
        hasAnalysis: !!parsed.analysis,
        hasDreamData: !!parsed.dreamData
      });
      
      // First block should contain full_analysis
      if (index === 0 && parsed.full_analysis) {
        result.fullAnalysis = parsed.full_analysis;
      }
      
      // Second block should contain analysis and dreamData
      if (index === 1 || (index === 0 && parsed.dreamData)) {
        result.dreamData = parsed;
      }
    } catch (error) {
      debugLog(`Failed to parse JSON block ${index + 1}`, { error: String(error) });
    }
  });
  
  return result;
}

/**
 * Route request to appropriate backend endpoint based on model
 */
async function routeToBackend(request: DreamAPIRequest): Promise<BackendResponse> {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                      process.env.NEXT_PUBLIC_COMPUTE_API_URL || 
                      'http://localhost:3001';
  
  const isGeminiModel = request.modelId.startsWith('gemini-');
  const endpoint = isGeminiModel ? '/gemini' : '/0g-compute';
  
  debugLog('Routing request to backend', {
    model: request.modelId,
    endpoint,
    isGemini: isGeminiModel,
    backendUrl: BACKEND_URL
  });
  
  // Prepare request body based on endpoint
  const requestBody = isGeminiModel ? {
    prompt: request.prompt,
    modelId: request.modelId
  } : {
    walletAddress: request.walletAddress || '0x0000000000000000000000000000000000000000',
    query: request.prompt,
    modelId: request.modelId
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    debugLog('Backend request failed', { error: String(error) });
    throw error;
  }
}

/**
 * Main function to send dream analysis to AI backend
 */
export async function sendDreamToAI(
  prompt: string,
  modelId: string,
  walletAddress?: string,
  isEvolutionDream: boolean = false
): Promise<AIResponse> {
  debugLog('=== BANDYCKA JAZDA: Sending dream to REAL AI ===', {
    promptLength: prompt.length,
    modelId,
    isEvolutionDream,
    hasWallet: !!walletAddress
  });
  
  try {
    // Send to backend
    const backendResponse = await routeToBackend({
      prompt,
      modelId,
      walletAddress,
      isEvolutionDream
    });
    
    if (!backendResponse.success) {
      throw new Error(backendResponse.error || 'Backend request failed');
    }
    
    debugLog('Received backend response', {
      hasData: !!backendResponse.data,
      dataLength: backendResponse.data?.length,
      metadata: backendResponse.metadata
    });
    
    // Extract JSON blocks from AI response
    const responseText = backendResponse.data || '';
    const { fullAnalysis, dreamData } = extractJsonBlocks(responseText);
    
    // If no structured data found, use the raw response
    const analysisText = fullAnalysis || responseText;
    
    // Build response in expected format
    const aiResponse: AIResponse = {
      fullAnalysis: typeof analysisText === 'string' ? analysisText : 
                   (analysisText.full_analysis || 'Dream analysis completed.'),
      
      dreamData: dreamData?.dreamData || {
        id: dreamData?.dreamData?.id || Math.floor(Date.now() / 1000),
        timestamp: dreamData?.dreamData?.timestamp || Math.floor(Date.now() / 1000),
        content: prompt.substring(0, 200),
        emotions: dreamData?.dreamData?.emotions || ['neutral'],
        symbols: dreamData?.dreamData?.symbols || [],
        intensity: dreamData?.dreamData?.intensity || 5,
        lucidity: dreamData?.dreamData?.lucidity || 2,
        dreamType: dreamData?.dreamData?.dream_type || 'normal'
      },
      
      analysis: dreamData?.analysis || 'Dream has been analyzed and insights extracted.',
      
      // Include personality impact if it's an evolution dream
      personalityImpact: isEvolutionDream && dreamData?.personalityImpact ? 
        dreamData.personalityImpact : undefined
    };
    
    debugLog('=== AI Response Parsed Successfully ===', {
      hasFullAnalysis: !!aiResponse.fullAnalysis,
      fullAnalysisLength: aiResponse.fullAnalysis.length,
      dreamId: aiResponse.dreamData.id,
      hasPersonalityImpact: !!aiResponse.personalityImpact,
      emotions: aiResponse.dreamData.emotions,
      model: backendResponse.metadata?.model || modelId
    });
    
    return aiResponse;
    
  } catch (error) {
    debugLog('=== AI Request Failed ===', { error: String(error) });
    
    // Return a fallback response on error
    const fallbackResponse: AIResponse = {
      fullAnalysis: `I encountered an issue connecting to the AI service (${String(error)}). Your dream has been noted but couldn't be fully analyzed at this time. Please try again later.`,
      dreamData: {
        id: Math.floor(Date.now() / 1000),
        timestamp: Math.floor(Date.now() / 1000),
        content: prompt.substring(0, 200),
        emotions: ['uncertain'],
        symbols: [],
        intensity: 5,
        lucidity: 1,
        dreamType: 'unanalyzed'
      },
      analysis: 'Dream analysis temporarily unavailable.'
    };
    
    return fallbackResponse;
  }
}

/**
 * Helper to get selected model from terminal context
 */
export function getSelectedModel(modelRef: any): string {
  try {
    const modelState = modelRef?.getSnapshot();
    const selectedModel = modelState?.context?.selectedModel;
    
    debugLog('Retrieved selected model from modelRef', { 
      selectedModel,
      hasModelRef: !!modelRef,
      hasContext: !!modelState?.context
    });
    
    return selectedModel || 'gemini-2.5-flash-auto';
  } catch (error) {
    debugLog('Failed to get selected model, using default', { error: String(error) });
    return 'gemini-2.5-flash-auto';
  }
}