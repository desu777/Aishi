'use client';

import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAgentDream, useAgentPrompt, useAgentAI, useAgentRead } from '../../../hooks/agentHooks';
import { useStorageDownload } from '../../../hooks/storage/useStorageDownload';
import { Moon, Loader2, AlertCircle, Brain, Database, Users, FileText, Sparkles, Zap, Download, Archive } from 'lucide-react';

interface DreamAnalysisSectionProps {
  hasAgent: boolean;
  effectiveTokenId: number | undefined;
}

export default function DreamAnalysisSection({
  hasAgent,
  effectiveTokenId
}: DreamAnalysisSectionProps) {
  // ALL HOOKS MUST BE AT THE TOP - Rules of Hooks
  const { theme } = useTheme();
  const { 
    dreamText, 
    setDreamText, 
    isLoadingContext, 
    contextStatus, 
    builtContext, 
    error,
    buildDreamContext,
    isUploadingToStorage,
    uploadStatus,
    extractAndSaveDreamData,
    // NEW: STEP 6 imports
    isProcessingContract,
    contractStatus,
    processStorageAndContract
  } = useAgentDream();
  const { buildDreamAnalysisPrompt } = useAgentPrompt();
  const { 
    isLoading: isLoadingAI, 
    error: aiError, 
    aiResponse, 
    parsedResponse, 
    resetAI, 
    sendDreamAnalysis 
  } = useAgentAI();
  
  // NEW: Agent memory data
  const { 
    agentData, 
    memoryAccess,
    isLoading: isLoadingAgent 
  } = useAgentRead(effectiveTokenId);
  
  // NEW: Storage download functionality
  const { 
    downloadFile, 
    isLoading: isDownloading, 
    error: downloadError, 
    status: downloadStatus 
  } = useStorageDownload();
  
  // State hooks MUST be here, not after conditional returns
  const [builtPrompt, setBuiltPrompt] = useState<string | null>(null);
  const [promptFormat, setPromptFormat] = useState<any>(null);
  
  // Debug logs dla development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[DreamAnalysis] ${message}`, data || '');
    }
  };

  // Log na start komponentu
  debugLog('DreamAnalysisSection loaded', { hasAgent, effectiveTokenId });

  // DETAILED LOGGING OF RECEIVED DATA
  debugLog('useAgentRead data received', {
    hasAgentData: !!agentData,
    hasMemoryAccess: !!memoryAccess,
    isLoadingAgent,
    
    agentDataDetails: agentData ? {
      agentName: agentData.agentName,
      intelligenceLevel: agentData.intelligenceLevel,
      dreamCount: agentData.dreamCount,
      conversationCount: agentData.conversationCount,
      totalEvolutions: agentData.totalEvolutions,
      personalityInitialized: agentData.personalityInitialized
    } : 'no agent data',
    
    personalityDetails: agentData?.personality ? {
      creativity: agentData.personality.creativity,
      analytical: agentData.personality.analytical,
      empathy: agentData.personality.empathy,
      intuition: agentData.personality.intuition,
      resilience: agentData.personality.resilience,
      curiosity: agentData.personality.curiosity,
      dominantMood: agentData.personality.dominantMood,
      uniqueFeaturesCount: agentData.personality.uniqueFeatures?.length || 0
    } : 'no personality data',
    
    memoryAccessDetails: memoryAccess ? {
      monthsAccessible: memoryAccess.monthsAccessible,
      memoryDepth: memoryAccess.memoryDepth
    } : 'no memory access data',
    
    memoryDetails: agentData?.memory ? {
      memoryCoreHash: agentData.memory.memoryCoreHash,
      currentDreamDailyHash: agentData.memory.currentDreamDailyHash,
      lastDreamMonthlyHash: agentData.memory.lastDreamMonthlyHash,
      currentMonth: agentData.memory.currentMonth,
      currentYear: agentData.memory.currentYear
    } : 'no memory data'
  });

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
    
    debugLog('Building context for agent', { 
      tokenId: effectiveTokenId,
      hasAgentData: !!agentData,
      hasMemoryAccess: !!memoryAccess,
      agentName: agentData?.agentName,
      memoryAccessible: memoryAccess?.monthsAccessible
    });
    
    // Combine all data from useAgentRead (Wagmi v2 compatible)
    const combinedAgentData = agentData ? {
      ...agentData,
      memory: {
        ...agentData.memory,
        memoryDepth: memoryAccess?.memoryDepth || 'current month only',
        monthsAccessible: memoryAccess?.monthsAccessible || 1
      }
    } : undefined;
    
    // Pass pre-loaded agent data from useAgentRead (Wagmi v2 compatible)
    await buildDreamContext(effectiveTokenId, combinedAgentData);
  };

  // Early return AFTER all hooks
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

  const handleBuildPrompt = () => {
    if (!builtContext) {
      debugLog('No built context available');
      return;
    }
    
    debugLog('Building prompt for agent', { agentName: builtContext.agentProfile.name });
    const promptResult = buildDreamAnalysisPrompt(builtContext);
    setBuiltPrompt(promptResult.prompt);
    setPromptFormat(promptResult.expectedFormat);
    debugLog('Prompt built successfully', { 
      promptLength: promptResult.prompt.length, 
      needsEvolution: promptResult.expectedFormat.needsPersonalityEvolution 
    });
  };

  const handleSendToAI = async () => {
    if (!builtContext || !builtPrompt || !promptFormat) {
      debugLog('Missing required data for AI analysis');
      return;
    }
    
    debugLog('Sending prompt to AI', { 
      agentName: builtContext.agentProfile.name,
      promptLength: builtPrompt.length,
      needsEvolution: promptFormat.needsPersonalityEvolution
    });
    
    const promptData = {
      prompt: builtPrompt,
      expectedFormat: promptFormat
    };
    
    await sendDreamAnalysis(promptData);
  };

  // Handler for STEP 5: Save to Storage
  const handleSaveToStorage = async () => {
    if (!effectiveTokenId || !parsedResponse) {
      debugLog('Missing tokenId or AI response data');
      return;
    }

    debugLog('Saving dream to storage', { 
      tokenId: effectiveTokenId,
      dreamId: parsedResponse.dreamData.id,
      hasPersonalityImpact: !!parsedResponse.personalityImpact
    });
    
    const result = await extractAndSaveDreamData(effectiveTokenId, parsedResponse);
    
    if (result.success) {
      debugLog('Storage save successful', {
        rootHash: result.rootHash
      });
    } else {
      debugLog('Storage save failed', {
        error: result.error
      });
      // setError(`Storage save failed: ${result.error}`); // Original code had this line commented out
    }
  };

  // NEW: STEP 6 - Handler for Storage + Contract processing
  const handleProcessStorageAndContract = async () => {
    if (!effectiveTokenId || !parsedResponse) {
      debugLog('Missing tokenId or AI response data');
      return;
    }

    debugLog('Starting storage and contract processing', {
      tokenId: effectiveTokenId,
      hasParsedResponse: !!parsedResponse,
      hasBuiltContext: !!builtContext
    });

    const result = await processStorageAndContract(effectiveTokenId, parsedResponse);
    
    if (result.success) {
      debugLog('Storage and contract processing successful', {
        rootHash: result.rootHash,
        txHash: result.txHash
      });
    } else {
      debugLog('Storage and contract processing failed', {
        error: result.error
      });
      // setError(`Processing failed: ${result.error}`); // Original code had this line commented out
    }
  };

  // NEW: Handler for downloading memory files
  const handleDownloadMemoryFile = async (rootHash: string, fileName: string) => {
    if (!rootHash || rootHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      debugLog('Cannot download - empty or null hash', { rootHash, fileName });
      return;
    }

    debugLog('Starting memory file download', { rootHash, fileName });
    
    const result = await downloadFile(rootHash);
    
    if (result.success && result.data) {
      // Convert ArrayBuffer to JSON and trigger download
      try {
        const textDecoder = new TextDecoder('utf-8');
        const jsonText = textDecoder.decode(result.data);
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        debugLog('Memory file download successful', { fileName, size: result.data.byteLength });
      } catch (error) {
        debugLog('Failed to process downloaded file', { error, fileName });
      }
    } else {
      debugLog('Memory file download failed', { error: result.error, fileName });
    }
  };

  return (
    <div>
      {/* MEMORY FILES SECTION - Before Step 1 */}
      {isLoadingAgent ? (
        <div style={{
          backgroundColor: theme.bg.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <Loader2 size={32} style={{ 
            color: theme.accent.primary, 
            marginBottom: '15px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: theme.text.secondary, fontSize: '14px' }}>
            Loading agent memory data...
          </p>
        </div>
      ) : agentData?.memory ? (
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
            <Archive size={20} />
            Memory Files - Agent #{effectiveTokenId}
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
            📁 Download JSON files from agent's hierarchical memory system. Each file contains structured data from different time periods.
          </div>

          {/* Memory Files Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {/* Daily Dreams File */}
            <div style={{
              padding: '15px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <FileText size={16} style={{ color: theme.accent.primary }} />
                <h4 style={{
                  color: theme.text.primary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: 0
                }}>
                  Daily Dreams (Current Month)
                </h4>
              </div>
              
              <div style={{
                fontSize: '12px',
                color: theme.text.secondary,
                marginBottom: '10px',
                fontFamily: 'monospace'
              }}>
                {agentData.memory.currentDreamDailyHash || 'No hash available'}
              </div>
              
              <button
                onClick={() => handleDownloadMemoryFile(
                  agentData.memory.currentDreamDailyHash,
                  `daily_dreams_${agentData.memory.currentYear}-${String(agentData.memory.currentMonth).padStart(2, '0')}.json`
                )}
                disabled={!agentData.memory.currentDreamDailyHash || 
                         agentData.memory.currentDreamDailyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                         isDownloading}
                style={{
                  backgroundColor: (!agentData.memory.currentDreamDailyHash || 
                                   agentData.memory.currentDreamDailyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                                   isDownloading) ? theme.bg.card : theme.accent.primary,
                  color: (!agentData.memory.currentDreamDailyHash || 
                         agentData.memory.currentDreamDailyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                         isDownloading) ? theme.text.secondary : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: (!agentData.memory.currentDreamDailyHash || 
                          agentData.memory.currentDreamDailyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                          isDownloading) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={12} />
                    Download
                  </>
                )}
              </button>
            </div>

            {/* Monthly Dreams File */}
            <div style={{
              padding: '15px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <FileText size={16} style={{ color: theme.accent.secondary }} />
                <h4 style={{
                  color: theme.text.primary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: 0
                }}>
                  Monthly Dreams (Last Consolidation)
                </h4>
              </div>
              
              <div style={{
                fontSize: '12px',
                color: theme.text.secondary,
                marginBottom: '10px',
                fontFamily: 'monospace'
              }}>
                {agentData.memory.lastDreamMonthlyHash || 'No hash available'}
              </div>
              
              <button
                onClick={() => handleDownloadMemoryFile(
                  agentData.memory.lastDreamMonthlyHash,
                  `monthly_dreams_consolidated.json`
                )}
                disabled={!agentData.memory.lastDreamMonthlyHash || 
                         agentData.memory.lastDreamMonthlyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                         isDownloading}
                style={{
                  backgroundColor: (!agentData.memory.lastDreamMonthlyHash || 
                                   agentData.memory.lastDreamMonthlyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                                   isDownloading) ? theme.bg.card : theme.accent.secondary,
                  color: (!agentData.memory.lastDreamMonthlyHash || 
                         agentData.memory.lastDreamMonthlyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                         isDownloading) ? theme.text.secondary : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: (!agentData.memory.lastDreamMonthlyHash || 
                          agentData.memory.lastDreamMonthlyHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                          isDownloading) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={12} />
                    Download
                  </>
                )}
              </button>
            </div>

            {/* Yearly Core Memory File */}
            <div style={{
              padding: '15px',
              backgroundColor: theme.bg.panel,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <Brain size={16} style={{ color: '#ffa500' }} />
                <h4 style={{
                  color: theme.text.primary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: 0
                }}>
                  Yearly Core Memory
                </h4>
              </div>
              
              <div style={{
                fontSize: '12px',
                color: theme.text.secondary,
                marginBottom: '10px',
                fontFamily: 'monospace'
              }}>
                {agentData.memory.memoryCoreHash || 'No hash available'}
              </div>
              
              <button
                onClick={() => handleDownloadMemoryFile(
                  agentData.memory.memoryCoreHash,
                  `yearly_core_memory.json`
                )}
                disabled={!agentData.memory.memoryCoreHash || 
                         agentData.memory.memoryCoreHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                         isDownloading}
                style={{
                  backgroundColor: (!agentData.memory.memoryCoreHash || 
                                   agentData.memory.memoryCoreHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                                   isDownloading) ? theme.bg.card : '#ffa500',
                  color: (!agentData.memory.memoryCoreHash || 
                         agentData.memory.memoryCoreHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                         isDownloading) ? theme.text.secondary : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: (!agentData.memory.memoryCoreHash || 
                          agentData.memory.memoryCoreHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ||
                          isDownloading) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={12} />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Download Status */}
          {downloadStatus && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: theme.bg.card,
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              fontSize: '12px',
              color: theme.text.secondary,
              fontFamily: 'monospace'
            }}>
              {downloadStatus}
            </div>
          )}

          {/* Download Error */}
          {downloadError && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#ff4444',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={14} />
              Download Error: {downloadError}
            </div>
          )}

          {/* Memory Info */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: theme.bg.card,
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
            fontSize: '12px',
            color: theme.text.secondary
          }}>
            <strong>Memory Info:</strong> Current Period: {agentData.memory.currentMonth}/{agentData.memory.currentYear} | 
            Last Consolidation: {agentData.memory.lastConsolidation ? new Date(Number(agentData.memory.lastConsolidation) * 1000).toLocaleDateString() : 'Never'}
          </div>
        </div>
      ) : (
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
            No Memory Data Found
          </h3>
          <p style={{ color: theme.text.secondary, fontSize: '14px' }}>
            The agent's memory data is not yet available. Please ensure the agent is minted and has processed some dreams.
          </p>
        </div>
      )}

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
            
            {/* Language Detection Info */}
            <div style={{
              marginBottom: '15px',
              padding: '12px',
              backgroundColor: builtContext.languageDetection.isReliable ? '#e8f5e8' : '#fff3cd',
              borderRadius: '6px',
              border: `1px solid ${builtContext.languageDetection.isReliable ? '#28a745' : '#ffc107'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: builtContext.languageDetection.isReliable ? '#155724' : '#856404'
              }}>
                {builtContext.languageDetection.isReliable ? '✅' : '⚠️'} 
                Language Detected: {builtContext.languageDetection.languageName}
              </div>
              <div style={{
                fontSize: '12px',
                color: builtContext.languageDetection.isReliable ? '#155724' : '#856404',
                marginTop: '4px'
              }}>
                Confidence: {Math.round(builtContext.languageDetection.confidence * 100)}% 
                {!builtContext.languageDetection.isReliable && ' (Fallback to English)'}
              </div>
            </div>

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

      {/* STEP 3: Prompt Building */}
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
          STEP 3: Prompt Building
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
          📝 Building AI prompt with complete context for personalized dream analysis. Agent will use personality, memory, and historical data.
        </div>

        {/* Build Prompt Button */}
        <button
          onClick={handleBuildPrompt}
          disabled={!builtContext}
          style={{
            backgroundColor: !builtContext ? theme.bg.panel : theme.accent.primary,
            color: !builtContext ? theme.text.secondary : 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: !builtContext ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px'
          }}
        >
          <FileText size={16} />
          Build Analysis Prompt
        </button>

        {/* Prompt Format Info */}
        {promptFormat && (
          <div style={{
            fontSize: '14px',
            color: theme.text.primary,
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: theme.bg.panel,
            borderRadius: '6px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontWeight: '600', marginBottom: '5px' }}>
              📊 Analysis Format:
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>
              • Dream ID: #{promptFormat.dreamId}
              • {promptFormat.needsPersonalityEvolution ? 
                  `🧬 Personality Evolution (${promptFormat.dreamId}th dream)` : 
                  '📝 Regular Analysis'}
              • {promptFormat.needsPersonalityEvolution ? 
                  'Will include personality changes & unique features' : 
                  'Analysis only - no trait changes'}
            </div>
          </div>
        )}

        {/* Built Prompt Display */}
        {builtPrompt && (
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
              <FileText size={16} />
              Generated Prompt Ready
            </h4>
            
            <div style={{
              fontSize: '12px',
              color: theme.text.secondary,
              marginBottom: '10px'
            }}>
              Prompt length: {builtPrompt.length} characters
            </div>

            <textarea
              value={builtPrompt}
              readOnly
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '10px',
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                color: theme.text.primary,
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none'
              }}
            />
            
            <div style={{
              marginTop: '10px',
              fontSize: '12px',
              color: theme.text.secondary,
              textAlign: 'center'
            }}>
              ✅ Ready for AI analysis (STEP 4)
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: AI Analysis */}
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
          STEP 4: AI Analysis
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
          🤖 Send prompt to AI model via 0g-compute API for personalized dream analysis. The AI will respond with full analysis and structured data.
        </div>

        {/* Send to AI Button */}
        <button
          onClick={handleSendToAI}
          disabled={!builtPrompt || isLoadingAI}
          style={{
            backgroundColor: !builtPrompt || isLoadingAI ? theme.bg.panel : theme.accent.primary,
            color: !builtPrompt || isLoadingAI ? theme.text.secondary : 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: !builtPrompt || isLoadingAI ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px'
          }}
        >
          {isLoadingAI ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing Dream...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Send to AI Analysis
            </>
          )}
        </button>

        {/* AI Error Display */}
        {aiError && (
          <div style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            AI Error: {aiError}
          </div>
        )}

        {/* AI Response Display */}
        {parsedResponse && (
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
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={16} />
              AI Dream Analysis Complete
            </h4>

            {/* AI Response Stats */}
            {aiResponse && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '10px',
                marginBottom: '15px',
                fontSize: '12px',
                color: theme.text.secondary
              }}>
                <div><strong>Model:</strong> {aiResponse.model}</div>
                <div><strong>Cost:</strong> {aiResponse.cost} OG</div>
                <div><strong>Response Time:</strong> {aiResponse.responseTime}ms</div>
                <div><strong>Valid:</strong> {aiResponse.isValid ? '✅' : '❌'}</div>
              </div>
            )}

            {/* Dream Analysis Section */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: theme.bg.card,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h5 style={{
                color: theme.text.primary,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                🌙 Full Dream Analysis
              </h5>
              
              <div style={{
                color: theme.text.primary,
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {parsedResponse.fullAnalysis}
              </div>
            </div>

            {/* Dream Data Summary */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: theme.bg.card,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h5 style={{
                color: theme.text.primary,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                📊 Dream Data Summary
              </h5>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px',
                fontSize: '12px',
                color: theme.text.secondary
              }}>
                <div><strong>Dream ID:</strong> #{parsedResponse.dreamData.id}</div>
                <div><strong>Intensity:</strong> {parsedResponse.dreamData.intensity}/10</div>
                <div><strong>Lucidity:</strong> {parsedResponse.dreamData.lucidity_level}/5</div>
                <div><strong>Type:</strong> {parsedResponse.dreamData.dream_type}</div>
              </div>
              
              <div style={{ marginTop: '10px', fontSize: '12px' }}>
                <div><strong>Emotions:</strong> {parsedResponse.dreamData.emotions.join(', ')}</div>
                <div><strong>Symbols:</strong> {parsedResponse.dreamData.symbols.join(', ')}</div>
              </div>
            </div>

            {/* Personality Impact (if evolution) */}
            {parsedResponse.personalityImpact && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: theme.bg.card,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <h5 style={{
                  color: theme.text.primary,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  🧬 Personality Evolution (Dream #{parsedResponse.dreamData.id})
                </h5>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '8px',
                  fontSize: '12px',
                  color: theme.text.secondary
                }}>
                  <div>Creativity: {parsedResponse.personalityImpact.creativityChange > 0 ? '+' : ''}{parsedResponse.personalityImpact.creativityChange}</div>
                  <div>Analytical: {parsedResponse.personalityImpact.analyticalChange > 0 ? '+' : ''}{parsedResponse.personalityImpact.analyticalChange}</div>
                  <div>Empathy: {parsedResponse.personalityImpact.empathyChange > 0 ? '+' : ''}{parsedResponse.personalityImpact.empathyChange}</div>
                  <div>Intuition: {parsedResponse.personalityImpact.intuitionChange > 0 ? '+' : ''}{parsedResponse.personalityImpact.intuitionChange}</div>
                  <div>Resilience: {parsedResponse.personalityImpact.resilienceChange > 0 ? '+' : ''}{parsedResponse.personalityImpact.resilienceChange}</div>
                  <div>Curiosity: {parsedResponse.personalityImpact.curiosityChange > 0 ? '+' : ''}{parsedResponse.personalityImpact.curiosityChange}</div>
                </div>
                
                <div style={{ marginTop: '10px', fontSize: '12px' }}>
                  <div><strong>Mood Shift:</strong> {parsedResponse.personalityImpact.moodShift}</div>
                  <div><strong>Evolution Weight:</strong> {parsedResponse.personalityImpact.evolutionWeight}/100</div>
                </div>
                
                {parsedResponse.personalityImpact.newFeatures.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <strong>New Features:</strong>
                    {parsedResponse.personalityImpact.newFeatures.map((feature, index) => (
                      <div key={index} style={{ marginLeft: '10px' }}>
                        • {feature.name}: {feature.description} ({feature.intensity}/100)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analysis Summary */}
            <div style={{
              padding: '10px',
              backgroundColor: theme.bg.card,
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              fontSize: '12px',
              color: theme.text.secondary
            }}>
              <strong>Brief Analysis:</strong> {parsedResponse.analysis}
            </div>

            {/* Save to Storage Button */}
            {effectiveTokenId && (
              <button
                onClick={handleSaveToStorage}
                disabled={isUploadingToStorage}
                style={{
                  backgroundColor: isUploadingToStorage ? theme.bg.panel : theme.accent.primary,
                  color: isUploadingToStorage ? theme.text.secondary : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: isUploadingToStorage ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '15px'
                }}
              >
                {isUploadingToStorage ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving Dream...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Save Dream to Storage
                  </>
                )}
              </button>
            )}

            {/* Upload Status Display */}
            {uploadStatus && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: theme.bg.panel,
                borderRadius: '6px',
                fontSize: '13px',
                color: theme.text.secondary,
                fontFamily: 'monospace'
              }}>
                {uploadStatus}
              </div>
            )}

            {/* NEW: STEP 6 - Process Storage & Contract Button */}
            {effectiveTokenId && builtContext && (
              <button
                onClick={handleProcessStorageAndContract}
                disabled={isUploadingToStorage || isProcessingContract}
                style={{
                  backgroundColor: (isUploadingToStorage || isProcessingContract) ? theme.bg.panel : theme.accent.secondary,
                  color: (isUploadingToStorage || isProcessingContract) ? theme.text.secondary : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: (isUploadingToStorage || isProcessingContract) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px'
                }}
              >
                {(isUploadingToStorage || isProcessingContract) ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    {isUploadingToStorage ? 'Saving to Storage...' : 'Processing Contract...'}
                  </>
                ) : (
                  <>
                    🚀 Process Storage & Contract
                  </>
                )}
              </button>
            )}

            {/* NEW: STEP 6 - Contract Status Display */}
            {(uploadStatus || contractStatus) && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: theme.bg.panel,
                borderRadius: '6px',
                fontSize: '13px',
                color: theme.text.secondary,
                fontFamily: 'monospace'
              }}>
                {contractStatus || uploadStatus}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
