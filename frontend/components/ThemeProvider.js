import React, { createContext, useContext, useState } from 'react';

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
  const [darkMode, setDarkMode] = useState(true);

  const theme = {
    bg: {
      main: darkMode ? '#0A0A0F' : '#FAFAFA',
      card: darkMode ? 'rgba(18, 18, 28, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      panel: darkMode ? '#1A1A2E' : '#F5F5F5',
      hover: darkMode ? '#2A2A3E' : '#EEEEEE'
    },
    text: {
      primary: darkMode ? '#FFFFFF' : '#1A1A1A',
      secondary: darkMode ? '#B3B3B3' : '#666666',
      accent: darkMode ? '#8B5CF6' : '#7C3AED'
    },
    accent: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      tertiary: '#06B6D4'
    },
    border: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.2)'
  };

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 