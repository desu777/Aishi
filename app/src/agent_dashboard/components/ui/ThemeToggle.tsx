'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, onToggle }) => {
  const { theme } = useTheme();

  return (
    <button
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.bg.card,
        color: theme.text.primary,
        cursor: 'pointer',
        fontSize: 'clamp(12px, 2.5vw, 14px)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.accent.primary;
        e.currentTarget.style.backgroundColor = theme.bg.panel;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border;
        e.currentTarget.style.backgroundColor = theme.bg.card;
      }}
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeToggle;