'use client';

import { useMemo } from 'react';
import { useAgentRead } from '../../hooks/agentHooks';
import { useTheme } from '../../contexts/ThemeContext';
import { Brain, Sparkles, TrendingUp, MessageCircle, Zap, User, Calendar, Hash, DollarSign, Users } from 'lucide-react';

export default function AgentInfo() {
  const { theme } = useTheme();
  const {
    userAgent,
    userTokenId,
    hasAgent,
    userAgentLoading,
    userAgentError,
    totalAgents,
    totalSupply,
    totalFeesCollected,
    nextTokenId,
    maxAgents,
    leftToMint,
    contractName,
    contractSymbol,
    userBalance,
    isLoading,
    contractAddress,
  } = useAgentRead();

  // Format BigInt values for display
  const formatBigInt = (value: bigint | undefined) => {
    if (!value) return '0';
    return value.toString();
  };

  // Format timestamp
  const formatTimestamp = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Never';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Calculate personality average
  const personalityAverage = useMemo(() => {
    if (!userAgent?.personality) return 0;
    const traits = [
      userAgent.personality.creativity,
      userAgent.personality.analytical,
      userAgent.personality.empathy,
      userAgent.personality.intuition,
      userAgent.personality.resilience,
      userAgent.personality.curiosity,
    ];
    return Math.round(traits.reduce((a, b) => a + b, 0) / traits.length);
  }, [userAgent]);

  // Get personality color based on value
  const getPersonalityColor = (value: number) => {
    if (value >= 80) return '#44ff44';
    if (value >= 60) return '#ffff44';
    if (value >= 40) return '#ff8844';
    return '#ff4444';
  };

  // Get personality bar width
  const getPersonalityBarWidth = (value: number) => {
    return Math.max(5, (value / 100) * 100);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: theme.text.secondary
      }}>
        <Sparkles size={24} style={{ marginRight: '10px', animation: 'pulse 2s infinite' }} />
        Loading agent information...
      </div>
    );
  }

  if (userAgentError) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: theme.bg.card,
        border: `1px solid #ff4444`,
        borderRadius: '12px',
        color: '#ff4444',
        textAlign: 'center'
      }}>
        <p>Error loading agent information:</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          {userAgentError.message}
        </p>
      </div>
    );
  }

  if (!hasAgent) {
    return (
      <div style={{
        padding: '40px',
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <Brain size={48} style={{ color: theme.text.secondary, marginBottom: '20px' }} />
        <h3 style={{ color: theme.text.primary, marginBottom: '10px' }}>No Agent Found</h3>
        <p style={{ color: theme.text.secondary, fontSize: '14px' }}>
          You don't have a Dream Agent yet. Mint one to get started!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Agent Basic Info */}
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
          <Brain size={20} />
          Agent Profile
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <label style={{ color: theme.text.secondary, fontSize: '12px' }}>Agent Name</label>
            <div style={{ 
              color: theme.text.primary, 
              fontWeight: '600', 
              fontSize: '18px',
              marginTop: '5px'
            }}>
              {userAgent?.agentName || 'Unnamed Agent'}
            </div>
          </div>
          
          <div>
            <label style={{ color: theme.text.secondary, fontSize: '12px' }}>Token ID</label>
            <div style={{ 
              color: theme.text.primary, 
              fontWeight: '600',
              marginTop: '5px'
            }}>
              #{formatBigInt(userTokenId as bigint)}
            </div>
          </div>
          
          <div>
            <label style={{ color: theme.text.secondary, fontSize: '12px' }}>Created</label>
            <div style={{ 
              color: theme.text.primary, 
              marginTop: '5px'
            }}>
              {formatTimestamp(userAgent?.createdAt)}
            </div>
          </div>
          
          <div>
            <label style={{ color: theme.text.secondary, fontSize: '12px' }}>Intelligence Level</label>
            <div style={{ 
              color: theme.accent.primary, 
              fontWeight: '600',
              marginTop: '5px'
            }}>
              Level {formatBigInt(userAgent?.intelligenceLevel)}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Statistics */}
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
          <TrendingUp size={20} />
          Agent Statistics
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <Sparkles size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {formatBigInt(userAgent?.dreamCount)}
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Dreams</div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <MessageCircle size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {formatBigInt(userAgent?.conversationCount)}
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Conversations</div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <Zap size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {formatBigInt(userAgent?.totalEvolutions)}
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Evolutions</div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <Brain size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {personalityAverage}%
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Personality Avg</div>
          </div>
        </div>
      </div>

      {/* Personality Traits */}
      {userAgent?.personality && (
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
            <User size={20} />
            Personality Traits
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {[
              { name: 'Creativity', value: userAgent.personality.creativity },
              { name: 'Analytical', value: userAgent.personality.analytical },
              { name: 'Empathy', value: userAgent.personality.empathy },
              { name: 'Intuition', value: userAgent.personality.intuition },
              { name: 'Resilience', value: userAgent.personality.resilience },
              { name: 'Curiosity', value: userAgent.personality.curiosity },
            ].map((trait) => (
              <div key={trait.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  minWidth: '80px',
                  fontSize: '14px',
                  color: theme.text.secondary,
                  fontWeight: '500'
                }}>
                  {trait.name}
                </div>
                <div style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: theme.bg.panel,
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${getPersonalityBarWidth(trait.value)}%`,
                    backgroundColor: getPersonalityColor(trait.value),
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{
                  minWidth: '35px',
                  fontSize: '14px',
                  color: theme.text.primary,
                  fontWeight: '600'
                }}>
                  {trait.value}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              color: theme.text.secondary,
              marginBottom: '5px'
            }}>
              Dominant Mood
            </div>
            <div style={{
              fontSize: '16px',
              color: theme.text.primary,
              fontWeight: '600'
            }}>
              {userAgent.personality.dominantMood || 'Neutral'}
            </div>
          </div>
        </div>
      )}

      {/* Contract Statistics */}
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
          <Hash size={20} />
          Network Statistics
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <Users size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {formatBigInt(totalAgents as bigint)}
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Total Agents</div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <Sparkles size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {leftToMint ? formatBigInt(leftToMint) : 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Left to Mint</div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <DollarSign size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {formatBigInt(totalFeesCollected as bigint)} OG
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Fees Collected</div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: theme.bg.panel,
            borderRadius: '8px'
          }}>
            <Hash size={24} style={{ color: theme.accent.primary, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: '600', color: theme.text.primary }}>
              {formatBigInt(nextTokenId as bigint)}
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary }}>Next Token ID</div>
          </div>
        </div>
      </div>
    </div>
  );
} 