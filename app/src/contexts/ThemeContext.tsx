'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeContextType, ThemeColors } from '../types';

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mounted, setMounted] = useState(false);
  
  // Debug helper
  const debugLog = (message: string, data: any = null) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[💜 AISHI] ${message}`, data || '');
    }
  };

  useEffect(() => {
    setMounted(true);
    debugLog('ThemeProvider initialized');
  }, []);

  // Aishi Theme - violet accents for inner AI companion
  const theme: ThemeColors = {
    // Bazowe tła (z /client)
    bg: {
      main: '#0A0A0A',      // Główne tło - czarny
      card: '#121218',      // Sidebar - dark gray
      panel: '#18181F',     // Panele - darker gray
      success: '#10B981',   // Success background - green
    },
    
    // Teksty (z /client)
    text: {
      primary: '#E6E6E6',   // Główny tekst - light gray
      secondary: '#9999A5', // Drugorzędny tekst - medium gray
      tertiary: '#6B7280',  // Tertiary text - darker gray
      accent: '#8B5CF6',    // Accent text - violet
      success: '#10B981',   // Success text - green
    },
    
    // Obramowania (z /client)
    border: '#232330',      // Ciemne obramowania
    
    // Akcenty - Aishi Violet Theme
    accent: {
      primary: '#8B5CF6',   // Violet - główny akcent
      secondary: '#FF5CAA', // Pink - zachowujemy z /client
      tertiary: '#7F5AF0',  // Purple - zachowujemy z /client
      success: '#10B981',   // Success accent - green
    },
    
    // Dodatkowe kolory dla Aishi
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
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 