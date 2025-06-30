import React from 'react';
import { Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Footer
export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer style={{
      padding: '80px 20px 40px',
      background: theme.bg.card,
      marginTop: '80px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Logo and Description */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Moon size={24} color="white" />
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                color: theme.text.primary
              }}>
                Dreamscape
              </span>
            </div>
            <p style={{
              color: theme.text.secondary,
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Advanced AI-powered dream analysis for deeper self-understanding and subconscious exploration.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['🌙', '🧠', '✨'].map((emoji, index) => (
                <div
                  key={index}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: theme.bg.panel,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              color: theme.text.primary,
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Quick Links
            </h4>
            {['Features', 'How It Works', 'About', 'Contact', 'Privacy'].map((link) => (
              <div key={link} style={{ marginBottom: '12px' }}>
                <a href={`#${link.toLowerCase().replace(' ', '-')}`} style={{
                  color: theme.text.secondary,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = theme.accent.primary}
                onMouseLeave={(e) => e.target.style.color = theme.text.secondary}
                >
                  {link}
                </a>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              color: theme.text.primary,
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Contact
            </h4>
            <div style={{ color: theme.text.secondary, marginBottom: '12px' }}>
              support@dreamscape.ai
            </div>
            <div style={{ color: theme.text.secondary, marginBottom: '12px' }}>
              +1 (555) 123-DREAM
            </div>
            <div style={{ color: theme.text.secondary }}>
              San Francisco, CA
            </div>
          </div>
        </div>

        <div style={{
          borderTop: `1px solid ${theme.border}`,
          paddingTop: '40px',
          textAlign: 'center',
          color: theme.text.secondary
        }}>
          <p>&copy; 2024 Dreamscape. All rights reserved. Made with 🌙 for dreamers.</p>
        </div>
      </div>
    </footer>
  );
}; 