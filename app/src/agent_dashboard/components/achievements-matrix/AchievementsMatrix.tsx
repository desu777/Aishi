'use client';

import React, { useState, useEffect } from 'react';
import '../AchievementsMatrixAnimations.css';

export interface AchievementsMatrixProps {
  dashboardData: any;
}

export const AchievementsMatrix: React.FC<AchievementsMatrixProps> = ({ 
  dashboardData 
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [activeElements, setActiveElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Random glitch effect every 5-9 seconds
    const scheduleNextGlitch = () => {
      const delay = Math.random() * 4000 + 5000; // 5-9 seconds
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

  // Animate elements sequentially on load
  useEffect(() => {
    const elements = ['header', 'growth', 'activity', 'milestones', 'rewards'];
    let timeoutId: NodeJS.Timeout;
    
    const activateElements = () => {
      elements.forEach((element, index) => {
        setTimeout(() => {
          setActiveElements(prev => new Set([...prev, element]));
        }, index * 200);
      });
    };

    timeoutId = setTimeout(activateElements, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return (
      <div className={`achievements-matrix ${isGlitching ? 'glitching' : ''}`}>
        <div className="header-text">ACHIEVEMENTS</div>
        <div className="empty-line"></div>
        <div className="matrix-line">No agent found. Type 'mint &lt;name&gt;' to</div>
        <div className="matrix-line">begin your achievement journey.</div>
      </div>
    );
  }

  const agent = dashboardData.agent.data;
  const stats = dashboardData.stats;
  
  // Evolution Stats
  const totalEvolutions = Number(agent.totalEvolutions || 0);
  const lastEvolution = agent.lastEvolutionDate ? 
    new Date(Number(agent.lastEvolutionDate) * 1000).toLocaleDateString() : 'Never';
  const evolutionRate = stats?.evolutionStats?.evolutionRate || 0;
  
  // Intelligence & Activity
  const intelligenceLevel = Number(agent.intelligenceLevel || 0);
  const dreamCount = Number(agent.dreamCount || 0);
  const conversationCount = Number(agent.conversationCount || 0);
  const totalActivity = dreamCount + conversationCount;
  
  // Consolidation rewards
  const pendingRewards = Number(dashboardData.memory?.consolidation?.consolidationReward?.totalReward || 0);
  const consolidationStreak = Number(stats?.consolidationStreak || 0);
  
  // Achievement milestones with ASCII icons (no emojis)
  const achievedMilestones = agent.achievedMilestones || [];
  
  // Define all possible milestones with ASCII icons only
  const allMilestones = {
    // Personality Milestones
    'empathy_master': { icon: '♥', name: 'Empathy Master', desc: 'Reach 85 empathy', req: 'Empathy ≥ 85' },
    'creative_genius': { icon: '∞', name: 'Creative Genius', desc: 'Reach 90 creativity', req: 'Creativity ≥ 90' },
    'logic_lord': { icon: '◊', name: 'Logic Lord', desc: 'Reach 90 analytical', req: 'Analytical ≥ 90' },
    'spiritual_guide': { icon: '◈', name: 'Spiritual Guide', desc: 'Reach 90 intuition', req: 'Intuition ≥ 90' },
    'balanced_soul': { icon: '⚖', name: 'Balanced Soul', desc: 'All traits above 60', req: 'All Traits ≥ 60' },
    
    // Memory Milestones
    'memory_keeper': { icon: '■', name: 'Memory Keeper', desc: '3 month consolidation streak', req: '3 Months' },
    'memory_guardian': { icon: '⬢', name: 'Memory Guardian', desc: '6 month consolidation streak', req: '6 Months' },
    'memory_master': { icon: '◆', name: 'Memory Master', desc: '12 month consolidation streak', req: '12 Months' },
    'eternal_memory': { icon: '※', name: 'Eternal Memory', desc: '24 month consolidation streak', req: '24 Months' }
  };
  
  // Create progress bars for key metrics
  const createProgressBar = (current: number, target: number, length: number = 15) => {
    const progress = Math.min(current / target, 1);
    const filled = Math.floor(progress * length);
    const empty = length - filled;
    const percentage = Math.floor(progress * 100);
    return {
      bar: '█'.repeat(filled) + '░'.repeat(empty),
      percent: `${percentage}%`
    };
  };
  
  // Intelligence progress (next milestone at multiples of 10)
  const nextIntLevel = Math.ceil(intelligenceLevel / 10) * 10;
  const intProgress = createProgressBar(intelligenceLevel, nextIntLevel);
  
  // Activity progress (next milestone: 100, 365, 1000)
  let nextActivityMilestone = 100;
  if (totalActivity >= 1000) nextActivityMilestone = 2000;
  else if (totalActivity >= 365) nextActivityMilestone = 1000;
  else if (totalActivity >= 100) nextActivityMilestone = 365;
  
  const activityProgress = createProgressBar(totalActivity, nextActivityMilestone);
  
  // Achievement count
  const achievedCount = Object.keys(allMilestones).filter(key => achievedMilestones.includes(key)).length;

  return (
    <div className={`achievements-matrix ${isGlitching ? 'glitching' : ''}`}>
      <div className="header-text">ACHIEVEMENTS</div>
      <div className="empty-line"></div>
      
      <div className="section-header">◇ GROWTH ANALYTICS:</div>
      <div className="growth-line">◇ Intelligence: <span className="level-value">{String(intelligenceLevel)} LVL</span> <span className="progress-bar">{intProgress.bar}</span> <span className="percent-value">{intProgress.percent}</span></div>
      <div className="growth-line">⟳ Evolution Rate: <span className="rate-value">{String(evolutionRate)}%</span> - Total: <span className="count-value">{String(totalEvolutions)}</span> changes</div>
      <div className="growth-line">◈ Last Evolution: <span className="date-value">{lastEvolution}</span></div>
      
      <div className="empty-line"></div>
      
      <div className="section-header">▲ ACTIVITY PROGRESS:</div>
      <div className="activity-line">⬢ Total Interactions <span className="progress-bar">{activityProgress.bar}</span> <span className="activity-count">{String(totalActivity)}</span></div>
      <div className="activity-line">  ◊ Dreams: <span className="dream-count">{String(dreamCount)}</span> - ※ Conversations: <span className="conv-count">{String(conversationCount)}</span></div>
      <div className="activity-line">  ⟐ Next Milestone: <span className="milestone-target">{String(nextActivityMilestone)}</span></div>
      
      <div className="empty-line"></div>
      
      <div className="section-header">◆ MILESTONES ({String(achievedCount)}/{Object.keys(allMilestones).length}):</div>
      
      {/* Show achieved milestones first */}
      {Object.entries(allMilestones).map(([key, milestone]) => {
        const isAchieved = achievedMilestones.includes(key);
        if (isAchieved) {
          return (
            <div key={key} className="milestone-achieved">
              <span className="milestone-icon achieved">{milestone.icon}</span> <span className="milestone-name achieved">{milestone.name}</span> <span className="milestone-status achieved">✓ UNLOCKED</span>
            </div>
          );
        }
        return null;
      })}
      
      {/* Show unachieved milestones */}
      {Object.entries(allMilestones).map(([key, milestone]) => {
        const isAchieved = achievedMilestones.includes(key);
        if (!isAchieved) {
          return (
            <div key={key} className="milestone-pending">
              <span className="milestone-icon pending">○</span> <span className="milestone-name pending">{milestone.name}</span> <span className="milestone-req">{milestone.req}</span>
            </div>
          );
        }
        return null;
      })}
      
      <div className="empty-line"></div>
      
      <div className="section-header">⟐ PENDING REWARDS:</div>
      <div className="rewards-line">◇ Consolidation Bonus: <span className="reward-value">+{String(pendingRewards)}</span> Intelligence</div>
      <div className="rewards-line">◈ Current Streak: <span className="streak-value">{String(consolidationStreak)}</span> months</div>
    </div>
  );
};