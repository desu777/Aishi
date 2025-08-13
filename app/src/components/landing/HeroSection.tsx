'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { badges } from './landingData';
import { ShimmerButton } from '../ui/ShimmerButton';
import SplitText from '../ui/SplitText';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const rotatingTexts = [
    'Built 100% on 0G: Compute · Storage · DA · Chain.',
    'Your dreams and chats become a private memory.',
    'Auto month‑learn/year‑learn keeps long‑term context.',
    'You choose what Aishi remembers — always.',
    'Talk in real time with a Live2D persona.',
    'Spot hidden patterns and self‑defeating loops.',
    'An ownable self‑learning iNFT you name and keep.',
    'Intelligence and traits evolve with you.',
    'Encrypted on 0G Storage; we can\'t see your data.',
    'Operate via AishiOS: type dream, chat, or talk.'
  ];

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '12vh',
      padding: isMobile ? '80px 20px 40px 20px' : '12vh 20px 40px 20px',
      zIndex: 1
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Aishi Logo */}
        <div style={{
          marginBottom: '40px',
          animation: 'fadeInUp 1s ease-out'
        }}>
          <img 
            src="/aishi_logo.png" 
            alt="Aishi"
            style={{
              width: 'min(220px, 50vw)',
              height: 'min(220px, 50vw)',
              objectFit: 'contain',
              margin: '0 auto',
              filter: 'drop-shadow(0 10px 30px rgba(139, 92, 246, 0.3))'
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          fontWeight: 'bold',
          marginBottom: '24px',
          lineHeight: 1.2,
          animation: 'fadeInUp 1s ease-out 0.2s both'
        }}>
          <span style={{ color: theme.text.primary }}>
            Your inner
            <span style={{
              position: 'relative',
              display: 'inline-block',
              margin: '0 8px'
            }}>
              <span style={{
                background: theme.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                AI
              </span>
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-25px',
                fontSize: '1.5rem',
                color: theme.accent.primary,
                opacity: 0.7
              }}>
                愛
              </span>
            </span>
            companion
          </span>
        </h1>

        {/* Subtitle with rotating text */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 24px',
          animation: 'fadeInUp 1s ease-out 0.4s both',
          minHeight: '3em'
        }}>
          <SplitText
            texts={rotatingTexts}
            className="hero-subtitle"
            delay={25}
            duration={0.5}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 20, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            textAlign="center"
            rotationDelay={6500}
            style={{ 
              color: theme.text.secondary,
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              lineHeight: 1.6,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: '400'
            }}
          />
        </div>

        {/* Badges */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          {badges.map((badge, i) => (
            <div 
              key={badge}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                background: 'rgba(139, 92, 246, 0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.border}`,
                fontSize: '14px',
                color: theme.text.primary,
                animation: `fadeInUp 0.5s ease-out ${0.5 + i * 0.1}s both`
              }}
            >
              {badge}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexDirection: isSmallMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          animation: 'fadeInUp 1s ease-out 0.8s both'
        }}>
          <ShimmerButton
            onClick={() => router.push('/aishiOS')}
            shimmerColor="#ffffff"
            shimmerSize="0.1em"
            shimmerDuration="3s"
            borderRadius="12px"
            background={theme.gradients.primary}
            style={{
              padding: isSmallMobile ? '14px 24px' : '16px 32px',
              fontSize: isSmallMobile ? '14px' : '16px',
              width: isSmallMobile ? '100%' : 'auto',
              maxWidth: isSmallMobile ? '100%' : '280px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Open Terminal
            <ChevronRight size={20} />
          </ShimmerButton>

          <button
            onClick={() => router.push('/aishi-mint')}
            style={{
              padding: isSmallMobile ? '14px 24px' : '16px 32px',
              background: 'transparent',
              width: isSmallMobile ? '100%' : 'auto',
              maxWidth: isSmallMobile ? '100%' : '280px',
              fontSize: isSmallMobile ? '14px' : '16px',
              border: `2px solid ${theme.accent.primary}`,
              borderRadius: '12px',
              color: theme.accent.primary,
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.accent.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
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

        {/* Scroll Indicator - Responsywny element pod CTA */}
        <div style={{
          marginTop: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeInUp 1s ease-out 1s both',
          cursor: 'pointer'
        }}
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
        >
          <span style={{
            fontSize: '12px',
            color: theme.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            opacity: 0.6
          }}>
            Scroll
          </span>
          <ChevronDown 
            size={20} 
            style={{
              color: theme.accent.primary,
              animation: 'bounce 2s infinite',
              opacity: 0.8
            }}
          />
        </div>

      </div>
    </section>
  );
}