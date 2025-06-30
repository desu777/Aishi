import React from 'react';
import { useTheme } from './ThemeProvider';

// CTA Section
export const CTASection = () => {
  const { theme } = useTheme();

  return (
    <section id="contact" style={{
      padding: '120px 20px',
      margin: '0 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
          fontWeight: '700',
          marginBottom: '40px',
          background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Did you know dreams have a huge impact on our lives?
        </h2>

        <div style={{
          fontSize: '1.1rem',
          color: theme.text.secondary,
          lineHeight: '1.8',
          textAlign: 'left',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          <p style={{ marginBottom: '24px' }}>
            <strong style={{ color: theme.accent.primary }}>Kekulé's Discovery:</strong> The German chemist discovered the ring structure of benzene after dreaming of a snake seizing its own tail, revolutionizing organic chemistry.
          </p>
          
          <p style={{ marginBottom: '24px' }}>
            <strong style={{ color: theme.accent.primary }}>Tesla's Innovations:</strong> Nikola Tesla often solved complex electrical engineering problems through his vivid dreams, leading to breakthrough inventions in alternating current.
          </p>
          
          <p style={{ marginBottom: '24px' }}>
            <strong style={{ color: theme.accent.primary }}>Paul McCartney's "Yesterday":</strong> The melody for one of the most covered songs in music history came to McCartney in a dream, proving creativity flows through our subconscious.
          </p>
          
          <p style={{ marginBottom: '0' }}>
            <strong style={{ color: theme.accent.primary }}>Stephen King's "Misery":</strong> The bestselling author conceived the entire plot during a nightmare on a flight, showing how dreams can unlock our deepest storytelling potential.
          </p>
        </div>
      </div>
    </section>
  );
}; 