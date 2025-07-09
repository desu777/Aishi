'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../hooks/useWallet';
import { useAgentMint } from '../../hooks/agentHooks';
import { useAgentDream } from '../../hooks/agentHooks';
import { AgentInfo } from '../../components/agent/AgentInfo';
import DreamInput from '../../components/agent/DreamInput';
import AgentChat from '../../components/agent/AgentChat';
import { Brain, Sparkles, CheckCircle, AlertCircle, Loader2, Zap, Info, Moon, MessageCircle } from 'lucide-react';

export default function AgentTest() {
  const { theme, debugLog } = useTheme();
  const { 
    isConnected, 
    address, 
    connectWallet, 
    isCorrectNetwork, 
    switchToOGNetwork
  } = useWallet();
  
  // Agent mint hook
  const {
    mintAgent,
    isLoading,
    isWaitingForReceipt,
    error,
    txHash,
    tokenId,
    resetMint,
    getTransactionUrl,
    isWalletConnected,
    isCorrectNetwork: mintNetworkCheck,
    contractAddress,
    hasCurrentBalance,
    currentBalance
  } = useAgentMint();
  
  // Agent dream hook for testing
  const {
    testContractCall,
    checkCanProcessDreamToday,
    hasAgent: dreamHasAgent,
    userTokenId: dreamUserTokenId,
    userAgent: dreamUserAgent
  } = useAgentDream();
  
  // Local state
  const [agentName, setAgentName] = useState('');
  const [mode, setMode] = useState<'mint' | 'info' | 'dream' | 'chat'>('mint');
  const [lastMintedAgent, setLastMintedAgent] = useState<{
    name: string;
    txHash: string;
    timestamp: number;
  } | null>(null);
  
  // Debug log on start
  debugLog('Agent Test page loaded');

  // Handle mint agent
  const handleMintAgent = async () => {
    if (!agentName.trim()) {
      alert('Please enter an agent name');
      return;
    }
    
    const result = await mintAgent(agentName.trim());
    
    if (result.success && result.txHash) {
      // Only clear input when transaction is sent, not when confirmed
      setAgentName(''); 
      debugLog('Agent transaction sent', result);
    }
  };

  // Update lastMintedAgent when tokenId is confirmed
  useEffect(() => {
    if (tokenId && txHash) {
      setLastMintedAgent({
        name: '', // We don't store the name anymore since input was cleared
        txHash: txHash,
        timestamp: Date.now()
      });
      debugLog('Agent minted and confirmed', { tokenId: tokenId.toString() });
    }
  }, [tokenId, txHash, debugLog]);

  return (
    <Layout>
      <div style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            🧠 Agent Testing
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: theme.text.secondary,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Test interface for minting Dream Agents and managing iNFT contracts
          </p>
        </div>

        {/* Contract Info */}
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
            Contract Information
          </h3>
          
          <div style={{ color: theme.text.secondary, fontSize: '14px' }}>
            <p><strong>Contract:</strong> {contractAddress}</p>
            <p><strong>Network:</strong> 0G Galileo Testnet (Chain ID: 16601)</p>
            <p><strong>Function:</strong> mintAgent(proofs[], descriptions[], agentName, to)</p>
            <p><strong>Minting Fee:</strong> 0.1 OG per agent</p>
          </div>
        </div>

        {/* Wallet Status */}
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
            Wallet Status
          </h3>
          
          {!isConnected ? (
            <button
              onClick={connectWallet}
              style={{
                backgroundColor: theme.accent.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Connect Wallet
            </button>
          ) : !isCorrectNetwork ? (
            <button
              onClick={switchToOGNetwork}
              style={{
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Switch to 0G Network
            </button>
          ) : (
            <div style={{ color: theme.text.primary }}>
              ✅ Connected: {address}
              {currentBalance && (
                <div style={{ 
                  color: theme.text.secondary, 
                  fontSize: '14px', 
                  marginTop: '5px' 
                }}>
                  Balance: {currentBalance.formatted} {currentBalance.symbol}
                  {!hasCurrentBalance && (
                    <span style={{ color: '#ff4444', marginLeft: '8px' }}>
                      (Need 0.1 OG to mint)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {isConnected && isCorrectNetwork && (
          <>
            {/* Mode Toggle */}
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
                Mode Selection
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setMode('mint')}
                  style={{
                    backgroundColor: mode === 'mint' ? theme.accent.primary : theme.bg.panel,
                    color: mode === 'mint' ? 'white' : theme.text.primary,
                    border: `1px solid ${mode === 'mint' ? theme.accent.primary : theme.border}`,
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} />
                  Mint Agent
                </button>
                
                <button
                  onClick={() => setMode('info')}
                  style={{
                    backgroundColor: mode === 'info' ? theme.accent.primary : theme.bg.panel,
                    color: mode === 'info' ? 'white' : theme.text.primary,
                    border: `1px solid ${mode === 'info' ? theme.accent.primary : theme.border}`,
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Info size={16} />
                  Agent Info
                </button>
                
                <button
                  onClick={() => setMode('dream')}
                  style={{
                    backgroundColor: mode === 'dream' ? theme.accent.primary : theme.bg.panel,
                    color: mode === 'dream' ? 'white' : theme.text.primary,
                    border: `1px solid ${mode === 'dream' ? theme.accent.primary : theme.border}`,
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Moon size={16} />
                  Dream Analysis
                </button>
                
                <button
                  onClick={() => setMode('chat')}
                  style={{
                    backgroundColor: mode === 'chat' ? theme.accent.primary : theme.bg.panel,
                    color: mode === 'chat' ? 'white' : theme.text.primary,
                    border: `1px solid ${mode === 'chat' ? theme.accent.primary : theme.border}`,
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <MessageCircle size={16} />
                  Agent Chat
                </button>
              </div>
            </div>

            {/* Conditional Content Based on Mode */}
            {mode === 'mint' && (
              <>
                {/* Mint Agent Section */}
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
                <Sparkles size={20} />
                Mint Dream Agent (0.1 OG Fee)
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
                💡 Minting requires 0.1 OG fee. Agent starts as a "blank slate" with neutral personality traits (all 50).
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
                    Agent Name:
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter your agent's name..."
                    maxLength={50}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.bg.panel,
                      color: theme.text.primary,
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                {error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ff4444',
                    fontSize: '14px',
                    padding: '10px',
                    backgroundColor: theme.bg.panel,
                    borderRadius: '6px'
                  }}>
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={handleMintAgent}
                    disabled={isLoading || isWaitingForReceipt || !agentName.trim() || !hasCurrentBalance}
                    style={{
                      backgroundColor: theme.accent.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      cursor: isLoading || isWaitingForReceipt || !agentName.trim() || !hasCurrentBalance ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: isLoading || isWaitingForReceipt || !agentName.trim() || !hasCurrentBalance ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Sending Transaction...
                      </>
                    ) : isWaitingForReceipt ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Waiting for Confirmation...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Mint Agent
                      </>
                    )}
                  </button>
                  
                  {(error || txHash) && (
                    <button
                      onClick={resetMint}
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

                {txHash && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '15px',
                    backgroundColor: theme.bg.panel,
                    borderRadius: '8px',
                    border: `1px solid ${tokenId ? '#44ff44' : theme.accent.primary}33`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: tokenId ? '#44ff44' : theme.accent.primary,
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {tokenId ? <CheckCircle size={16} /> : <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                      {tokenId ? 'Agent Minted Successfully!' : 'Transaction Sent - Waiting for Confirmation...'}
                    </div>
                    
                    {tokenId && (
                      <div style={{
                        fontSize: '12px',
                        color: theme.text.primary,
                        marginTop: '5px'
                      }}>
                        <strong>Token ID:</strong> #{tokenId.toString()}
                      </div>
                    )}
                    
                    <div style={{
                      fontSize: '12px',
                      color: theme.text.secondary,
                      wordBreak: 'break-all'
                    }}>
                      <strong>Transaction:</strong> 
                      <a 
                        href={getTransactionUrl(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.accent.primary,
                          textDecoration: 'none',
                          marginLeft: '5px'
                        }}
                      >
                        {txHash.slice(0, 10)}...{txHash.slice(-8)}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Last Minted Agent */}
            {lastMintedAgent && (
              <div style={{
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  color: theme.text.primary,
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Brain size={20} />
                  Last Minted Agent
                </h3>
                
                <div style={{
                  padding: '15px',
                  backgroundColor: theme.bg.panel,
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`
                }}>
                  <div style={{ color: theme.text.primary, fontWeight: '600', marginBottom: '5px' }}>
                    {lastMintedAgent.name}
                  </div>
                  <div style={{ color: theme.text.secondary, fontSize: '12px' }}>
                    Minted: {new Date(lastMintedAgent.timestamp).toLocaleString()}
                  </div>
                  <div style={{ color: theme.text.secondary, fontSize: '12px', marginTop: '5px' }}>
                    TX: 
                    <a 
                      href={getTransactionUrl(lastMintedAgent.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: theme.accent.primary,
                        textDecoration: 'none',
                        marginLeft: '5px'
                      }}
                    >
                      {lastMintedAgent.txHash.slice(0, 10)}...{lastMintedAgent.txHash.slice(-8)}
                    </a>
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {/* Agent Info Mode */}
            {mode === 'info' && (
              <AgentInfo />
            )}

            {/* Dream Analysis Mode */}
            {mode === 'dream' && (
              <>
                {/* Direct Contract Test Button */}
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
                    Direct Contract Test
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
                    🧪 Test direct contract call with mock data to see what errors occur
                  </div>

                  {/* Agent Info Display */}
                  {dreamHasAgent && dreamUserAgent && (
                    <div style={{
                      fontSize: '12px',
                      color: theme.text.secondary,
                      marginBottom: '15px',
                      padding: '10px',
                      backgroundColor: theme.bg.panel,
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <div><strong>Agent:</strong> {dreamUserAgent.agentName}</div>
                      <div><strong>Token ID:</strong> #{dreamUserTokenId?.toString()}</div>
                      <div><strong>Dreams Processed:</strong> {dreamUserAgent.dreamCount?.toString()}</div>
                      <div><strong>Intelligence Level:</strong> {dreamUserAgent.intelligenceLevel?.toString()}</div>
                      <div><strong>Personality Initialized:</strong> {dreamUserAgent.personalityInitialized ? 'Yes' : 'No'}</div>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginBottom: '15px'
                  }}>
                    <button
                      onClick={async () => {
                        try {
                          debugLog('Testing canProcessDreamToday check...');
                          const canProcess = await checkCanProcessDreamToday();
                          debugLog('canProcessDreamToday result:', { canProcess });
                          alert(`Can process dream today: ${canProcess}`);
                        } catch (error: any) {
                          debugLog('canProcessDreamToday check failed:', error);
                          alert(`Check failed: ${error.message}`);
                        }
                      }}
                      disabled={!dreamHasAgent || !dreamUserTokenId}
                      style={{
                        backgroundColor: theme.accent.secondary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        cursor: !dreamHasAgent || !dreamUserTokenId ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        opacity: !dreamHasAgent || !dreamUserTokenId ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle size={16} />
                      Check Dream Status
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          debugLog('Testing direct contract call...');
                          const txHash = await testContractCall({
                            dreamHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                            analysisHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                            impact: {
                              creativityChange: 2,
                              analyticalChange: 1,
                              empathyChange: 1,
                              intuitionChange: 1,
                              resilienceChange: 1,
                              curiosityChange: 1,
                              moodShift: 'contemplative',
                              evolutionWeight: 5
                            }
                          });
                          debugLog('Contract call succeeded!', { txHash });
                          alert(`Contract call succeeded! TX: ${txHash}`);
                        } catch (error: any) {
                          debugLog('Contract call failed:', error);
                          alert(`Contract call failed: ${error.message}`);
                        }
                      }}
                      disabled={!dreamHasAgent || !dreamUserTokenId}
                      style={{
                        backgroundColor: theme.accent.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        cursor: !dreamHasAgent || !dreamUserTokenId ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        opacity: !dreamHasAgent || !dreamUserTokenId ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Zap size={16} />
                      Test Contract Call
                    </button>
                  </div>
                  
                  {(!dreamHasAgent || !dreamUserTokenId) && (
                    <div style={{
                      fontSize: '12px',
                      color: theme.text.secondary,
                      marginTop: '10px'
                    }}>
                      ⚠️ You need to mint an agent first to test contract calls
                    </div>
                  )}
                </div>
                
                <DreamInput />
              </>
            )}

            {/* Agent Chat Mode */}
            {mode === 'chat' && (
              <AgentChat />
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 