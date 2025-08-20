'use client';

import React, { CSSProperties } from 'react';
import { Home, Upload, X, User, ChevronLeft, ChevronRight, Brain, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import SVGIcon from '../ui/SVGIcon';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isOpen, isMobile, isCollapsed, onClose, onToggleCollapse }: SidebarProps) => {
  const { theme, debugLog } = useTheme();
  const router = useRouter();
  
  // Check if test features are enabled
  const isDreamTest = process.env.NEXT_PUBLIC_DREAM_TEST === 'true';
  
  // Compute sidebar styles based on state
  const sidebarStyle: CSSProperties = {
    width: isCollapsed ? '80px' : '240px',
    backgroundColor: theme.bg.card,      // Z /client
    borderRight: `1px solid ${theme.border}`,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: isMobile ? 'fixed' : 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    transition: 'all 0.3s ease',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    boxShadow: isMobile && isOpen ? '0 0 15px rgba(0, 0, 0, 0.1)' : 'none',
    overflow: 'hidden',
    overflowY: 'auto',
    overflowX: 'hidden'
  };
  
  const handleLogoClick = (): void => {
    debugLog('Logo clicked - navigating to home');
    router.push('/');
    if (isMobile) onClose();
  };

  return (
    <div style={sidebarStyle}>
      {/* Close button (mobile only) */}
      {isMobile && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: theme.text.secondary,
            cursor: 'pointer',
            zIndex: 2,
            padding: '8px'
          }}
        >
          <X size={20} />
        </button>
      )}

      {/* Collapse button (desktop only) */}
      {!isMobile && (
        <button
          onClick={onToggleCollapse}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: theme.bg.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            color: theme.text.primary,
            cursor: 'pointer',
            zIndex: 2,
            padding: '6px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.accent.primary;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.panel;
            e.currentTarget.style.color = theme.text.primary;
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}
      
      {/* Logo/Brand Section */}
      <div 
        style={{ 
          padding: isCollapsed ? '0 10px' : '0 20px', 
          paddingTop: isCollapsed ? '60px' : '50px', // Więcej miejsca gdy collapsed
          marginBottom: isCollapsed ? '20px' : '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={handleLogoClick}
      >
        {/* Aishi Logo */}
        <div style={{ 
          position: 'relative', 
          marginBottom: isCollapsed ? '10px' : '20px',
          width: isCollapsed ? '40px' : '200px',
          height: isCollapsed ? '40px' : '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={isCollapsed ? "/logo_clean.png" : "/logo.png"}
            alt="Aishi Logo" 
            style={{
              width: isCollapsed ? '40px' : '220px',
              height: isCollapsed ? '40px' : '100px',
              objectFit: 'contain',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
        
        {!isCollapsed && (
          <span style={{
            fontSize: '11px',
            color: theme.text.secondary,
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            Your inner AI (愛) companion
          </span>
        )}
      </div>
      
      {/* Navigation Items */}
      <div style={{ flex: 1 }}>
        <SidebarItem 
          icon={<SVGIcon src="/home.svg" size={18} alt="Home" />} 
          label="Home" 
          to="/"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<SVGIcon src="/magic-wand.svg" size={18} alt="Mint Aishi" />} 
          label="Mint Aishi" 
          to="/aishi-mint"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<SVGIcon src="/microchip-ai.svg" size={18} alt="AishiOS" />} 
          label="aishiOS" 
          to="/aishiOS"
          isCollapsed={isCollapsed}
          onClick={isMobile ? onClose : undefined}
        />
        <SidebarItem 
          icon={<SVGIcon src="/document.svg" size={18} alt="Documentation" />} 
          label="Documentation" 
          onClick={() => {
            const docsUrl = process.env.NEXT_PUBLIC_DOCS_AISHI_URL;
            if (docsUrl && docsUrl.trim()) {
              window.open(docsUrl, '_blank', 'noopener,noreferrer');
            } else {
              console.warn('NEXT_PUBLIC_DOCS_AISHI_URL not configured');
            }
            if (isMobile) onClose();
          }}
          isCollapsed={isCollapsed}
        />
        {isDreamTest && (
          <SidebarItem 
            icon={<User size={18} />} 
            label="Agent Dashboard" 
            to="/agent-dashboard"
            isCollapsed={isCollapsed}
            onClick={isMobile ? onClose : undefined}
          />
        )}
        {isDreamTest && (
          <SidebarItem 
            icon={<Upload size={18} />} 
            label="Upload Dream" 
            to="/upload"
            isCollapsed={isCollapsed}
            onClick={isMobile ? onClose : undefined}
          />
        )}
        {isDreamTest && (
          <SidebarItem 
            icon={<Brain size={18} />} 
            label="Compute Test" 
            to="/compute"
            isCollapsed={isCollapsed}
            onClick={isMobile ? onClose : undefined}
          />
        )}
        {isDreamTest && (
          <SidebarItem 
            icon={<Sparkles size={18} />} 
            label="Agent Test" 
            to="/agent-test"
            isCollapsed={isCollapsed}
            onClick={isMobile ? onClose : undefined}
          />
        )}
      </div>
      
      {/* Footer */}
      <div style={{ 
        paddingLeft: isCollapsed ? '10px' : '20px',
        paddingRight: isCollapsed ? '10px' : '20px',
        paddingBottom: '0',
        paddingTop: '20px',
        marginTop: '20px',
        borderTop: `1px solid ${theme.border}`
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '8px',
          opacity: 0.8,
          fontSize: isCollapsed ? '10px' : '12px',
          color: theme.text.secondary,
          transition: 'all 0.3s ease'
        }}>
          {isCollapsed ? (
            <img 
              src="/og.png" 
              alt="0G Network"
              style={{ 
                width: '40px',
                height: '20px',
                objectFit: 'contain',
                opacity: 0.8 
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Powered by</span>
              <img 
                src="/og.png" 
                alt="0G Network"
                style={{ 
                  width: '40px',
                  height: '20px',
                  objectFit: 'contain',
                  opacity: 0.9 
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 