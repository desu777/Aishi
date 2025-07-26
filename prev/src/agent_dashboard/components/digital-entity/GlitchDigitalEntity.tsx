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
        <div className="header-text">DIGITAL ENTITY</div>
        <div className="empty-line"></div>
        <div className="data-line">◇ No agent found. Use 'mint &lt;name&gt;' to</div>
        <div className="data-line">  create your digital entity.</div>
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

  // Format clean display values
  const agentName = agent.agentName;
  const tokenId = `#${String(dashboardData.agent.tokenId).padStart(3, '0')}`;
  const intLevel = `${intelligenceLevel} LVL`;

  return (
    <div className={`digital-entity ${isGlitching ? 'glitching' : ''}`}>
      <div className="header-text">DIGITAL ENTITY</div>
      <div className="empty-line"></div>
      
      <div className="data-line">◇ NAME: {agentName}</div>
      <div className="data-line">◇ ID: {tokenId}</div>
      <div className="data-line">※ OWNER: {ownerShort}</div>
      <div className="data-line">⬢ INTELLIGENCE: {intLevel}</div>
      <div className="data-line">◈ CREATED: {createdDate}</div>
      <div className="data-line">⟐ STATUS: <span className="status-indicator">{statusIcon}</span></div>
      
      <div className="empty-line"></div>
      <div className={`neural-activity ${isGlitching ? 'glitching' : ''}`}>▲ NEURAL ACTIVITY:</div>
      <div className="data-line">  ◊ Dreams: {dreamCount}</div>
      <div className="data-line">  ※ Conversations: {conversationCount}</div>
      <div className="data-line">  ⟳ Evolutions: {totalEvolutions}</div>
      <div className="data-line">  ◆ Last Update: {timeAgo}</div>
    </div>
  );
};