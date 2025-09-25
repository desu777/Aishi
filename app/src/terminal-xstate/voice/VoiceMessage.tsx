/**
 * @fileoverview Voice Message Component - Messenger-like audio message UI
 * @description Component for displaying and playing voice messages with waveform visualization
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface VoiceMessageProps {
  audioUrl?: string;
  audioBlob?: Blob;
  duration: number;
  isUserMessage?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  timestamp?: number;
  sender?: string;
  status?: 'sending' | 'sent' | 'error' | 'playing';
}

// Waveform bars configuration
const WAVEFORM_BARS = 30;

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  audioUrl,
  audioBlob,
  duration,
  isUserMessage = false,
  isPlaying: externalIsPlaying,
  onPlay,
  onPause,
  timestamp,
  sender,
  status = 'sent'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();

  // Generate random waveform heights for visual effect
  const [waveformHeights] = useState(() =>
    Array.from({ length: WAVEFORM_BARS }, () =>
      Math.random() * 0.5 + 0.3 // Heights between 30% and 80%
    )
  );

  // Create audio URL from blob if needed
  useEffect(() => {
    if (audioBlob && !audioUrl && audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob, audioUrl]);

  // Handle external play state
  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  // Update time during playback
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!audioRef.current.paused) {
        animationRef.current = requestAnimationFrame(updateTime);
      }
    }
  }, []);

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setIsPlaying(false);
        onPause?.();
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        updateTime();
        onPlay?.();
      }
    } catch (err) {
      setError('Failed to play audio');
      console.error('Audio playback error:', err);
    }
  }, [isPlaying, onPlay, onPause, updateTime]);

  // Handle audio ended
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Handle audio loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setActualDuration(audioRef.current.duration);
    }
  }, []);

  // Format time display
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const progress = actualDuration > 0 ? (currentTime / actualDuration) * 100 : 0;

  // Component styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: isUserMessage
      ? 'rgba(139, 92, 246, 0.1)'
      : 'rgba(255, 255, 255, 0.05)',
    border: '1px solid',
    borderColor: isUserMessage
      ? 'rgba(139, 92, 246, 0.3)'
      : 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    maxWidth: '320px',
    marginLeft: isUserMessage ? 'auto' : '0',
    marginRight: isUserMessage ? '0' : 'auto',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    opacity: status === 'sending' ? 0.7 : 1
  };

  const playButtonStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: isUserMessage ? '#8B5CF6' : '#4B5563',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    flexShrink: 0
  };

  const waveformContainerStyle: React.CSSProperties = {
    flex: 1,
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const progressOverlayStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    backgroundColor: isUserMessage
      ? 'rgba(139, 92, 246, 0.2)'
      : 'rgba(255, 255, 255, 0.1)',
    transition: 'width 0.1s linear',
    pointerEvents: 'none' as const
  };

  const waveformBarStyle = (index: number, height: number): React.CSSProperties => ({
    width: '2px',
    height: `${height * 100}%`,
    backgroundColor: index < (progress / 100) * WAVEFORM_BARS
      ? (isUserMessage ? '#8B5CF6' : '#F0F0F0')
      : (isUserMessage ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.3)'),
    borderRadius: '1px',
    transition: 'all 0.2s ease',
    transform: isPlaying && index < (progress / 100) * WAVEFORM_BARS
      ? `scaleY(${1 + Math.sin(Date.now() / 100 + index) * 0.2})`
      : 'scaleY(1)'
  });

  const timeStyle: React.CSSProperties = {
    fontSize: '12px',
    color: isUserMessage ? '#8B5CF6' : '#8A8A8A',
    fontFamily: 'monospace',
    minWidth: '45px',
    textAlign: 'right' as const
  };

  const senderStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: '-18px',
    left: isUserMessage ? 'auto' : '0',
    right: isUserMessage ? '0' : 'auto',
    fontSize: '11px',
    color: '#8A8A8A',
    fontFamily: 'monospace'
  };

  return (
    <div style={containerStyle} onClick={togglePlay}>
      {sender && (
        <span style={senderStyle}>{sender}</span>
      )}

      <button
        style={playButtonStyle}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div style={waveformContainerStyle}>
        <div style={progressOverlayStyle} />
        {waveformHeights.map((height, index) => (
          <div
            key={index}
            style={waveformBarStyle(index, height)}
          />
        ))}
      </div>

      <span style={timeStyle}>
        {formatTime(isPlaying ? currentTime : actualDuration)}
      </span>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        preload="metadata"
      />

      {/* Status indicator */}
      {status === 'sending' && (
        <div style={{
          position: 'absolute' as const,
          bottom: '-4px',
          right: '4px',
          fontSize: '10px',
          color: '#8A8A8A'
        }}>
          Sending...
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute' as const,
          bottom: '-18px',
          left: '0',
          fontSize: '11px',
          color: '#EF4444'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};