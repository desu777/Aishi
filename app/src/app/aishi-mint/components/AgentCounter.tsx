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
      gap: theme.spacing.xl,
    }}>
      {/* Counter Display */}
      <div style={{
        textAlign: 'center',
        padding: theme.spacing.xl,
      }}>
        <div style={{
          fontSize: theme.typography.fontSizes.xxl,
          fontWeight: theme.typography.fontWeights.bold,
          color: theme.accent.primary,
          fontFamily: theme.typography.fontFamilies.monospace,
          marginBottom: theme.spacing.sm,
        }}>
          {agentsRemaining}
        </div>
        
        <div style={{
          fontSize: theme.typography.fontSizes.sm,
          color: theme.text.secondary,
          marginBottom: theme.spacing.xl,
        }}>
          Agents Remaining
        </div>
        
        {/* Progress Bar */}
        <div style={{
          width: '200px',
          height: '8px',
          backgroundColor: `${theme.bg.primary}88`,
          borderRadius: theme.radius.sm,
          overflow: 'hidden',
          marginBottom: theme.spacing.sm,
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: theme.accent.primary,
            transition: theme.effects.transitions.normal,
          }} />
        </div>
        
        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          fontSize: theme.typography.fontSizes.xs,
          color: theme.text.secondary,
        }}>
          <FiUsers />
          <span>{agentsMinted} / {maxAgents} minted</span>
        </div>
      </div>
    </div>
  );
}