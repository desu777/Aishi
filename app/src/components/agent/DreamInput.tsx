'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAgentDream } from '../../hooks/agentHooks/useAgentDream';
import { Moon, Brain, Sparkles, CheckCircle, AlertCircle, Loader2, Save, Zap, Database, FileText, ArrowRight } from 'lucide-react';

interface DreamInputProps {
  className?: string;
}

export default function DreamInput({ className }: DreamInputProps) {
  const { theme, debugLog } = useTheme();
  const {
    // State
    isAnalyzing,
    isSavingToStorage,
    isProcessingOnChain,
    isWaitingForReceipt,
    isComplete,
    error,
    currentStep,
    dreamAnalysis,
    storageHash,
    txHash,
    
    // Actions
    processDream,
    resetProcessing,
    
    // Agent context
    hasAgent,
    userAgent,
    userTokenId,
    
    // Configuration
    computeConfig,
    storageConfig
  } = useAgentDream();

  // Local state for dream input
  const [dreamText, setDreamText] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [lucidDream, setLucidDream] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  // Available emotions for selection
  const availableEmotions = [
    'happy', 'sad', 'anxious', 'excited', 'confused', 'peaceful',
    'frightened', 'curious', 'nostalgic', 'frustrated', 'hopeful', 'surprised'
  ];

  // Handle dream processing
  const handleProcessDream = async () => {
    if (!dreamText.trim()) {
      alert('Please enter your dream description');
      return;
    }

    const dreamInput = {
      dreamText: dreamText.trim(),
      emotions: selectedEmotions,
      lucidDream
    };

    debugLog('Processing dream', dreamInput);
    
    const result = await processDream(dreamInput);
    
    if (result.success) {
      // Clear input on success
      setDreamText('');
      setSelectedEmotions([]);
      setLucidDream(false);
      debugLog('Dream processed successfully', result);
    }
  };

  // Toggle emotion selection
  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  // Reset form
  const handleReset = () => {
    setDreamText('');
    setSelectedEmotions([]);
    setLucidDream(false);
    resetProcessing();
  };

  // Loading state
  const isLoading = isAnalyzing || isSavingToStorage || isProcessingOnChain || isWaitingForReceipt;

  return (
    <div className={className}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          🌙 Dream Analysis
        </h2>
        <p style={{
          fontSize: '1rem',
          color: theme.text.secondary,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Share your dreams with your AI agent to evolve its personality and unlock new capabilities
        </p>
      </div>

      {/* Agent Status */}
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
          Agent Status
        </h3>
        
        {!hasAgent ? (
          <div style={{
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: theme.text.secondary
          }}>
            <AlertCircle size={16} />
            <span>No agent found. Please mint an agent first to process dreams.</span>
          </div>
        ) : (
          <div style={{
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: theme.text.primary
          }}>
            <CheckCircle size={16} style={{ color: '#44ff44' }} />
            <div>
              <div style={{ fontWeight: '600' }}>
                Agent Ready: {userAgent?.agentName || 'Unknown'}
              </div>
              <div style={{ fontSize: '14px', color: theme.text.secondary, marginTop: '2px' }}>
                Token ID: #{userTokenId?.toString()} | Dreams: {userAgent?.dreamCount?.toString() || '0'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dream Input Form */}
      {hasAgent && (
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
            Describe Your Dream
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Dream Text Input */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text.secondary,
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                Dream Description:
              </label>
              <textarea
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                placeholder="Describe your dream in detail... The more details you provide, the better the analysis will be."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.bg.panel,
                  color: theme.text.primary,
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
              <div style={{
                fontSize: '12px',
                color: theme.text.secondary,
                marginTop: '5px'
              }}>
                {dreamText.length}/2000 characters
              </div>
            </div>

            {/* Emotions Selection */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text.secondary,
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                Emotions felt in the dream (optional):
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {availableEmotions.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedEmotions.includes(emotion) 
                        ? theme.accent.primary 
                        : theme.bg.panel,
                      color: selectedEmotions.includes(emotion) 
                        ? 'white' 
                        : theme.text.primary,
                      border: `1px solid ${selectedEmotions.includes(emotion) 
                        ? theme.accent.primary 
                        : theme.border}`
                    }}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            {/* Lucid Dream Toggle */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: theme.text.secondary,
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={lucidDream}
                  onChange={(e) => setLucidDream(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                <Sparkles size={16} />
                This was a lucid dream (I was aware I was dreaming)
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ff4444',
                fontSize: '14px',
                padding: '12px',
                backgroundColor: theme.bg.panel,
                borderRadius: '8px',
                border: `1px solid #ff444433`
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Process Button */}
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <button
                onClick={handleProcessDream}
                disabled={isLoading || !dreamText.trim()}
                style={{
                  backgroundColor: theme.accent.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: isLoading || !dreamText.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: isLoading || !dreamText.trim() ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {currentStep === 'analyzing' ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    AI Analyzing...
                  </>
                ) : currentStep === 'saving' ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving to Storage...
                  </>
                ) : currentStep === 'processing' ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {isWaitingForReceipt ? 'Waiting for Confirmation...' : 'Processing On-Chain...'}
                  </>
                ) : (
                  <>
                    <Brain size={16} />
                    Process Dream
                  </>
                )}
              </button>
              
              {(error || txHash) && (
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: theme.bg.panel,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {isLoading && (
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
            <Zap size={20} />
            Processing Progress
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {/* Step 1: AI Analysis */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${isAnalyzing ? theme.accent.primary : theme.border}`
            }}>
              {isAnalyzing ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: theme.accent.primary }} />
              ) : currentStep === 'analyzing' ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: theme.accent.primary }} />
              ) : dreamAnalysis ? (
                <CheckCircle size={16} style={{ color: '#44ff44' }} />
              ) : (
                <Brain size={16} style={{ color: theme.text.secondary }} />
              )}
              <div>
                <div style={{ 
                  color: isAnalyzing || dreamAnalysis ? theme.accent.primary : theme.text.secondary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  1. AI Analysis via 0G Compute
                </div>
                <div style={{ fontSize: '12px', color: theme.text.secondary }}>
                  {isAnalyzing ? 'Analyzing dream with AI...' : 
                   dreamAnalysis ? 'Analysis complete' : 'Waiting...'}
                </div>
              </div>
            </div>

            {/* Step 2: Storage */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${isSavingToStorage ? theme.accent.primary : theme.border}`
            }}>
              {isSavingToStorage ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: theme.accent.primary }} />
              ) : storageHash ? (
                <CheckCircle size={16} style={{ color: '#44ff44' }} />
              ) : (
                <Database size={16} style={{ color: theme.text.secondary }} />
              )}
              <div>
                <div style={{ 
                  color: isSavingToStorage || storageHash ? theme.accent.primary : theme.text.secondary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  2. Save to 0G Storage
                </div>
                <div style={{ fontSize: '12px', color: theme.text.secondary }}>
                  {isSavingToStorage ? 'Saving to decentralized storage...' : 
                   storageHash ? `Saved: ${storageHash.slice(0, 8)}...${storageHash.slice(-6)}` : 'Waiting...'}
                </div>
              </div>
            </div>

            {/* Step 3: On-Chain Processing */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${isProcessingOnChain || isWaitingForReceipt ? theme.accent.primary : theme.border}`
            }}>
              {isProcessingOnChain || isWaitingForReceipt ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: theme.accent.primary }} />
              ) : isComplete && txHash ? (
                <CheckCircle size={16} style={{ color: '#44ff44' }} />
              ) : (
                <Zap size={16} style={{ color: theme.text.secondary }} />
              )}
              <div>
                <div style={{ 
                  color: isProcessingOnChain || isWaitingForReceipt || isComplete ? theme.accent.primary : theme.text.secondary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  3. Process On-Chain
                </div>
                <div style={{ fontSize: '12px', color: theme.text.secondary }}>
                  {isProcessingOnChain ? 'Sending transaction...' : 
                   isWaitingForReceipt ? 'Waiting for confirmation...' :
                   isComplete && txHash ? 'Transaction confirmed' : 'Waiting...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dream Analysis Results */}
      {dreamAnalysis && (
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
            <FileText size={20} />
            Dream Analysis Results
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* AI Analysis */}
            <div style={{
              padding: '15px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                color: theme.text.primary,
                marginBottom: '10px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                AI Analysis
              </h4>
              <p style={{
                color: theme.text.secondary,
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {dreamAnalysis.analysis}
              </p>
            </div>

            {/* Personality Impact */}
            <div style={{
              padding: '15px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                color: theme.text.primary,
                marginBottom: '10px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Personality Impact
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {Object.entries(dreamAnalysis.personalityImpact).map(([key, value]) => (
                  <div key={key} style={{
                    fontSize: '12px',
                    color: theme.text.secondary
                  }}>
                    <span style={{ fontWeight: '600' }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </span>
                    <span style={{ marginLeft: '5px' }}>
                      {typeof value === 'number' ? (value >= 0 ? `+${value}` : value) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dream Metadata */}
            <div style={{
              padding: '15px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                color: theme.text.primary,
                marginBottom: '10px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Dream Metadata
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                fontSize: '14px'
              }}>
                <div>
                  <span style={{ fontWeight: '600', color: theme.text.primary }}>Themes:</span>
                  <span style={{ color: theme.text.secondary, marginLeft: '5px' }}>
                    {dreamAnalysis.dreamMetadata.themes.join(', ')}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: theme.text.primary }}>Symbols:</span>
                  <span style={{ color: theme.text.secondary, marginLeft: '5px' }}>
                    {dreamAnalysis.dreamMetadata.symbols.join(', ')}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: theme.text.primary }}>Emotions:</span>
                  <span style={{ color: theme.text.secondary, marginLeft: '5px' }}>
                    {dreamAnalysis.dreamMetadata.emotions.join(', ')}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: theme.text.primary }}>Intensity:</span>
                  <span style={{ color: theme.text.secondary, marginLeft: '5px' }}>
                    {dreamAnalysis.dreamMetadata.intensity}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {isComplete && txHash && (
        <div style={{
          backgroundColor: theme.bg.card,
          border: `1px solid #44ff4433`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            color: '#44ff44',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle size={20} />
            Dream Processed Successfully!
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '14px'
          }}>
            <div style={{ color: theme.text.primary }}>
              Your dream has been analyzed and your agent's personality has evolved!
            </div>
            
            {storageHash && (
              <div style={{ color: theme.text.secondary }}>
                <strong>Storage Hash:</strong> {storageHash}
              </div>
            )}
            
            <div style={{ color: theme.text.secondary }}>
              <strong>Transaction:</strong> {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </div>
            
            <div style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: theme.bg.panel,
              borderRadius: '6px',
              color: theme.text.secondary,
              fontSize: '12px'
            }}>
              💡 Your agent's personality has been updated based on this dream. You can check the Agent Info section to see the changes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 