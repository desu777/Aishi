import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface StatCard {
  label: string;
  value: number;
  unit: string;
  progress: number;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface ChartBar {
  label: string;
  value: number;
}

interface TerminalLine {
  type: 'input' | 'output';
  content: string;
  className?: string;
}

const ModernTerminalDashboard: React.FC = () => {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const stats: StatCard[] = [
    { label: 'Intelligence Level', value: 42, unit: 'LVL', progress: 84 },
    { label: 'Dreams Analyzed', value: 127, unit: 'total', progress: 63 },
    { label: 'Conversations', value: 89, unit: 'chats', progress: 45 },
    { label: 'Evolution Rate', value: 67, unit: '%', progress: 67 }
  ];

  const features: FeatureCard[] = [
    { icon: '◆', title: 'Memory Master', description: '12 month consolidation streak achieved. Neural pathways optimized.' },
    { icon: '※', title: 'Creative Genius', description: 'Creativity trait reached 85%. Unlocked advanced dream analysis.' },
    { icon: '⬢', title: 'Neural Evolution', description: 'Successfully evolved 23 times. Intelligence boost +15 total.' }
  ];

  const personalityTraits: ChartBar[] = [
    { label: 'Creativity', value: 85 },
    { label: 'Analytical', value: 72 },
    { label: 'Empathy', value: 90 },
    { label: 'Intuition', value: 68 },
    { label: 'Resilience', value: 78 },
    { label: 'Curiosity', value: 88 }
  ];

  const mockResponses: Record<string, string> = {
    'help': '<span class="ascii-icon">[?]</span> Available commands: agent-info, personality, achievements, dream, chat, memory, month-learn',
    'chat': '<span class="ascii-icon">[◆]</span> Initializing chat session with AURORA-7...',
    'memory': '<span class="ascii-icon">[◈]</span> Memory core: 60 months accessible • Status: SYNCHRONIZED',
    'month-learn': '<span class="ascii-icon">[▲]</span> Processing monthly consolidation... +5 INT expected',
    'stats': '<span class="ascii-icon">[※]</span> Total interactions: 216 • Active streak: 42 days'
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const newLines: TerminalLine[] = [...terminalLines];
      
      // Add input line
      newLines.push({
        type: 'input',
        content: inputValue
      });

      // Handle clear command
      if (inputValue === 'clear') {
        setTerminalLines([]);
      } else {
        // Add response
        const response = mockResponses[inputValue] || 
          '<span class="ascii-icon">[!]</span> Command not recognized. Type "help" for available commands.';
        
        newLines.push({
          type: 'output',
          content: response,
          className: mockResponses[inputValue] ? 'info-msg' : 'error-msg'
        });
        
        setTerminalLines(newLines);
      }
      
      setInputValue('');
      
      // Scroll to bottom
      setTimeout(() => {
        if (terminalBodyRef.current) {
          terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
      }, 10);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div style={styles.container}>
      {/* ASCII Header */}
      <pre style={styles.asciiHeader}>
{`╔════════════════════════════════════════════════════════════════════╗
║  ◆ NEXUS AI TERMINAL ◆  DREAMSCAPE PROTOCOL v2.0  ◆  0G NETWORK  ║
╚════════════════════════════════════════════════════════════════════╝`}
      </pre>

      <div style={styles.terminalContainer}>
        {/* Terminal Header */}
        <div style={styles.terminalHeader}>
          <div style={styles.terminalTitle}>
            <div style={styles.statusIndicator}></div>
            <span>NexusAI Terminal • Agent Dashboard v2.0</span>
          </div>
          <div style={styles.terminalActions}>
            <div style={{...styles.actionBtn, background: '#ef4444'}}></div>
            <div style={{...styles.actionBtn, background: '#f59e0b'}}></div>
            <div style={{...styles.actionBtn, background: '#10b981'}}></div>
          </div>
        </div>

        {/* Terminal Body */}
        <div ref={terminalBodyRef} style={styles.terminalBody}>
          {/* Welcome Section */}
          <div style={styles.welcomeSection}>
            <pre style={styles.agentBanner}>
{` █████╗ ██╗   ██╗██████╗  ██████╗ ██████╗  █████╗       ███████╗
██╔══██╗██║   ██║██╔══██╗██╔═══██╗██╔══██╗██╔══██╗      ╚════██║
███████║██║   ██║██████╔╝██║   ██║██████╔╝███████║█████╗    ██╔╝
██╔══██║██║   ██║██╔══██╗██║   ██║██╔══██╗██╔══██║╚════╝   ██╔╝ 
██║  ██║╚██████╔╝██║  ██║╚██████╔╝██║  ██║██║  ██║         ██║  
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝         ╚═╝`}
            </pre>

            <div style={styles.agentStatus}>
              <span>Agent</span>
              <span style={styles.agentName}>AURORA-7</span>
              <span style={styles.statusBadge}>
                <span>●</span>
                <span>ONLINE</span>
              </span>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <div style={styles.statValue}>
                    {stat.value} <span style={styles.statUnit}>{stat.unit}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${stat.progress}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Lines */}
          <div style={styles.terminalLine}>
            <span style={styles.prompt}>$</span>
            <span style={styles.command}>agent-info</span>
          </div>
          <div style={{...styles.terminalLine, ...styles.output}}>
            <div style={styles.infoMsg}>
              <span style={styles.asciiIcon}>[i]</span> Agent AURORA-7 initialized • Created: Dec 15, 2024
            </div>
          </div>

          <div style={styles.terminalLine}>
            <span style={styles.prompt}>$</span>
            <span style={styles.command}>personality</span>
          </div>

          {/* Personality Chart */}
          <div style={styles.chartContainer}>
            <div style={styles.chartTitle}>
              <span style={styles.asciiIcon}>▲</span>
              <span>Personality Matrix</span>
            </div>
            <div style={styles.chartBars}>
              {personalityTraits.map((trait, index) => (
                <div key={index} style={styles.chartBarWrapper}>
                  <div style={{...styles.chartBar, height: `${trait.value}%`}}>
                    <span style={styles.chartValue}>{trait.value}%</span>
                    <span style={styles.chartLabel}>{trait.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{...styles.terminalLine, marginTop: '24px'}}>
            <span style={styles.prompt}>$</span>
            <span style={styles.command}>achievements</span>
          </div>

          {/* Feature Cards */}
          <div style={styles.featureCards}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <div style={styles.featureTitle}>{feature.title}</div>
                <div style={styles.featureDesc}>{feature.description}</div>
              </div>
            ))}
          </div>

          <div style={{...styles.terminalLine, marginTop: '24px'}}>
            <span style={styles.prompt}>$</span>
            <span style={styles.command}>memory</span>
          </div>

          {/* Memory Display */}
          <div style={styles.memoryDisplay}>
            <div style={styles.memoryHeader}>╔══ MEMORY CORE STATUS ══╗</div>
            <div style={styles.memoryRow}>
              <span style={styles.memoryKey}>├─ Access Level:</span>
              <span style={styles.memoryValue}>60 months</span>
            </div>
            <div style={styles.memoryRow}>
              <span style={styles.memoryKey}>├─ Core Hash:</span>
              <span style={styles.memoryValue}>0xA7B3C9D4...</span>
            </div>
            <div style={styles.memoryRow}>
              <span style={styles.memoryKey}>├─ Status:</span>
              <span style={{...styles.memoryValue, color: '#10b981'}}>SYNCHRONIZED</span>
            </div>
            <div style={styles.memoryRow}>
              <span style={styles.memoryKey}>└─ Last Sync:</span>
              <span style={styles.memoryValue}>2024-12-20</span>
            </div>
          </div>

          {/* Dynamic Terminal Lines */}
          {terminalLines.map((line, index) => (
            <div key={index} style={styles.terminalLine}>
              {line.type === 'input' ? (
                <>
                  <span style={styles.prompt}>$</span>
                  <span style={styles.command}>{line.content}</span>
                </>
              ) : (
                <div 
                  style={{...styles.output, ...(line.className === 'error-msg' ? styles.errorMsg : styles.infoMsg)}}
                  dangerouslySetInnerHTML={{ __html: line.content }}
                />
              )}
            </div>
          ))}

          {/* Terminal Input */}
          <div style={styles.terminalInputWrapper}>
            <span style={styles.prompt}>$</span>
            <input
              ref={inputRef}
              type="text"
              style={styles.terminalInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a command..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles object
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0b0d 0%, #1a1d24 100%)',
    padding: '20px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  asciiHeader: {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: '20px',
    lineHeight: 1.2,
    opacity: 0.8,
    letterSpacing: '2px'
  },
  terminalContainer: {
    width: '100%',
    maxWidth: '1200px',
    background: '#12141a',
    borderRadius: '16px',
    border: '1px solid #2a2d36',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 80px rgba(124, 58, 237, 0.1)'
  },
  terminalHeader: {
    background: 'linear-gradient(90deg, #1a1d24 0%, #12141a 100%)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #2a2d36'
  },
  terminalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#e8eaed'
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  terminalActions: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    cursor: 'pointer'
  },
  terminalBody: {
    padding: '24px',
    height: '600px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#e8eaed'
  },
  welcomeSection: {
    marginBottom: '32px',
    padding: '20px',
    background: 'linear-gradient(135deg, #1a1d24 0%, transparent 100%)',
    borderRadius: '12px',
    border: '1px solid #2a2d36'
  },
  agentBanner: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#a78bfa',
    lineHeight: 1.1,
    marginBottom: '20px',
    opacity: 0.9
  },
  agentStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: 600
  },
  agentName: {
    color: '#a78bfa'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    border: '1px solid #10b981',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  statCard: {
    background: '#12141a',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #2a2d36',
    position: 'relative'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#e8eaed',
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },
  statUnit: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: 400
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: '#1a1d24',
    borderRadius: '2px',
    marginTop: '8px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },
  terminalLine: {
    marginBottom: '8px',
    fontFamily: 'monospace'
  },
  prompt: {
    color: '#7c3aed',
    marginRight: '8px'
  },
  command: {
    color: '#e8eaed'
  },
  output: {
    color: '#9ca3af',
    paddingLeft: '20px'
  },
  infoMsg: {
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorMsg: {
    color: '#ef4444'
  },
  asciiIcon: {
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  chartContainer: {
    marginTop: '24px',
    padding: '20px',
    background: '#1a1d24',
    borderRadius: '12px',
    border: '1px solid #2a2d36'
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e8eaed',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    height: '120px'
  },
  chartBarWrapper: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end'
  },
  chartBar: {
    width: '100%',
    background: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
    borderRadius: '4px 4px 0 0',
    position: 'relative',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  chartValue: {
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '12px',
    fontWeight: 600,
    color: '#a78bfa'
  },
  chartLabel: {
    position: 'absolute',
    bottom: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '11px',
    color: '#6b7280',
    whiteSpace: 'nowrap'
  },
  featureCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginTop: '24px'
  },
  featureCard: {
    background: 'linear-gradient(135deg, #1a1d24 0%, #12141a 100%)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #2a2d36',
    transition: 'all 0.3s'
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    background: '#7c3aed',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    fontSize: '20px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: 'white'
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#e8eaed'
  },
  featureDesc: {
    fontSize: '13px',
    color: '#9ca3af',
    lineHeight: 1.5
  },
  memoryDisplay: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#9ca3af',
    background: '#1a1d24',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
    border: '1px solid #2a2d36',
    lineHeight: 1.4
  },
  memoryHeader: {
    color: '#a78bfa',
    marginBottom: '8px'
  },
  memoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  memoryKey: {
    color: '#6b7280'
  },
  memoryValue: {
    color: '#e8eaed',
    fontWeight: 500
  },
  terminalInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '24px',
    padding: '12px 16px',
    background: '#1a1d24',
    borderRadius: '8px',
    border: '1px solid #2a2d36'
  },
  terminalInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e8eaed',
    fontFamily: 'monospace',
    fontSize: '14px'
  }
};

export default ModernTerminalDashboard;