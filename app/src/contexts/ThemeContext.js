'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  // Debug helper
  const debugLog = (message, data = null) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[🔮 DREAMSCAPE] ${message}`, data || '');
    }
  };

  useEffect(() => {
    setMounted(true);
    debugLog('ThemeProvider initialized');
  }, []);

  // Dreamscape Theme - bazowe kolory z /client + violet accents
  const theme = {
    // Bazowe tła (z /client)
    bg: {
      main: '#0A0A0A',      // Główne tło - czarny
      card: '#121218',      // Sidebar - dark gray
      panel: '#18181F',     // Panele - darker gray
    },
    
    // Teksty (z /client)
    text: {
      primary: '#E6E6E6',   // Główny tekst - light gray
      secondary: '#9999A5', // Drugorzędny tekst - medium gray
      accent: '#8B5CF6'     // Accent text - violet
    },
    
    // Obramowania (z /client)
    border: '#232330',      // Ciemne obramowania
    
    // Akcenty - Dreamscape Violet Theme
    accent: {
      primary: '#8B5CF6',   // Violet - główny akcent
      secondary: '#FF5CAA', // Pink - zachowujemy z /client
      tertiary: '#7F5AF0',  // Purple - zachowujemy z /client
    },
    
    // Dodatkowe kolory dla Dreamscape
    dream: {
      violet: '#8B5CF6',
      purple: '#A855F7', 
      lightPurple: '#C084FC',
      pink: '#F472B6',
      cyan: '#00D2E9',      // Backup z /client
    },
    
    // Gradient effects
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
      secondary: 'linear-gradient(135deg, #A855F7, #C084FC)',
      rainbow: 'linear-gradient(90deg, #8B5CF6, #FF5CAA, #7F5AF0)',
      dream: 'linear-gradient(135deg, #8B5CF6, #FF5CAA)',
    }
  };

  // Debug theme na start
  useEffect(() => {
    if (mounted) {
      debugLog('Theme loaded:', theme);
    }
  }, [mounted]);

  // Jeśli nie mounted, nie renderuj niczego (prevent hydration issues)
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, debugLog }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 