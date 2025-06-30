import React from 'react';
import { Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// CTA Section
export const CTASection = () => {
  const { theme } = useTheme();

  return (
    <section style={{
      padding: '120px 20px',
      background: `linear-gradient(135deg, ${theme.accent.primary}15, ${theme.accent.secondary}15)`,
      borderRadius: '32px',
      margin: '0 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
          fontWeight: '700',
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Ready to Explore Your Dreams?
        </h2>

        <p style={{
          fontSize: '1.25rem',
          color: theme.text.secondary,
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Join thousands of dreamers who have unlocked the secrets of their subconscious mind. 
          Start your journey of self-discovery today.
        </p>

        <button style={{
          background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
          border: 'none',
          borderRadius: '50px',
          padding: '20px 40px',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: `0 10px 30px ${theme.accent.primary}40`
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Zap size={24} />
          Start Your Dream Journey
        </button>
      </div>
    </section>
  );
}; 