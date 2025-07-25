'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaArrowLeft } from 'react-icons/fa';
import { Live2DModel, Live2DModelRef } from '@/components/live2d/Live2DModel';
import { Live2DTestControls } from '@/components/live2d/Live2DTestControls';

export default function CompanionPage() {
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
    
    // Example: Play different animations based on session state
    if (modelRef.current && isModelReady) {
      if (!isSessionActive) {
        // Starting session
        if (availableMotions.includes('bear cry')) {
          modelRef.current.playMotion('bear cry');
        }
      } else {
        // Stopping session
        if (availableMotions.includes('sleep')) {
          modelRef.current.playMotion('sleep');
        }
      }
    }
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
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
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

      {/* Main Content Area - Live2D Model */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <Live2DModel
          ref={modelRef}
          modelPath="/pajama/pajama/bear Pajama.model3.json"
          width={windowSize.width}
          height={windowSize.height}
          onReady={handleModelReady}
          className="max-w-full max-h-full"
        />
      </div>

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