'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu } from 'lucide-react';
import { FaultyTerminal } from '../backgrounds';

interface LayoutProps {
  children: ReactNode;
  backgroundType?: 'video' | 'faulty-terminal' | 'none';
}

const Layout = ({ children, backgroundType = 'video' }: LayoutProps) => {
  const { theme, debugLog } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Persist sidebar collapsed state
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile on mount and when window resizes
  useEffect(() => {
    const checkIsMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    checkIsMobile();
    debugLog('Layout initialized', { isMobile: window.innerWidth < 768 });
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [debugLog]);
  
  // Toggle sidebar
  const toggleSidebar = (): void => {
    setSidebarOpen(prev => !prev);
    debugLog('Sidebar toggled', { open: !sidebarOpen });
  };

  // Toggle sidebar collapse
  const toggleSidebarCollapse = (): void => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    // Save to localStorage
    localStorage.setItem('sidebar-collapsed', newCollapsed.toString());
    debugLog('Sidebar collapse toggled', { collapsed: newCollapsed });
  };

  // Obliczamy szerokość sidebara
  const sidebarWidth = sidebarCollapsed ? 80 : 240;
  
  return (
    <div style={{ 
      color: theme.text.primary,
      minHeight: '100vh',
      display: 'flex',
      transition: 'all 0.3s ease',
      position: 'relative'
    }}>
      {/* Background Selection */}
      {backgroundType === 'video' && (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
            opacity: 0.15
          }}
        >
          <source src="/pendi-bg.mp4" type="video/mp4" />
        </video>
      )}
      
      {backgroundType === 'faulty-terminal' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1
        }}>
          <FaultyTerminal
            enabled={true}
            performanceMode={isMobile}
            config={{
              tint: "#8B5CF6",
              brightness: 0.15,
              scale: 1.5,
              scanlineIntensity: 0.3,
              glitchAmount: 0.5,
              flickerAmount: 0.3,
              mouseReact: !isMobile,
              pageLoadAnimation: true
            }}
          />
        </div>
      )}
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            transition: 'opacity 0.3s ease'
          }}
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        isMobile={isMobile}
        isCollapsed={sidebarCollapsed}
        onClose={toggleSidebar}
        onToggleCollapse={toggleSidebarCollapse}
      />
      
      {/* Main Content */}
      <div style={{ 
        flex: 1,
        transition: 'margin-left 0.3s ease',
        width: '100%',
        marginLeft: !isMobile && sidebarOpen ? `${sidebarWidth}px` : 0,
        overflowX: 'hidden'
      }}>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        {/* Spacer for fixed header */}
        <div style={{ height: '80px' }} />
        
        {/* Page Content */}
        <div style={{ padding: '20px', maxWidth: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout; 