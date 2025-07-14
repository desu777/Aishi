import React, { createContext, useContext } from 'react';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const theme = {
    bg: {
      main: '#0A0A0F',
      card: 'rgba(18, 18, 28, 0.8)',
      panel: '#1A1A2E',
      hover: '#2A2A3E'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      accent: '#8B5CF6'
    },
    accent: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      tertiary: '#06B6D4'
    },
    border: 'rgba(139, 92, 246, 0.2)'
  };

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 