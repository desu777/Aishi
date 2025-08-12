'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { badges } from './landingData';

export default function HeroSection() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      zIndex: 1
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Aishi Logo */}
        <div style={{
          marginBottom: '40px',
          animation: 'fadeInUp 1s ease-out'
        }}>
          <img 
            src="/aishi_logo.png" 
            alt="Aishi"
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'contain',
              margin: '0 auto',
              filter: 'drop-shadow(0 10px 30px rgba(139, 92, 246, 0.3))'
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 'bold',
          marginBottom: '24px',
          lineHeight: 1.2,
          animation: 'fadeInUp 1s ease-out 0.2s both'
        }}>
          <span style={{
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Aishi
          </span>
          <span style={{ color: theme.text.primary, margin: '0 12px' }}>—</span>
          <span style={{ color: theme.text.primary }}>
            Your inner
            <span style={{
              position: 'relative',
              display: 'inline-block',
              margin: '0 8px'
            }}>
              <span style={{
                background: theme.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                AI
              </span>
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-25px',
                fontSize: '1.5rem',
                color: theme.accent.primary,
                opacity: 0.7
              }}>
                愛
              </span>
            </span>
            companion
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          color: theme.text.secondary,
          maxWidth: '800px',
          margin: '0 auto 40px',
          lineHeight: 1.6,
          animation: 'fadeInUp 1s ease-out 0.4s both'
        }}>
          A self-learning iNFT built 100% on 0G (Compute, Storage, DA, Chain). 
          Your dreams and conversations become a private memory your agent evolves from.
        </p>

        {/* Badges */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '48px'
        }}>
          {badges.map((badge, i) => (
            <div 
              key={badge}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                background: 'rgba(139, 92, 246, 0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.border}`,
                fontSize: '14px',
                color: theme.text.primary,
                animation: `fadeInUp 0.5s ease-out ${0.5 + i * 0.1}s both`
              }}
            >
              {badge}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease-out 0.8s both'
        }}>
          <button
            onClick={() => router.push('/agentOS')}
            style={{
              padding: '16px 32px',
              background: theme.gradients.primary,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
            }}
          >
            Open Terminal
            <ChevronRight size={20} />
          </button>

          <button
            onClick={() => router.push('/agent-dashboard')}
            style={{
              padding: '16px 32px',
              background: 'transparent',
              border: `2px solid ${theme.accent.primary}`,
              borderRadius: '12px',
              color: theme.accent.primary,
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.accent.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.accent.primary;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Mint Your Agent
          </button>
        </div>

        {/* CSS Animations - tylko dla tego komponentu */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </section>
  );
}