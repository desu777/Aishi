/**
 * @fileoverview Helper functions for formatting agent data in terminal
 * @description Provides utilities for displaying agent information with theme colors
 */

import React from 'react';
import { TerminalLine } from '../machines/types';
import { CompleteAgentData } from './contractReader';

// Theme colors matching ThemeContext
const colors = {
  primary: '#E6E6E6',      // text.primary
  secondary: '#9999A5',    // text.secondary
  accent: '#8B5CF6',       // accent.primary (violet)
  success: '#10B981',      // accent.success
  background: '#2D2D2D',   // bg for empty progress
  bar: '#8B5CF6',          // filled progress bar
  barEmpty: '#333333',     // empty progress bar
  highest: '#10B981',      // highlight color for highest trait
};

/**
 * Creates a colored progress bar for trait visualization
 */
function createColoredProgressBar(value: number, isHighest: boolean = false, max: number = 100): React.ReactNode {
  const barLength = 10;
  const filled = Math.round((value / max) * barLength);
  const empty = barLength - filled;
  
  const barColor = isHighest ? colors.highest : colors.bar;
  
  return (
    <>
      <span style={{ color: barColor }}>{'█'.repeat(filled)}</span>
      <span style={{ color: colors.barEmpty }}>{'░'.repeat(empty)}</span>
    </>
  );
}

/**
 * Formats personality traits for terminal display
 */
export function formatPersonalityOutput(agentData: CompleteAgentData | null): TerminalLine[] {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
    console.log('[formatPersonalityOutput] Called with data:', !!agentData);
    if (agentData) {
      console.log('[formatPersonalityOutput] Personality data:', agentData.personality);
    }
  }
  
  const timestamp = Date.now();
  
  if (!agentData) {
    return [{
      type: 'error',
      content: 'No agent found. Please mint an agent first.',
      timestamp
    }];
  }

  const lines: TerminalLine[] = [];

  // Traits with progress bars
  const traits = [
    { name: 'Creativity', value: agentData.personality.creativity },
    { name: 'Analytical', value: agentData.personality.analytical },
    { name: 'Empathy', value: agentData.personality.empathy },
    { name: 'Intuition', value: agentData.personality.intuition },
    { name: 'Resilience', value: agentData.personality.resilience },
    { name: 'Curiosity', value: agentData.personality.curiosity }
  ];

  // Find highest trait
  const maxTrait = traits.reduce((max, trait) => 
    trait.value > max.value ? trait : max, traits[0]);

  traits.forEach((trait, index) => {
    const isHighest = trait.value === maxTrait.value && trait.value > 50;
    const bar = createColoredProgressBar(trait.value, isHighest);
    
    const content = (
      <>
        <span style={{ color: colors.primary, fontWeight: '500' }}>
          {trait.name.padEnd(12)}
        </span>
        <span style={{ marginLeft: '8px', marginRight: '8px' }}>{bar}</span>
        <span style={{ color: colors.accent, fontWeight: '600' }}>
          {String(trait.value).padStart(3)}
        </span>
        <span style={{ color: colors.secondary }}>/100</span>
        {isHighest && (
          <span style={{ 
            color: colors.highest, 
            fontWeight: '500',
            marginLeft: '8px'
          }}>
            ★ highest
          </span>
        )}
      </>
    );
    
    lines.push({
      type: 'info',
      content,
      timestamp: timestamp + 1 + index
    });
  });

  // Empty line
  lines.push({
    type: 'info',
    content: '',
    timestamp: timestamp + 7
  });

  // Dominant mood
  const moodContent = (
    <>
      <span style={{ color: colors.secondary }}>Dominant Mood: </span>
      <span style={{ 
        color: colors.accent, 
        fontWeight: '600',
        textTransform: 'capitalize'
      }}>
        {agentData.personality.dominantMood}
      </span>
    </>
  );
  
  lines.push({
    type: 'info',
    content: moodContent,
    timestamp: timestamp + 8
  });

  // Response style
  const responseStyle = agentData.computed?.responseStyle || agentData.cachedResponseStyle || 'balanced thinker';
  const styleContent = (
    <>
      <span style={{ color: colors.secondary }}>Response Style: </span>
      <span style={{ 
        color: colors.success, 
        fontWeight: '600',
        fontStyle: 'italic'
      }}>
        {responseStyle}
      </span>
    </>
  );
  
  lines.push({
    type: 'info',
    content: styleContent,
    timestamp: timestamp + 9
  });

  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
    console.log('[formatPersonalityOutput] Returning lines:', lines.length);
    console.log('[formatPersonalityOutput] First line:', lines[0]);
  }

  return lines;
}

/**
 * Formats unique features for terminal display
 */
