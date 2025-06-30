import React, { useState, useEffect } from 'react';
import { Moon, Brain, Sparkles, Users, BarChart3, Shield, Menu, X, ChevronDown, Play, Star, Zap, Eye, Bot } from 'lucide-react';

// Theme Context
const ThemeContext = React.createContext();

const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  const theme = {
    bg: {
      main: darkMode ? '#0A0A0F' : '#FAFAFA',
      card: darkMode ? 'rgba(18, 18, 28, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      panel: darkMode ? '#1A1A2E' : '#F5F5F5',
      hover: darkMode ? '#2A2A3E' : '#EEEEEE'
    },
    text: {
      primary: darkMode ? '#FFFFFF' : '#1A1A1A',
      secondary: darkMode ? '#B3B3B3' : '#666666',
      accent: darkMode ? '#8B5CF6' : '#7C3AED'
    },
    accent: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      tertiary: '#06B6D4'
    },
    border: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.2)'
  };

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Particle Background Component
const ParticleBackground = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      background: `radial-gradient(circle at 20% 50%, ${theme.accent.primary}15 0%, transparent 50%), 
                   radial-gradient(circle at 80% 20%, ${theme.accent.secondary}15 0%, transparent 50%),
                   radial-gradient(circle at 40% 80%, ${theme.accent.tertiary}10 0%, transparent 50%),
                   ${theme.bg.main}`,
      overflow: 'hidden'
    }}>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            backgroundColor: Math.random() > 0.5 ? theme.accent.primary : theme.accent.secondary,
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.8 + 0.2,
            animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
            animationDelay: Math.random() * 5 + 's'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
};

// Header Component
const Header = () => {
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
        <div style={{
          display: window.innerWidth <= 768 ? 'none' : 'flex',
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
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: window.innerWidth > 768 ? 'none' : 'flex',
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
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: theme.bg.card,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.border}`,
          padding: '20px',
          display: window.innerWidth > 768 ? 'none' : 'block'
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

// Hero Section
const HeroSection = () => {
  const { theme } = useTheme();
  
  return (
    <section id="home" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px 0',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        <div style={{
          marginBottom: '24px',
          animation: 'fadeInUp 1s ease-out'
        }}>
          <span style={{
            background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            padding: '8px 20px',
            borderRadius: '25px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            AI-Powered Dream Analysis
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: '800',
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.1',
          animation: 'fadeInUp 1s ease-out 0.2s both'
        }}>
          Unlock the Secrets of Your Dreams
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: theme.text.secondary,
          marginBottom: '40px',
          lineHeight: '1.6',
          animation: 'fadeInUp 1s ease-out 0.4s both'
        }}>
          Advanced AI agents analyze your dreams to provide deep insights into your subconscious mind. 
          Transform your sleep into a journey of self-discovery with our revolutionary iNFT technology.
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease-out 0.6s both'
        }}>
          <button style={{
            background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
            border: 'none',
            borderRadius: '50px',
            padding: '16px 32px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 8px 25px ${theme.accent.primary}40`
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Play size={20} />
            Start Dream Analysis
          </button>

          <button style={{
            background: 'transparent',
            border: `2px solid ${theme.accent.primary}`,
            borderRadius: '50px',
            padding: '16px 32px',
            color: theme.accent.primary,
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = theme.accent.primary;
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = theme.accent.primary;
          }}
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '60px',
          marginTop: '80px',
          flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease-out 0.8s both'
        }}>
          {[
            { number: '10K+', label: 'Dreams Analyzed' },
            { number: '95%', label: 'Accuracy Rate' },
            { number: '24/7', label: 'AI Availability' }
          ].map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: theme.accent.primary,
                marginBottom: '8px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
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

// How It Works Section
const HowItWorksSection = () => {
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
                <div style={{
                  position: 'absolute',
                  top: '80px',
                  right: '-20px',
                  width: '40px',
                  height: '2px',
                  background: `linear-gradient(90deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                  display: window.innerWidth <= 900 ? 'none' : 'block'
                }} />
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
    </section>
  );
};

// CTA Section
const CTASection = () => {
  const { theme } = useTheme();

  return (
    <section style={{
      padding: '120px 20px',
      background: `linear-gradient(135deg, ${theme.accent.primary}15, ${theme.accent.secondary}15)`,
      borderRadius: '32px',
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
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Ready to Explore Your Dreams?
        </h2>

        <p style={{
          fontSize: '1.25rem',
          color: theme.text.secondary,
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Join thousands of dreamers who have unlocked the secrets of their subconscious mind. 
          Start your journey of self-discovery today.
        </p>

        <button style={{
          background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
          border: 'none',
          borderRadius: '50px',
          padding: '20px 40px',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: `0 10px 30px ${theme.accent.primary}40`
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Zap size={24} />
          Start Your Dream Journey
        </button>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
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

// Main App Component
const DreamscapeApp = () => {
  return (
    <ThemeProvider>
      <div style={{ 
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden auto'
      }}>
        <ParticleBackground />
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default DreamscapeApp;