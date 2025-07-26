/**
 * Shizuku Live2D Controller Hook
 * Level 1100 Implementation with VTubeStudio-inspired Parameter Control
 * 
 * Maps AI JSON responses to Live2D model parameters
 */

import { useCallback, useRef } from 'react';
import type { Live2DModelRef } from '@/components/live2d/utils/live2d-types';
import type { ShizukuResponse } from '@/hooks/useShizukuAI';

// Expression mapping based on AI_AVATAR_CONTROL_MANUAL.md
const EMOTION_MAP = {
  love: '爱心眼',
  star: '星星眼', 
  angry: '生气',
  cry: '哭哭',
  dark: '黑脸',
  blush: '脸红',
  blank: '空白眼',
  dizzy: '蚊香眼',
  none: null
};

const ACCESSORY_MAP = {
  eyepatch: '眼罩',
  jacket: '外套',
  wings: '翅膀',
  gaming: '游戏机',
  mic: '麦克风',
  tea: '茶杯',
  catEars: '猫耳',
  devil: '恶魔角',
  halo: '光环'
};

const DECORATION_MAP = {
  flowers: '花花',
  crossPin: '十字发夹',
  linePin: '一字发夹',
  bow: '蝴蝶结'
};

const SPECIAL_FX_MAP = {
  heart: '比心',
  board: '写字板',
  colorChange: '换色',
  touch: '点触',
  watermark: '水印',
  haloColorChange: '光环换色',
  wingsToggle: '翅膀切换'
};

interface UseShizukuControllerOptions {
  enableDebugLogs?: boolean;
  smoothTransitions?: boolean;
  transitionDuration?: number;
}

