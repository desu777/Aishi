'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { steps } from './landingData';

export default function HowItWorksSection() {
  const { theme } = useTheme();

  return (
    <section style={{
      padding: '100px 20px',
      background: `linear-gradient(180deg, transparent, ${theme.bg.card}, transparent)`,
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
              How It Works
            </span>
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: theme.text.secondary
          }}>
            Your journey with Aishi in simple steps
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '32px',
            top: '32px',
            bottom: '32px',
            width: '2px',
            background: theme.border
          }} />

          {/* Steps */}
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '24px',
              marginBottom: '40px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: theme.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                flexShrink: 0,
                zIndex: 1
              }}>
                {i + 1}
              </div>
              <div style={{ paddingTop: '12px' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: theme.accent.primary
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: theme.text.secondary,
                  lineHeight: 1.6
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}