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
  dreamData: {
    id: number;
    timestamp: number;
    content: string;
    emotions: string[];
    symbols: string[];
    intensity: number;
    lucidity_level: number;
    dream_type: string;
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
   * Sends AI prompt to 0g-compute API (supports both dream analysis and conversation)
   */
  const sendDreamAnalysis = async (
    promptData: DreamAnalysisPrompt | any,
    model: string = 'llama-3.3-70b-instruct'
  ): Promise<ParsedAIResponse | null> => {
    if (!address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error }));
      debugLog('AI analysis failed - wallet not connected');
      return null;
    }

    if (!promptData.prompt.trim()) {
      const error = 'Prompt is required';
      setState(prev => ({ ...prev, error }));
      debugLog('AI analysis failed - no prompt');
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
      debugLog('Starting AI analysis', { 
        walletAddress: address,
        model,
        promptLength: promptData.prompt.length,
        needsEvolution: promptData.expectedFormat.needsPersonalityEvolution
      });

      // Get API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
      
      debugLog('API URL configured', { apiUrl });

      // Send request to 0g-compute API
      const response = await fetch(`${apiUrl}/analyze-dream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          query: promptData.prompt,
          model: model
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResult = await response.json();
      
      if (!apiResult.success) {
        throw new Error(apiResult.error || 'AI analysis failed');
      }

      const aiResponse: AIResponse = apiResult.data;
      
      debugLog('AI response received', {
        model: aiResponse.model,
        cost: aiResponse.cost,
        responseTime: aiResponse.responseTime,
        isValid: aiResponse.isValid,
        responseLength: aiResponse.response.length
      });

      // Parse AI response (different logic for conversation vs dream analysis)
      const parsedResponse = parseAIResponse(aiResponse.response, promptData.expectedFormat);
      
      if (!parsedResponse) {
        throw new Error('Failed to parse AI response');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        aiResponse,
        parsedResponse
      }));

      debugLog('AI analysis completed successfully', {
        dreamId: parsedResponse.dreamData.id,
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
      debugLog('AI analysis failed', { error: errorMessage });
      return null;
    }
  };

  /**
   * Parses AI response text (supports both conversation and dream analysis)
   */
  const parseAIResponse = (
    responseText: string, 
    expectedFormat: any
  ): ParsedAIResponse | null => {
    try {
      debugLog('Parsing AI response', { 
        responseLength: responseText.length,
        isConversation: expectedFormat.isConversation,
        needsEvolution: expectedFormat.needsPersonalityEvolution
      });

      // For conversation, return raw response as fullAnalysis
      if (expectedFormat.isConversation) {
        debugLog('Parsing as conversation response');
        
        const parsedResponse: ParsedAIResponse = {
          fullAnalysis: responseText,
          dreamData: {
            id: 0,
            timestamp: Date.now(),
            content: '',
            emotions: [],
            symbols: [],
            intensity: 0,
            lucidity_level: 0,
            dream_type: 'conversation'
          },
          analysis: responseText.substring(0, 200) + '...' // Short excerpt
        };

        debugLog('Conversation response parsed successfully', {
          responseLength: parsedResponse.fullAnalysis.length
        });

        return parsedResponse;
      }

      // For dream analysis, extract JSON blocks (existing logic)
      const jsonBlocks = extractJsonBlocks(responseText);
      
      if (jsonBlocks.length < 2) {
        debugLog('Not enough JSON blocks found', { found: jsonBlocks.length });
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
      debugLog('Failed to parse AI response', { error: error instanceof Error ? error.message : String(error) });
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