import React from 'react';
import { Brain, Bot, BarChart3, Sparkles, Shield, Eye } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Features Section
export const FeaturesSection = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Brain size={32} />,
      title: 'AI Dream Analysis',
      description: 'Advanced neural networks analyze dream patterns, symbols, and emotions to provide personalized insights.'
    },
    {
      icon: <Bot size={32} />,
      title: 'iNFT Agents',
      description: 'Unique intelligent NFT agents that learn from your dreams and provide ongoing personalized guidance.'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Dream Tracking',
      description: 'Comprehensive tracking of dream patterns, themes, and emotional states over time.'
    },
    {
      icon: <Sparkles size={32} />,
      title: 'Lucid Dreaming',
      description: 'Tools and techniques to achieve lucid dreaming and take control of your dream experiences.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Privacy First',
      description: 'Your dreams are private. All analysis is done with complete confidentiality and security.'
    },
    {
      icon: <Eye size={32} />,
      title: 'Deep Insights',
      description: 'Uncover hidden meanings, recurring themes, and subconscious patterns in your dreams.'
    }
  ];

  return (
    <section id="features" style={{
      padding: '120px 20px',
      background: `linear-gradient(180deg, transparent 0%, ${theme.bg.card}50 50%, transparent 100%)`
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
            Powerful Features
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: theme.text.secondary,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover the advanced capabilities that make Dreamscape the leading platform for dream analysis and subconscious exploration.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: theme.bg.card,
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                border: `1px solid ${theme.border}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${theme.accent.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                color: theme.accent.primary
              }}>
                {feature.icon}
              </div>
              
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: theme.text.primary
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                color: theme.text.secondary,
                lineHeight: '1.6'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 