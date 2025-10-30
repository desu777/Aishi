'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { badges } from './landingData';
import SplitText from '../ui/SplitText';
import PillNav from '../ui/PillNav';
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
    'Auto month-learn and memory-core keeps long-term context.',
    'You choose what Aishi remembers – always.',
    'Chat in real time with your Live2D companion.',
    'Spot hidden patterns and self-defeating loops.',
    'An ownable self-learning iNFT you name and keep.',
    'Intelligence and traits evolve with you.',
    'Encrypted on 0G Storage; we can\'t see your data.',
    'Operate via AishiOS: type dream, chat, and help to see more available commands.'
  ];

  return (
    <section style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: isMobile ? '60px 20px 40px 20px' : '70px 20px 60px 20px',
      zIndex: 1
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        textAlign: 'center'
      }}>
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
              <img
                src="/AI.png"
                alt="AI"
                style={{
                  display: 'inline-block',
                  height: isMobile ? '1.5em' : '2em',
                  verticalAlign: 'middle',
                  margin: '0 4px'
                }}
              />
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
          margin: '0 auto 32px',
          animation: 'fadeInUp 1s ease-out 0.4s both',
          minHeight: '2em'
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
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '40px'
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

        {/* PillNav CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '0',
          animation: 'fadeInUp 1s ease-out 0.8s both'
        }}>
          <PillNav
            items={[
              {
                label: 'AishiOS',
                href: '/aishiOS',
                ariaLabel: 'Open AishiOS'
              },
              {
                label: 'Mint',
                href: '/aishi-mint',
                ariaLabel: 'Mint Your Agent'
              },
              {
                label: 'Learn More',
                onClick: () => {
                  const docsUrl = process.env.NEXT_PUBLIC_DOCS_AISHI_URL;
                  if (docsUrl && docsUrl.trim()) {
                    window.open(docsUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    console.warn('NEXT_PUBLIC_DOCS_AISHI_URL not configured');
                  }
                },
                ariaLabel: 'Learn more about Aishi'
              }
            ]}
          />
        </div>

      </div>
    </section>
  );
}