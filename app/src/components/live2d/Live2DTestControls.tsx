'use client';

import React, { useState } from 'react';
import { Live2DModelRef } from './Live2DModel';
import { MotionPriority } from 'pixi-live2d-display-lipsyncpatch/cubism4';

interface Live2DTestControlsProps {
  modelRef: React.RefObject<Live2DModelRef>;
  availableMotions: string[];
  availableExpressions: string[];
}

export const Live2DTestControls: React.FC<Live2DTestControlsProps> = ({
  modelRef,
  availableMotions,
  availableExpressions
}) => {
  const [selectedPriority, setSelectedPriority] = useState<MotionPriority>(MotionPriority.NORMAL);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMotion, setCurrentMotion] = useState<string>('');
  const [currentExpression, setCurrentExpression] = useState<string>('');

  const handlePlayMotion = async (motionName: string) => {
    if (!modelRef.current) return;
    
    setIsPlaying(true);
    setCurrentMotion(motionName);
    
    try {
      await modelRef.current.playMotion(motionName, selectedPriority);
    } catch (error) {
      console.error('Error playing motion:', error);
    } finally {
      setIsPlaying(false);
      setCurrentMotion('');
    }
  };

  const handleSetExpression = async (expression: string) => {
    if (!modelRef.current) return;
    
    setCurrentExpression(expression);
    
    try {
      await modelRef.current.setExpression(expression);
    } catch (error) {
      console.error('Error setting expression:', error);
    }
  };

  const handleStopAll = () => {
    if (!modelRef.current) return;
    modelRef.current.stopAllMotions();
    setIsPlaying(false);
    setCurrentMotion('');
  };

  return (
    <div className="absolute bottom-20 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-white text-lg font-bold mb-4 font-mono">Live2D Test Controls</h3>
        
        {/* Motion Priority Selector */}
        <div className="mb-4">
          <label className="text-white text-sm font-mono mb-2 block">Motion Priority:</label>
          <div className="flex gap-2">
            {Object.entries({
              [MotionPriority.IDLE]: 'IDLE',
              [MotionPriority.NORMAL]: 'NORMAL',
              [MotionPriority.FORCE]: 'FORCE'
            }).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSelectedPriority(Number(value) as MotionPriority)}
                className={`px-4 py-2 rounded font-mono text-sm transition-all ${
                  selectedPriority === Number(value)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Motions Section */}
        <div className="mb-4">
          <h4 className="text-white text-sm font-mono mb-2">Available Motions ({availableMotions.length})</h4>
          <div className="flex flex-wrap gap-2">
            {availableMotions.map((motion) => (
              <button
                key={motion}
                onClick={() => handlePlayMotion(motion)}
                disabled={isPlaying}
                className={`px-4 py-2 rounded font-mono text-sm transition-all ${
                  currentMotion === motion
                    ? 'bg-green-600 text-white animate-pulse'
                    : isPlaying
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {motion}
              </button>
            ))}
            <button
              onClick={handleStopAll}
              className="px-4 py-2 rounded font-mono text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
            >
              Stop All
            </button>
          </div>
        </div>

        {/* Expressions Section */}
        <div className="mb-4">
          <h4 className="text-white text-sm font-mono mb-2">Available Expressions ({availableExpressions.length})</h4>
          <div className="flex flex-wrap gap-2">
            {availableExpressions.map((expression) => (
              <button
                key={expression}
                onClick={() => handleSetExpression(expression)}
                className={`px-4 py-2 rounded font-mono text-sm transition-all ${
                  currentExpression === expression
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {expression}
              </button>
            ))}
            <button
              onClick={() => {
                if (modelRef.current) {
                  modelRef.current.setExpression(0); // Reset to default
                  setCurrentExpression('');
                }
              }}
              className="px-4 py-2 rounded font-mono text-sm bg-white/5 text-white/50 hover:bg-white/10 transition-all"
            >
              Reset Expression
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="text-white/50 text-xs font-mono">
          {isPlaying && <p>Playing: {currentMotion}</p>}
          {currentExpression && <p>Current Expression: {currentExpression}</p>}
        </div>
      </div>
    </div>
  );
};