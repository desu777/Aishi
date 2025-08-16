import React, { useRef, useEffect, useState, useMemo } from 'react';
import { parseCommand, suggestCommands, AVAILABLE_COMMANDS, CommandType } from '../services/commandParser';

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
  promptSymbol = '>'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  
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
        if (value.toLowerCase() === 'clear') {
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