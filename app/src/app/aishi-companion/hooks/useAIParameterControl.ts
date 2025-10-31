/**
 * @fileoverview AI Parameter Control Hook
 * @description Manages Live2D parameter state and executes AI-driven animations
 */

import { useRef, useState, useCallback } from 'react';
import type { Live2DModelRef } from '@/components/live2d/utils/live2d-types';
import {
  parseAIResponse,
  buildParameterUpdates,
  getDefaultParameterValues,
  type ParsedAIResponse
} from '../services/aiParameterService';
import { ParameterAnimator } from '../services/parameterAnimator';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_AISHI_COMPANION_DEBUG === 'true') {
    console.log(`[useAIParameterControl] ${message}`, data || '');
  }
};

/**
 * Hook for managing AI-controlled Live2D parameters
 */
export const useAIParameterControl = (modelRef: React.RefObject<Live2DModelRef>) => {
  const animatorRef = useRef(new ParameterAnimator());

  const [currentValues, setCurrentValues] = useState<Map<string, number>>(
    getDefaultParameterValues()
  );

  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * Update single parameter value
   */
  const updateParameter = useCallback((paramId: string, value: number) => {
    if (!modelRef.current) {
      debugLog('Cannot update parameter - model ref is null');
      return;
    }

    modelRef.current.setParameterValue(paramId, value);
    setCurrentValues(prev => {
      const updated = new Map(prev);
      updated.set(paramId, value);
      return updated;
    });

    debugLog(`Parameter updated: ${paramId} = ${value}`);
  }, [modelRef]);

  /**
   * Process AI response and execute parameter animations
   * Returns clean text without JSON blocks
   */
  const processAIResponse = useCallback(async (aiResponse: string): Promise<string> => {
    debugLog('Processing AI response for parameters', {
      responseLength: aiResponse.length
    });

    // Parse AI response
    const parsed = parseAIResponse(aiResponse, currentValues);

    debugLog('AI response parsed', {
      hasParameters: parsed.hasParameters,
      hasExpressions: parsed.hasExpressions,
      parameterCount: Object.keys(parsed.parameters).length,
      expressionCount: parsed.expressions.length
    });

    // Apply expressions (immediate, not animated)
    if (parsed.hasExpressions && modelRef.current) {
      debugLog('Applying expressions', { expressions: parsed.expressions });

      parsed.expressions.forEach(expr => {
        try {
          modelRef.current!.setExpression(expr);
        } catch (error) {
          debugLog(`Failed to set expression: ${expr}`, { error: String(error) });
        }
      });
    }

    // Animate parameters if any
    if (parsed.hasParameters && modelRef.current) {
      setIsAnimating(true);

      // Build parameter updates
      const updates = buildParameterUpdates(parsed.parameters, currentValues);

      if (updates.length > 0) {
        // Create animation sequences
        const sequences = animatorRef.current.queueAnimations(updates);

        debugLog('Executing parameter animations', {
          sequenceCount: sequences.length,
          parameters: sequences.map(s => s.name)
        });

        // Execute animations
        await animatorRef.current.executeAnimations(sequences, modelRef.current);

        // Update state with final values
        setCurrentValues(prev => {
          const updated = new Map(prev);
          Object.entries(parsed.parameters).forEach(([paramId, value]) => {
            updated.set(paramId, value);
          });
          return updated;
        });

        debugLog('Animations complete, state updated');
      }

      setIsAnimating(false);
    }

    return parsed.text;
  }, [currentValues, modelRef]);

  /**
   * Reset all parameters to defaults
   */
  const resetAllParameters = useCallback(() => {
    if (!modelRef.current) return;

    const defaults = getDefaultParameterValues();

    defaults.forEach((value, paramId) => {
      modelRef.current!.setParameterValue(paramId, value);
    });

    setCurrentValues(defaults);
    debugLog('All parameters reset to defaults');
  }, [modelRef]);

  /**
   * Get current parameter values map
   */
  const getCurrentValues = useCallback((): Map<string, number> => {
    return new Map(currentValues);
  }, [currentValues]);

  /**
   * Cancel any active animations
   */
  const cancelAnimations = useCallback(() => {
    animatorRef.current.cancelAll();
    setIsAnimating(false);
    debugLog('Animations cancelled');
  }, []);

  return {
    currentValues,
    isAnimating,
    processAIResponse,
    resetAllParameters,
    getCurrentValues,
    updateParameter,
    cancelAnimations
  };
};
