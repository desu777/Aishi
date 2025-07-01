import React from 'react';
import { Play } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Orb from './Orb';
import { WordRotate } from './WordRotate';
import { ShimmerButton } from './ShimmerButton';

// Hero Section
export const HeroSection = () => {
  const { theme } = useTheme();

  const rotatingTexts = [
    'yours.',
    'private.',
    'decentralized.',
    'intelligent.',
    'evolving.',
    'on-chain.',
    'unstoppable.',
  ];
  
  return (
    <section id="home" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(60px, 12vw, 80px) clamp(15px, 4vw, 20px) 0',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        {/* Orb with Dreamscape text */}
        <div style={{ 
          width: '100%', 
          height: 'clamp(200px, 30vw, 320px)', 
          position: 'relative',
                      marginBottom: 'clamp(10px, 3vw, 20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Orb
            hoverIntensity={0.5}
            rotateOnHover={true}
            hue={280}
            forceHoverState={false}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            maxWidth: '80%',
            textAlign: 'center'
          }} className="orb-text">
            <img
              src="/logo.png"
              alt="Dreamscape"
              style={{
                width: 'clamp(140px, 22vw, 190px)',
                height: 'auto',
                filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.6))',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        </div>

        <div style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '800',
          marginBottom: '24px',
          lineHeight: '1.1',
          animation: 'fadeInUp 1s ease-out 0.2s both',
          textAlign: 'center'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.2em'
          }}>
            Your dreams, now
          </div>
          <WordRotate
            words={rotatingTexts}
            duration={4000}
            style={{
              background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'block',
              fontSize: 'inherit',
              fontWeight: 'inherit'
            }}
            motionProps={{
              initial: { opacity: 0, y: 50 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -50 },
              transition: { duration: 0.8, ease: "easeOut" },
            }}
          />
        </div>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
          color: theme.text.secondary,
          marginBottom: '40px',
          lineHeight: '1.6',
          animation: 'fadeInUp 1s ease-out 0.4s both'
        }}>
          Meet the world's first iNFT. A personal AI agent that learns and evolves with every dream, its memory secured forever on the 0G blockchain.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          animation: 'fadeInUp 1s ease-out 0.6s both'
        }}>
          <ShimmerButton
            background={`linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`}
            shimmerColor="#ffffff"
            shimmerDuration="2s"
            borderRadius="50px"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              fontWeight: '700',
              fontFamily: '"Work Sans", sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: `0 8px 30px ${theme.accent.primary}40`,
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Launch Your Agent
          </ShimmerButton>
        </div>


      </div>
    </section>
  );
}; 