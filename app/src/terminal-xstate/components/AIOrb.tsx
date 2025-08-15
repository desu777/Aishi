/**
 * @fileoverview AI Orb component - Visual representation of the AI agent's consciousness
 * @description Siri-style animated orb that responds to agent states with Aishi colors
 */

import React, { useEffect, useState } from 'react';
import SiriOrb from './SiriOrb';

interface AIorbProps {
  status: 'uninitialized' | 'connecting' | 'syncing' | 'online' | 'thinking' | 'responding' | 'error' | 'no_agent';
  agentName?: string | null;
  intelligenceLevel?: number;
  syncProgress?: string;
  isMobile?: boolean;
  isTablet?: boolean;
}

const AIOrb: React.FC<AIorbProps> = ({ 
  status, 
  agentName,
  intelligenceLevel = 0,
  syncProgress,
  isMobile = false,
  isTablet = false
}) => {
  const [dots, setDots] = useState('');
  
  // Animate dots for loading states
  useEffect(() => {
    if (status === 'connecting' || status === 'syncing') {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [status]);

  // Determine orb size based on device (reduced sizes)
  const getOrbSize = () => {
    if (isMobile) return "120px";
    if (isTablet) return "150px";
    return "180px";
  };

  // Get colors and animation speed based on status
  const getOrbConfig = () => {
    switch (status) {
      case 'uninitialized':
        return {
          colors: {
            bg: "rgba(26, 26, 26, 0.5)",          // Very dark gray with transparency
            c1: "rgba(77, 77, 89, 0.4)",          // Dark gray with violet tint, low opacity
            c2: "rgba(64, 64, 77, 0.35)",         // Darker gray, more transparent
            c3: "rgba(51, 51, 64, 0.3)",          // Almost black, very transparent
          },
          animationDuration: 40,  // Very slow
        };
      
      case 'connecting':
      case 'syncing':
        return {
          colors: {
            bg: "rgba(26, 26, 26, 0.7)",          // Dark background with medium transparency
            c1: "rgba(109, 62, 216, 0.8)",        // Dark violet with some transparency
            c2: "rgba(124, 77, 226, 0.85)",       // Medium violet, slightly more opaque
            c3: "rgba(79, 42, 186, 0.75)",        // Deep violet, more transparent
          },
          animationDuration: 15,  // Medium speed
        };
      
      case 'online':
        return {
          colors: {
            bg: "rgba(26, 26, 26, 0.9)",          // Dark background, mostly opaque
            c1: "rgba(139, 92, 246, 1)",          // Main violet #8B5CF6 (full opacity)
            c2: "rgba(168, 130, 255, 1)",         // Light violet - harmonious shade
            c3: "rgba(109, 62, 216, 0.95)",       // Dark violet, slight transparency
          },
          animationDuration: 20,  // Normal speed
        };
      
      case 'thinking':
        return {
          colors: {
            bg: "rgba(26, 26, 26, 0.85)",         // Dark background, slightly transparent
            c1: "rgba(168, 130, 255, 1)",         // Light violet (full opacity)
            c2: "rgba(139, 92, 246, 0.95)",       // Main violet, slight transparency
            c3: "rgba(124, 77, 226, 0.9)",        // Medium-dark violet, more transparent
          },
          animationDuration: 8,   // Fast
        };
      
      case 'responding':
        return {
          colors: {
            bg: "rgba(26, 26, 26, 0.85)",         // Dark background, slightly transparent
            c1: "rgba(242, 242, 242, 0.95)",      // White accent with slight transparency
            c2: "rgba(139, 92, 246, 1)",          // Violet #8B5CF6 (full opacity)
            c3: "rgba(230, 230, 230, 0.9)",       // Light white with transparency
          },
          animationDuration: 10,  // Fast
        };
      
      case 'error':
        return {
          colors: {
            bg: "rgba(38, 26, 26, 0.8)",          // Dark with red tint, transparent
            c1: "rgba(255, 107, 107, 0.9)",       // Bright red with transparency
            c2: "rgba(220, 83, 83, 0.85)",        // Dark red, more transparent
            c3: "rgba(204, 68, 68, 0.8)",         // Muted red, even more transparent
          },
          animationDuration: 25,  // Slow
        };
      
      case 'no_agent':
        return {
          colors: {
            bg: "rgba(31, 31, 31, 0.6)",          // Very dark, more transparent
            c1: "rgba(78, 42, 142, 0.5)",         // Very dark violet, half transparent
            c2: "rgba(69, 37, 125, 0.45)",        // Even darker violet, more transparent
            c3: "rgba(59, 32, 108, 0.4)",         // Almost black violet, very transparent
          },
          animationDuration: 35,  // Very slow
        };
      
      default:
        return {
          colors: {
            bg: "rgba(26, 26, 26, 0.9)",          // Dark background, mostly opaque
            c1: "rgba(139, 92, 246, 1)",          // Main violet (full opacity)
            c2: "rgba(168, 130, 255, 1)",         // Light violet - harmonious shade
            c3: "rgba(109, 62, 216, 0.95)",       // Dark violet, slight transparency
          },
          animationDuration: 20,
        };
    }
  };

  // Status text content - returns JSX for formatted display
  const getStatusContent = () => {
    switch (status) {
      case 'uninitialized':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#F97316'}}>initializing</span>
            </div>
            <div style={{fontSize: '14px'}}>Starting up</div>
          </>
        );
      case 'connecting':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#FCD34D'}}>connecting</span>
            </div>
            <div style={{fontSize: '14px'}}>Connecting{dots}</div>
          </>
        );
      case 'syncing':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#FCD34D'}}>syncing</span>
            </div>
            <div style={{fontSize: '14px'}}>Syncing{dots}</div>
          </>
        );
      case 'online':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.8, marginBottom: '2px'}}>
              <span style={{color: '#10B981'}}>connected</span>
            </div>
            <div style={{fontSize: '14px', fontWeight: 600}}>
              <span style={{color: '#FFFFFF'}}>{agentName || 'Agent'}</span>
              {intelligenceLevel > 0 && (
                <span style={{color: '#FFFFFF'}}> ~ iq:{intelligenceLevel}</span>
              )}
            </div>
          </>
        );
      case 'thinking':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#A855F7'}}>processing</span>
            </div>
            <div style={{fontSize: '14px'}}>Thinking...</div>
          </>
        );
      case 'responding':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#A855F7'}}>generating</span>
            </div>
            <div style={{fontSize: '14px'}}>Responding...</div>
          </>
        );
      case 'error':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#EF4444'}}>failed</span>
            </div>
            <div style={{fontSize: '14px', color: '#FCA5A5'}}>
              {syncProgress || 'Connection error'}
            </div>
          </>
        );
      case 'no_agent':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>empty</span>
            </div>
            <div style={{fontSize: '13px', color: '#9CA3AF'}}>No agent minted</div>
          </>
        );
      default:
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>status:</span>
            </div>
            <div style={{fontSize: '12px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>standby</span>
            </div>
            <div style={{fontSize: '14px'}}>Waiting...</div>
          </>
        );
    }
  };


  const orbConfig = getOrbConfig();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 0',
      position: 'relative',
      minHeight: parseInt(getOrbSize()) + 120,
    }}>
      {/* Welcome message */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center',
        color: '#9999A5',
        fontSize: isMobile ? '14px' : '16px',
        fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
        letterSpacing: '0.02em',
        opacity: 0.8,
      }}>
        Welcome to aishiOS terminal. Type 'help' for available commands.
      </div>

      {/* Orb Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Siri Orb */}
        <SiriOrb
          size={getOrbSize()}
          colors={orbConfig.colors}
          animationDuration={orbConfig.animationDuration}
          className="drop-shadow-2xl"
        />

        {/* Status text overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
          textShadow: `0 0 20px rgba(0, 0, 0, 0.9)`,
          pointerEvents: 'none',
          color: '#FFFFFF',
        }}>
          {getStatusContent()}
        </div>
      </div>

      {/* Sub-status for no agent */}
      {status === 'no_agent' && (
        <div style={{
          marginTop: '1.5rem',
          color: '#9999A5',
          fontSize: isMobile ? '12px' : '14px',
          fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
          opacity: 0.7,
        }}>
          Type 'mint' to create your first agent
        </div>
      )}

      {/* Additional glow effect for active states */}
      {(status === 'thinking' || status === 'responding') && (
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          
          .drop-shadow-2xl {
            filter: drop-shadow(0 25px 25px rgba(139, 92, 246, 0.25));
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  );
};

export default AIOrb;