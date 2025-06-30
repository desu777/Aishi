import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Header Component
export const Header = () => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMenuOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrolled 
        ? `${theme.bg.card}95`
        : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? `1px solid ${theme.border}` : 'none',
      transition: 'all 0.3s ease',
      padding: '0 20px'
    }}>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <div style={{
          fontSize: '24px',
          fontWeight: '800',
          fontFamily: '"Michroma", "Work Sans", sans-serif',
          color: theme.text.primary
        }}>
          Dreamscape.
        </div>

        {/* Desktop Menu */}
        <div style={{
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center',
          gap: '32px'
        }}>
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                color: theme.text.secondary,
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.color = theme.accent.primary}
              onMouseLeave={(e) => e.target.style.color = theme.text.secondary}
            >
              {item.label}
            </a>
          ))}
          
          {/* CTA Button */}
          <button style={{
            background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            border: 'none',
            borderRadius: '25px',
            padding: '12px 24px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            boxShadow: `0 4px 15px ${theme.accent.primary}30`
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: isMobile ? 'flex' : 'none',
            background: 'transparent',
            border: 'none',
            color: theme.text.primary,
            cursor: 'pointer',
            padding: '8px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && isMobile && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          display: 'block',
          background: theme.bg.card,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.border}`,
          padding: '20px'
        }}>
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                display: 'block',
                color: theme.text.secondary,
                textDecoration: 'none',
                fontWeight: '500',
                padding: '12px 0',
                borderBottom: `1px solid ${theme.border}`,
                transition: 'color 0.3s ease'
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}


    </header>
  );
}; 