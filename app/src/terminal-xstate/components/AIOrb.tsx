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

  // Determine orb size based on device (further reduced sizes for more space)
  const getOrbSize = () => {
    if (isMobile) return "100px";
    if (isTablet) return "130px";
    return "150px";
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




  const orbConfig = getOrbConfig();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 0',
      position: 'relative',
    }}>
      {/* Welcome message */}
      <div style={{
        marginBottom: '1rem',
        textAlign: 'center',
        color: '#9999A5',
        fontSize: isMobile ? '14px' : '16px',
        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        letterSpacing: '0.02em',
        opacity: 0.8,
        lineHeight: '1.4',
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


      </div>



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