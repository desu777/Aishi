// Core hook for managing Live2D model lifecycle
import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel, type Cubism4InternalModel } from 'pixi-live2d-display-lipsyncpatch/cubism4';
import { 
  createPixiApp, 
  loadLive2DModel, 
  cleanupPixiApp, 
  cleanupLive2DModel,
  createPerformanceMonitor,
} from '../utils/live2d-loader';
import type { Live2DModelRef, Live2DPerformanceMetrics } from '../utils/live2d-types';
import { ExpressionCategoryManager } from '../utils/ExpressionCategoryManager';
import { EXPRESSION_PRESETS } from '../utils/expression-categories';

interface UseLive2DOptions {
  modelPath: string;
  width: number;
  height: number;
  scale?: number;
  transparent?: boolean;
  autoPlay?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  onMotionStart?: (group: string, index: number) => void;
  onMotionFinish?: (group: string, index: number) => void;
  onHit?: (hitAreaNames: string[]) => void;
}

export const useLive2D = (options: UseLive2DOptions) => {
  const {
    modelPath,
    width,
    height,
    scale = 1,
    transparent = false,
    autoPlay = true,
    onLoad,
    onError,
    onMotionStart,
    onMotionFinish,
    onHit,
  } = options;
  
  // Debug log AI mode on hook initialization
  const isAIMode = process.env.NEXT_PUBLIC_LIVE2MODEL_AI === 'true';
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log('[useLive2D] Hook initialized with AI Mode:', {
      isAIMode,
      NEXT_PUBLIC_LIVE2MODEL_AI: process.env.NEXT_PUBLIC_LIVE2MODEL_AI
    });
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const performanceMonitorRef = useRef<ReturnType<typeof createPerformanceMonitor> | null>(null);
  const expressionManagerRef = useRef<ExpressionCategoryManager>(
    new ExpressionCategoryManager(process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true')
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [metrics, setMetrics] = useState<Live2DPerformanceMetrics>({
    fps: 0,
    memory: 0,
    drawCalls: 0,
    textureCount: 0,
  });

  // Model control methods
  const playMotion = useCallback(async (group: string, index?: number, priority: number = 2): Promise<void> => {
    if (!modelRef.current) {
      console.warn('Model not loaded');
      return;
    }

    try {
      // Use the motion API with proper priority
      const actualIndex = index ?? 0;
      await modelRef.current.motion(group, actualIndex, priority);
    } catch (error) {
      console.error('Failed to play motion:', error);
    }
  }, []);

  const stopAllMotions = useCallback(() => {
    if (!modelRef.current) return;
    modelRef.current.internalModel.motionManager?.stopAllMotions();
  }, []);

  const setExpression = useCallback((expressionId: string | number) => {
    if (!modelRef.current) return;
    try {
      // Use category manager for string expressions
      if (typeof expressionId === 'string') {
        expressionManagerRef.current.applyExpression(expressionId);
      } else {
        // Fallback for numeric indices
        modelRef.current.expression(expressionId);
      }
    } catch (error) {
      console.warn('Failed to set expression:', error);
    }
  }, []);

  const resetExpression = useCallback(() => {
    if (!modelRef.current) return;
    try {
      expressionManagerRef.current.reset();
    } catch (error) {
      console.warn('Failed to reset expression:', error);
    }
  }, []);

  const lookAt = useCallback((x: number, y: number) => {
    if (!modelRef.current) return;
    
    // Don't respond to lookAt calls in AI mode
    const isAIMode = process.env.NEXT_PUBLIC_LIVE2MODEL_AI === 'true';
    if (isAIMode) return;
    
    modelRef.current.focus(x, y);
  }, []);

  const stopLookAt = useCallback(() => {
    if (!modelRef.current) return;
    
    // Don't respond to stopLookAt calls in AI mode
    const isAIMode = process.env.NEXT_PUBLIC_LIVE2MODEL_AI === 'true';
    if (isAIMode) return;
    
    modelRef.current.focus(modelRef.current.x, modelRef.current.y);
  }, []);

  const startLipSync = useCallback((audioLevel: number) => {
    if (!modelRef.current) return;
    try {
      (modelRef.current.internalModel as Cubism4InternalModel).coreModel.setParameterValueById('ParamMouthOpenY', audioLevel);
    } catch (error) {
      console.warn('Failed to start lip sync:', error);
    }
  }, []);

  const setLipSyncValue = useCallback((value: number) => {
    if (!modelRef.current) return;
    const clampedValue = Math.max(0, Math.min(1, value));
    try {
      (modelRef.current.internalModel as Cubism4InternalModel).coreModel.setParameterValueById('ParamMouthOpenY', clampedValue);
    } catch (error) {
      console.warn('Failed to set lip sync value:', error);
    }
  }, []);

  const stopLipSync = useCallback(() => {
    setLipSyncValue(0);
  }, [setLipSyncValue]);

  const hit = useCallback((x: number, y: number) => {
    if (!modelRef.current) return;
    
    const point = new PIXI.Point(x, y);
    const hitAreas = modelRef.current.hitTest(point);
    
    if (hitAreas.length > 0 && onHit) {
      onHit(hitAreas);
    }
  }, [onHit]);

  const getAvailableMotions = useCallback((): string[] => {
    if (!modelRef.current) return [];
    return Object.keys(modelRef.current.internalModel.motionManager.motionGroups || {});
  }, []);

  const getAvailableExpressions = useCallback((): string[] => {
    if (!modelRef.current) return [];
    
    // Debug logging for expression manager structure
    if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
      console.log('[DEBUG] ExpressionManager structure:', {
        motionManager: !!modelRef.current.internalModel.motionManager,
        expressionManager: !!modelRef.current.internalModel.motionManager.expressionManager,
        expressions: modelRef.current.internalModel.motionManager.expressionManager?.expressions,
        settings: modelRef.current.internalModel.settings?.expressions,
      });
    }
    
    const expressionManager = modelRef.current.internalModel.motionManager.expressionManager;
    
    // Method 1: Try to get from expressionManager.expressions
    if (expressionManager?.expressions) {
      try {
        if (Array.isArray(expressionManager.expressions)) {
          const names = expressionManager.expressions.map((exp: any) => exp.name || exp.Name || exp);
          if (names.length > 0) {
            if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
              console.log('[DEBUG] Got expressions from expressionManager.expressions:', names);
            }
            return names.filter(name => name && typeof name === 'string');
          }
        }
      } catch (error) {
        console.warn('[DEBUG] Failed to get expressions from expressionManager.expressions:', error);
      }
    }
    
    // Method 2: Try to get from settings.expressions
    const settings = modelRef.current.internalModel.settings;
    if (settings?.expressions && Array.isArray(settings.expressions)) {
      try {
        const names = settings.expressions.map((exp: any) => exp.Name || exp.name || exp);
        if (names.length > 0) {
          if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
            console.log('[DEBUG] Got expressions from settings.expressions:', names);
          }
          return names.filter(name => name && typeof name === 'string');
        }
      } catch (error) {
        console.warn('[DEBUG] Failed to get expressions from settings.expressions:', error);
      }
    }
    
    // Method 3: Try to get expression names from expressionManager directly
    if (expressionManager) {
      try {
        // Check if expressionManager has a method to get expression names
        if (typeof expressionManager.getExpressionNames === 'function') {
          const names = expressionManager.getExpressionNames();
          if (Array.isArray(names) && names.length > 0) {
            if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
              console.log('[DEBUG] Got expressions from getExpressionNames():', names);
            }
            return names;
          }
        }
        
        // Check other possible properties
        const possibleProps = ['names', 'expressionNames', '_expressions', 'expressionMap'];
        for (const prop of possibleProps) {
          if (expressionManager[prop]) {
            if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
              console.log(`[DEBUG] Found expressions in ${prop}:`, expressionManager[prop]);
            }
            if (Array.isArray(expressionManager[prop])) {
              return expressionManager[prop];
            } else if (typeof expressionManager[prop] === 'object') {
              return Object.keys(expressionManager[prop]);
            }
          }
        }
      } catch (error) {
        console.warn('[DEBUG] Failed to get expressions from expressionManager methods:', error);
      }
    }
    
    if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
      console.warn('[DEBUG] No expressions found through any method');
    }
    
    return [];
  }, []);

  const getHitAreas = useCallback((): string[] => {
    if (!modelRef.current) return [];
    return modelRef.current.hitAreas.map((area: any) => area.name);
  }, []);

  const getCurrentMotion = useCallback((): { group: string; index: number } | null => {
    if (!modelRef.current) return null;
    const playing = modelRef.current.internalModel.motionManager.playing;
    return playing ? { group: playing.group, index: playing.index } : null;
  }, []);

  const getCurrentExpression = useCallback((): string | null => {
    if (!modelRef.current) return null;
    return modelRef.current.internalModel.motionManager.expressionManager?.currentExpression || null;
  }, []);

  const setParameterValue = useCallback((id: string, value: number, weight: number = 1) => {
    if (!modelRef.current) return;
    try {
      // Use setParameterValueById for Cubism 4 models
      modelRef.current.internalModel.coreModel.setParameterValueById(id, value, weight);
    } catch (error) {
      console.warn(`Failed to set parameter ${id}:`, error);
    }
  }, []);

  const getParameterValue = useCallback((id: string): number => {
    if (!modelRef.current) return 0;
    try {
      // Use getParameterValueById for Cubism 4 models
      return modelRef.current.internalModel.coreModel.getParameterValueById(id) || 0;
    } catch (error) {
      console.warn(`Failed to get parameter ${id}:`, error);
      return 0;
    }
  }, []);

  // Expression category methods
  const toggleExpression = useCallback((expressionName: string): boolean => {
    if (!modelRef.current) return false;
    return expressionManagerRef.current.toggleExpression(expressionName);
  }, []);

  const getActiveExpressions = useCallback((): string[] => {
    return expressionManagerRef.current.getActiveExpressions();
  }, []);

  const isExpressionActive = useCallback((expressionName: string): boolean => {
    return expressionManagerRef.current.isExpressionActive(expressionName);
  }, []);

  const applyFormPreset = useCallback((presetName: keyof typeof EXPRESSION_PRESETS): void => {
    if (!modelRef.current) return;
    expressionManagerRef.current.applyFormPreset(presetName);
  }, []);

  // Create model ref object
  const modelRefObject: Live2DModelRef = {
    playMotion,
    stopAllMotions,
    setExpression,
    resetExpression,
    toggleExpression,
    getActiveExpressions,
    isExpressionActive,
    applyFormPreset,
    lookAt,
    stopLookAt,
    hit,
    startLipSync,
    stopLipSync,
    setLipSyncValue,
    getAvailableMotions,
    getAvailableExpressions,
    getHitAreas,
    getCurrentMotion,
    getCurrentExpression,
    setParameterValue,
    getParameterValue,
    getModel: () => modelRef.current,
    getApp: () => appRef.current,
  };

  // Initialize Live2D
  useEffect(() => {
    let mounted = true;

    const initLive2D = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Create PIXI application
        const app = createPixiApp({ width, height, transparent });
        appRef.current = app;

        // Add canvas to container
        containerRef.current.appendChild(app.view as HTMLCanvasElement);

        // Create performance monitor
        if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
          performanceMonitorRef.current = createPerformanceMonitor();
        }

        // Check if AI mode is enabled
        const isAIMode = process.env.NEXT_PUBLIC_LIVE2MODEL_AI === 'true';
        
        // Load model with AI-specific options
        const model = await loadLive2DModel(modelPath, {
          autoUpdate: true,
          motionPreload: 'IDLE',
          autoFocus: !isAIMode, // Disable auto cursor tracking in AI mode
          autoHitTest: true, // Keep hit testing enabled
        });
        
        if (!mounted) {
          model.destroy();
          return;
        }

        modelRef.current = model;

        // Set model properties
        model.x = width / 2;
        model.y = height * 0.75; // Position model lower on screen (75% of height)
        model.scale.set(scale);

        // Add event listeners
        model.on('hit', (hitAreaNames: string[]) => {
          if (onHit) onHit(hitAreaNames);
        });

        if (onMotionStart) {
          model.internalModel.motionManager.on('motionStart', (group: string, index: number) => {
            onMotionStart(group, index);
          });
        }

        if (onMotionFinish) {
          model.internalModel.motionManager.on('motionFinish', (group: string, index: number) => {
            onMotionFinish(group, index);
          });
        }

        // Add to stage
        app.stage.addChild(model);

        // Add manual update to ticker as fallback
        app.ticker.add((deltaTime) => {
          if (modelRef.current) {
            modelRef.current.update(deltaTime);
          }
        });

        // Initialize expression category manager
        expressionManagerRef.current.setModel(model);
        
        // Load expression parameters for category management
        if (model.internalModel.settings?.expressions) {
          const baseUrl = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);
          const expressions = model.internalModel.settings.expressions.map((expr: any) => ({
            name: expr.Name || expr.name,
            file: baseUrl + (expr.File || expr.file)
          }));
          await expressionManagerRef.current.loadExpressionParameters(expressions);
        }

        // Debug expression manager after model load
        if (process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true') {
          console.log('[DEBUG] Model loaded, checking expression structure:', {
            hasMotionManager: !!model.internalModel.motionManager,
            hasExpressionManager: !!model.internalModel.motionManager.expressionManager,
            settingsExpressions: model.internalModel.settings?.expressions?.length || 0,
            motionGroups: Object.keys(model.internalModel.motionManager.motionGroups || {}),
          });
          
          // Try to force expression manager initialization if it doesn't exist
          if (!model.internalModel.motionManager.expressionManager && model.internalModel.settings?.expressions) {
            console.log('[DEBUG] Attempting to initialize expression manager...');
            try {
              // Check if there's a method to initialize expressions
              if (typeof model.internalModel.motionManager.createExpressionManager === 'function') {
                model.internalModel.motionManager.createExpressionManager();
                console.log('[DEBUG] Expression manager created successfully');
              }
            } catch (error) {
              console.warn('[DEBUG] Failed to create expression manager:', error);
            }
          }
        }

        // Start idle animation if autoPlay
        if (autoPlay) {
          const motions = getAvailableMotions();
          if (motions.includes('idle')) {
            playMotion('idle');
          } else if (motions.length > 0) {
            // If no idle motion, play the first available motion
            playMotion(motions[0]);
          }
        }

        // Configure AI mode behavior
        if (isAIMode) {
          try {
            // Set neutral eye position (looking straight at viewer)
            model.internalModel.coreModel.setParameterValueById('ParamEyeBallX', 0);
            model.internalModel.coreModel.setParameterValueById('ParamEyeBallY', 0);
            
            // Set neutral head position
            model.internalModel.coreModel.setParameterValueById('ParamAngleX', 0);
            model.internalModel.coreModel.setParameterValueById('ParamAngleY', 0);
            model.internalModel.coreModel.setParameterValueById('ParamAngleZ', 0);
            
            // Ensure natural breathing is maintained (default value)
            model.internalModel.coreModel.setParameterValueById('ParamBreath', 0.5);
            
            // Ensure automatic blinking is enabled
            if (model.internalModel.eyeBlink) {
              model.internalModel.eyeBlink.setBlinkingInterval(2.5); // Natural blink interval
            }
            
            if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
              console.log('[AI MODE] ✓ Cursor tracking disabled, neutral position set');
              console.log('[AI MODE] ✓ Eye blink enabled:', !!model.internalModel.eyeBlink);
            }
          } catch (error) {
            console.warn('[AI MODE] Failed to set neutral position:', error);
          }
        } else {
          // Normal mode - ensure blinking is also enabled
          try {
            if (model.internalModel.eyeBlink) {
              model.internalModel.eyeBlink.setBlinkingInterval(2.5); // Natural blink interval
            }
            
            if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
              console.log('[NORMAL MODE] ✓ Cursor tracking enabled, eye blink enabled:', !!model.internalModel.eyeBlink);
            }
          } catch (error) {
            console.warn('[NORMAL MODE] Failed to configure blinking:', error);
          }
        }

        setIsReady(true);
        setIsLoading(false);
        if (onLoad) onLoad();

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load Live2D model';
        setError(errorMessage);
        setIsLoading(false);
        if (onError) onError(errorMessage);
      }
    };

    initLive2D();

    // Update performance metrics
    const metricsInterval = setInterval(() => {
      if (performanceMonitorRef.current && appRef.current) {
        setMetrics({
          fps: performanceMonitorRef.current.getFPS(),
          memory: performanceMonitorRef.current.getMemory(),
          drawCalls: appRef.current.renderer.gl.drawingBufferWidth ? 1 : 0,
          textureCount: Object.keys(appRef.current.renderer.texture.managedTextures).length,
        });
      }
    }, 1000);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(metricsInterval);

      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.destroy();
      }

      if (modelRef.current) {
        cleanupLive2DModel(modelRef.current);
      }

      if (appRef.current) {
        cleanupPixiApp(appRef.current);
      }
    };
  }, [modelPath, width, height, scale, transparent, autoPlay]);

  return {
    containerRef,
    modelRef: modelRefObject,
    isLoading,
    error,
    isReady,
    metrics,
  };
};