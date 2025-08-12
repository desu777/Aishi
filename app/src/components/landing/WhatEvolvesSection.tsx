'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { traits } from './landingData';

export default function WhatEvolvesSection() {
  const { theme } = useTheme();

  return (
    <section style={{
      padding: '100px 20px',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            <span style={{
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              What Evolves
            </span>
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: theme.text.secondary
          }}>
            Watch your Aishi grow and adapt
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          {traits.map((trait, i) => (
            <div key={trait} style={{
              padding: '24px',
              background: theme.bg.card,
              borderRadius: '16px',
              border: `1px solid ${theme.border}`,
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: theme.text.primary
              }}>
                {trait}
              </h3>
              <div style={{
                height: '4px',
                background: theme.border,
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: theme.gradients.primary,
                  borderRadius: '2px',
                  width: `${60 + Math.random() * 40}%`,
                  animation: `slideIn 1s ease-out ${0.1 * i}s both`
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* CSS Animation for progress bars */}
        <style jsx>{`
          @keyframes slideIn {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }
        `}</style>
      </div>
    </section>
  );
}