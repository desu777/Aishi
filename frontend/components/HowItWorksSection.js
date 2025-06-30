import React, { useRef } from 'react';
import { User, Brain } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AnimatedBeam } from './AnimatedBeam';
import Circle from './Circle';
import { WordRotate } from './WordRotate';
import DecryptedText from './DecryptedText';

// How It Works Section
export const HowItWorksSection = () => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  
  // User refs
  const userRef = useRef(null);
  const userResultRef = useRef(null);
  
  // System component refs
  const chainRef = useRef(null);
  const inftRef = useRef(null);
  const storageRef = useRef(null);
  const computeRef = useRef(null);
  const storageResultRef = useRef(null);
  const inftEvaluateRef = useRef(null);

  const rotatingWords = [
    'Works',
    'Flows',
    'Evolves',
    'Learns',
    'Grows'
  ];

  const steps = [
    { title: "Submit Dream", description: "User shares their dream text" },
    { title: "0G Chain", description: "Blockchain verifies & records" },
    { title: "iNFT Agent", description: "AI agent recalls your patterns" },
    { title: "Secure Storage", description: "Dream saved privately on 0G" },
    { title: "AI Compute", description: "Analysis with full context" },
    { title: "Store Results", description: "Response secured forever" },
    { title: "Agent Evolution", description: "iNFT grows with insights" },
    { title: "Receive Analysis", description: "Personalized interpretation" }
  ];

  return (
    <section id="how-it-works" style={{
      padding: 'clamp(60px, 15vw, 120px) clamp(15px, 4vw, 20px)',
      background: `linear-gradient(180deg, transparent 0%, ${theme.bg.card}30 50%, transparent 100%)`,
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
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
              How It
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
            <DecryptedText
              text="Experience the revolutionary flow of decentralized dream analysis powered by 0G's cutting-edge blockchain infrastructure."
              animateOn="view"
              speed={80}
              maxIterations={25}
              revealDirection="start"
              style={{
                fontSize: 'inherit',
                color: 'inherit',
                lineHeight: 'inherit'
              }}
            />
          </p>
        </div>

        {/* Flow Diagram */}
        <div 
          ref={containerRef}
          style={{
            position: 'relative',
            height: '600px',
            marginBottom: '60px',
            padding: '20px'
          }}
        >
          {/* User (Start) */}
          <Circle ref={userRef} size="80px" style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)`
          }}>
            <User size={32} color={theme.accent.primary} />
          </Circle>

          {/* 0G Chain */}
          <Circle ref={chainRef} size="70px" style={{
            position: 'absolute',
            top: '120px',
            left: '20%'
          }}>
            <img src="/chain.png" alt="0G Chain" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </Circle>

          {/* iNFT Agent */}
          <Circle ref={inftRef} size="80px" style={{
            position: 'absolute',
            top: '120px',
            right: '20%',
            background: `linear-gradient(135deg, ${theme.accent.primary}15, ${theme.accent.secondary}15)`
          }}>
            <img src="/iNFT.png" alt="iNFT Agent" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
          </Circle>

          {/* Storage Node */}
          <Circle ref={storageRef} size="70px" style={{
            position: 'absolute',
            top: '250px',
            left: '15%'
          }}>
            <img src="/storage.png" alt="0G Storage" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </Circle>

          {/* 0G Compute */}
          <Circle ref={computeRef} size="75px" style={{
            position: 'absolute',
            top: '250px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `linear-gradient(135deg, ${theme.accent.secondary}15, ${theme.accent.primary}15)`
          }}>
            <img src="/compute.png" alt="0G Compute" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </Circle>

          {/* Storage Results */}
          <Circle ref={storageResultRef} size="70px" style={{
            position: 'absolute',
            top: '250px',
            right: '15%'
          }}>
            <img src="/storage.png" alt="0G Storage" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </Circle>

          {/* iNFT Evaluate */}
          <Circle ref={inftEvaluateRef} size="75px" style={{
            position: 'absolute',
            top: '380px',
            left: '30%',
            background: `linear-gradient(135deg, ${theme.accent.primary}15, ${theme.accent.secondary}15)`
          }}>
            <img src="/iNFTevaluate.png" alt="iNFT Evaluate" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </Circle>

          {/* User (End) */}
          <Circle ref={userResultRef} size="80px" style={{
            position: 'absolute',
            top: '500px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)`
          }}>
            <User size={32} color={theme.accent.primary} />
          </Circle>

          {/* Animated Beams */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={userRef}
            toRef={chainRef}
            curvature={-30}
            duration={2}
            delay={0}
          />
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={chainRef}
            toRef={inftRef}
            curvature={30}
            duration={2}
            delay={0.3}
          />
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={inftRef}
            toRef={storageRef}
            curvature={-50}
            duration={2}
            delay={0.6}
          />
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={storageRef}
            toRef={computeRef}
            curvature={20}
            duration={2}
            delay={0.9}
          />
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={computeRef}
            toRef={storageResultRef}
            curvature={-20}
            duration={2}
            delay={1.2}
          />
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={storageResultRef}
            toRef={inftEvaluateRef}
            curvature={40}
            duration={2}
            delay={1.5}
          />
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={inftEvaluateRef}
            toRef={userResultRef}
            curvature={-25}
            duration={2}
            delay={1.8}
          />
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
          gap: 'clamp(16px, 4vw, 24px)',
          marginTop: '40px'
        }}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                background: theme.bg.card,
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${theme.border}`,
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 30px ${theme.accent.primary}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                boxShadow: `0 4px 12px ${theme.accent.primary}30`
              }}>
                {index + 1}
              </div>
              
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: theme.text.primary
              }}>
                {step.title}
              </h4>
              
              <p style={{
                color: theme.text.secondary,
                fontSize: '0.9rem',
                lineHeight: '1.4'
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