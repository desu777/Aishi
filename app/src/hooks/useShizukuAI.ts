/**
 * Shizuku AI Integration Hook
 * Level 1100 Implementation with Gemini Native JSON Schema
 * 
 * Handles communication with 0g-compute backend and Gemini AI
 */

import { useState, useCallback, useRef } from 'react';
import { 
  buildShizukuPrompt,
  SHIZUKU_RESPONSE_SCHEMA 
} from '@/prompts/shizuku';

// Type definitions based on our JSON Schema
export interface ShizukuResponse {
  text: string;
  emotions: {
    base: string;
    eyeEffect: string;
  };
  mouth: {
    openness: number;
    form: number;
    lipSync: boolean;
  };
  accessories: {
    eyepatch: boolean;
    jacket: boolean;
    wings: boolean;
    gaming: boolean;
    mic: boolean;
    tea: boolean;
    catEars: boolean;
    devil: boolean;
    halo: boolean;
  };
  decorations: {
    flowers: boolean;
    crossPin: boolean;
    linePin: boolean;
    bow: boolean;
  };
  specialFX: {
    heart: boolean;
    board: boolean;
    colorChange: boolean;
    touch: boolean;
    watermark: boolean;
    haloColorChange: boolean;
    wingsToggle: boolean;
  };
  physics: {
    headMovement: { x: number; y: number; z: number };
    bodyMovement: { x: number; y: number; z: number };
    breathing: number;
    eyeTracking: { x: number; y: number };
  };
  formPreset: string | null;
}

interface UseShizukuAIOptions {
  backendUrl?: string;
  temperature?: number;
  maxTokens?: number;
  enableTestMode?: boolean;
}

interface ShizukuAIState {
  isLoading: boolean;
  error: string | null;
  lastResponse: ShizukuResponse | null;
  conversationHistory: string[];
}

export const useShizukuAI = (options: UseShizukuAIOptions = {}) => {
  const {
    backendUrl = process.env.NEXT_PUBLIC_0G_COMPUTE_URL || 'http://localhost:3001',
    temperature = 0.8,
    maxTokens = 2048,
    enableTestMode = process.env.NEXT_PUBLIC_LIVE2MODEL_SHIZUKU_TEST === 'true'
  } = options;

  const [state, setState] = useState<ShizukuAIState>({
    isLoading: false,
    error: null,
    lastResponse: null,
    conversationHistory: []
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Parse JSON from Gemini response (may be wrapped in markdown)
  const parseShizukuResponse = useCallback((rawResponse: string): ShizukuResponse => {
    try {
      // Safety check for input type
      if (!rawResponse || typeof rawResponse !== 'string') {
        throw new Error(`Invalid input type: ${typeof rawResponse}`);
      }

      // Handle markdown code block wrapping
      let jsonStr = rawResponse.trim();
      
      // Remove markdown code block if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Validate required fields
      if (!parsed.text || !parsed.emotions || !parsed.physics) {
        throw new Error('Missing required fields in AI response');
      }
      
      // Return with type safety
      return parsed as ShizukuResponse;
      
    } catch (error) {
      console.error('[Shizuku AI] Failed to parse response:', error);
      console.error('[Shizuku AI] Raw response:', rawResponse);
      
      // Return fallback response
      return {
        text: "抱歉，我现在有点困惑... (Sorry, I'm a bit confused right now...)",
        emotions: { base: "dizzy", eyeEffect: "none" },
        mouth: { openness: 30, form: -20, lipSync: true },
        accessories: {
          eyepatch: false, jacket: true, wings: false, gaming: false,
          mic: false, tea: false, catEars: false, devil: false, halo: false
        },
        decorations: { flowers: false, crossPin: false, linePin: false, bow: false },
        specialFX: {
          heart: false, board: false, colorChange: false, touch: false,
          watermark: false, haloColorChange: false, wingsToggle: false
        },
        physics: {
          headMovement: { x: 0, y: -5, z: -2 },
          bodyMovement: { x: 0, y: 0, z: 0 },
          breathing: 0.4,
          eyeTracking: { x: 0, y: 0 }
        },
        formPreset: null
      };
    }
  }, []);

  // Send message to Shizuku and get AI response
  const sendMessage = useCallback(async (userMessage: string): Promise<ShizukuResponse> => {
    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Build prompt with user message and conversation history
      const prompt = buildShizukuPrompt(userMessage, state.conversationHistory);

      if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
        console.log('[Shizuku AI] Sending prompt to Gemini:', {
          userMessage,
          promptLength: prompt.length,
          conversationHistory: state.conversationHistory.length
        });
      }

      // Send request to 0g-compute backend
      const response = await fetch(`${backendUrl}/api/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature,
          maxTokens
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get AI response');
      }

      // Parse the AI response - handle different response formats
      let responseText: string;
      if (typeof result.data === 'string') {
        responseText = result.data;
      } else if (result.data && typeof result.data === 'object') {
        // If backend returns nested structure, extract text
        responseText = result.data.text || JSON.stringify(result.data);
      } else {
        throw new Error('Invalid response format from backend');
      }

      const shizukuResponse = parseShizukuResponse(responseText);

      // Update conversation history
      const newHistory = [
        ...state.conversationHistory,
        `User: ${userMessage}`,
        `Shizuku: ${shizukuResponse.text}`
      ].slice(-6); // Keep last 3 exchanges

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: shizukuResponse,
        conversationHistory: newHistory,
        error: null
      }));

      if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
        console.log('[Shizuku AI] ✓ Response parsed successfully:', {
          text: shizukuResponse.text,
          emotion: shizukuResponse.emotions.base,
          breathing: shizukuResponse.physics.breathing
        });
      }

      return shizukuResponse;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was aborted, don't update state
        return parseShizukuResponse('{"text":"Request aborted","emotions":{"base":"none","eyeEffect":"none"}}');
      }

      const errorMessage = error.message || 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      console.error('[Shizuku AI] Error:', errorMessage);
      
      // Return error response
      return parseShizukuResponse(JSON.stringify({
        text: `抱歉，我遇到了一个问题: ${errorMessage}`,
        emotions: { base: "cry", eyeEffect: "none" },
        mouth: { openness: 20, form: -50, lipSync: true },
        accessories: {
          eyepatch: false, jacket: true, wings: false, gaming: false,
          mic: false, tea: false, catEars: false, devil: false, halo: false
        },
        decorations: { flowers: false, crossPin: false, linePin: false, bow: false },
        specialFX: {
          heart: false, board: false, colorChange: false, touch: false,
          watermark: false, haloColorChange: false, wingsToggle: false
        },
        physics: {
          headMovement: { x: 0, y: -10, z: -3 },
          bodyMovement: { x: 0, y: 0, z: 0 },
          breathing: 0.3,
          eyeTracking: { x: 0, y: 0 }
        },
        formPreset: null
      }));
    }
  }, [backendUrl, temperature, maxTokens, enableTestMode, state.conversationHistory, parseShizukuResponse]);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      lastResponse: null,
      error: null
    }));
  }, []);

  // Cancel current request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    lastResponse: state.lastResponse,
    conversationHistory: state.conversationHistory,
    
    // Actions
    sendMessage,
    clearHistory,
    cancelRequest,
    
    // Utilities
    parseShizukuResponse
  };
};