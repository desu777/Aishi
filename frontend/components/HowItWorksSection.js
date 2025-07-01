import React, { useRef, useState, useEffect } from 'react';
import { User, Brain, Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AnimatedBeam } from './AnimatedBeam';
import Circle from './Circle';
import { WordRotate } from './WordRotate';
import DecryptedText from './DecryptedText';
import TiltedCard from './TiltedCard';

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

  // Flow animation state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const rotatingWords = [
    'Works.',
    'Flows.',
    'Evolves.',
    'Learns.',
    'Grows.'
  ];

  const steps = [
    { title: "Submit Dream", description: "Share your dream through secure text input or by recording your voice, which is then automatically transcribed." },
    { title: "0G Chain", description: "The process is initiated on the 0G blockchain, preparing the transaction that will later immutably record your dream's hash." },
    { title: "iNFT Agent", description: "Your personal iNFT agent accesses its long-term memory, retrieving all past dream patterns and emotional profiles from 0G Storage." },
    { title: "Secure Storage", description: "The new dream text is encrypted and uploaded to a decentralized 0G Storage node, ensuring only you have access." },
    { title: "AI Compute", description: "An evolutionary prompt, enriched with your unique history, is sent to the decentralized 0G AI network for a deeply personalized analysis." },
    { title: "Store Results", description: "The AI's generated analysis is also secured in 0G Storage, creating a permanent, private link to the original dream." },
    { title: "Agent Evolution", description: "The new data hashes are submitted to the smart contract. Every 5th dream, your iNFT agent evolves, increasing its intelligence level." },
    { title: "Receive Analysis", description: "The complete, context-aware analysis is delivered back to you, revealing insights that grow deeper with every dream." }
  ];

  // Animation control
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 7) {
            setIsPlaying(false);
            return 7;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per step
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setHasStarted(false);
  };

  // Define beam configurations
  const beamConfigs = [
    { from: userRef, to: chainRef, curvature: -30 },
    { from: chainRef, to: inftRef, curvature: 30 },
    { from: inftRef, to: storageRef, curvature: -50 },
    { from: storageRef, to: computeRef, curvature: 20 },
    { from: computeRef, to: storageResultRef, curvature: -20 },
    { from: storageResultRef, to: inftEvaluateRef, curvature: 40 },
    { from: inftEvaluateRef, to: userResultRef, curvature: -25 }
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
            lineHeight: '1.6',
            marginBottom: '32px'
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

          {/* Flow Control Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '40px'
          }}>
            <button
              onClick={handlePlay}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                border: 'none',
                borderRadius: '25px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 15px ${theme.accent.primary}40`
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? 'Pause Flow' : 'Start Flow'}
            </button>
            
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: theme.bg.card,
                border: `1px solid ${theme.border}`,
                borderRadius: '25px',
                padding: '12px 24px',
                color: theme.text.secondary,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.color = theme.text.secondary;
              }}
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
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
            background: currentStep >= 0 ? 
              `linear-gradient(135deg, ${theme.accent.primary}40, ${theme.accent.secondary}40)` :
              `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)`,
            border: currentStep >= 0 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 0 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <User size={32} color={currentStep >= 0 ? theme.accent.primary : theme.text.secondary} />
            {currentStep >= 0 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                1
              </div>
            )}
          </Circle>

          {/* 0G Chain */}
          <Circle ref={chainRef} size="70px" style={{
            position: 'absolute',
            top: '120px',
            left: '20%',
            background: currentStep >= 1 ? 
              `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)` :
              'rgba(255, 255, 255, 0.05)',
            border: currentStep >= 1 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 1 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <img src="/chain.png" alt="0G Chain" style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'contain',
              filter: currentStep >= 1 ? 'brightness(1.3)' : 'brightness(0.7)'
            }} />
            {currentStep >= 1 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                2
              </div>
            )}
          </Circle>

          {/* iNFT Agent */}
          <Circle ref={inftRef} size="80px" style={{
            position: 'absolute',
            top: '120px',
            right: '20%',
            background: currentStep >= 2 ? 
              `linear-gradient(135deg, ${theme.accent.primary}30, ${theme.accent.secondary}30)` :
              `linear-gradient(135deg, ${theme.accent.primary}15, ${theme.accent.secondary}15)`,
            border: currentStep >= 2 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 2 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <img src="/iNFT.png" alt="iNFT Agent" style={{ 
              width: '45px', 
              height: '45px', 
              objectFit: 'contain',
              filter: currentStep >= 2 ? 'brightness(1.3)' : 'brightness(0.7)'
            }} />
            {currentStep >= 2 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                3
              </div>
            )}
          </Circle>

          {/* Storage Node */}
          <Circle ref={storageRef} size="70px" style={{
            position: 'absolute',
            top: '250px',
            left: '15%',
            background: currentStep >= 3 ? 
              `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)` :
              'rgba(255, 255, 255, 0.05)',
            border: currentStep >= 3 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 3 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <img src="/storage.png" alt="0G Storage" style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'contain',
              filter: currentStep >= 3 ? 'brightness(1.3)' : 'brightness(0.7)'
            }} />
            {currentStep >= 3 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                4
              </div>
            )}
          </Circle>

          {/* 0G Compute */}
          <Circle ref={computeRef} size="75px" style={{
            position: 'absolute',
            top: '250px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: currentStep >= 4 ? 
              `linear-gradient(135deg, ${theme.accent.secondary}30, ${theme.accent.primary}30)` :
              `linear-gradient(135deg, ${theme.accent.secondary}15, ${theme.accent.primary}15)`,
            border: currentStep >= 4 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 4 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <img src="/compute.png" alt="0G Compute" style={{ 
              width: '42px', 
              height: '42px', 
              objectFit: 'contain',
              filter: currentStep >= 4 ? 'brightness(1.3)' : 'brightness(0.7)'
            }} />
            {currentStep >= 4 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                5
              </div>
            )}
          </Circle>

          {/* Storage Results */}
          <Circle ref={storageResultRef} size="70px" style={{
            position: 'absolute',
            top: '250px',
            right: '15%',
            background: currentStep >= 5 ? 
              `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)` :
              'rgba(255, 255, 255, 0.05)',
            border: currentStep >= 5 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 5 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <img src="/storage.png" alt="0G Storage" style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'contain',
              filter: currentStep >= 5 ? 'brightness(1.3)' : 'brightness(0.7)'
            }} />
            {currentStep >= 5 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                6
              </div>
            )}
          </Circle>

          {/* iNFT Evaluate */}
          <Circle ref={inftEvaluateRef} size="75px" style={{
            position: 'absolute',
            top: '380px',
            left: '30%',
            background: currentStep >= 6 ? 
              `linear-gradient(135deg, ${theme.accent.primary}30, ${theme.accent.secondary}30)` :
              `linear-gradient(135deg, ${theme.accent.primary}15, ${theme.accent.secondary}15)`,
            border: currentStep >= 6 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 6 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <img src="/iNFTevaluate.png" alt="iNFT Evaluate" style={{ 
              width: '42px', 
              height: '42px', 
              objectFit: 'contain',
              filter: currentStep >= 6 ? 'brightness(1.3)' : 'brightness(0.7)'
            }} />
            {currentStep >= 6 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                7
              </div>
            )}
          </Circle>

          {/* User (End) */}
          <Circle ref={userResultRef} size="80px" style={{
            position: 'absolute',
            top: '500px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: currentStep >= 7 ? 
              `linear-gradient(135deg, ${theme.accent.primary}40, ${theme.accent.secondary}40)` :
              `linear-gradient(135deg, ${theme.accent.primary}20, ${theme.accent.secondary}20)`,
            border: currentStep >= 7 ? 
              `2px solid ${theme.accent.primary}` :
              `2px solid rgba(255, 255, 255, 0.1)`,
            boxShadow: currentStep >= 7 ? 
              `0 0 30px ${theme.accent.primary}50` :
              '0 0 20px -12px rgba(0,0,0,0.8)'
          }}>
            <User size={32} color={currentStep >= 7 ? theme.accent.primary : theme.text.secondary} />
            {currentStep >= 7 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.accent.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white'
              }}>
                8
              </div>
            )}
          </Circle>

          {/* Animated Beams - only show active ones */}
          {beamConfigs.map((config, index) => (
            hasStarted && currentStep > index && (
              <AnimatedBeam
                key={`beam-${index}`}
                containerRef={containerRef}
                fromRef={config.from}
                toRef={config.to}
                curvature={config.curvature}
                duration={1.5}
                delay={0}
                pathColor={`${theme.accent.primary}40`}
                pathWidth={3}
                pathOpacity={0.8}
                gradientStartColor={theme.accent.primary}
                gradientStopColor={theme.accent.secondary}
              />
            )
          ))}
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
          gap: 'clamp(16px, 4vw, 24px)',
          marginTop: '40px'
        }}>
          {steps.map((step, index) => (
            <TiltedCard
              key={index}
              scaleOnHover={currentStep >= index ? 1.08 : 1.05}
              rotateAmplitude={currentStep >= index ? 10 : 6}
              style={{
                height: 'auto',
                minHeight: '200px'
              }}
            >
              <div style={{
                background: currentStep >= index ? 
                  `${theme.bg.card}CC` : 
                  theme.bg.card,
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '20px',
                border: currentStep >= index ? 
                  `2px solid ${theme.accent.primary}60` : 
                  `1px solid ${theme.border}`,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                transform: currentStep >= index ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: currentStep >= index ? 
                  `0 12px 30px ${theme.accent.primary}20` : 
                  'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentStep >= index ? 
                    theme.accent.primary : 
                    theme.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: currentStep >= index ? 
                    `0 4px 12px ${theme.accent.primary}40` : 
                    'none',
                  transition: 'all 0.3s ease'
                }}>
                  {index + 1}
                </div>
                
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: currentStep >= index ? 
                    theme.accent.primary : 
                    theme.text.primary,
                  transition: 'color 0.3s ease'
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
            </TiltedCard>
          ))}
        </div>
      </div>
    </section>
  );
}; 