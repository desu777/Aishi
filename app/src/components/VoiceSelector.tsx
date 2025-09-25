/**
 * @fileoverview Voice Selector Component
 * @description Dropdown for selecting voice profiles with test functionality
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Volume2, Check, Mic, User, Bot, Zap, Play, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { breakpoints } from '../utils/responsive';
import { VoiceProfile } from '../hooks/useVoiceDiscovery';

interface VoiceSelectorProps {
  voices: VoiceProfile[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  onTestVoice?: (voiceId: string) => Promise<any>;
  isLoading?: boolean;
  isTesting?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onVoiceChange,
  onTestVoice,
  isLoading = false,
  isTesting = false
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoints.sm);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentVoice = voices.find(v => v.id === selectedVoice) || voices[0];

  const getVoiceIcon = (voiceId: string) => {
    switch (voiceId) {
      case 'aria': return <User size={16} />;
      case 'nova': return <Mic size={16} />;
      case 'atlas': return <Bot size={16} />;
      case 'echo': return <Zap size={16} />;
      default: return <Volume2 size={16} />;
    }
  };

  const getVoiceColor = (gender: string) => {
    switch (gender) {
      case 'female': return '#EC4899'; // Pink
      case 'male': return '#3B82F6'; // Blue
      case 'neutral': return '#8B5CF6'; // Purple
      default: return theme.accent.primary;
    }
  };

  const handleTestVoice = async (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation(); // Prevent dropdown from closing
    if (onTestVoice && !testingVoiceId) {
      setTestingVoiceId(voiceId);
      try {
        await onTestVoice(voiceId);
      } finally {
        setTestingVoiceId(null);
      }
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || isTesting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          backgroundColor: isOpen ? theme.bg.panel : theme.bg.card,
          color: theme.text.primary,
          cursor: isLoading || isTesting ? 'wait' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          minWidth: '200px',
          justifyContent: 'space-between',
          opacity: isLoading || isTesting ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading && !isTesting) {
            e.currentTarget.style.borderColor = theme.accent.primary;
            e.currentTarget.style.backgroundColor = theme.bg.panel;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.border;
          e.currentTarget.style.backgroundColor = isOpen ? theme.bg.panel : theme.bg.card;
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={16} style={{ color: getVoiceColor(currentVoice?.gender || 'neutral') }} />
          <span>{currentVoice?.name || 'Select Voice'}</span>
        </div>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.bg.card,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: isMobile ? '300px' : '400px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {/* Voice profiles */}
          {voices.map((voice) => (
            <div
              key={voice.id}
              style={{
                padding: '12px',
                borderBottom: `1px solid ${theme.border}`,
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                <button
                  onClick={() => {
                    onVoiceChange(voice.id);
                    setIsOpen(false);
                  }}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: theme.text.primary
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getVoiceIcon(voice.id)}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          fontSize: '14px',
                          color: selectedVoice === voice.id ? theme.accent.primary : theme.text.primary
                        }}>
                          {voice.name}
                        </span>
                        {selectedVoice === voice.id && (
                          <Check size={14} style={{ color: theme.accent.primary }} />
                        )}
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: getVoiceColor(voice.gender),
                          color: '#fff',
                          fontWeight: '500'
                        }}>
                          {voice.gender}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: theme.text.secondary,
                        margin: '0 0 4px 0'
                      }}>
                        {voice.description}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: theme.text.tertiary,
                        margin: 0,
                        fontStyle: 'italic'
                      }}>
                        {voice.personality}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Test Voice Button */}
                {onTestVoice && (
                  <button
                    onClick={(e) => handleTestVoice(e, voice.id)}
                    disabled={testingVoiceId !== null}
                    style={{
                      padding: '6px 12px',
                      marginLeft: '12px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg.secondary,
                      color: theme.text.primary,
                      cursor: testingVoiceId !== null ? 'wait' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      opacity: testingVoiceId !== null && testingVoiceId !== voice.id ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (testingVoiceId === null) {
                        e.currentTarget.style.backgroundColor = theme.bg.hover;
                        e.currentTarget.style.borderColor = theme.accent.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bg.secondary;
                      e.currentTarget.style.borderColor = theme.border;
                    }}
                  >
                    {testingVoiceId === voice.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        <span>Test</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Emotional range tags */}
              {!isMobile && voice.emotionalRange && voice.emotionalRange.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap',
                  marginTop: '8px',
                  marginLeft: '28px'
                }}>
                  {voice.emotionalRange.map((emotion) => (
                    <span
                      key={emotion}
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: theme.bg.secondary,
                        color: theme.text.secondary,
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;