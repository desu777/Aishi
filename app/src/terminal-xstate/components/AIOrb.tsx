/**
 * @fileoverview AI Orb component - Visual representation of the AI agent's consciousness
 * @description Siri-style animated orb that responds to agent states with Aishi colors
 */

import React, { useEffect, useState } from 'react';
import SiriOrb from './SiriOrb';

interface AIorbProps {
  status: 'uninitialized' | 'connecting' | 'syncing' | 'online' | 'thinking' | 'responding' | 'error' | 'no_agent';
  agentName?: string | null;
  syncProgress?: string;
  isMobile?: boolean;
  isTablet?: boolean;
}

const AIOrb: React.FC<AIorbProps> = ({ 
  status, 
  agentName, 
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

  // Determine orb size based on device
  const getOrbSize = () => {
    if (isMobile) return "140px";
    if (isTablet) return "180px";
    return "220px";
  };

  // Get colors and animation speed based on status
  const getOrbConfig = () => {
    switch (status) {
      case 'uninitialized':
        return {
          colors: {
            bg: "oklch(10% 0 0)",           // Very dark gray
            c1: "oklch(30% 0.02 264)",      // Dark gray
            c2: "oklch(25% 0.01 264)",      // Darker gray
            c3: "oklch(20% 0.01 264)",      // Almost black
          },
          animationDuration: 40,  // Very slow
        };
      
      case 'connecting':
      case 'syncing':
        return {
          colors: {
            bg: "oklch(15% 0.01 264)",      // Dark background
            c1: "oklch(65% 0.20 303)",      // Muted violet
            c2: "oklch(70% 0.18 293)",      // Muted purple
            c3: "oklch(60% 0.15 283)",      // Muted light purple
          },
          animationDuration: 15,  // Medium speed
        };
      
      case 'online':
        return {
          colors: {
            bg: "oklch(15% 0.01 264)",      // Dark background
            c1: "oklch(70% 0.25 303)",      // Violet (#8B5CF6)
            c2: "oklch(75% 0.22 293)",      // Purple (#A855F7)
            c3: "oklch(80% 0.18 283)",      // Light Purple (#C084FC)
          },
          animationDuration: 20,  // Normal speed
        };
      
      case 'thinking':
        return {
          colors: {
            bg: "oklch(15% 0.01 264)",      // Dark background
            c1: "oklch(80% 0.28 293)",      // Bright purple
            c2: "oklch(85% 0.25 283)",      // Bright light purple
            c3: "oklch(75% 0.30 303)",      // Bright violet
          },
          animationDuration: 8,   // Fast
        };
      
      case 'responding':
        return {
          colors: {
            bg: "oklch(15% 0.01 264)",      // Dark background
            c1: "oklch(75% 0.20 195)",      // Cyan tint
            c2: "oklch(70% 0.25 303)",      // Violet
            c3: "oklch(85% 0.15 195)",      // Light cyan
          },
          animationDuration: 10,  // Fast
        };
      
      case 'error':
        return {
          colors: {
            bg: "oklch(15% 0.01 0)",        // Dark with no hue
            c1: "oklch(60% 0.25 25)",       // Red
            c2: "oklch(55% 0.20 15)",       // Dark red
            c3: "oklch(50% 0.15 20)",       // Muted red
          },
          animationDuration: 25,  // Slow
        };
      
      case 'no_agent':
        return {
          colors: {
            bg: "oklch(12% 0 0)",           // Very dark
            c1: "oklch(40% 0.05 264)",      // Gray with slight blue
            c2: "oklch(35% 0.03 264)",      // Darker gray
            c3: "oklch(30% 0.02 264)",      // Almost black
          },
          animationDuration: 35,  // Very slow
        };
      
      default:
        return {
          colors: {
            bg: "oklch(15% 0.01 264)",
            c1: "oklch(70% 0.25 303)",
            c2: "oklch(75% 0.22 293)",
            c3: "oklch(80% 0.18 283)",
          },
          animationDuration: 20,
        };
    }
  };

  // Status text content
  const getStatusText = () => {
    switch (status) {
      case 'uninitialized':
        return 'Initializing';
      case 'connecting':
        return `Connecting${dots}`;
      case 'syncing':
        return `Syncing${dots}`;
      case 'online':
        return agentName ? `${agentName} is online` : 'Agent online';
      case 'thinking':
        return 'Thinking';
      case 'responding':
        return 'Responding';
      case 'error':
        return syncProgress || 'Connection failed';
      case 'no_agent':
        return 'No agent';
      default:
        return 'Standby';
    }
  };

  // Get text color based on status
  const getTextColor = () => {
    switch (status) {
      case 'uninitialized':
      case 'no_agent':
        return '#6B7280';  // Gray
      case 'error':
        return '#FCA5A5';  // Light red
      case 'online':
      case 'thinking':
      case 'responding':
        return '#FFFFFF';  // White
      default:
        return '#E6E6E6';  // Light gray
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
          color: getTextColor(),
          fontSize: isMobile ? '13px' : isTablet ? '15px' : '17px',
          fontWeight: 500,
          textAlign: 'center',
          padding: '0 1rem',
          zIndex: 10,
          fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
          letterSpacing: '0.05em',
          textTransform: status === 'no_agent' ? 'uppercase' : 'none',
          textShadow: `0 0 20px rgba(0, 0, 0, 0.8)`,
          pointerEvents: 'none',
        }}>
          {getStatusText()}
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