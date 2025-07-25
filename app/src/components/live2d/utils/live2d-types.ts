// TypeScript definitions for Live2D integration with pixi-live2d-display
import type { Live2DModel as PixiLive2DModel } from 'pixi-live2d-display-lipsyncpatch/cubism4';
import type { Application } from 'pixi.js';

export interface Live2DModelOptions {
  modelPath: string;
  width?: number;
  height?: number;
  scale?: number;
  x?: number;
  y?: number;
  autoPlay?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  onMotionStart?: (group: string, index: number) => void;
  onMotionFinish?: (group: string, index: number) => void;
  onHit?: (hitAreaNames: string[]) => void;
}

export interface Live2DModelRef {
  // Core model control
  playMotion: (group: string, index?: number, priority?: number) => Promise<void>;
  stopAllMotions: () => void;
  setExpression: (expressionId: string | number) => void;
  resetExpression: () => void;
  
  // Interaction
  lookAt: (x: number, y: number) => void;
  stopLookAt: () => void;
  hit: (x: number, y: number) => void;
  
  // Lip sync
  startLipSync: (audioLevel: number) => void;
  stopLipSync: () => void;
  setLipSyncValue: (value: number) => void;
  
  // Information getters
  getAvailableMotions: () => string[];
  getAvailableExpressions: () => string[];
  getHitAreas: () => string[];
  getCurrentMotion: () => { group: string; index: number } | null;
  getCurrentExpression: () => string | null;
  
  // Advanced control
  setParameterValue: (id: string, value: number, weight?: number) => void;
  getParameterValue: (id: string) => number;
  
  // Model instance access (for advanced usage)
  getModel: () => PixiLive2DModel | null;
  getApp: () => Application | null;
}

export interface Live2DMotionPriority {
  NONE: 0;
  IDLE: 1;
  NORMAL: 2;
  FORCE: 3;
}

export interface Live2DPerformanceMetrics {
  fps: number;
  memory: number;
  drawCalls: number;
  textureCount: number;
}

export interface Live2DTestControlsProps {
  modelRef: React.RefObject<Live2DModelRef>;
  availableMotions: string[];
  availableExpressions: string[];
  showPerformance?: boolean;
}

// Error types
export class Live2DLoadError extends Error {
  constructor(public modelPath: string, public originalError: Error) {
    super(`Failed to load Live2D model: ${modelPath}`);
    this.name = 'Live2DLoadError';
  }
}

export class Live2DWebGLError extends Error {
  constructor(message: string) {
    super(`WebGL Error: ${message}`);
    this.name = 'Live2DWebGLError';
  }
}