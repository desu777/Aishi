'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaArrowLeft } from 'react-icons/fa';
import { Live2DModel } from '@/components/live2d/Live2DModel';
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
  const [isLoading, setIsLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  // Check if test mode is enabled
  const isTestMode = process.env.NEXT_PUBLIC_LIVE2MODEL_TEST === 'true';

  // Handle window size
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight - 200 // Account for UI controls
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
      
      // Example: Play eat animation when sending message
      if (modelRef.current && isModelReady && availableMotions.includes('eat')) {
        modelRef.current.playMotion('eat');
      }
      
      setInputText('');
    }
  };

  const handleModelReady = () => {
    setIsModelReady(true);
    if (modelRef.current) {
      setAvailableMotions(modelRef.current.getAvailableMotions());
      setAvailableExpressions(modelRef.current.getAvailableExpressions());
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

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
              Meet Your Companion
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your AI companion is here to chat, play, and keep you company. 
              Interact with them and discover their unique personality!
            </p>
          </motion.div>

          {/* Live2D Model Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-4xl mx-auto mb-12"
          >
            <div className="relative bg-black/30 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-purple-500/20">
              {/* Live2D Model */}
              <div className="relative rounded-2xl overflow-hidden shadow-inner">
                <Live2DModel
                  modelPath="/pajama/pajama/bear Pajama.model3.json"
                  width={800}
                  height={600}
                  autoPlay={true}
                  className="rounded-2xl"
                  onLoad={() => {
                    setIsLoading(false);
                    console.log('Live2D model loaded successfully');
                  }}
                  onError={(error) => {
                    setModelError(error);
                    setIsLoading(false);
                    console.error('Live2D model error:', error);
                  }}
                />
              </div>

              {/* Interaction Hints */}
              {!isLoading && !modelError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-center"
                >
                  <p className="text-gray-300 text-sm">
                    💡 Tip: Click on your companion to see them react!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

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
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            display: 'flex',
            justifyContent: 'center'
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
        </div>
      </main>

      {/* Ambient glow effect */}
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}