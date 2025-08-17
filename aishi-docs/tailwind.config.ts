import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dynamic background colors (dark/light)
        background: {
          main: 'rgb(var(--background-main) / <alpha-value>)',
          card: 'rgb(var(--background-card) / <alpha-value>)',
          panel: 'rgb(var(--background-panel) / <alpha-value>)',
          success: '#10B981',
        },
        // Dynamic text colors (dark/light)
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)',
          accent: '#8B5CF6',
          success: '#10B981',
        },
        // Dynamic border color
        border: 'rgb(var(--border-color) / <alpha-value>)',
        // Static accent colors - Aishi Violet Theme (same for both modes)
        accent: {
          primary: '#8B5CF6',
          secondary: '#FF5CAA',
          tertiary: '#7F5AF0',
          success: '#10B981',
          error: '#EF4444',
        },
        // Dream colors (static)
        dream: {
          violet: '#8B5CF6',
          purple: '#A855F7',
          lightPurple: '#C084FC',
          pink: '#F472B6',
          cyan: '#00D2E9',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config