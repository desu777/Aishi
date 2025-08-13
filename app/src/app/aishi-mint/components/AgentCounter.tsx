'use client';

import { useTheme } from '../../../contexts/ThemeContext';
import { FiUsers } from 'react-icons/fi';

interface AgentCounterProps {
  agentsMinted: number;
  agentsRemaining: number;
  maxAgents: number;
}

export default function AgentCounter({ 
  agentsMinted, 
  agentsRemaining, 
  maxAgents 
}: AgentCounterProps) {
  const { theme } = useTheme();
  
  // Calculate percentage for progress bar
  const percentage = (agentsMinted / maxAgents) * 100;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    }}>
      {/* Counter Display */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: theme.accent.primary,
          fontFamily: "'Space Grotesk', monospace",
          marginBottom: '10px',
        }}>
          {agentsRemaining}
        </div>
        
        <div style={{
          fontSize: '14px',
          color: theme.text.secondary,
          marginBottom: '20px',
        }}>
          Agents Remaining
        </div>
        
        {/* Progress Bar */}
        <div style={{
          width: '200px',
          height: '8px',
          backgroundColor: `${theme.bg.primary}88`,
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '10px',
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: theme.accent.primary,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        
        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12px',
          color: theme.text.secondary,
        }}>
          <FiUsers />
          <span>{agentsMinted} / {maxAgents} minted</span>
        </div>
      </div>
    </div>
  );
}