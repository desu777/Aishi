import React from 'react';
import { ShieldCheck, Zap, BrainCircuit, Key, BadgeCheck, Cpu } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { WordRotate } from './WordRotate';
import TiltedCard from './TiltedCard';

// Features Section
export const FeaturesSection = () => {
  const { theme } = useTheme();

  const rotatingWords = [
    'Dreams.',
    'Us.',
    'AI.',
    'Web3.',
    'Privacy.',
    'Future.'
  ];

  const features = [
    {
      icon: <Zap size={32} />,
      title: 'Decentralized AI Analysis',
      description: 'Your dreams are analyzed by a decentralized AI network on the 0G platform. This eliminates the "black box" problem, ensuring transparent, private, and unbiased insights that are truly your own.'
    },
    {
      icon: <BrainCircuit size={32} />,
      title: 'Evolving iNFT Agent',
      description: 'Receive a personal iNFT that acts as your evolving dream agent. It learns from every analysis, growing from a Novice to a Master, providing progressively deeper and more personalized guidance.'
    },
    {
      icon: <ShieldCheck size={32} />,
      title: 'Unstoppable On-Chain Memory',
      description: 'Your dreams and the agent\'s memory are secured forever on 0G\'s decentralized storage. This guarantees data sovereignty—no one can access, modify, or delete your data, not even us.'
    },
    {
      icon: <Key size={32} />,
      title: 'Deep Subconscious Insights',
      description: 'Your iNFT agent connects patterns across multiple dreams, revealing long-term emotional trends and subconscious narratives that would otherwise remain hidden.'
    },
    {
      icon: <BadgeCheck size={32} />,
      title: 'Verifiable Agent Provenance',
      description: 'Every stage of your agent\'s evolution is recorded immutably on the blockchain. This provides a verifiable, on-chain history of its unique learning journey.'
    },
    {
      icon: <Cpu size={32} />,
      title: 'Future-Proof AI Infrastructure',
      description: 'Built on 0G, a high-performance modular AI chain, Dreamscape leverages unparalleled speed and scalability, ensuring your journey is always seamless.'
    },
  ];

  return (
    <section id="features" style={{
      padding: 'clamp(60px, 15vw, 120px) clamp(15px, 4vw, 20px)',
      background: `linear-gradient(180deg, transparent 0%, ${theme.bg.card}50 50%, transparent 100%)`
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 10vw, 80px)' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '24px',
            lineHeight: '1.1',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.3em'
          }}>
            <span style={{
              background: `linear-gradient(135deg, ${theme.text.primary}, ${theme.accent.primary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              A New Paradigm for
            </span>
            <WordRotate
              words={rotatingWords}
              duration={3000}
              style={{
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 'inherit',
                fontWeight: 'inherit'
              }}
              motionProps={{
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -30 },
                transition: { duration: 0.6, ease: "easeOut" },
              }}
            />
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: theme.text.secondary,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Dreamscape isn't just another analysis tool. It's a revolutionary platform built on decentralized infrastructure for unparalleled privacy and intelligence.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
          gap: 'clamp(16px, 4vw, 32px)'
        }}>
          {features.map((feature, index) => (
            <TiltedCard
              key={index}
              scaleOnHover={1.03}
              rotateAmplitude={6}
              style={{
                height: 'auto',
                minHeight: '280px'
              }}
            >
              <div style={{
                background: theme.bg.card,
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: 'clamp(24px, 6vw, 32px)',
                border: `1px solid ${theme.border}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  color: theme.accent.primary,
                  marginBottom: '24px'
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
                  lineHeight: '1.6',
                  flex: 1
                }}>
                  {feature.description}
                </p>
              </div>
            </TiltedCard>
          ))}
        </div>
      </div>
    </section>
  );
}; 