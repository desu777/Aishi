import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { ShimmerButton } from './ShimmerButton';

// Header Component
export const Header = () => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Detect active section based on scroll position
      const sections = ['home', 'features', 'how-it-works', 'contact'];
      const scrollPosition = window.scrollY + 100; // Offset for better detection
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
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
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
    { label: 'Did u know?', href: '#contact', id: 'contact' }
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
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.label}
                href={item.href}
                style={{
                  color: isActive ? theme.accent.primary : theme.text.secondary,
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = theme.accent.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = theme.text.secondary;
                  }
                }}
              >
                {item.label}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: theme.accent.primary,
                    transition: 'all 0.3s ease'
                  }} />
                )}
              </a>
            );
          })}
          
          {/* CTA Button */}
          <ShimmerButton
            background={`linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`}
            shimmerColor="#ffffff"
            shimmerDuration="2s"
            borderRadius="25px"
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: '"Work Sans", sans-serif',
              letterSpacing: '0.02em',
              padding: '12px 24px',
              boxShadow: `0 4px 15px ${theme.accent.primary}30`,
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Get Started
          </ShimmerButton>
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
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.label}
                href={item.href}
                style={{
                  display: 'block',
                  color: isActive ? theme.accent.primary : theme.text.secondary,
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '500',
                  padding: '12px 0',
                  borderBottom: `1px solid ${theme.border}`,
                  transition: 'color 0.3s ease'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
          
          {/* Mobile CTA Button */}
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <ShimmerButton
              background={`linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`}
              shimmerColor="#ffffff"
              shimmerDuration="2s"
              borderRadius="25px"
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                fontFamily: '"Work Sans", sans-serif',
                letterSpacing: '0.02em',
                padding: '12px 24px',
                boxShadow: `0 4px 15px ${theme.accent.primary}30`,
                width: '100%',
                maxWidth: '200px'
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </ShimmerButton>
          </div>
        </div>
      )}

    </header>
  );
}; 