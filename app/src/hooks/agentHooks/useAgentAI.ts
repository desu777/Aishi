'use client';

import { useState } from 'react';
import { useWallet } from '../useWallet';
import { DreamAnalysisPrompt } from './useAgentPrompt';

interface AIAnalysisState {
  isLoading: boolean;
  error: string | null;
  aiResponse: AIResponse | null;
  parsedResponse: ParsedAIResponse | null;
}

interface AIResponse {
  response: string;
  model: string;
  cost: number;
  chatId: string;
  responseTime: number;
  isValid: boolean;
}

interface ParsedAIResponse {
  fullAnalysis: string;
  dreamData?: {
    id: number;
    date: string;
    timestamp?: number;
    // Podstawowe dane
    emotions: string[];
    symbols: string[];
    themes?: string[];
    intensity: number;
    lucidity: number;  // ZMIANA z lucidity_level
    // Archetypy i wzorce  
    archetypes?: string[];
    recurring_from?: number[];
    // Analiza
    analysis?: string;
    // Wpływ na osobowość
    personality_impact?: {
      dominant_trait?: string;
      shift_direction?: string;
      intensity?: number;
    };
    // Metadane
    sleep_quality?: number;
    recall_clarity?: number;
    dream_type?: string;
  };
  personalityImpact?: {
    evolutionWeight: number;
    creativityChange: number;
    analyticalChange: number;
    empathyChange: number;
    intuitionChange: number;
    resilienceChange: number;
    curiosityChange: number;
    moodShift: string;
    newFeatures: Array<{
      name: string;
      description: string;
      intensity: number;
    }>;
  };
  analysis: string;
}

export function useAgentAI() {
  const [state, setState] = useState<AIAnalysisState>({
    isLoading: false,
    error: null,
    aiResponse: null,
    parsedResponse: null
  });

  const { address } = useWallet();

  // Debug logs dla development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[useAgentAI] ${message}`, data || '');
    }
  };

  debugLog('useAgentAI hook initialized');

  const resetAI = () => {
    setState({
      isLoading: false,
      error: null,
      aiResponse: null,
      parsedResponse: null
    });
    debugLog('AI state reset');
  };

  /**
   * Sends dream analysis prompt to 0g-compute API - ONLY FOR DREAMS
   */
  const sendDreamAnalysis = async (
    promptData: DreamAnalysisPrompt
  ): Promise<ParsedAIResponse | null> => {
    if (!address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error }));
      debugLog('Dream analysis failed - wallet not connected');
      return null;
    }

    if (!promptData.prompt.trim()) {
      const error = 'Prompt is required';
      setState(prev => ({ ...prev, error }));
      debugLog('Dream analysis failed - no prompt');
      return null;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      aiResponse: null,
      parsedResponse: null
    }));

    try {
      debugLog('Starting dream analysis', { 
        walletAddress: address,
        promptLength: promptData.prompt.length,
        needsEvolution: promptData.expectedFormat.needsPersonalityEvolution
      });

      // Get API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
      
      debugLog('API URL configured', { apiUrl });

      // Send request to 0g-compute API
      const response = await fetch(`${apiUrl}/0g-compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          query: promptData.prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResult = await response.json();
      
      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Dream analysis failed');
      }

      const aiResponse: AIResponse = apiResult.data;
      
      debugLog('AI response received', {
        model: aiResponse.model,
        cost: aiResponse.cost,
        responseTime: aiResponse.responseTime,
        isValid: aiResponse.isValid,
        responseLength: aiResponse.response.length
      });

      // Parse AI response for dream analysis
      const parsedResponse = parseDreamAnalysisResponse(aiResponse.response, promptData.expectedFormat);
      
      if (!parsedResponse) {
        throw new Error('Failed to parse dream analysis response');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        aiResponse,
        parsedResponse
      }));

      debugLog('Dream analysis completed successfully', {
        dreamId: parsedResponse.dreamData?.id,
        hasEvolution: !!parsedResponse.personalityImpact,
        analysisLength: parsedResponse.analysis.length,
        fullAnalysisLength: parsedResponse.fullAnalysis.length
      });

      return parsedResponse;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }));
      debugLog('Dream analysis failed', { error: errorMessage });
      return null;
    }
  };

  /**
   * Parses AI response text for DREAM ANALYSIS ONLY
   */
  const parseDreamAnalysisResponse = (
    responseText: string, 
    expectedFormat: any
  ): ParsedAIResponse | null => {
    try {
      debugLog('Parsing dream analysis response', { 
        responseLength: responseText.length,
        needsEvolution: expectedFormat.needsPersonalityEvolution
      });

      // Extract JSON blocks for dream analysis (dual format)
      const jsonBlocks = extractJsonBlocks(responseText);
      
      if (jsonBlocks.length < 2) {
        debugLog('Not enough JSON blocks found for dream analysis', { found: jsonBlocks.length });
        return null;
      }

      // Parse first JSON block (full analysis)
      const fullAnalysisData = JSON.parse(jsonBlocks[0]);
      if (!fullAnalysisData.full_analysis) {
        debugLog('Missing full_analysis in first JSON block');
        return null;
      }

      // Parse second JSON block (storage summary)
      const storageData = JSON.parse(jsonBlocks[1]);
      if (!storageData.analysis || !storageData.dreamData) {
        debugLog('Missing required fields in second JSON block');
        return null;
      }

      const parsedResponse: ParsedAIResponse = {
        fullAnalysis: fullAnalysisData.full_analysis,
        dreamData: storageData.dreamData,
        analysis: storageData.analysis,
        personalityImpact: expectedFormat.needsPersonalityEvolution ? storageData.personalityImpact : undefined
      };

      debugLog('Dream analysis response parsed successfully', {
        hasFullAnalysis: !!parsedResponse.fullAnalysis,
        hasDreamData: !!parsedResponse.dreamData,
        hasPersonalityImpact: !!parsedResponse.personalityImpact
      });

      return parsedResponse;

    } catch (error) {
      debugLog('Failed to parse dream analysis response', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  };

  /**
   * Extracts JSON blocks from AI response text
   */
  const extractJsonBlocks = (text: string): string[] => {
    const jsonBlocks: string[] = [];
    
    // Look for JSON blocks wrapped in ```json or just ```
    const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
    let match;
    
    while ((match = jsonRegex.exec(text)) !== null) {
      jsonBlocks.push(match[1]);
    }
    
    // If no wrapped blocks found, look for standalone JSON objects
    if (jsonBlocks.length === 0) {
      const standaloneRegex = /\{[\s\S]*?\}/g;
      while ((match = standaloneRegex.exec(text)) !== null) {
        try {
          JSON.parse(match[0]); // Test if it's valid JSON
          jsonBlocks.push(match[0]);
        } catch {
          // Skip invalid JSON
        }
      }
    }
    
    debugLog('JSON blocks extracted', { count: jsonBlocks.length });
    return jsonBlocks;
  };

  return {
    isLoading: state.isLoading,
    error: state.error,
    aiResponse: state.aiResponse,
    parsedResponse: state.parsedResponse,
    resetAI,
    sendDreamAnalysis
  };
} 