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
  FaSyncAlt,
  FaGlasses,
  FaTshirt,
  FaHeart,
  FaStar,
  FaPalette,
  FaCat
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
  const [currentTab, setCurrentTab] = useState<'motions' | 'expressions' | 'lipsync' | 'params' | 'special' | 'face'>('motions');
  const [specialParams, setSpecialParams] = useState({
    glasses: 0,
    outfit: 0,
    question: 0,
    sweat: 0,
    grin: 0,
    starEyes: 0,
    dizzy: 0,
    angry: 0,
    blush: 0,
    cry: 0,
    eyeColorR: 0,
    eyeColorG: 0,
  });
  const [faceParams, setFaceParams] = useState({
    tongue: 0,
    mouthX: 0,
    cheekPuff: 0,
    mouthShrug: 0,
    mouthFunnel: 0,
    mouthPress: 0,
    mouthWiden: 0,
    jawOpen: 0,
    eyeSquint: 0,
    eyeSquint2: 0,
  });

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
    if (modelRef.current) {
      modelRef.current.setLipSyncValue(value);
    }
  }, [modelRef]);

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
        <button
          onClick={() => setCurrentTab('special')}
          style={currentTab === 'special' ? activeTabStyle : tabStyle}
        >
          <FaStar style={{ marginRight: '4px' }} />
          Special
        </button>
        <button
          onClick={() => setCurrentTab('face')}
          style={currentTab === 'face' ? activeTabStyle : tabStyle}
        >
          <FaCat style={{ marginRight: '4px' }} />
          Face Track
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
                  <li>ParamBreath (Breathing)</li>
                  <li>Physics: Hair, clothes, tail, accessories</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {currentTab === 'special' && (
          <motion.div
            key="special"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              maxHeight: '240px',
              overflowY: 'auto',
            }}>
              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaGlasses /> Glasses: {specialParams.glasses}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.glasses}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, glasses: value }));
                    modelRef.current?.setParameterValue('Param11', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>
              
              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaTshirt /> Outfit: {specialParams.outfit}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.outfit}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, outfit: value }));
                    modelRef.current?.setParameterValue('Param16', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  ❓ Question: {specialParams.question}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.question}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, question: value }));
                    modelRef.current?.setParameterValue('Param43', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  💦 Sweat: {specialParams.sweat}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.sweat}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, sweat: value }));
                    modelRef.current?.setParameterValue('Param44', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  😊 Grin: {specialParams.grin}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.grin}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, grin: value }));
                    modelRef.current?.setParameterValue('Param54', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  ⭐ Star Eyes: {specialParams.starEyes}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.starEyes}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, starEyes: value }));
                    modelRef.current?.setParameterValue('Param55', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  😵 Dizzy: {specialParams.dizzy}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.dizzy}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, dizzy: value }));
                    modelRef.current?.setParameterValue('Param56', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  😠 Angry: {specialParams.angry}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.angry}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, angry: value }));
                    modelRef.current?.setParameterValue('Param57', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaHeart /> Blush: {specialParams.blush}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.blush}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, blush: value }));
                    modelRef.current?.setParameterValue('Param58', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  😭 Cry: {specialParams.cry}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.cry}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, cry: value }));
                    modelRef.current?.setParameterValue('Param59', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaPalette /> Eye Color R: {specialParams.eyeColorR}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.eyeColorR}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, eyeColorR: value }));
                    modelRef.current?.setParameterValue('Param62', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaPalette /> Eye Color G: {specialParams.eyeColorG}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={specialParams.eyeColorG}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSpecialParams(prev => ({ ...prev, eyeColorG: value }));
                    modelRef.current?.setParameterValue('Param63', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {currentTab === 'face' && (
          <motion.div
            key="face"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              maxHeight: '240px',
              overflowY: 'auto',
            }}>
              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  👅 Tongue: {faceParams.tongue}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.tongue}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, tongue: value }));
                    modelRef.current?.setParameterValue('Param46', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Mouth X: {faceParams.mouthX}%
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={faceParams.mouthX}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, mouthX: value }));
                    modelRef.current?.setParameterValue('Param20', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Cheek Puff: {faceParams.cheekPuff}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.cheekPuff}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, cheekPuff: value }));
                    modelRef.current?.setParameterValue('Param21', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Mouth Shrug: {faceParams.mouthShrug}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.mouthShrug}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, mouthShrug: value }));
                    modelRef.current?.setParameterValue('Param48', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Mouth Funnel: {faceParams.mouthFunnel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.mouthFunnel}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, mouthFunnel: value }));
                    modelRef.current?.setParameterValue('Param45', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Mouth Press: {faceParams.mouthPress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.mouthPress}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, mouthPress: value }));
                    modelRef.current?.setParameterValue('Param47', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Mouth Widen: {faceParams.mouthWiden}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.mouthWiden}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, mouthWiden: value }));
                    modelRef.current?.setParameterValue('Param49', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Jaw Open: {faceParams.jawOpen}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.jawOpen}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, jawOpen: value }));
                    modelRef.current?.setParameterValue('Param50', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Eye Squint 1: {faceParams.eyeSquint}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.eyeSquint}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, eyeSquint: value }));
                    modelRef.current?.setParameterValue('Param51', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                  Eye Squint 2: {faceParams.eyeSquint2}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceParams.eyeSquint2}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFaceParams(prev => ({ ...prev, eyeSquint2: value }));
                    modelRef.current?.setParameterValue('Param52', value / 100);
                  }}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};