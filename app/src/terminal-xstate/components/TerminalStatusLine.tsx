/**
 * @fileoverview Terminal Status Line Component
 * @description Single line status display showing agent connection and intelligence level
 */

import React, { useEffect, useState } from 'react';

interface TerminalStatusLineProps {
  status: 'uninitialized' | 'connecting' | 'syncing' | 'online' | 'thinking' | 'responding' | 'error' | 'no_agent';
  agentName?: string | null;
  intelligenceLevel?: number;
  isMobile?: boolean;
  isTablet?: boolean;
}

const TerminalStatusLine: React.FC<TerminalStatusLineProps> = ({
  status,
  agentName,
  intelligenceLevel = 0,
  isMobile = false,
  isTablet = false
}) => {
  const [dots, setDots] = useState('');
  
  // Animate dots for thinking state
  useEffect(() => {
    if (status === 'thinking') {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [status]);
  const getStatusText = () => {
    switch (status) {
      case 'online': return 'connected';
      case 'connecting': return 'connecting...';
      case 'syncing': return 'syncing...';
      case 'thinking': return 'processing';
      case 'responding': return 'generating';
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
    }}>
      {status === 'thinking' && agentName ? (
        // Special display for thinking state
        <>
          <span style={{ color: '#9CA3AF' }}>status: </span>
          <span style={{ 
            color: '#FFFFFF',
            fontWeight: '500',
          }}>
            {agentName}
          </span>
          <span style={{ 
            color: '#A855F7',
            fontWeight: '500',
          }}>
            {' is thinking'}
          </span>
          <span style={{ 
            color: '#A855F7',
            fontWeight: '500',
            minWidth: '18px',
            display: 'inline-block',
            textAlign: 'left'
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
            type 'mint' to create agent
          </span>
        </>
      )}
    </div>
  );
};

export default TerminalStatusLine;
