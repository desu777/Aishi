'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaSmile, 
  FaVolumeUp, 
  FaMouse, 
  FaEye,
  FaRandom,
  FaStop,
  FaSyncAlt
} from 'react-icons/fa';
import type { Live2DTestControlsProps, Live2DModelRef } from './utils/live2d-types';

export const Live2DTestControls: React.FC<Live2DTestControlsProps> = ({
  modelRef,
  availableMotions,
  availableExpressions,
  showPerformance = true,
}) => {
  const [selectedMotion, setSelectedMotion] = useState('');
  const [selectedExpression, setSelectedExpression] = useState('');
  const [lipSyncValue, setLipSyncValue] = useState(0);
  const [isLipSyncActive, setIsLipSyncActive] = useState(false);
  const [currentTab, setCurrentTab] = useState<'motions' | 'expressions' | 'lipsync' | 'params'>('motions');

  // Play motion
  const handlePlayMotion = useCallback((motionGroup: string) => {
    if (modelRef.current) {
      modelRef.current.playMotion(motionGroup);
      setSelectedMotion(motionGroup);
    }
  }, [modelRef]);

  // Set expression
  const handleSetExpression = useCallback((expression: string) => {
    if (modelRef.current) {
      modelRef.current.setExpression(expression);
      setSelectedExpression(expression);
    }
  }, [modelRef]);

  // Reset expression
  const handleResetExpression = useCallback(() => {
    if (modelRef.current) {
      modelRef.current.resetExpression();
      setSelectedExpression('');
    }
  }, [modelRef]);

  // Stop all motions
  const handleStopMotions = useCallback(() => {
    if (modelRef.current) {
      modelRef.current.stopAllMotions();
      setSelectedMotion('');
    }
  }, [modelRef]);

  // Lip sync simulation
  const handleLipSyncChange = useCallback((value: number) => {
    setLipSyncValue(value);
    if (modelRef.current && isLipSyncActive) {
      modelRef.current.setLipSyncValue(value);
    }
  }, [modelRef, isLipSyncActive]);

  // Toggle lip sync
  const toggleLipSync = useCallback(() => {
    if (modelRef.current) {
      if (!isLipSyncActive) {
        setIsLipSyncActive(true);
        // Simulate talking animation
        let value = 0;
        const interval = setInterval(() => {
          value = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
          setLipSyncValue(value);
          if (modelRef.current) {
            modelRef.current.setLipSyncValue(value);
          }
        }, 50);
        
        // Store interval ID for cleanup
        (window as any).__lipSyncInterval = interval;
      } else {
        setIsLipSyncActive(false);
        if ((window as any).__lipSyncInterval) {
          clearInterval((window as any).__lipSyncInterval);
        }
        modelRef.current.stopLipSync();
        setLipSyncValue(0);
      }
    }
  }, [modelRef, isLipSyncActive]);

  // Test hit areas
  const handleTestHit = useCallback(() => {
    if (modelRef.current) {
      // Simulate random hit
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      modelRef.current.hit(x, y);
    }
  }, [modelRef]);

  const tabStyle = {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.3s ease',
    borderRadius: '8px',
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    color: '#8B5CF6',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{
        position: 'fixed',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '800px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        padding: '20px',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <h3 style={{
          color: '#8B5CF6',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: 0,
        }}>
          Live2D Test Controls
        </h3>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <button
            onClick={handleStopMotions}
            style={{
              ...tabStyle,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
            }}
          >
            <FaStop style={{ marginRight: '4px' }} />
            Stop All
          </button>
          <button
            onClick={handleResetExpression}
            style={{
              ...tabStyle,
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              color: '#22C55E',
            }}
          >
            <FaSyncAlt style={{ marginRight: '4px' }} />
            Reset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '8px',
      }}>
        <button
          onClick={() => setCurrentTab('motions')}
          style={currentTab === 'motions' ? activeTabStyle : tabStyle}
        >
          <FaPlay style={{ marginRight: '4px' }} />
          Motions
        </button>
        <button
          onClick={() => setCurrentTab('expressions')}
          style={currentTab === 'expressions' ? activeTabStyle : tabStyle}
        >
          <FaSmile style={{ marginRight: '4px' }} />
          Expressions
        </button>
        <button
          onClick={() => setCurrentTab('lipsync')}
          style={currentTab === 'lipsync' ? activeTabStyle : tabStyle}
        >
          <FaVolumeUp style={{ marginRight: '4px' }} />
          Lip Sync
        </button>
        <button
          onClick={() => setCurrentTab('params')}
          style={currentTab === 'params' ? activeTabStyle : tabStyle}
        >
          <FaEye style={{ marginRight: '4px' }} />
          Parameters
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {currentTab === 'motions' && (
          <motion.div
            key="motions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {availableMotions.map((motion) => (
                <button
                  key={motion}
                  onClick={() => handlePlayMotion(motion)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedMotion === motion 
                      ? 'rgba(139, 92, 246, 0.3)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${selectedMotion === motion ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    color: selectedMotion === motion ? '#8B5CF6' : '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMotion !== motion) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMotion !== motion) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  {motion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentTab === 'expressions' && (
          <motion.div
            key="expressions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {availableExpressions.map((expression) => (
                <button
                  key={expression}
                  onClick={() => handleSetExpression(expression)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedExpression === expression 
                      ? 'rgba(139, 92, 246, 0.3)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${selectedExpression === expression ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    color: selectedExpression === expression ? '#8B5CF6' : '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedExpression !== expression) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedExpression !== expression) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  {expression}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentTab === 'lipsync' && (
          <motion.div
            key="lipsync"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <button
                onClick={toggleLipSync}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isLipSyncActive 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : 'rgba(34, 197, 94, 0.2)',
                  border: `2px solid ${isLipSyncActive ? '#EF4444' : '#22C55E'}`,
                  borderRadius: '8px',
                  color: isLipSyncActive ? '#EF4444' : '#22C55E',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FaVolumeUp />
                {isLipSyncActive ? 'Stop Lip Sync' : 'Start Lip Sync'}
              </button>
              
              <div>
                <label style={{
                  color: '#fff',
                  fontSize: '14px',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Manual Control: {Math.round(lipSyncValue * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lipSyncValue * 100}
                  onChange={(e) => handleLipSyncChange(Number(e.target.value) / 100)}
                  disabled={isLipSyncActive}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: isLipSyncActive ? 'not-allowed' : 'pointer',
                    opacity: isLipSyncActive ? 0.5 : 1,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {currentTab === 'params' && (
          <motion.div
            key="params"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <button
                onClick={handleTestHit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid #8B5CF6',
                  borderRadius: '8px',
                  color: '#8B5CF6',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FaMouse />
                Test Random Hit Area
              </button>
              
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#999',
              }}>
                <p style={{ margin: '0 0 8px 0' }}>Available Parameters:</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>ParamEyeLOpen / ParamEyeROpen (Eye blink)</li>
                  <li>ParamMouthOpenY (Lip sync)</li>
                  <li>ParamAngleX/Y/Z (Head rotation)</li>
                  <li>ParamBodyAngleX/Y/Z (Body rotation)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};