'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaArrowLeft } from 'react-icons/fa';
import { Live2DModel } from '@/components/live2d/Live2DModel';
import { Live2DTestControls } from '@/components/live2d/Live2DTestControls';
import type { Live2DModelRef } from '@/components/live2d/utils/live2d-types';
import { motion } from 'framer-motion';

export default function CompanionIsYours() {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isModelReady, setIsModelReady] = useState(false);
  const [availableMotions, setAvailableMotions] = useState<string[]>([]);
  const [availableExpressions, setAvailableExpressions] = useState<string[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const inputRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<Live2DModelRef>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  // Check if test mode is enabled
  const isTestMode = process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true';

  // Handle window size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial size
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Focus input
    inputRef.current?.focus();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMic = () => {
    setIsMicActive(!isMicActive);
  };

  const toggleSession = () => {
         setIsSessionActive(!isSessionActive);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // TODO: Implement message sending
      console.log('Sending message:', inputText);
      
      // Example: Play animation when sending message
      if (modelRef.current && isModelReady) {
        // Play a random expression when sending message
        const expressions = modelRef.current.getAvailableExpressions();
        if (expressions.length > 0) {
          const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
          modelRef.current.setExpression(randomExpression);
        }
      }
      
      setInputText('');
    }
  };

  const handleModelLoad = () => {
    setIsModelReady(true);
    setIsLoading(false);
    if (modelRef.current) {
      setAvailableMotions(modelRef.current.getAvailableMotions());
      setAvailableExpressions(modelRef.current.getAvailableExpressions());
      console.log('Available motions:', modelRef.current.getAvailableMotions());
      console.log('Available expressions:', modelRef.current.getAvailableExpressions());
    }
  };

  const handleModelError = (error: string) => {
    setModelError(error);
    setIsLoading(false);
    console.error('Live2D model error:', error);
  };

  const handleModelHit = (hitAreaNames: string[]) => {
    console.log('Hit areas:', hitAreaNames);
    // Play random motion when model is clicked
    if (modelRef.current && availableMotions.length > 0) {
      const randomMotion = availableMotions[Math.floor(Math.random() * availableMotions.length)];
      modelRef.current.playMotion(randomMotion);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Back Button */}
      <button
        onClick={() => router.push('/agent-dashboard')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100,
          padding: '12px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontFamily: "'JetBrains Mono', monospace",
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <FaArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Main Content - Full Screen Live2D */}
      <main className="fixed inset-0 w-full h-full">
        {/* Live2D Model - Full Screen */}
        <Live2DModel
          ref={modelRef}
          modelPath="/水母_vts/水母.model3.json"
          width={windowSize.width}
          height={windowSize.height}
          scale={0.18}
          transparent={true}
          autoPlay={true}
          className="w-full h-full"
          onLoad={handleModelLoad}
          onError={handleModelError}
          onHit={handleModelHit}
        />

        {/* Test Controls - Only visible when NEXT_PUBLIC_LIVE2MODEL_TEST=true */}
        {isTestMode && isModelReady && (
          <Live2DTestControls
            modelRef={modelRef}
            availableMotions={availableMotions}
            availableExpressions={availableExpressions}
          />
        )}

        {/* Bottom UI Controls */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              maxWidth: '600px',
              width: '100%'
            }}>
              {/* Microphone Button */}
              <button
                onClick={toggleMic}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: isMicActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${isMicActive ? '#8B5CF6' : 'rgba(255, 255, 255, 0.2)'}`,
                  color: isMicActive ? '#8B5CF6' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (!isMicActive) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMicActive) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                {isMicActive ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              />

              {/* Start/Stop Button */}
              <button
                onClick={toggleSession}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: isSessionActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  border: `2px solid ${isSessionActive ? '#EF4444' : '#22C55E'}`,
                  color: isSessionActive ? '#EF4444' : '#22C55E',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSessionActive ? <FaStop size={18} /> : <FaPlay size={18} />}
              </button>
          </div>
        </div>
      </main>
    </div>
  );
}