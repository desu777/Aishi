'use client';

import React from 'react';

interface SplashScreenProps {
  isLoading: boolean;
  progress: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading, progress }) => {
  if (!isLoading) return null;

  // Calculate progress bar fill
  const fillCount = Math.floor((progress / 100) * 30);
  const emptyCount = 30 - fillCount;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0A0A0A',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px'
      }}
    >
      {/* Logo */}
      <img 
        src="/logo.png" 
        alt="AISHI" 
        style={{ 
          width: '200px',
          height: 'auto'
        }} 
      />
      
      {/* Progress Bar */}
      <div 
        style={{ 
          fontSize: '32px', 
          fontFamily: 'Courier New, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <span style={{ color: '#2D2D2D' }}>[</span>
        <span style={{ color: '#8B5CF6' }}>{'█'.repeat(fillCount)}</span>
        <span style={{ color: '#2D2D2D' }}>{'░'.repeat(emptyCount)}</span>
        <span style={{ color: '#2D2D2D' }}>]</span>
        <span style={{ 
          color: '#8A8A8A',
          fontSize: '24px',
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontWeight: '500',
          minWidth: '60px',
          textAlign: 'right'
        }}>
          {progress}%
        </span>
      </div>
      
      {/* Loading text */}
      <div style={{
        fontSize: '14px',
        color: '#8A8A8A',
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontWeight: '300',
        opacity: 0.7
      }}>
        Loading...
      </div>
    </div>
  );
};