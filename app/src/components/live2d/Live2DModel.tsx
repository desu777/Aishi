'use client';

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useLive2D } from './hooks/useLive2D';
import { MotionPriority } from 'pixi-live2d-display-lipsyncpatch/cubism4';

interface Live2DModelProps {
  modelPath: string;
  width?: number;
  height?: number;
  animationToPlay?: string;
  expressionToShow?: string;
  onMotionEnd?: () => void;
  onReady?: () => void;
  className?: string;
}

export interface Live2DModelRef {
  playMotion: (motionName: string, priority?: MotionPriority) => Promise<void>;
  setExpression: (expression: string | number) => Promise<void>;
  stopAllMotions: () => void;
  getAvailableMotions: () => string[];
  getAvailableExpressions: () => string[];
}

export const Live2DModel = forwardRef<Live2DModelRef, Live2DModelProps>((
  {
    modelPath,
    width = 800,
    height = 600,
    animationToPlay,
    expressionToShow,
    onMotionEnd,
    onReady,
    className = ''
  },
  ref
) => {
  const {
    canvasRef,
    isLoading,
    error,
    model,
    availableMotions,
    availableExpressions,
    playMotion,
    setExpression,
    stopAllMotions
  } = useLive2D({ modelPath, width, height, autoPlay: false });

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    playMotion,
    setExpression,
    stopAllMotions,
    getAvailableMotions: () => availableMotions,
    getAvailableExpressions: () => availableExpressions
  }), [playMotion, setExpression, stopAllMotions, availableMotions, availableExpressions]);

  // Handle animation prop changes
  useEffect(() => {
    if (animationToPlay && model && availableMotions.includes(animationToPlay)) {
      playMotion(animationToPlay);
    }
  }, [animationToPlay, model, availableMotions, playMotion]);

  // Handle expression prop changes
  useEffect(() => {
    if (expressionToShow && model) {
      setExpression(expressionToShow);
    }
  }, [expressionToShow, model, setExpression]);

  // Setup motion end listener
  useEffect(() => {
    if (!model || !onMotionEnd) return;

    const handleMotionEnd = () => {
      onMotionEnd();
    };

    model.internalModel.motionManager.on('motionFinish', handleMotionEnd);

    return () => {
      model.internalModel.motionManager.off('motionFinish', handleMotionEnd);
    };
  }, [model, onMotionEnd]);

  // Call onReady when model is loaded
  useEffect(() => {
    if (model && !isLoading && onReady) {
      onReady();
    }
  }, [model, isLoading, onReady]);

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-red-500 text-center">
          <p className="text-lg font-bold mb-2">Error Loading Model</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading Live2D Model...</p>
          </div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});

Live2DModel.displayName = 'Live2DModel';