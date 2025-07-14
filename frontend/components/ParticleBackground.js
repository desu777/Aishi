import React from 'react';
import { useTheme } from './ThemeProvider';

// Moon Background Component with Blur and Overlay
export const ParticleBackground = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      {/* Moon Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/moon.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(3px)',
        transform: 'scale(1.1)', // Zapobiega białym krawędziom przy blur
        zIndex: 1
      }} />
      
      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(
          135deg, 
          rgba(10, 10, 15, 0.85) 0%, 
          rgba(18, 18, 28, 0.8) 50%, 
          rgba(26, 26, 46, 0.75) 100%
        )`,
        zIndex: 2
      }} />
      
      {/* Gradient Overlay with Accent Colors */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 50%, ${theme.accent.primary}15 0%, transparent 50%), 
          radial-gradient(circle at 80% 20%, ${theme.accent.secondary}15 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, ${theme.accent.tertiary}10 0%, transparent 50%)
        `,
        zIndex: 3
      }} />
      

      

    </div>
  );
}; 