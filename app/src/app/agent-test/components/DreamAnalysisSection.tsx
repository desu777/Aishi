'use client';

import { useTheme } from '../../../contexts/ThemeContext';
import { useAgentDream } from '../../../hooks/agentHooks';
import { Moon, Loader2, AlertCircle, Brain, Database, Users } from 'lucide-react';

interface DreamAnalysisSectionProps {
  hasAgent: boolean;
  effectiveTokenId: number | undefined;
}

export default function DreamAnalysisSection({
  hasAgent,
  effectiveTokenId
}: DreamAnalysisSectionProps) {
  const { theme } = useTheme();
  const { 
    dreamText, 
    setDreamText, 
    isLoadingContext, 
    contextStatus, 
    builtContext, 
    error,
    buildDreamContext 
  } = useAgentDream();
  
  // Debug logs dla development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[DreamAnalysis] ${message}`, data || '');
    }
  };

  // Log na start komponentu
  debugLog('DreamAnalysisSection loaded', { hasAgent, effectiveTokenId });

  if (!hasAgent) {
    return (
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <AlertCircle size={48} style={{ color: theme.text.secondary, marginBottom: '20px' }} />
        <h3 style={{ color: theme.text.primary, marginBottom: '10px' }}>
          No Agent Found
        </h3>
        <p style={{ color: theme.text.secondary, fontSize: '14px' }}>
          You need to mint an agent first to analyze dreams.
        </p>
      </div>
    );
  }

  const handleDreamInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDreamText(value);
    debugLog('Dream text changed', { length: value.length, preview: value.substring(0, 50) + '...' });
  };

  const handleBuildContext = async () => {
    if (!effectiveTokenId) {
      debugLog('No effective token ID');
      return;
    }
    
    debugLog('Building context for agent', effectiveTokenId);
    await buildDreamContext(effectiveTokenId);
  };

  return (
    <div>
      {/* STEP 1: Dream Input */}
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: theme.text.primary,
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Moon size={20} />
          STEP 1: Dream Input - Agent #{effectiveTokenId}
        </h3>
        
        <div style={{
          fontSize: '14px',
          color: theme.text.secondary,
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: theme.bg.panel,
          borderRadius: '6px',
          border: `1px solid ${theme.border}`
        }}>
          💭 Enter your dream to analyze and evolve your agent's personality. Each dream contributes to your agent's growth and memory.
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: theme.text.primary,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Describe Your Dream
          </label>
          
          <textarea
            value={dreamText}
            onChange={handleDreamInputChange}
            placeholder="Tell me about your dream... What happened? How did you feel? What was the atmosphere like?"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              backgroundColor: theme.bg.panel,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text.primary,
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          
          <div style={{
            fontSize: '12px',
            color: theme.text.secondary,
            marginTop: '5px',
            textAlign: 'right'
          }}>
            {dreamText.length} characters
          </div>
        </div>
      </div>

      {/* STEP 2: Context Building */}
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: theme.text.primary,
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Brain size={20} />
          STEP 2: Context Building
        </h3>
        
        <div style={{
          fontSize: '14px',
          color: theme.text.secondary,
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: theme.bg.panel,
          borderRadius: '6px',
          border: `1px solid ${theme.border}`
        }}>
          🧠 Building comprehensive analysis context from agent's personality, memory depth, and historical data.
        </div>

        {/* Build Context Button */}
        <button
          onClick={handleBuildContext}
          disabled={!dreamText.trim() || isLoadingContext}
          style={{
            backgroundColor: (!dreamText.trim() || isLoadingContext) ? theme.bg.panel : theme.accent.primary,
            color: (!dreamText.trim() || isLoadingContext) ? theme.text.secondary : 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: (!dreamText.trim() || isLoadingContext) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px'
          }}
        >
          {isLoadingContext ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Building Context...
            </>
          ) : (
            <>
              <Brain size={16} />
              Build Analysis Context
            </>
          )}
        </button>

        {/* Context Status */}
        {contextStatus && (
          <div style={{
            fontSize: '14px',
            color: theme.text.primary,
            marginBottom: '15px',
            padding: '8px 12px',
            backgroundColor: theme.bg.panel,
            borderRadius: '6px',
            border: `1px solid ${theme.border}`
          }}>
            📡 {contextStatus}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            fontSize: '14px',
            color: '#ff4444',
            marginBottom: '15px',
            padding: '8px 12px',
            backgroundColor: '#ffeeee',
            borderRadius: '6px',
            border: '1px solid #ffcccc'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Context Summary */}
        {builtContext && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <h4 style={{
              color: theme.text.primary,
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database size={16} />
              Context Built Successfully
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              fontSize: '14px'
            }}>
              <div>
                <strong style={{ color: theme.text.primary }}>Agent:</strong>
                <div style={{ color: theme.text.secondary }}>
                  {builtContext.agentProfile.name} (Level {builtContext.agentProfile.intelligenceLevel})
                </div>
              </div>
              
              <div>
                <strong style={{ color: theme.text.primary }}>Memory Access:</strong>
                <div style={{ color: theme.text.secondary }}>
                  {builtContext.memoryAccess.memoryDepth}
                </div>
              </div>
              
              <div>
                <strong style={{ color: theme.text.primary }}>Historical Data:</strong>
                <div style={{ color: theme.text.secondary }}>
                  {builtContext.historicalData.dailyDreams.length} daily dreams,{' '}
                  {builtContext.historicalData.monthlyConsolidations.length} monthly consolidations
                </div>
              </div>
              
              <div>
                <strong style={{ color: theme.text.primary }}>Unique Features:</strong>
                <div style={{ color: theme.text.secondary }}>
                  {builtContext.uniqueFeatures.length} AI-generated traits
                </div>
              </div>
            </div>

            {/* Personality Overview */}
            <div style={{ marginTop: '15px' }}>
              <strong style={{ color: theme.text.primary, fontSize: '14px' }}>Personality Profile:</strong>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '8px',
                fontSize: '12px'
              }}>
                <div>Creativity: {builtContext.personality.creativity}/100</div>
                <div>Analytical: {builtContext.personality.analytical}/100</div>
                <div>Empathy: {builtContext.personality.empathy}/100</div>
                <div>Intuition: {builtContext.personality.intuition}/100</div>
                <div>Resilience: {builtContext.personality.resilience}/100</div>
                <div>Curiosity: {builtContext.personality.curiosity}/100</div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <strong>Style:</strong> {builtContext.personality.responseStyle} | 
                <strong> Mood:</strong> {builtContext.personality.dominantMood}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
