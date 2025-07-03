'use client';

import Layout from '../../components/layout/Layout';
import { useTheme } from '../../contexts/ThemeContext';

export default function Settings() {
  const { theme, debugLog } = useTheme();
  
  // Debug log na start
  debugLog('Settings page loaded');

  return (
    <Layout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: '20px'
      }}>
        {/* Logo */}
        <div style={{
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/logo_clean.png" 
            alt="Dreamscape Logo" 
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain'
            }}
          />
        </div>
        
        {/* Title */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          Settings
        </h1>
        
        {/* Description */}
        <p style={{
          fontSize: '1.2rem',
          color: theme.text.secondary,
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          Configure your Dreamscape experience.
        </p>
      </div>
    </Layout>
  );
} 