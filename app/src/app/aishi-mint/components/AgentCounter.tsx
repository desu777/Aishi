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
          fontSize: `clamp(${theme.typography.fontSizes.xl}, 6vw, ${theme.typography.fontSizes.xxl})`,
          fontWeight: theme.typography.fontWeights.bold,
          color: theme.accent.primary,
          fontFamily: theme.typography.fontFamilies.monospace,
          marginBottom: theme.spacing.sm,
          lineHeight: 1,
        }}>
          {agentsRemaining}
        </div>
        
        <div style={{
          fontSize: `clamp(${theme.typography.fontSizes.xs}, 3vw, ${theme.typography.fontSizes.sm})`,
          color: theme.text.secondary,
          marginBottom: `clamp(${theme.spacing.md}, 3vw, ${theme.spacing.xl})`,
        }}>
          Agents Remaining
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
          <span style={{
            fontSize: `clamp(11px, 2.5vw, ${theme.typography.fontSizes.xs})`,
          }}>{agentsMinted} / {maxAgents} minted</span>
        </div>
      </div>
    </div>
  );
}