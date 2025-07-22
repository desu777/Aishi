'use client';

import React, { useState, useEffect } from 'react';
import { GlitchDigitalEntityProps } from './types';
import './DigitalEntityAnimations.css';

export const GlitchDigitalEntity: React.FC<GlitchDigitalEntityProps> = ({ 
  dashboardData 
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Random glitch effect every 3-7 seconds
    const scheduleNextGlitch = () => {
      const delay = Math.random() * 4000 + 3000; // 3-7 seconds
      setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch(); // Schedule next glitch
        }, 800); // Glitch duration
      }, delay);
    };

    scheduleNextGlitch();
  }, []);

  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return (
      <div className={`digital-entity ${isGlitching ? 'glitching' : ''}`}>
        {`╔══════════════════════════════════════════════╗
║              DIGITAL ENTITY                  ║
╠══════════════════════════════════════════════╣
║                                              ║
║  No agent found. Use 'mint <name>' to       ║
║  create your digital entity.                 ║
║                                              ║
╚══════════════════════════════════════════════╝`}
      </div>
    );
  }

  const agent = dashboardData.agent.data;
  
  // Format creation date
  const createdDate = new Date(Number(agent.createdAt) * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Format last update - time ago
  const lastUpdated = Number(agent.lastUpdated) * 1000;
  const now = Date.now();
  const timeDiff = now - lastUpdated;
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;

  // Format shortened owner address
  const ownerShort = `${agent.owner.slice(0, 6)}...${agent.owner.slice(-4)}`;

  // Status indicator based on personality initialization
  const statusIcon = agent.personalityInitialized ? '●' : '○';
  
  // Format activity stats
  const dreamCount = Number(agent.dreamCount || 0);
  const conversationCount = Number(agent.conversationCount || 0);
  const totalEvolutions = Number(agent.totalEvolutions || 0);
  const intelligenceLevel = Number(agent.intelligenceLevel || 0);

  // Pad strings to maintain box alignment
  const padName = agent.agentName.padEnd(22);
  const padId = `#${String(dashboardData.agent.tokenId).padStart(3, '0')}`;
  const padOwner = ownerShort.padEnd(20);
  const padInt = `${intelligenceLevel} LVL`.padStart(6);
  const padCreated = createdDate.padEnd(18);
  const padStatus = `${statusIcon}`;

  const content = `╔══════════════════════════════════════════════╗
║              DIGITAL ENTITY                  ║
╠══════════════════════════════════════════════╣
║                                              ║
║  NAME: ${padName} ID: ${padId}      ║
║  OWNER: ${padOwner} INT: ${padInt}  ║
║  CREATED: ${padCreated} STATUS: ${padStatus}    ║
║                                              ║
║  NEURAL ACTIVITY:                            ║
║  ├─ Dreams: ${String(dreamCount).padEnd(30)}║
║  ├─ Conversations: ${String(conversationCount).padEnd(24)}║
║  ├─ Evolutions: ${String(totalEvolutions).padEnd(27)}║
║  └─ Last Update: ${timeAgo.padEnd(25)}║
║                                              ║
╚══════════════════════════════════════════════╝`;

  return (
    <div className={`digital-entity ${isGlitching ? 'glitching' : ''}`}>
      {content.split('\n').map((line, index) => {
        if (line.includes('DIGITAL ENTITY')) {
          return <div key={index} className="header-text">{line}</div>;
        } else if (line.includes('NEURAL ACTIVITY')) {
          return <div key={index} className={`neural-activity ${isGlitching ? 'glitching' : ''}`}>{line}</div>;
        } else if (line.includes('├─') || line.includes('└─')) {
          return <div key={index} className="data-line">{line}</div>;
        } else if (line.includes('STATUS:')) {
          const statusParts = line.split(statusIcon);
          return (
            <div key={index} className="data-line">
              {statusParts[0]}
              <span className="status-indicator">{statusIcon}</span>
              {statusParts[1]}
            </div>
          );
        }
        return <div key={index}>{line}</div>;
      })}
    </div>
  );
};