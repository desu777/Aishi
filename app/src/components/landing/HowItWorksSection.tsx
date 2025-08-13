'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { steps } from './landingData';
import { useState, useEffect } from 'react';

export default function HowItWorksSection() {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <section style={{
      padding: isMobile ? '60px 16px' : '100px 20px',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Blur background overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(24, 24, 31, 0.3)',
        backdropFilter: 'blur(10px)',
        zIndex: -1
      }} />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: isSmallMobile ? '1.75rem' : 'clamp(2rem, 4vw, 3rem)',
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
            left: isSmallMobile ? '20px' : '32px',
            top: '32px',
            bottom: '32px',
            width: '2px',
            background: theme.border
          }} />

          {/* Steps */}
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: isSmallMobile ? '16px' : '24px',
              marginBottom: '40px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: isSmallMobile ? '40px' : '64px',
                height: isSmallMobile ? '40px' : '64px',
                borderRadius: '50%',
                background: theme.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isSmallMobile ? '1rem' : '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                flexShrink: 0,
                zIndex: 1
              }}>
                {i + 1}
              </div>
              <div style={{ paddingTop: '12px' }}>
                <h3 style={{
                  fontSize: isSmallMobile ? '1.1rem' : '1.25rem',
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