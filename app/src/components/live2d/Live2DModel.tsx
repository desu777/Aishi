'use client';

import React from 'react';
import { useLive2D } from './hooks/useLive2D';

interface Live2DModelProps {
  modelPath: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export const Live2DModel: React.FC<Live2DModelProps> = ({
  modelPath,
  width = 800,
  height = 600,
  autoPlay = true,
  className = '',
  onLoad,
  onError
}) => {
  const { containerRef, isLoading, error, model } = useLive2D({
    modelPath,
    width,
    height,
    autoPlay
  });

  React.useEffect(() => {
    if (!isLoading && !error && model && onLoad) {
      onLoad();
    }
  }, [isLoading, error, model, onLoad]);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <div className={`live2d-container ${className}`} style={{ position: 'relative', width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Loading Live2D Model...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
          <div className="text-red-500">Error: {error}</div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative'
        }}
      />
    </div>
  );
};