import { useEffect, useRef, useState, useCallback, MutableRefObject } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel, MotionPriority } from 'pixi-live2d-display-lipsyncpatch/cubism4';

// Extend window to include PIXI
declare global {
  interface Window {
    PIXI: typeof PIXI;
    Live2DCubismCore: any;
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

// CRITICAL: Disable WebGL2 to avoid shader compilation errors
PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL_LEGACY;
PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;

export const useLive2D = ({ modelPath, width = 800, height = 600, autoPlay = true }: UseLive2DOptions) => {
  // Use a container ref instead of canvas ref to avoid React DOM conflicts
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const isInitializedRef = useRef(false);
  
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
    let mounted = true;
    let canvas: HTMLCanvasElement | null = null;
    
    const initializeLive2D = async () => {
      try {
        // Check for SSR
        if (typeof window === 'undefined') {
          throw new Error('Window not available (SSR)');
        }

        // Wait for container to be mounted
        if (!containerRef.current) {
          throw new Error('Container ref not available');
        }

        // Check if already initialized
        if (isInitializedRef.current) {
          return;
        }

        // Check if Cubism Core is loaded
        if (!window.Live2DCubismCore) {
          // Try to wait for it
          let attempts = 0;
          while (!window.Live2DCubismCore && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!window.Live2DCubismCore) {
            throw new Error('Live2DCubismCore not loaded after waiting');
          }
        }

        // Make PIXI available globally for Live2D
        window.PIXI = PIXI;

        // Create canvas element manually to avoid React DOM conflicts
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        
        // CRITICAL: Create PIXI Application with conservative settings
        const app = new PIXI.Application({
          view: canvas,
          width,
          height,
          backgroundColor: 0x000000,
          backgroundAlpha: 0,
          antialias: true,
          resolution: 1, // Force resolution to 1 to avoid issues
          autoDensity: false,
          // WebGL1 specific settings to avoid shader errors
          powerPreference: 'low-power',
          preserveDrawingBuffer: false,
          premultipliedAlpha: true,
          // Force WebGL1
          context: null,
          forceCanvas: false
        });

        // Verify app creation
        if (!app || !app.renderer || !app.stage) {
          throw new Error('Failed to create PIXI Application');
        }

        // Add canvas to container
        containerRef.current.appendChild(canvas);
        
        appRef.current = app;
        canvasRef.current = canvas;
        isInitializedRef.current = true;

        // Load the Live2D model
        const encodedModelPath = encodeURI(modelPath);
        
        const model = await Live2DModel.from(encodedModelPath, {
          autoUpdate: true,
          autoHitTest: true,
          autoFocus: true
        });

        if (!model) {
          throw new Error('Live2D model loaded but is null');
        }

        if (!mounted) return;

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
          model.internalModel.motionManager.expressionManager.expressions.forEach((exp: any) => {
            if (exp.name) {
              expressions.push(exp.name);
            }
          });
        }

        // Update state on successful initialization
        setState({
          isLoading: false,
          error: null,
          model,
          availableMotions: motions,
          availableExpressions: expressions
        });

        // Auto-play idle motion if enabled
        if (autoPlay && motions.includes('idle')) {
          setTimeout(() => {
            if (mounted && model) {
              model.motion('idle');
            }
          }, 100);
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
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load model'
          }));
        }
      }
    };

    // Start initialization
    initializeLive2D();

    // Cleanup function
    return () => {
      mounted = false;
      
      if (appRef.current) {
        try {
          // Remove all children first
          appRef.current.stage.removeChildren();
          
          // Destroy the app
          appRef.current.destroy(true, {
            children: true,
            texture: true,
            baseTexture: true
          });
        } catch (e) {
          console.warn('Error during PIXI cleanup:', e);
        }
        appRef.current = null;
      }
      
      // Remove canvas from DOM
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      
      modelRef.current = null;
      canvasRef.current = null;
      isInitializedRef.current = false;
    };
  }, [modelPath, width, height, autoPlay]);

  // Handle resize
  useEffect(() => {
    if (!appRef.current || !canvasRef.current || !modelRef.current) return;

    const handleResize = () => {
      if (appRef.current && canvasRef.current && modelRef.current) {
        appRef.current.renderer.resize(width, height);
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        
        const scale = Math.min(width / modelRef.current.width, height / modelRef.current.height) * 0.8;
        modelRef.current.scale.set(scale);
        modelRef.current.x = width / 2;
        modelRef.current.y = height / 2;
      }
    };

    handleResize();
  }, [width, height]);

  return {
    containerRef,
    ...state,
    playMotion,
    setExpression,
    stopAllMotions
  };
};