import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background colors from app
        background: {
          main: '#0A0A0A',
          card: '#121218',
          panel: '#18181F',
          success: '#10B981',
        },
        // Text colors from app
        text: {
          primary: '#E6E6E6',
          secondary: '#9999A5',
          tertiary: '#6B7280',
          accent: '#8B5CF6',
          success: '#10B981',
        },
        // Border color
        border: '#232330',
        // Accent colors - Aishi Violet Theme
        accent: {
          primary: '#8B5CF6',
          secondary: '#FF5CAA',
          tertiary: '#7F5AF0',
          success: '#10B981',
          error: '#EF4444',
        },
        // Dream colors
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