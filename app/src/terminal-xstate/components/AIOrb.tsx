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
            bg: "oklch(0.10 0 0)",                // Very dark gray
            c1: "oklch(0.30 0.01 292.72)",        // Dark gray with slight violet
            c2: "oklch(0.25 0.01 292.72)",        // Darker gray
            c3: "oklch(0.20 0.01 292.72)",        // Almost black
          },
          animationDuration: 40,  // Very slow
        };
      
      case 'connecting':
      case 'syncing':
        return {
          colors: {
            bg: "oklch(0.10 0.01 292.72)",        // Dark background
            c1: "oklch(0.45 0.2189 292.72)",      // Dark violet
            c2: "oklch(0.50 0.2189 292.72)",      // Medium violet
            c3: "oklch(0.40 0.2189 292.72)",      // Very dark violet
          },
          animationDuration: 15,  // Medium speed
        };
      
      case 'online':
        return {
          colors: {
            bg: "oklch(0.10 0.01 292.72)",        // Dark background with violet tint
            c1: "oklch(0.6056 0.2189 292.72)",    // Violet #8B5CF6 (exact)
            c2: "oklch(0.6294 0.2189 292.72)",    // Lightest violet
            c3: "oklch(0.55 0.2189 292.72)",      // Slightly darker violet
          },
          animationDuration: 20,  // Normal speed
        };
      
      case 'thinking':
        return {
          colors: {
            bg: "oklch(0.10 0.01 292.72)",        // Dark background
            c1: "oklch(0.6294 0.2189 292.72)",    // Brightest violet
            c2: "oklch(0.6056 0.2189 292.72)",    // Normal violet
            c3: "oklch(0.58 0.2189 292.72)",      // Between normal and bright
          },
          animationDuration: 8,   // Fast
        };
      
      case 'responding':
        return {
          colors: {
            bg: "oklch(0.10 0.01 292.72)",        // Dark background
            c1: "oklch(0.95 0 0)",                 // White accent instead of cyan
            c2: "oklch(0.6056 0.2189 292.72)",    // Violet #8B5CF6
            c3: "oklch(0.90 0 0)",                 // Light white instead of cyan-blue
          },
          animationDuration: 10,  // Fast
        };
      
      case 'error':
        return {
          colors: {
            bg: "oklch(0.15 0.01 0)",        // Dark with no hue
            c1: "oklch(0.60 0.25 25)",       // Red
            c2: "oklch(0.55 0.20 15)",       // Dark red
            c3: "oklch(0.50 0.15 20)",       // Muted red
          },
          animationDuration: 25,  // Slow
        };
      
      case 'no_agent':
        return {
          colors: {
            bg: "oklch(0.12 0 0)",                // Very dark
            c1: "oklch(0.40 0.2189 292.72)",      // Very dark violet
            c2: "oklch(0.35 0.2189 292.72)",      // Even darker violet
            c3: "oklch(0.30 0.2189 292.72)",      // Almost black violet
          },
          animationDuration: 35,  // Very slow
        };
      
      default:
        return {
          colors: {
            bg: "oklch(0.10 0.01 292.72)",
            c1: "oklch(0.6056 0.2189 292.72)",    // Normal violet
            c2: "oklch(0.6294 0.2189 292.72)",    // Brightest violet
            c3: "oklch(0.55 0.2189 292.72)",      // Slightly darker violet
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
              <span style={{color: '#6B7280'}}>$status: </span>
              <span style={{color: '#F97316'}}>initializing</span>
            </div>
            <div style={{fontSize: '14px'}}>Starting up</div>
          </>
        );
      case 'connecting':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>$status: </span>
              <span style={{color: '#FCD34D'}}>connecting</span>
            </div>
            <div style={{fontSize: '14px'}}>Connecting{dots}</div>
          </>
        );
      case 'syncing':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>$status: </span>
              <span style={{color: '#FCD34D'}}>syncing</span>
            </div>
            <div style={{fontSize: '14px'}}>Syncing{dots}</div>
          </>
        );
      case 'online':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.7, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>$status: </span>
              <span style={{color: '#10B981'}}>connected</span>
            </div>
            <div style={{fontSize: '14px', fontWeight: 600}}>
              <span style={{color: '#FFFFFF'}}>{agentName || 'Agent'}</span>
              {intelligenceLevel > 0 && (
                <span style={{color: '#FFFFFF'}}> | lvl {intelligenceLevel}</span>
              )}
            </div>
          </>
        );
      case 'thinking':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>$status: </span>
              <span style={{color: '#A855F7'}}>processing</span>
            </div>
            <div style={{fontSize: '14px'}}>Thinking...</div>
          </>
        );
      case 'responding':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>$status: </span>
              <span style={{color: '#00D2E9'}}>generating</span>
            </div>
            <div style={{fontSize: '14px'}}>Responding...</div>
          </>
        );
      case 'error':
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>$status: </span>
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
              <span style={{color: '#6B7280'}}>$status: </span>
              <span style={{color: '#6B7280'}}>empty</span>
            </div>
            <div style={{fontSize: '13px', color: '#9CA3AF'}}>No agent minted</div>
          </>
        );
      default:
        return (
          <>
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '2px'}}>
              <span style={{color: '#6B7280'}}>$status: </span>
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