export function formatUniqueFeaturesOutput(agentData: CompleteAgentData | null): TerminalLine[] {
  const timestamp = Date.now();
  
  if (!agentData) {
    return [{
      type: 'error',
      content: 'No agent found. Please mint an agent first.',
      timestamp
    }];
  }

  const lines: TerminalLine[] = [];
  
  // Header
  lines.push({
    type: 'info',
    content: '╭─ Unique Features ───────────────────────────╮',
    timestamp: timestamp + 1
  });

  if (!agentData.features || agentData.features.length === 0) {
    lines.push({
      type: 'info',
      content: '│ No unique features yet                     │',
      timestamp: timestamp + 2
    });
    lines.push({
      type: 'info',
      content: '│ Features emerge through dream evolution    │',
      timestamp: timestamp + 3
    });
  } else {
    let lineNum = 2;
    agentData.features.forEach((feature, index) => {
      if (index > 0) {
        // Empty line between features
        lines.push({
          type: 'info',
          content: '│                                             │',
          timestamp: timestamp + lineNum++
        });
      }

      // Feature name with star
      lines.push({
        type: 'info',
        content: `│ ★ ${feature.name.padEnd(41)} │`,
        timestamp: timestamp + lineNum++
      });

      // Intensity
      lines.push({
        type: 'info',
        content: `│   Intensity: ${String(feature.intensity).padStart(3)}/100                       │`,
        timestamp: timestamp + lineNum++
      });

      // Description (word wrap at ~40 chars)
      const words = feature.description.split(' ');
      let currentLine = '   ';
      words.forEach(word => {
        if (currentLine.length + word.length > 42) {
          lines.push({
            type: 'info',
            content: `│ ${currentLine.padEnd(43)} │`,
            timestamp: timestamp + lineNum++
          });
          currentLine = '   ';
        }
        currentLine += word + ' ';
      });
      
      if (currentLine.trim()) {
        lines.push({
          type: 'info',
          content: `│ ${currentLine.padEnd(43)} │`,
          timestamp: timestamp + lineNum++
        });
      }
    });
  }

  // Footer
  lines.push({
    type: 'info',
    content: '╰─────────────────────────────────────────────╯',
    timestamp: timestamp + lines.length + 1
  });

  return lines;
}

/**
 * Formats agent stats for terminal display
 */
export function formatStatsOutput(agentData: CompleteAgentData | null): TerminalLine[] {
  const timestamp = Date.now();
  
  if (!agentData) {
    return [{
      type: 'error',
      content: 'No agent found. Please mint an agent first.',
      timestamp
    }];
  }

  const lines: TerminalLine[] = [];
  
  // Header
  lines.push({
    type: 'info',
    content: '╭─ Agent Statistics ──────────────────────────╮',
    timestamp: timestamp + 1
  });

  // Basic info
  lines.push({
    type: 'info',
    content: `│ Name: ${agentData.basic.agentName.padEnd(38)} │`,
    timestamp: timestamp + 2
  });

  lines.push({
    type: 'info',
    content: `│ Token ID: #${String(agentData.tokenId).padEnd(33)} │`,
    timestamp: timestamp + 3
  });

  // Empty line
  lines.push({
    type: 'info',
    content: '│                                             │',
    timestamp: timestamp + 4
  });

  // Intelligence
  lines.push({
    type: 'info',
    content: `│ Intelligence Level: ${String(agentData.basic.intelligenceLevel).padStart(3)} ⚡                  │`,
    timestamp: timestamp + 5
  });

  // Dreams
  const nextEvolution = Math.ceil((agentData.basic.dreamCount + 1) / 5) * 5;
  const dreamsToEvolve = nextEvolution - agentData.basic.dreamCount;
  lines.push({
    type: 'info',
    content: `│ Dreams: ${String(agentData.basic.dreamCount).padStart(3)} (next evolution: ${dreamsToEvolve})          │`,
    timestamp: timestamp + 6
  });

  // Conversations
  const nextIntBoost = Math.ceil((agentData.basic.conversationCount + 1) / 10) * 10;
  const convosToBoost = nextIntBoost - agentData.basic.conversationCount;
  lines.push({
    type: 'info',
    content: `│ Conversations: ${String(agentData.basic.conversationCount).padStart(3)} (next boost: ${convosToBoost})       │`,
    timestamp: timestamp + 7
  });

  // Evolution stats
  if (agentData.evolutionStats) {
    lines.push({
      type: 'info',
      content: `│ Total Evolutions: ${String(agentData.evolutionStats.totalEvolutions).padStart(3)}                       │`,
      timestamp: timestamp + 8
    });

    lines.push({
      type: 'info',
      content: `│ Evolution Rate: ${String(agentData.evolutionStats.evolutionRate).padStart(3)}% per day              │`,
      timestamp: timestamp + 9
    });
  }

  // Milestones
  if (agentData.basic.achievedMilestones && agentData.basic.achievedMilestones.length > 0) {
    lines.push({
      type: 'info',
      content: '│                                             │',
      timestamp: timestamp + 10
    });

    lines.push({
      type: 'info',
      content: '│ Achieved Milestones:                       │',
      timestamp: timestamp + 11
    });

    agentData.basic.achievedMilestones.forEach((milestone, index) => {
      lines.push({
        type: 'info',
        content: `│ ✓ ${milestone.padEnd(41)} │`,
        timestamp: timestamp + 12 + index
      });
    });
  }

  // Footer
  lines.push({
    type: 'info',
    content: '╰─────────────────────────────────────────────╯',
    timestamp: timestamp + lines.length + 1
  });

  return lines;
}