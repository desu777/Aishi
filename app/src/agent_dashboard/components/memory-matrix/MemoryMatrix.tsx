'use client';

import React, { useState, useEffect } from 'react';
import '../MemoryMatrixAnimations.css';

export interface MemoryMatrixProps {
  dashboardData: any;
}

export const MemoryMatrix: React.FC<MemoryMatrixProps> = ({ 
  dashboardData 
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [activeElements, setActiveElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Random glitch effect every 4-8 seconds
    const scheduleNextGlitch = () => {
      const delay = Math.random() * 4000 + 4000; // 4-8 seconds
      setTimeout(() => {
        setIsGlitching(true);
        setTimeout(() => {
          setIsGlitching(false);
          scheduleNextGlitch(); // Schedule next glitch
        }, 1200); // Glitch duration - longer for memory
      }, delay);
    };

    scheduleNextGlitch();
  }, []);

  // Animate elements sequentially on load
  useEffect(() => {
    const elements = ['header', 'access-bar', 'hierarchy', 'fragments', 'consolidation'];
    let timeoutId: NodeJS.Timeout;
    
    const activateElements = () => {
      elements.forEach((element, index) => {
        setTimeout(() => {
          setActiveElements(prev => new Set([...prev, element]));
        }, index * 300);
      });
    };

    timeoutId = setTimeout(activateElements, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return (
      <div className={`memory-matrix ${isGlitching ? 'glitching' : ''}`}>
        <div className="header-text">MEMORY CORE</div>
        <div className="empty-line"></div>
        <div className="matrix-line">◇ No agent found. Type 'mint &lt;name&gt;' to</div>
        <div className="matrix-line">  initialize memory core.</div>
      </div>
    );
  }

  const agent = dashboardData.agent.data;
  const memory = dashboardData.memory;
  const memoryAccess = memory.access || {};
  const consolidation = memory.consolidation || {};
  
  // Format access levels based on intelligence
  const memoryDepth = memoryAccess.memoryDepth || 'Unknown';
  const monthsAccessible = Number(memoryAccess.monthsAccessible || 0);
  
  // Format consolidation data
  const consolidationStreak = Number(dashboardData.stats?.consolidationStreak || 0);
  const isUpToDate = consolidation.needsConsolidation !== true;
  const consolidationStatus = isUpToDate ? '✓ SYNCHRONIZED' : '! NEEDS SYNC';
  const pendingRewards = Number(consolidation.consolidationReward?.totalReward || 0);
  
  // Memory hashes from contract
  const currentDreamHash = agent.memory?.currentDreamDailyHash || '';
  const currentConvHash = agent.memory?.currentConvDailyHash || '';
  const memoryCoreHash = agent.memory?.memoryCoreHash || '';
  const lastConsolidationDate = agent.memory?.lastConsolidation ? 
    new Date(Number(agent.memory.lastConsolidation) * 1000).toLocaleDateString() : 'Never';
  const currentMonth = agent.memory?.currentMonth ? Number(agent.memory.currentMonth) : new Date().getMonth() + 1;
  const currentYear = agent.memory?.currentYear ? Number(agent.memory.currentYear) : new Date().getFullYear();

  // Create visual memory access bar (months accessible / 60 max)
  const createAccessBar = (months: number, maxMonths: number = 60) => {
    const filled = Math.floor((months / maxMonths) * 20); // 0-20 chars
    const empty = 20 - filled;
    const isActive = activeElements.has('access-bar');
    
    return (
      <span className={`access-bar ${isActive ? 'active' : ''} ${isGlitching ? 'glitching' : ''}`}>
        {'█'.repeat(filled)}{'░'.repeat(empty)}
      </span>
    );
  };

  // Format hash preview (first 8 chars or show status)
  const formatHash = (hash: string, label: string) => {
    const labelStr = `${label}: `;
    if (!hash || hash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return `${labelStr}[EMPTY]`.padEnd(30);
    }
    const preview = hash.startsWith('0x') ? hash.slice(2, 10) : hash.slice(0, 8);
    return `${labelStr}${preview.toUpperCase()}`.padEnd(30);
  };

  // Create consolidation streak indicator with cyberpunk symbols
  const createStreakIndicator = (streak: number) => {
    const indicator = (() => {
      if (streak >= 24) return '◆◆◆◆◆'; // Eternal Memory
      if (streak >= 12) return '◆◆◆◆◇'; // Memory Master  
      if (streak >= 6) return '◆◆◆◇◇';  // Memory Guardian
      if (streak >= 3) return '◆◆◇◇◇';  // Memory Keeper
      if (streak >= 1) return '◆◇◇◇◇';  // Active
      return '◇◇◇◇◇';                  // Inactive
    })();
    
    return (
      <span className={`streak-indicator ${isGlitching ? 'glitching' : ''}`}>
        {indicator}
      </span>
    );
  };

  // Memory hierarchy status indicators
  const dailyStatus = (currentDreamHash && currentConvHash) ? 
    <span className="layer-active">●</span> : <span className="layer-pending">◐</span>;
  const monthlyStatus = consolidation.needsConsolidation ? 
    <span className="layer-pending">◐</span> : <span className="layer-active">●</span>;
  const yearlyStatus = memoryCoreHash ? 
    <span className="layer-active">●</span> : <span className="layer-inactive">○</span>;

  // Sync status styling
  const syncStatusClass = isUpToDate ? 'sync-status' : 'sync-status needs-sync';

  return (
    <div className={`memory-matrix ${isGlitching ? 'glitching' : ''}`}>
      <div className="header-text">MEMORY CORE</div>
      <div className="empty-line"></div>
      
      <div className="section-header">⬢ MEMORY ACCESS MATRIX:</div>
      <div className="matrix-line">▲ Depth Range: <span className="memory-value">{memoryDepth}</span></div>
      <div className="matrix-line">◆ Access Level {createAccessBar(monthsAccessible)} <span className="memory-value">{String(monthsAccessible)}</span>/60</div>
      
      <div className="empty-line"></div>
      
      <div className="section-header">※ HIERARCHY STATUS:</div>
      <div className="matrix-line">{dailyStatus} ◊ <span className="memory-label">Daily Layer</span> - Current period active</div>
      <div className="matrix-line">{monthlyStatus} ◇ <span className="memory-label">Monthly Layer</span> - <span className="memory-value">{String(currentMonth).padStart(2)}/{currentYear}</span> consolidation</div>
      <div className="matrix-line">{yearlyStatus} ◈ <span className="memory-label">Yearly Core</span> - Long-term memory archive</div>
      
      <div className="empty-line"></div>
      
      <div className="section-header">◇ STORAGE FRAGMENTS:</div>
      <div className="matrix-line">◈ <span className={`hash-fragment ${isGlitching ? 'glitching' : ''}`}>{formatHash(memoryCoreHash, 'CORE')}</span></div>
      <div className="matrix-line">◊ <span className={`hash-fragment ${isGlitching ? 'glitching' : ''}`}>{formatHash(currentDreamHash, 'DREAMS')}</span></div>
      <div className="matrix-line">※ <span className={`hash-fragment ${isGlitching ? 'glitching' : ''}`}>{formatHash(currentConvHash, 'CONVOS')}</span></div>
      
      <div className="empty-line"></div>
      
      <div className="section-header">⟐ CONSOLIDATION ENGINE:</div>
      <div className="matrix-line">⬢ Status: <span className={syncStatusClass}>{consolidationStatus}</span></div>
      <div className="matrix-line">◆ Streak: {createStreakIndicator(consolidationStreak)} <span className="memory-value">{String(consolidationStreak)}</span> months</div>
      <div className="matrix-line">◇ Rewards: <span className="memory-value">+{String(pendingRewards)} INT</span> pending</div>
      <div className="matrix-line">⟳ Last Sync: <span className="memory-label">{lastConsolidationDate}</span></div>
    </div>
  );
};