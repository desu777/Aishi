/**
 * @fileoverview Terminal Status Line Component
 * @description Single line status display showing agent connection and intelligence level
 */

import React, { useEffect, useState } from 'react';

interface TerminalStatusLineProps {
  status: 'uninitialized' | 'connecting' | 'syncing' | 'online' | 'thinking' | 'responding' | 'learning' | 'evolving' | 'error' | 'no_agent' | 'recording';
  agentName?: string | null;
  intelligenceLevel?: number;
  isMobile?: boolean;
  isTablet?: boolean;
  isChatActive?: boolean;
  chatStatus?: string | null;
  isRecording?: boolean;
  shouldShowMonthLearnPrompt?: boolean;
  shouldShowYearLearnPrompt?: boolean;
}

const TerminalStatusLine: React.FC<TerminalStatusLineProps> = ({
  status,
  agentName,
  intelligenceLevel = 0,
  isMobile = false,
  isTablet = false,
  isChatActive = false,
  chatStatus = null,
  shouldShowMonthLearnPrompt = false,
  shouldShowYearLearnPrompt = false
}) => {
  const [dots, setDots] = useState('');
  const [prevStatus, setPrevStatus] = useState(status);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animate dots for active processing states
  useEffect(() => {
    if (status === 'thinking' || status === 'learning' || status === 'evolving' || status === 'recording') {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [status]);

  // Handle status transitions with animation
  useEffect(() => {
    if (status !== prevStatus) {
      setIsTransitioning(true);
      const fadeTimer = setTimeout(() => {
        setPrevStatus(status);
        setIsTransitioning(false);
      }, 150); // Half of the animation duration for smooth transition
      return () => clearTimeout(fadeTimer);
    }
  }, [status, prevStatus]);
  const getStatusText = () => {
    switch (status) {
      case 'online': return 'connected';
      case 'connecting': return 'connecting...';
      case 'syncing': return 'syncing...';
      case 'thinking': return 'thinking';
      case 'responding': return 'generating';
      case 'learning': return 'learning';
      case 'evolving': return 'evolving';
      case 'recording': return 'recording audio';
      case 'error': return 'failed';
      case 'no_agent': return 'no agent';
      default: return 'initializing';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#10B981';
      case 'thinking':
      case 'responding': return '#A855F7';
      case 'learning': return '#10B981';
      case 'evolving': return '#F59E0B';
      case 'recording': return '#EF4444';  // Red for recording
      case 'connecting':
      case 'syncing': return '#FCD34D';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{
      textAlign: 'center',
      margin: '1rem 0 1.5rem 0',
      fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: isMobile ? '11px' : isTablet ? '12px' : '13px',
      lineHeight: '1.4',
      color: '#E5E5E5',
      letterSpacing: '0.5px',
      fontWeight: '400',
      position: 'relative',
      height: '20px', // Fixed height for smooth transitions
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(-3px)' : 'translateY(0)',
      }}>
        {status === 'recording' ? (
          // Special display for recording state
          <>
            <span style={{ color: '#9CA3AF' }}>status: </span>
            <span style={{
              color: getStatusColor(),
              fontWeight: '500',
            }}>
              {getStatusText()}
            </span>
            <span style={{
              color: getStatusColor(),
              fontWeight: '500',
              minWidth: '18px',
              display: 'inline-block',
              textAlign: 'left',
            }}>
              {dots}
            </span>
          </>
        ) : (status === 'thinking' || status === 'learning' || status === 'evolving') && agentName ? (
          // Special display for active processing states
          <>
            <span style={{ color: '#9CA3AF' }}>status: </span>
            <span style={{
              color: '#FFFFFF',
              fontWeight: '500',
            }}>
              {agentName}
            </span>
            <span style={{
              color: getStatusColor(),
              fontWeight: '500',
            }}>
              {' is ' + getStatusText()}
            </span>
            <span style={{
              color: getStatusColor(),
              fontWeight: '500',
              minWidth: '18px',
              display: 'inline-block',
              textAlign: 'left',
            }}>
              {dots}
            </span>
          </>
        ) : (
          // Normal status display
          <>
            <span style={{ color: '#9CA3AF' }}>status: </span>
            <span style={{
              color: getStatusColor(),
              fontWeight: '500',
            }}>
              {getStatusText()}
            </span>
          
          {status !== 'no_agent' && agentName && (
            <>
              <span style={{ color: '#9CA3AF' }}> with </span>
              <span style={{ 
                color: '#FFFFFF',
                fontWeight: '500',
              }}>
                {agentName}
              </span>
            </>
          )}

          {status !== 'no_agent' && intelligenceLevel > 0 && (
            <>
              <span style={{ color: '#9CA3AF' }}> | intelligence: </span>
              <span style={{
                color: '#A855F7',
                fontWeight: '500',
              }}>
                {intelligenceLevel}
              </span>
            </>
          )}

          {/* Consolidation hints - pulsating prompts */}
          {status === 'online' && (shouldShowMonthLearnPrompt || shouldShowYearLearnPrompt) && (
            <>
              <span style={{ color: '#9CA3AF' }}> | </span>
              <span style={{
                color: '#A855F7',
                fontWeight: '500',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {shouldShowMonthLearnPrompt && 'month-learn'}
                {shouldShowMonthLearnPrompt && shouldShowYearLearnPrompt && ', '}
                {shouldShowYearLearnPrompt && 'memory-core'}
                {' available'}
              </span>
            </>
          )}
        </>
      )}

        {status === 'no_agent' && (
          <>
            <span style={{ color: '#9CA3AF' }}> | </span>
            <span style={{
              color: '#9CA3AF',
              fontStyle: 'italic',
              fontSize: isMobile ? '10px' : isTablet ? '11px' : '12px',
            }}>
              go 'mint' section to create agent
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TerminalStatusLine;