export const useShizukuController = (
  modelRef: React.RefObject<Live2DModelRef>,
  options: UseShizukuControllerOptions = {}
) => {
  const {
    enableDebugLogs = process.env.NEXT_PUBLIC_DREAM_TEST === 'true',
    smoothTransitions = true,
    transitionDuration = 500
  } = options;

  const lastAppliedStateRef = useRef<ShizukuResponse | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth parameter transition utility
  const smoothSetParameter = useCallback((
    parameterId: string, 
    targetValue: number, 
    duration: number = transitionDuration
  ) => {
    if (!modelRef.current || !smoothTransitions) {
      modelRef.current?.setParameterValue(parameterId, targetValue);
      return;
    }

    const currentValue = modelRef.current.getParameterValue(parameterId);
    const startTime = Date.now();
    const valueDiff = targetValue - currentValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = currentValue + (valueDiff * eased);
      
      modelRef.current?.setParameterValue(parameterId, newValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [modelRef, smoothTransitions, transitionDuration]);

  // Apply emotion expressions (base + eyeEffect)
  const applyEmotions = useCallback((emotions: ShizukuResponse['emotions']) => {
    if (!modelRef.current) return;

    try {
      // Apply base emotion (exclusive)
      const baseExpression = EMOTION_MAP[emotions.base as keyof typeof EMOTION_MAP];
      if (baseExpression) {
        modelRef.current.setExpression(baseExpression);
      } else if (emotions.base === 'none') {
        modelRef.current.resetExpression();
      }

      // Note: eyeEffect overlays are handled by the expression system automatically
      // The Live2D model combines multiple expressions additively

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applied emotions:', {
          base: emotions.base,
          eyeEffect: emotions.eyeEffect,
          expression: baseExpression
        });
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to apply emotions:', error);
    }
  }, [modelRef, enableDebugLogs]);

  // Apply mouth parameters with lip sync support
  const applyMouth = useCallback((mouth: ShizukuResponse['mouth']) => {
    if (!modelRef.current) return;

    try {
      // Convert 0-100 range to 0-1 for ParamMouthOpenY
      const normalizedOpenness = mouth.openness / 100;
      smoothSetParameter('ParamMouthOpenY', normalizedOpenness);

      // Convert -100 to 100 range to -1 to 1 for ParamMouthForm
      const normalizedForm = mouth.form / 100;
      smoothSetParameter('ParamMouthForm', normalizedForm);

      // Lip sync is handled by the speech system, we just record the preference
      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applied mouth:', {
          openness: mouth.openness,
          form: mouth.form,
          lipSync: mouth.lipSync
        });
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to apply mouth parameters:', error);
    }
  }, [modelRef, enableDebugLogs, smoothSetParameter]);

  // Apply accessories (with conflict resolution)
  const applyAccessories = useCallback((accessories: ShizukuResponse['accessories']) => {
    if (!modelRef.current) return;

    try {
      // Handle devil/halo conflict (from AI_AVATAR_CONTROL_MANUAL.md)
      let resolvedAccessories = { ...accessories };
      if (accessories.devil && accessories.halo) {
        // Prefer the one that changed from last state, or default to halo
        const lastState = lastAppliedStateRef.current?.accessories;
        if (lastState?.devil === false && accessories.devil === true) {
          resolvedAccessories.halo = false; // Devil wins
        } else {
          resolvedAccessories.devil = false; // Halo wins
        }
      }

      // Apply each accessory
      Object.entries(resolvedAccessories).forEach(([key, value]) => {
        const expressionName = ACCESSORY_MAP[key as keyof typeof ACCESSORY_MAP];
        if (expressionName) {
          if (value) {
            modelRef.current?.setExpression(expressionName);
          } else {
            // Remove accessory - this depends on the expression system
            // In practice, we might need to call resetExpression for specific accessories
          }
        }
      });

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applied accessories:', resolvedAccessories);
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to apply accessories:', error);
    }
  }, [modelRef, enableDebugLogs]);

  // Apply decorations (additive)
  const applyDecorations = useCallback((decorations: ShizukuResponse['decorations']) => {
    if (!modelRef.current) return;

    try {
      Object.entries(decorations).forEach(([key, value]) => {
        const expressionName = DECORATION_MAP[key as keyof typeof DECORATION_MAP];
        if (expressionName && value) {
          modelRef.current?.setExpression(expressionName);
        }
      });

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applied decorations:', decorations);
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to apply decorations:', error);
    }
  }, [modelRef, enableDebugLogs]);

  // Apply special effects (additive)
  const applySpecialFX = useCallback((specialFX: ShizukuResponse['specialFX']) => {
    if (!modelRef.current) return;

    try {
      Object.entries(specialFX).forEach(([key, value]) => {
        const expressionName = SPECIAL_FX_MAP[key as keyof typeof SPECIAL_FX_MAP];
        if (expressionName && value) {
          modelRef.current?.setExpression(expressionName);
        }
      });

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applied special FX:', specialFX);
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to apply special FX:', error);
    }
  }, [modelRef, enableDebugLogs]);

  // Apply physics parameters (head, body, breathing, eyes)
  const applyPhysics = useCallback((physics: ShizukuResponse['physics']) => {
    if (!modelRef.current) return;

    try {
      // Head movement (AI mode maintains control over these)
      smoothSetParameter('ParamAngleX', physics.headMovement.x);
      smoothSetParameter('ParamAngleY', physics.headMovement.y);
      smoothSetParameter('ParamAngleZ', physics.headMovement.z);

      // Body movement
      smoothSetParameter('ParamBodyAngleX', physics.bodyMovement.x);
      smoothSetParameter('ParamBodyAngleY', physics.bodyMovement.y);
      smoothSetParameter('ParamBodyAngleZ', physics.bodyMovement.z);

      // Breathing intensity
      smoothSetParameter('ParamBreath', physics.breathing);

      // Eye tracking (in AI mode, eyes should look at user)
      // We keep this for future use, but in current AI mode implementation,
      // eyes are set to neutral position
      if (physics.eyeTracking.x !== 0 || physics.eyeTracking.y !== 0) {
        smoothSetParameter('ParamEyeBallX', physics.eyeTracking.x);
        smoothSetParameter('ParamEyeBallY', physics.eyeTracking.y);
      }

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applied physics:', physics);
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to apply physics:', error);
    }
  }, [modelRef, enableDebugLogs, smoothSetParameter]);

  // Apply form preset (overrides individual settings)
  const applyFormPreset = useCallback((formPreset: string | null) => {
    if (!modelRef.current || !formPreset) return;

    try {
      // Use the existing form preset system from Live2D model
      if (modelRef.current.applyFormPreset) {
        modelRef.current.applyFormPreset(formPreset as any);
      }

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applied form preset:', formPreset);
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to apply form preset:', error);
    }
  }, [modelRef, enableDebugLogs]);

  // Main function to apply complete Shizuku response to Live2D model
  const applyShizukuResponse = useCallback((response: ShizukuResponse) => {
    if (!modelRef.current) {
      console.warn('[Shizuku Controller] Model not ready');
      return;
    }

    // Clear any existing transition
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    try {
      if (enableDebugLogs) {
        console.log('[Shizuku Controller] Applying Shizuku response:', {
          text: response.text.substring(0, 50) + '...',
          emotion: response.emotions.base,
          breathing: response.physics.breathing
        });
      }

      // Apply in order based on VTubeStudio priority system:
      // 1. Form preset (highest priority, overrides others)
      if (response.formPreset) {
        applyFormPreset(response.formPreset);
      }

      // 2. Expressions (emotions, accessories, decorations, special FX)
      applyEmotions(response.emotions);
      applyAccessories(response.accessories);
      applyDecorations(response.decorations);
      applySpecialFX(response.specialFX);

      // 3. Physics parameters (head, body, breathing)
      applyPhysics(response.physics);

      // 4. Mouth parameters (lowest priority for expressions)
      applyMouth(response.mouth);

      // Store the last applied state for conflict resolution
      lastAppliedStateRef.current = response;

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] ✓ Successfully applied all parameters');
      }

    } catch (error) {
      console.error('[Shizuku Controller] Failed to apply Shizuku response:', error);
    }
  }, [
    modelRef, 
    enableDebugLogs,
    applyFormPreset,
    applyEmotions,
    applyAccessories,
    applyDecorations,
    applySpecialFX,
    applyPhysics,
    applyMouth
  ]);

  // Reset to neutral state
  const resetToNeutral = useCallback(() => {
    if (!modelRef.current) return;

    try {
      // Reset expressions
      modelRef.current.resetExpression();

      // Reset physics to neutral
      smoothSetParameter('ParamAngleX', 0);
      smoothSetParameter('ParamAngleY', 0);
      smoothSetParameter('ParamAngleZ', 0);
      smoothSetParameter('ParamBodyAngleX', 0);
      smoothSetParameter('ParamBodyAngleY', 0);
      smoothSetParameter('ParamBodyAngleZ', 0);
      smoothSetParameter('ParamBreath', 0.5);
      smoothSetParameter('ParamEyeBallX', 0);
      smoothSetParameter('ParamEyeBallY', 0);

      // Reset mouth
      smoothSetParameter('ParamMouthOpenY', 0);
      smoothSetParameter('ParamMouthForm', 0);

      lastAppliedStateRef.current = null;

      if (enableDebugLogs) {
        console.log('[Shizuku Controller] ✓ Reset to neutral state');
      }
    } catch (error) {
      console.warn('[Shizuku Controller] Failed to reset to neutral:', error);
    }
  }, [modelRef, enableDebugLogs, smoothSetParameter]);

  return {
    applyShizukuResponse,
    resetToNeutral,
    lastAppliedState: lastAppliedStateRef.current,
    
    // Individual parameter application functions (for fine control)
    applyEmotions,
    applyMouth,
    applyAccessories,
    applyDecorations,
    applySpecialFX,
    applyPhysics,
    applyFormPreset
  };
};