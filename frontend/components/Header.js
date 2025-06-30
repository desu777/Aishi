import React, { useState, useEffect } from 'react';
import { Moon, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Header Component
export const Header = () => {
  const { theme, darkMode, setDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
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
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '24px',
          fontWeight: '700',
          color: theme.text.primary
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 20px ${theme.accent.primary}50`
          }}>
            <Moon size={24} color="white" />
          </div>
          Dreamscape
        </div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{
          display: 'flex',
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
          
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.text.primary,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

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
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: theme.text.primary,
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          display: 'none',
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

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}; 