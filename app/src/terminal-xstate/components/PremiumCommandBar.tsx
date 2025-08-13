import React, { useRef, useEffect } from 'react';

interface PremiumCommandBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
  onClear: () => void;
  disabled?: boolean;
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
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

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
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (value.toLowerCase() === 'clear') {
          onClear();
          onChange('');
        } else {
          onSubmit();
        }
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
        break;
    }
  };

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
    color: colors.pearl,
    fontFamily: 'Inter, -apple-system, "SF Pro Display", system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: 300,
    letterSpacing: '0.02em',
    caretColor: colors.accent
  };

  return (
    <div 
      style={commandBarStyle}
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
      <div style={commandInputStyle}>
        <span style={commandPromptStyle}>{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Processing...' : 'Enter command'}
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