import React from 'react';
import { Play } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Hero Section
export const HeroSection = () => {
  const { theme } = useTheme();
  
  return (
    <section id="home" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px 0',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        <div style={{
          marginBottom: '24px',
          animation: 'fadeInUp 1s ease-out'
        }}>
          <span style={{
            background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            padding: '8px 20px',
            borderRadius: '25px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            AI-Powered Dream Analysis
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: '800',
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.1',
          animation: 'fadeInUp 1s ease-out 0.2s both'
        }}>
          Unlock the Secrets of Your Dreams
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: theme.text.secondary,
          marginBottom: '40px',
          lineHeight: '1.6',
          animation: 'fadeInUp 1s ease-out 0.4s both'
        }}>
          Advanced AI agents analyze your dreams to provide deep insights into your subconscious mind. 
          Transform your sleep into a journey of self-discovery with our revolutionary iNFT technology.
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease-out 0.6s both'
        }}>
          <button style={{
            background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            border: 'none',
            borderRadius: '50px',
            padding: '16px 32px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 8px 25px ${theme.accent.primary}40`
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Play size={20} />
            Start Dream Analysis
          </button>

          <button style={{
            background: 'transparent',
            border: `2px solid ${theme.accent.primary}`,
            borderRadius: '50px',
            padding: '16px 32px',
            color: theme.accent.primary,
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = theme.accent.primary;
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = theme.accent.primary;
          }}
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '60px',
          marginTop: '80px',
          flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease-out 0.8s both'
        }}>
          {[
            { number: '10K+', label: 'Dreams Analyzed' },
            { number: '95%', label: 'Accuracy Rate' },
            { number: '24/7', label: 'AI Availability' }
          ].map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: theme.accent.primary,
                marginBottom: '8px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 