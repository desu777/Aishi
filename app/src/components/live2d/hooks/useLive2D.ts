// Core hook for managing Live2D model lifecycle
import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display-lipsyncpatch/cubism4';
import { 
  createPixiApp, 
  loadLive2DModel, 
  cleanupPixiApp, 
  cleanupLive2DModel,
  createPerformanceMonitor,
} from '../utils/live2d-loader';
import type { Live2DModelRef, Live2DPerformanceMetrics } from '../utils/live2d-types';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const performanceMonitorRef = useRef<ReturnType<typeof createPerformanceMonitor> | null>(null);

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
      const actualIndex = index ?? Math.floor(Math.random() * (modelRef.current.internalModel.motionManager.motionGroups[group]?.length || 0));
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
    modelRef.current.expression(expressionId);
  }, []);

  const resetExpression = useCallback(() => {
    if (!modelRef.current) return;
    modelRef.current.expression();
  }, []);

  const lookAt = useCallback((x: number, y: number) => {
    if (!modelRef.current) return;
    modelRef.current.focus(x, y);
  }, []);

  const stopLookAt = useCallback(() => {
    if (!modelRef.current) return;
    modelRef.current.focus(modelRef.current.x, modelRef.current.y);
  }, []);

  const startLipSync = useCallback((audioLevel: number) => {
    if (!modelRef.current) return;
    const mouthParam = modelRef.current.internalModel.coreModel.getParameterIndex('ParamMouthOpenY');
    if (mouthParam >= 0) {
      modelRef.current.internalModel.coreModel.setParameterValueByIndex(mouthParam, audioLevel);
    }
  }, []);

  const setLipSyncValue = useCallback((value: number) => {
    if (!modelRef.current) return;
    const clampedValue = Math.max(0, Math.min(1, value));
    const mouthParam = modelRef.current.internalModel.coreModel.getParameterIndex('ParamMouthOpenY');
    if (mouthParam >= 0) {
      modelRef.current.internalModel.coreModel.setParameterValueByIndex(mouthParam, clampedValue);
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
    return modelRef.current.internalModel.motionManager.expressionManager?.expressions.map((exp: any) => exp.name) || [];
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
    const index = modelRef.current.internalModel.coreModel.getParameterIndex(id);
    if (index >= 0) {
      modelRef.current.internalModel.coreModel.setParameterValueByIndex(index, value, weight);
    }
  }, []);

  const getParameterValue = useCallback((id: string): number => {
    if (!modelRef.current) return 0;
    const index = modelRef.current.internalModel.coreModel.getParameterIndex(id);
    return index >= 0 ? modelRef.current.internalModel.coreModel.getParameterValueByIndex(index) : 0;
  }, []);

  // Create model ref object
  const modelRefObject: Live2DModelRef = {
    playMotion,
    stopAllMotions,
    setExpression,
    resetExpression,
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

        // Load model
        const model = await loadLive2DModel(modelPath);
        
        if (!mounted) {
          model.destroy();
          return;
        }

        modelRef.current = model;

        // Set model properties
        model.x = width / 2;
        model.y = height / 2;
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

        // Start idle animation if autoPlay
        if (autoPlay) {
          const motions = getAvailableMotions();
          if (motions.includes('idle')) {
            playMotion('idle');
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