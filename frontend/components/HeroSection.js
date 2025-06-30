import React from 'react';
import { Play } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Orb from './Orb';

// Hero Section
export const HeroSection = () => {
  const { theme } = useTheme();
  
  return (
    <section id="home" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(60px, 12vw, 80px) clamp(15px, 4vw, 20px) 0',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        {/* Orb with Dreamscape text */}
        <div style={{ 
          width: '100%', 
          height: 'clamp(150px, 25vw, 280px)', 
          position: 'relative',
                      marginBottom: 'clamp(10px, 3vw, 20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Orb
            hoverIntensity={0.5}
            rotateOnHover={true}
            hue={280}
            forceHoverState={false}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(1.1rem, 3vw, 1.8rem)',
            fontFamily: '"Rajdhani ", "Work Sans", sans-serif',
            fontWeight: '800',
            color: '#FFFFFF',
            zIndex: 10,
            pointerEvents: 'none',
            letterSpacing: '1.5px',
            whiteSpace: 'nowrap',
            maxWidth: '80%',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(139, 92, 246, 0.6)'
          }}>
            Dreamscape.
          </div>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
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
          fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
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
            fontSize: 'clamp(14px, 2vw, 16px)',
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
            fontSize: 'clamp(14px, 2vw, 16px)',
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
          gap: 'clamp(30px, 8vw, 60px)',
          marginTop: 'clamp(40px, 10vw, 80px)',
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
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: '700',
                color: theme.accent.primary,
                marginBottom: '8px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: 'clamp(12px, 2vw, 14px)',
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