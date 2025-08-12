'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function FinalCTASection() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <section style={{
      padding: '150px 20px',
      position: 'relative',
      zIndex: 1,
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 'bold',
          marginBottom: '48px'
        }}>
          <span style={{
            background: theme.gradients.rainbow,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Ready to meet your Aishi?
          </span>
        </h2>

        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Primary CTA with glow effect */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: '-4px',
              background: theme.gradients.primary,
              borderRadius: '16px',
              filter: 'blur(20px)',
              opacity: 0.5
            }} />
            <button
              onClick={() => router.push('/agentOS')}
              style={{
                position: 'relative',
                padding: '20px 40px',
                background: theme.gradients.primary,
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Open Terminal
              <Zap size={24} />
            </button>
          </div>

          {/* Secondary CTA */}
          <button
            onClick={() => router.push('/agent-dashboard')}
            style={{
              padding: '20px 40px',
              background: 'transparent',
              border: `2px solid ${theme.accent.primary}`,
              borderRadius: '12px',
              color: theme.accent.primary,
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.accent.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-4px)';
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
      </div>
    </section>
  );
}