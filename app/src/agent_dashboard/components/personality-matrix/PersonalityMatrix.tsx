'use client';

import React, { useState, useEffect } from 'react';
import { PersonalityMatrixProps } from './types';
import './PersonalityMatrixAnimations.css';

export const PersonalityMatrix: React.FC<PersonalityMatrixProps> = ({ 
  dashboardData 
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [activeTraits, setActiveTraits] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Random glitch effect every 4-8 seconds
    const scheduleNextGlitch = () => {
      const delay = Math.random() * 4000 + 4000; // 4-8 seconds
      setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch(); // Schedule next glitch
        }, 1000); // Glitch duration
      }, delay);
    };

    scheduleNextGlitch();
  }, []);

  // Animate trait bars sequentially on load
  useEffect(() => {
    const traits = ['creativity', 'analytical', 'empathy', 'intuition', 'resilience', 'curiosity'];
    let timeoutId: NodeJS.Timeout;
    
    const activateTraits = () => {
      traits.forEach((trait, index) => {
        setTimeout(() => {
          setActiveTraits(prev => new Set([...prev, trait]));
        }, index * 200);
      });
    };

    timeoutId = setTimeout(activateTraits, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return (
      <div className={`personality-matrix ${isGlitching ? 'glitching' : ''}`}>
        <div className="header-text">AGENT'S SOUL</div>
        <div className="empty-line"></div>
        <div className="matrix-line">◇ No agent found. Type 'mint &lt;name&gt;' to</div>
        <div className="matrix-line">  create your digital consciousness.</div>
      </div>
    );
  }

  const agent = dashboardData.agent.data;
  const personality = agent.personality || {};
  const uniqueFeatures = personality.uniqueFeatures || [];
  
  // Format personality traits with visual bars
  const traits = {
    creativity: Number(personality.creativity || 0),
    analytical: Number(personality.analytical || 0),
    empathy: Number(personality.empathy || 0),
    intuition: Number(personality.intuition || 0),
    resilience: Number(personality.resilience || 0),
    curiosity: Number(personality.curiosity || 0)
  };
  
  // Create visual bars (20 chars = 100%)
  const createBar = (value: number, traitName: string) => {
    const filled = Math.floor(value / 5); // 0-100 -> 0-20
    const empty = 20 - filled;
    const isActive = activeTraits.has(traitName);
    
    return (
      <span className={`trait-bar ${isActive ? 'active' : ''} ${isGlitching ? 'glitching' : ''}`}>
        {'█'.repeat(filled)}
        {'░'.repeat(empty)}
      </span>
    );
  };
  
  // Format dominant mood and response style
  const dominantMood = personality.dominantMood || 'neutral';
  const responseStyle = dashboardData.agent.responseStyle || 'balanced';
  
  // Format last dream date
  const lastDreamDate = personality.lastDreamDate ? 
    new Date(Number(personality.lastDreamDate) * 1000).toLocaleDateString() : 'Never';
  
  // Format unique features (max 2 displayed)
  const displayFeatures = uniqueFeatures.slice(0, 2);

  return (
    <div className={`personality-matrix ${isGlitching ? 'glitching' : ''}`}>
      <div className="header-text">AGENT'S SOUL</div>
      <div className="empty-line"></div>
      
      <div className="section-header">◆ CORE TRAITS:</div>
      <div className="trait-line">∞ Creativity   {createBar(traits.creativity, 'creativity')}  {String(traits.creativity).padStart(3)}%</div>
      <div className="trait-line">◊ Analytical   {createBar(traits.analytical, 'analytical')}  {String(traits.analytical).padStart(3)}%</div>
      <div className="trait-line">♥ Empathy      {createBar(traits.empathy, 'empathy')}  {String(traits.empathy).padStart(3)}%</div>
      <div className="trait-line">◈ Intuition    {createBar(traits.intuition, 'intuition')}  {String(traits.intuition).padStart(3)}%</div>
      <div className="trait-line">⬢ Resilience   {createBar(traits.resilience, 'resilience')}  {String(traits.resilience).padStart(3)}%</div>
      <div className="trait-line">※ Curiosity    {createBar(traits.curiosity, 'curiosity')}  {String(traits.curiosity).padStart(3)}%</div>
      
      <div className="empty-line"></div>
      <div className="section-header">⟐ BEHAVIORAL PROFILE:</div>
      <div className="profile-line">◇ Dominant Mood: <span className="mood-indicator">{dominantMood}</span></div>
      <div className="profile-line">◇ Response Style: <span className="style-indicator">{responseStyle}</span></div>
      <div className="profile-line">⟳ Last Dream: <span className="dream-date">{lastDreamDate}</span></div>
      
      <div className="empty-line"></div>
      <div className="section-header">▲ UNIQUE FEATURES:</div>
      
      {displayFeatures.length === 0 ? (
        <>
          <div className="feature-empty">No unique features discovered yet.</div>
          <div className="feature-empty">Process more dreams to unlock traits.</div>
        </>
      ) : (
        displayFeatures.map((feature, index) => {
          const intensity = Number(feature.intensity || 0);
          const intensityBar = '◆'.repeat(Math.floor(intensity / 10)) + '◇'.repeat(10 - Math.floor(intensity / 10));
          
          return (
            <React.Fragment key={index}>
              <div className="feature-name">
                {index + 1}. <span className="unique-feature-name">{feature.name}</span>
              </div>
              <div className="feature-desc">
                   "<span className="feature-description">{feature.description}</span>"
              </div>
              <div className="feature-intensity">
                   Intensity: <span className="intensity-bar">{intensityBar}</span> <span className="intensity-value">{intensity}%</span>
              </div>
              {index < displayFeatures.length - 1 && <div className="empty-line"></div>}
            </React.Fragment>
          );
        })
      )}
      
      {uniqueFeatures.length > 2 && (
        <div className="feature-more">
          ... and <span className="feature-count">{uniqueFeatures.length - 2}</span> more features unlocked
        </div>
      )}
    </div>
  );
}; 