import React, { useRef, useEffect } from 'react';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
  onClear: () => void;
  disabled?: boolean;
  darkMode?: boolean;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  value,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  onClear,
  disabled = false,
  darkMode = true
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(8px, 3vw, 16px)',
        paddingTop: 0,
        fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        fontSize: 'clamp(15px, 4vw, 18px)'
      }}
    >
      <span 
        style={{ 
          color: '#8B5CF6', 
          marginRight: '8px',
          flexShrink: 0
        }}
      >
        $
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Processing...' : 'Type a command...'}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: darkMode ? '#e0e0e0' : '#333333',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          flex: 1,
          caretColor: '#8B5CF6',
          opacity: disabled ? 0.5 : 1
        }}
      />
    </div>
  );
};