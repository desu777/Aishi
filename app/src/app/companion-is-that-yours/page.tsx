'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaArrowLeft } from 'react-icons/fa';

export default function CompanionPage() {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
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
      setInputText('');
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

      {/* Main Content Area - Empty for now (for Live2D) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          color: 'rgba(255, 255, 255, 0.2)',
          fontSize: '24px',
          fontFamily: "'JetBrains Mono', monospace",
          textAlign: 'center'
        }}>
          {/* Placeholder for Live2D Model */}
          <div style={{ marginBottom: '20px' }}>Neural Interface Active</div>
          <div style={{ fontSize: '16px', opacity: 0.5 }}>Model Loading...</div>
        </div>
      </div>

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