import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel, MotionPriority } from 'pixi-live2d-display-lipsyncpatch/cubism4';

// Extend window to include PIXI
declare global {
  interface Window {
    PIXI: typeof PIXI;
  }
}

interface UseLive2DOptions {
  modelPath: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
}

interface Live2DState {
  isLoading: boolean;
  error: string | null;
  model: Live2DModel | null;
  availableMotions: string[];
  availableExpressions: string[];
}

export const useLive2D = ({ modelPath, width = 800, height = 600, autoPlay = true }: UseLive2DOptions) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  
  const [state, setState] = useState<Live2DState>({
    isLoading: true,
    error: null,
    model: null,
    availableMotions: [],
    availableExpressions: []
  });

  // Play motion by name
  const playMotion = useCallback(async (motionName: string, priority: MotionPriority = MotionPriority.NORMAL) => {
    if (!modelRef.current) {
      console.error('Model not loaded');
      return;
    }

    try {
      await modelRef.current.motion(motionName, undefined, priority);
    } catch (error) {
      console.error('Error playing motion:', error);
    }
  }, []);

  // Set expression by name or index
  const setExpression = useCallback(async (expression: string | number) => {
    if (!modelRef.current) {
      console.error('Model not loaded');
      return;
    }

    try {
      await modelRef.current.expression(expression);
    } catch (error) {
      console.error('Error setting expression:', error);
    }
  }, []);

  // Stop all motions
  const stopAllMotions = useCallback(() => {
    if (!modelRef.current) {
      console.error('Model not loaded');
      return;
    }

    modelRef.current.internalModel.motionManager.stopAllMotions();
  }, []);

  // Initialize PIXI and load model
  useEffect(() => {
    const initializeLive2D = async () => {
      // Check for SSR
      if (typeof window === 'undefined') return;
      if (!canvasRef.current) return;

      // Check if app already exists (prevent double initialization)
      if (appRef.current) {
        console.warn('PIXI Application already initialized');
        return;
      }

      // Check if Cubism Core is loaded
      if (!(window as any).Live2DCubismCore) {
        console.warn('Waiting for Cubism Core to load...');
        // Retry after a short delay
        setTimeout(() => {
          initializeLive2D();
        }, 100);
        return;
      }

      try {
        // Make PIXI available globally for Live2D
        window.PIXI = PIXI;

        // Create PIXI application
        const app = new PIXI.Application({
          view: canvasRef.current,
          width,
          height,
          backgroundColor: 0x000000,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true
        });

        appRef.current = app;

        // Load the Live2D model
        const model = await Live2DModel.from(modelPath, {
          autoUpdate: true,
          autoHitTest: true,
          autoFocus: true
        });

        modelRef.current = model;

        // Scale and position the model
        const scale = Math.min(width / model.width, height / model.height) * 0.8;
        model.scale.set(scale);
        model.x = width / 2;
        model.y = height / 2;
        model.anchor.set(0.5, 0.5);

        // Add model to stage
        app.stage.addChild(model);

        // Extract available motions and expressions
        const motions: string[] = [];
        const expressions: string[] = [];

        // Get motion groups
        if (model.internalModel.motionManager.motionGroups) {
          Object.keys(model.internalModel.motionManager.motionGroups).forEach(group => {
            motions.push(group);
          });
        }

        // Get expressions
        if (model.internalModel.motionManager.expressionManager?.expressions) {
          model.internalModel.motionManager.expressionManager.expressions.forEach((exp: any, index: number) => {
            if (exp.name) {
              expressions.push(exp.name);
            }
          });
        }

        setState({
          isLoading: false,
          error: null,
          model,
          availableMotions: motions,
          availableExpressions: expressions
        });

        // Auto-play idle motion if enabled
        if (autoPlay && motions.includes('idle')) {
          model.motion('idle');
        }

        // Enable interaction
        model.on('hit', (hitAreas: string[]) => {
          if (hitAreas.includes('Body')) {
            model.motion('tap_body');
          } else if (hitAreas.includes('Head')) {
            model.motion('tap_head');
          }
        });

      } catch (error) {
        console.error('Error loading Live2D model:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load model'
        }));
      }
    };

    initializeLive2D();

    // Cleanup
    return () => {
      if (appRef.current) {
        // Use destroy(false) to avoid canvas destruction issues with React StrictMode
        appRef.current.destroy(false);
        appRef.current = null;
      }
      modelRef.current = null;
    };
  }, [modelPath, width, height, autoPlay]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (appRef.current && canvasRef.current) {
        appRef.current.renderer.resize(width, height);
        
        if (modelRef.current) {
          const scale = Math.min(width / modelRef.current.width, height / modelRef.current.height) * 0.8;
          modelRef.current.scale.set(scale);
          modelRef.current.x = width / 2;
          modelRef.current.y = height / 2;
        }
      }
    };

    handleResize();
  }, [width, height]);

  return {
    canvasRef,
    ...state,
    playMotion,
    setExpression,
    stopAllMotions
  };
};