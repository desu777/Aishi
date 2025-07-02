'use client';

import Layout from '../components/layout/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { Brain, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  const { theme, debugLog } = useTheme();
  
  // Debug log na start
  debugLog('Home page loaded');
  
  return (
    <Layout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: '20px'
      }}>
        {/* Hero Section */}
        <div style={{
          background: theme.gradients.primary,
          borderRadius: '50%',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 30px rgba(139, 92, 246, 0.4)`,
          animation: 'pulse 2s infinite'
        }}>
          <Brain size={60} color="white" />
        </div>
        
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          Welcome to Dreamscape.
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: theme.text.secondary,
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          The world's first intelligent NFT that learns and evolves with your dreams. 
          Your personal AI agent that grows smarter with every dream you share.
        </p>
        
        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '40px',
          width: '100%',
          maxWidth: '800px'
        }}>
          <FeatureCard 
            icon={<Brain size={24} />}
            title="AI-Powered Analysis"
            description="Advanced AI interprets your dreams with personalized insights"
            theme={theme}
          />
          <FeatureCard 
            icon={<Sparkles size={24} />}
            title="Agent Evolution"
            description="Your agent evolves through 5 intelligence levels as it learns"
            theme={theme}
          />
          <FeatureCard 
            icon={<Zap size={24} />}
            title="0G Network"
            description="Decentralized AI computation and permanent storage"
            theme={theme}
          />
        </div>
      </div>
    </Layout>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, theme }) {
  return (
    <div style={{
      backgroundColor: theme.bg.card,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'left',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = theme.accent.primary;
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 4px 20px rgba(139, 92, 246, 0.2)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = theme.border;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{
        color: theme.accent.primary,
        marginBottom: '12px'
      }}>
        {icon}
      </div>
      <h3 style={{
        color: theme.text.primary,
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '8px'
      }}>
        {title}
      </h3>
      <p style={{
        color: theme.text.secondary,
        fontSize: '0.9rem',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
    </div>
  );
} 