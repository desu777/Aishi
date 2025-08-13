'use client';

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { valueProps, dreamInspirations, howAishiMakesItReal, disclaimer } from './landingData';
import { ChevronRight, Info } from 'lucide-react';

export default function ValuePropsSection() {
  const { theme } = useTheme();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredInspiration, setHoveredInspiration] = useState<number | null>(null);

  return (
    <section style={{
      padding: '100px 20px',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main Title */}
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
              Why Aishi?
            </span>
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: theme.text.secondary
          }}>
            Your personal AI that truly belongs to you
          </p>
        </div>

        {/* 6 Main Value Props - 3x2 grid layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '80px',
          maxWidth: '1200px',
          margin: '0 auto 80px'
        }}>
          {valueProps.map((prop, i) => (
            <div
              key={i}
              style={{
                padding: '32px 24px',
                background: hoveredCard === i 
                  ? 'rgba(139, 92, 246, 0.08)' 
                  : 'rgba(24, 24, 31, 0.4)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${hoveredCard === i ? theme.accent.primary : theme.border}`,
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                transform: hoveredCard === i ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Top gradient line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: theme.gradients.primary,
                transform: hoveredCard === i ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.3s ease'
              }} />

              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: theme.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <prop.icon size={24} color="white" />
              </div>
              
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: theme.text.primary
              }}>
                {prop.title}
              </h3>
              
              <p style={{
                fontSize: '0.95rem',
                color: theme.text.secondary,
                lineHeight: 1.5
              }}>
                {prop.description}
              </p>
            </div>
          ))}
        </div>

        {/* Known Inspirations from Dreams */}
        <div style={{
          marginBottom: '80px',
          padding: '60px 40px',
          background: 'rgba(139, 92, 246, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <span style={{
              background: theme.gradients.secondary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Known inspirations from dreams
            </span>
          </h3>
          <p style={{
            fontSize: '1rem',
            color: theme.text.secondary,
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Throughout history, dreams have sparked world-changing discoveries
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {dreamInspirations.map((inspiration, i) => (
              <div
                key={i}
                style={{
                  padding: '28px',
                  background: hoveredInspiration === i
                    ? 'rgba(139, 92, 246, 0.08)'
                    : 'rgba(24, 24, 31, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: `1px solid ${hoveredInspiration === i ? theme.accent.primary : theme.border}`,
                  transition: 'all 0.3s ease',
                  transform: hoveredInspiration === i ? 'translateY(-4px)' : 'translateY(0)',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredInspiration(i)}
                onMouseLeave={() => setHoveredInspiration(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: theme.gradients.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <inspiration.icon size={20} color="white" />
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: theme.text.primary
                    }}>
                      {inspiration.person}
                    </h4>
                    <p style={{
                      fontSize: '0.9rem',
                      color: theme.accent.primary
                    }}>
                      {inspiration.discovery}
                    </p>
                  </div>
                </div>
                <p style={{
                  fontSize: '0.95rem',
                  color: theme.text.secondary,
                  lineHeight: 1.5
                }}>
                  {inspiration.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How Aishi Makes It Real */}
        <div style={{
          marginBottom: '60px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '40px',
            color: theme.text.primary
          }}>
            How Aishi makes it real (today)
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {howAishiMakesItReal.map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: `1px solid ${theme.accent.primary}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <step.icon size={24} style={{ color: theme.accent.primary }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: theme.text.primary,
                      marginBottom: '2px'
                    }}>
                      {step.title}
                    </p>
                    <p style={{
                      fontSize: '0.8rem',
                      color: theme.text.secondary
                    }}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {i < howAishiMakesItReal.length - 1 && (
                  <ChevronRight 
                    size={20} 
                    style={{ 
                      color: theme.text.tertiary,
                      marginTop: '-20px'
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '24px',
          background: 'rgba(24, 24, 31, 0.4)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <Info size={24} style={{ color: theme.accent.primary, flexShrink: 0 }} />
          <p style={{
            fontSize: '0.95rem',
            color: theme.text.secondary,
            lineHeight: 1.5,
            margin: 0
          }}>
            {disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}