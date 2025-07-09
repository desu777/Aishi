'use client';

import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Moon, Sparkles, Eye, Download, FileText, Activity, Loader2, AlertCircle } from 'lucide-react';
import { useAgentDream } from '../../../hooks/agentHooks/useAgentDream';

interface DreamAnalysisSectionProps {
  hasAgent: boolean;
  effectiveTokenId: number | undefined;
}

export default function DreamAnalysisSection({
  hasAgent,
  effectiveTokenId
}: DreamAnalysisSectionProps) {
  const { theme } = useTheme();
  const [dreamInput, setDreamInput] = useState('');
  const [dreamContext, setDreamContext] = useState('');
  const [storageContent, setStorageContent] = useState('');
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
  const [downloadedFile, setDownloadedFile] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  
  const {
    buildDreamContext,
    saveDreamToStorage,
    isAnalyzing,
    isSavingToStorage,
    isProcessingOnChain,
    isWaitingForReceipt,
    error: dreamError
  } = useAgentDream();

  const handleBuildContext = async () => {
    if (!effectiveTokenId || !dreamInput.trim()) {
      alert('Token ID and dream input are required');
      return;
    }
    
    setIsTestingWorkflow(true);
    try {
      const result = await buildDreamContext(BigInt(effectiveTokenId), dreamInput.trim());
      setDreamContext(result);
    } catch (error) {
      console.error('Error building dream context:', error);
      setDreamContext('Error building context: ' + (error as Error).message);
    } finally {
      setIsTestingWorkflow(false);
    }
  };

  const handleSaveDream = async () => {
    if (!effectiveTokenId || !dreamInput.trim()) {
      alert('Token ID and dream input are required');
      return;
    }
    
    setIsTestingWorkflow(true);
    try {
      const result = await saveDreamToStorage(effectiveTokenId, dreamInput.trim());
      setStorageContent(JSON.stringify(result, null, 2));
      setDreamInput('');
    } catch (error) {
      console.error('Error saving dream:', error);
      setStorageContent('Error saving dream: ' + (error as Error).message);
    } finally {
      setIsTestingWorkflow(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!effectiveTokenId) {
      alert('Token ID is required');
      return;
    }
    
    setIsDownloading(true);
    setDownloadError('');
    
    try {
      const response = await fetch(`/api/dreams/download?tokenId=${effectiveTokenId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.content) {
        setDownloadedFile(data);
      } else {
        setDownloadError(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setDownloadError((error as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadJson = () => {
    if (!downloadedFile) return;
    
    const dataStr = JSON.stringify(downloadedFile.content, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `daily_dreams_${effectiveTokenId}_${downloadedFile.content.fileNumber}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!hasAgent) {
    return (
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} style={{ color: theme.text.secondary, marginBottom: '20px' }} />
        <h3 style={{ color: theme.text.primary, marginBottom: '10px' }}>
          No Agent Selected
        </h3>
        <p style={{ color: theme.text.secondary, fontSize: '14px' }}>
          You need to have an agent to analyze dreams.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* STEP 1: Dream Input Field */}
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{
          color: theme.text.primary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Moon size={20} />
          🌙 STEP 1: Dream Input
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
          💡 Describe your dream in detail. The more vivid and specific, the better the AI analysis will be.
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div>
            <label style={{
              display: 'block',
              color: theme.text.secondary,
              fontSize: '14px',
              marginBottom: '5px'
            }}>
              Dream Description:
            </label>
            <textarea
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              placeholder="I dreamed that I was flying over a vast ocean under a purple sky. The waves below were made of silver light, and I could hear whispers in an unknown language..."
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
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: theme.text.secondary
            }}>
              Characters: {dreamInput.length} / 2000
            </div>
            <div style={{
              fontSize: '12px',
              color: dreamInput.trim() ? theme.accent.primary : theme.text.secondary
            }}>
              {dreamInput.trim() ? '✓ Ready for analysis' : '○ Enter your dream first'}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: Dream Context Builder */}
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px',
        opacity: dreamInput.trim() ? 1 : 0.6
      }}>
        <h3 style={{
          color: theme.text.primary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Activity size={20} />
          🧠 STEP 2: Context Builder
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
          💡 Build rich context from previous dreams, personality traits, and memory access data + your current dream.
          {!dreamInput.trim() && (
            <div style={{ 
              marginTop: '8px', 
              color: theme.text.secondary,
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              ⚠️ Please enter your dream in Step 1 first.
            </div>
          )}
        </div>

        <button
          onClick={handleBuildContext}
          disabled={isTestingWorkflow || !dreamInput.trim()}
          style={{
            backgroundColor: theme.accent.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: (isTestingWorkflow || !dreamInput.trim()) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: (isTestingWorkflow || !dreamInput.trim()) ? 0.7 : 1,
            marginBottom: '20px'
          }}
        >
          {isTestingWorkflow ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Building Context + Dream...
            </>
          ) : !dreamInput.trim() ? (
            <>
              <Activity size={16} />
              Build Context (Need Dream First)
            </>
          ) : (
            <>
              <Activity size={16} />
              Build Context + Dream
            </>
          )}
        </button>

        {dreamContext && (
          <div style={{
            backgroundColor: theme.bg.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '15px',
            fontSize: '12px',
            color: theme.text.secondary,
            fontFamily: 'monospace',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{
              color: theme.text.primary,
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Generated Context ({dreamContext.length} chars):
            </div>
            <pre style={{
              margin: '0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {dreamContext}
            </pre>
          </div>
        )}
      </div>

      {/* Dream Storage Tester */}
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{
          color: theme.text.primary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Moon size={20} />
          💾 Dream Storage Tester (KROK 3)
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
          💡 Tests append-only pattern: fetches existing dreams + adds new dream as essence (max 2 sentences).
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div>
            <label style={{
              display: 'block',
              color: theme.text.secondary,
              fontSize: '14px',
              marginBottom: '5px'
            }}>
              Dream Input (will be converted to essence):
            </label>
            <textarea
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              placeholder="Describe your dream here..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bg.panel,
                color: theme.text.primary,
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={handleSaveDream}
            disabled={isTestingWorkflow || !dreamInput.trim()}
            style={{
              backgroundColor: theme.accent.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: isTestingWorkflow || !dreamInput.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isTestingWorkflow || !dreamInput.trim() ? 0.7 : 1
            }}
          >
            {isTestingWorkflow ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Processing Dream...
              </>
            ) : (
              <>
                <Moon size={16} />
                Save Dream to Storage
              </>
            )}
          </button>

          {storageContent && (
            <div style={{
              backgroundColor: theme.bg.panel,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '15px',
              fontSize: '12px',
              color: theme.text.secondary,
              fontFamily: 'monospace',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{
                color: theme.text.primary,
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Storage Result:
              </div>
              <pre style={{
                margin: '0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {storageContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Storage File Viewer */}
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{
          color: theme.text.primary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FileText size={20} />
          📁 Daily Dreams Storage File Viewer
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
          💡 Download and view current daily dreams JSON file from 0G Storage using currentDreamDailyHash.
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleDownloadFile}
            disabled={isDownloading}
            style={{
              backgroundColor: theme.accent.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isDownloading ? 0.7 : 1
            }}
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Downloading...
              </>
            ) : (
              <>
                <Eye size={16} />
                Fetch from Storage
              </>
            )}
          </button>

          {downloadedFile && (
            <button
              onClick={downloadJson}
              style={{
                backgroundColor: theme.bg.panel,
                color: theme.text.primary,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} />
              Download JSON
            </button>
          )}
        </div>

        {downloadError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ff4444',
            fontSize: '14px',
            padding: '10px',
            backgroundColor: theme.bg.panel,
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <AlertCircle size={16} />
            {downloadError}
          </div>
        )}

        {downloadedFile && (
          <div style={{
            backgroundColor: theme.bg.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h4 style={{
                color: theme.text.primary,
                fontSize: '16px',
                margin: '0'
              }}>
                File Information
              </h4>
              <span style={{
                color: theme.text.secondary,
                fontSize: '12px'
              }}>
                Size: {downloadedFile.size} bytes
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ color: theme.text.secondary }}>File Number:</span>
                <span style={{ color: theme.text.primary, marginLeft: '8px' }}>
                  {downloadedFile.content.fileNumber}
                </span>
              </div>
              <div>
                <span style={{ color: theme.text.secondary }}>Total Dreams:</span>
                <span style={{ color: theme.text.primary, marginLeft: '8px' }}>
                  {downloadedFile.content.totalDreams}
                </span>
              </div>
              <div>
                <span style={{ color: theme.text.secondary }}>Version:</span>
                <span style={{ color: theme.text.primary, marginLeft: '8px' }}>
                  {downloadedFile.content.version}
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: theme.bg.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '15px',
              fontSize: '12px',
              color: theme.text.secondary,
              fontFamily: 'monospace',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{
                color: theme.text.primary,
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                JSON Content:
              </div>
              <pre style={{
                margin: '0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(downloadedFile.content, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 