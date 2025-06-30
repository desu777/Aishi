import React from 'react';
import { Moon, Brain, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// How It Works Section
export const HowItWorksSection = () => {
  const { theme } = useTheme();

  const steps = [
    {
      number: '01',
      title: 'Record Your Dream',
      description: 'Use voice recording or text input to capture your dream immediately after waking up.',
      icon: <Moon size={24} />
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our advanced AI processes your dream content, identifying symbols, emotions, and patterns.',
      icon: <Brain size={24} />
    },
    {
      number: '03',
      title: 'Get Insights',
      description: 'Receive detailed analysis, interpretations, and personalized recommendations for your journey.',
      icon: <Sparkles size={24} />
    }
  ];

  return (
    <section id="how-it-works" style={{
      padding: '120px 20px',
      background: theme.bg.main
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '24px',
            background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: theme.text.secondary,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Simple steps to unlock the mysteries of your subconscious mind and transform your dreams into insights.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          {steps.map((step, index) => (
            <div key={index} style={{ textAlign: 'center', position: 'relative' }}>
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div 
                  className="connection-line"
                  style={{
                    position: 'absolute',
                    top: '80px',
                    right: '-20px',
                    width: '40px',
                    height: '2px',
                    background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                    display: 'none'
                  }} 
                />
              )}

              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: 'white',
                boxShadow: `0 10px 30px ${theme.accent.primary}40`
              }}>
                {step.icon}
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: theme.accent.primary,
                opacity: 0.3,
                marginBottom: '16px'
              }}>
                {step.number}
              </div>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: theme.text.primary
              }}>
                {step.title}
              </h3>

              <p style={{
                color: theme.text.secondary,
                lineHeight: '1.6',
                maxWidth: '280px',
                margin: '0 auto'
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .connection-line {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}; 