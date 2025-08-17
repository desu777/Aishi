/**
 * @fileoverview Theme toggle component for switching between dark and light modes
 * @description Renders a button with sun/moon icons to toggle theme with smooth animations
 */

'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-lg
        text-text-secondary hover:text-text-primary
        bg-background-card hover:bg-background-panel
        border border-border
        transition-all duration-200 ease-in-out
        transform hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50
      "
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for light mode */}
        <FiSun 
          size={20}
          className={`
            absolute inset-0 transition-all duration-300 ease-in-out
            ${theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        />
        
        {/* Moon icon for dark mode */}
        <FiMoon 
          size={20}
          className={`
            absolute inset-0 transition-all duration-300 ease-in-out
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
          `}
        />
      </div>
    </button>
  )
}