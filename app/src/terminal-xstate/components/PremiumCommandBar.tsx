import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { parseCommand, suggestCommands, AVAILABLE_COMMANDS, CommandType } from '../services/commandParser';
import MicrophoneButton from './MicrophoneButton';
import VoiceInputMessage from './VoiceInputMessage';
import { Send } from 'lucide-react';

interface PremiumCommandBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
  onClear: () => void;
  disabled?: boolean;
  placeholder?: string;
  promptSymbol?: string;
  isChatActive?: boolean;
  isDreamActive?: boolean;
  onEndSession?: () => void;
  onVoiceInput?: (audioBase64: string, audioBlob: Blob) => void;
  isVoiceEnabled?: boolean;
}

const colors = {
  pearl: '#F0F0F0',
  silver: '#8A8A8A',
  accent: '#8B5CF6',
  accentMuted: 'rgba(139, 92, 246, 0.1)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)'
};

const PremiumCommandBarComponent: React.FC<PremiumCommandBarProps> = ({
  value,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  onClear,
  disabled = false,
  placeholder = 'Enter command',
  promptSymbol = '>',
  isChatActive = false,
  isDreamActive = false,
  onEndSession,
  onVoiceInput,
  isVoiceEnabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [voiceInputBlob, setVoiceInputBlob] = useState<Blob | null>(null);
  const [voiceInputBase64, setVoiceInputBase64] = useState<string | null>(null);
  const [voiceInputUrl, setVoiceInputUrl] = useState<string | null>(null);
  
  // Check if current command is valid
  const isValidCommand = useMemo(() => {
    if (!value.trim()) return false;
    const parsed = parseCommand(value);
    return parsed.isValid;
  }, [value]);
  
  // Get suggestions for current input
  const suggestions = useMemo(() => {
    if (!value.trim() || value.includes(' ')) return [];
    return suggestCommands(value);
  }, [value]);

  // Show microphone button only when dream/chat workflow is active
  const showMicrophone = isVoiceEnabled && (
    isDreamActive ||
    isChatActive
  );

  // Handle voice recording completion
  const handleVoiceRecordingComplete = useCallback((audioBase64: string, audioBlob: Blob) => {
    if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
      console.log('[PremiumCommandBar] Voice recording completed', {
        audioBlobSize: audioBlob.size,
        base64Length: audioBase64.length,
        isDreamActive,
        isChatActive
      });
    }

    // Store both blob and base64
    setVoiceInputBlob(audioBlob);
    setVoiceInputBase64(audioBase64);

    // Create and store blob URL once
    try {
      const url = URL.createObjectURL(audioBlob);
      setVoiceInputUrl(url);
      console.log('[PremiumCommandBar] Created blob URL:', url);
    } catch (error) {
      console.error('[PremiumCommandBar] Failed to create blob URL:', error);
    }

    // Clear text input when voice is recorded
    onChange('');
  }, [onChange, isDreamActive, isChatActive]);

  // Handle voice input deletion
  const handleDeleteVoiceInput = useCallback(() => {
    if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
      console.log('[PremiumCommandBar] Voice input deleted');
    }

    // Cleanup blob URL if exists
    if (voiceInputUrl) {
      URL.revokeObjectURL(voiceInputUrl);
    }

    setVoiceInputBlob(null);
    setVoiceInputBase64(null);
    setVoiceInputUrl(null);
  }, [voiceInputUrl]);

  // Submit voice input
  const submitVoiceInput = useCallback(() => {
    if (voiceInputBase64 && voiceInputBlob && onVoiceInput) {
      if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
        console.log('[PremiumCommandBar] Submitting voice input', {
          blobSize: voiceInputBlob.size,
          base64Length: voiceInputBase64.length
        });
      }
      onVoiceInput(voiceInputBase64, voiceInputBlob);

      // Cleanup blob URL if exists
      if (voiceInputUrl) {
        URL.revokeObjectURL(voiceInputUrl);
      }

      // Clear voice input after submission
      setVoiceInputBlob(null);
      setVoiceInputBase64(null);
      setVoiceInputUrl(null);
    }
  }, [voiceInputBase64, voiceInputBlob, onVoiceInput, voiceInputUrl]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep focus when disabled state changes
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (voiceInputUrl) {
        URL.revokeObjectURL(voiceInputUrl);
      }
    };
  }, [voiceInputUrl]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle suggestions navigation
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => Math.max(0, prev - 1));
          return;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
          return;
        case 'Tab':
        case 'Enter':
          if (e.key === 'Tab' || (e.key === 'Enter' && suggestions.length === 1)) {
            e.preventDefault();
            onChange(suggestions[selectedSuggestion]);
            setShowSuggestions(false);
            return;
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          return;
      }
    }
    
    // Regular command handling
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (voiceInputBlob) {
          // Submit voice input
          submitVoiceInput();
        } else if (value.toLowerCase() === 'clear') {
          onClear();
          onChange('');
        } else {
          onSubmit();
        }
        setShowSuggestions(false);
        break;
      case 'ArrowUp':
        e.preventDefault();
        onHistoryUp();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onHistoryDown();
        break;
      case 'Escape':
        e.preventDefault();
        onChange('');
        setShowSuggestions(false);
        break;
    }
  };
  
  // Show/hide suggestions based on input
  useEffect(() => {
    if (suggestions.length > 0 && value && !value.includes(' ')) {
      setShowSuggestions(true);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, value]);

  const commandBarStyle: React.CSSProperties = {
    borderTop: `1px solid ${colors.borderSubtle}`,
    padding: '1.5rem 2rem',
    background: 'rgba(26, 26, 26, 0.5)',
    transition: 'all 0.2s ease'
  };

  const commandInputStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const commandPromptStyle: React.CSSProperties = {
    color: colors.silver,
    fontSize: '14px',
    fontWeight: 400,
    opacity: 0.5
  };

  const commandFieldStyle: React.CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: isValidCommand ? colors.accent : colors.pearl,
    fontFamily: 'Inter, -apple-system, "SF Pro Display", system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: isValidCommand ? 400 : 300,
    letterSpacing: '0.02em',
    caretColor: colors.accent,
    transition: 'color 0.2s ease, font-weight 0.2s ease'
  };
  
  const suggestionsStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: '2rem',
    right: '2rem',
    marginBottom: '0.5rem',
    background: 'rgba(26, 26, 26, 0.95)',
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '8px',
    overflow: 'hidden',
    zIndex: 10
  };
  
  const suggestionItemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    color: isSelected ? colors.accent : colors.silver,
    background: isSelected ? colors.accentMuted : 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'Inter, -apple-system, "SF Pro Display", system-ui, sans-serif',
    transition: 'all 0.1s ease'
  });

  return (
    <div 
      style={{ ...commandBarStyle, position: 'relative' }}
      onFocus={() => {
        // Add focus effect
        const bar = inputRef.current?.parentElement?.parentElement;
        if (bar) {
          bar.style.background = 'rgba(26, 26, 26, 0.6)';
          bar.style.borderTopColor = colors.accentMuted;
        }
      }}
      onBlur={() => {
        // Remove focus effect
        const bar = inputRef.current?.parentElement?.parentElement;
        if (bar) {
          bar.style.background = 'rgba(26, 26, 26, 0.5)';
          bar.style.borderTopColor = colors.borderSubtle;
        }
      }}
    >
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={suggestionsStyle}>
          {suggestions.map((cmd, index) => (
            <div
              key={cmd}
              style={suggestionItemStyle(index === selectedSuggestion)}
              onMouseEnter={() => setSelectedSuggestion(index)}
              onClick={() => {
                onChange(cmd);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              <span style={{ color: colors.accent }}>{cmd}</span>
              <span style={{ marginLeft: '1rem', opacity: 0.7 }}>
                {AVAILABLE_COMMANDS[cmd as CommandType]}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div style={commandInputStyle}>
        <span style={commandPromptStyle}>{promptSymbol}</span>

        {/* Show VoiceInputMessage or text input */}
        {voiceInputBlob ? (
          <>
            {process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' &&
              console.log('[PremiumCommandBar] Rendering VoiceInputMessage', {
                hasBlob: !!voiceInputBlob,
                hasBase64: !!voiceInputBase64
              })
            }
            <VoiceInputMessage
              audioBlob={voiceInputBlob}
              audioBase64={voiceInputBase64}
              onDelete={handleDeleteVoiceInput}
            />
          </>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Processing...' : placeholder}
            style={commandFieldStyle}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        )}

        {/* Microphone button for voice input */}
        {showMicrophone && !voiceInputBlob && (
          <MicrophoneButton
            onRecordingComplete={handleVoiceRecordingComplete}
            isDisabled={disabled}
            maxDuration={300}
          />
        )}

        {/* Submit button for dream/chat input */}
        {(showMicrophone || voiceInputBlob) && (
          <button
            onClick={() => {
              if (voiceInputBlob) {
                submitVoiceInput();
              } else {
                onSubmit();
              }
            }}
            disabled={disabled}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: colors.accent,
              border: 'none',
              color: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginLeft: '8px',
              opacity: disabled ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = colors.accent;
            }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        )}

        {/* End Session button for active chat */}
        {isChatActive && onEndSession && (
          <button
            onClick={onEndSession}
            style={{
              marginLeft: 'auto',
              padding: '0.5rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '4px',
              color: '#EF4444',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, -apple-system, "SF Pro Display", system-ui, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            End Session
          </button>
        )}
      </div>
      <style jsx>{`
        input::placeholder {
          color: ${colors.silver};
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export const PremiumCommandBar = React.memo(PremiumCommandBarComponent);