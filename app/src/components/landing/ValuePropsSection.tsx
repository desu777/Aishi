'use client';

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { valueProps } from './landingData';

export default function ValuePropsSection() {
  const { theme } = useTheme();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {valueProps.map((prop, i) => (
            <div
              key={i}
              style={{
                flex: '1 1 calc(20% - 16px)',
                minWidth: '180px',
                padding: '24px 16px',
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
                fontSize: '0.85rem',
                color: theme.text.secondary,
                lineHeight: 1.4
              }}>
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}