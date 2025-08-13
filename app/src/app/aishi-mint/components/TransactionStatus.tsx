'use client';

import { useTheme } from '../../../contexts/ThemeContext';
import { FiCheck, FiX, FiLoader, FiShare2, FiArrowRight } from 'react-icons/fi';
import AnimatedDots from '../../../components/ui/AnimatedDots';

interface TransactionStatusProps {
  showSuccess: boolean;
  mintedTokenId: number | null;
  agentName: string;
  isProcessing: boolean;
  isWritePending: boolean;
  writeError: any;
  txError: any;
  txHash: any;
  onShare: () => void;
  onReset: () => void;
}

export default function TransactionStatus({
  showSuccess,
  mintedTokenId,
  agentName,
  isProcessing,
  isWritePending,
  writeError,
  txError,
  txHash,
  onShare,
  onReset,
}: TransactionStatusProps) {
  const { theme } = useTheme();

  if (showSuccess) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: `${theme.bg.card}cc`,
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: `1px solid ${theme.accent.success}66`,
        animation: 'fadeIn 0.5s ease',
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          color: theme.accent.success,
        }}>
          <FiCheck />
        </div>
        
        <h2 style={{
          color: theme.text.primary,
          fontSize: '24px',
          marginBottom: '10px',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Agent Created Successfully!
        </h2>
        
        <p style={{
          color: theme.text.secondary,
          marginBottom: '30px',
        }}>
          {agentName} • Token ID #{mintedTokenId}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => window.location.href = '/agent-dashboard'}
            style={{
              padding: '12px 24px',
              backgroundColor: theme.accent.primary,
              color: theme.bg.primary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Open Dashboard
            <FiArrowRight />
          </button>
          
          <button
            onClick={onShare}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: theme.text.primary,
              border: `1px solid ${theme.accent.primary}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FiShare2 />
            Share on X
          </button>
        </div>
        
        {txHash && (
          <p style={{
            marginTop: '20px',
            fontSize: '12px',
            color: theme.text.secondary,
          }}>
            Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>
        )}
      </div>
    );
  }

  if (isProcessing) {
    return (
      <>
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
          
          .shimmer-border {
            position: relative;
            padding: 2px;
            border-radius: 20px;
            background: linear-gradient(
              90deg,
              transparent 25%,
              ${theme.accent.primary}44 50%,
              transparent 75%
            );
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          
          .shimmer-content {
            background: ${theme.bg.card};
            border-radius: 18px;
            backdrop-filter: blur(20px);
            padding: 40px;
          }
        `}</style>
        
        <div className="shimmer-border">
          <div className="shimmer-content">
            <div style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '600',
                color: theme.accent.primary,
              }}>
                {isWritePending ? (
                  <>
                    Confirm in wallet
                    <AnimatedDots color={theme.accent.primary} size={5} />
                  </>
                ) : (
                  <>
                    Creating agent
                    <AnimatedDots color={theme.accent.primary} size={5} />
                  </>
                )}
              </div>
              
              <p style={{
                color: theme.text.secondary,
                fontSize: '14px',
                margin: 0,
              }}>
                {isWritePending 
                  ? 'Please check your wallet for confirmation' 
                  : 'Processing transaction on blockchain'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (writeError || txError) {
    const error = writeError || txError;
    return (
      <div style={{
        padding: '16px',
        backgroundColor: `${theme.accent.error}22`,
        border: `1px solid ${theme.accent.error}66`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <FiX color={theme.accent.error} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{
            color: theme.text.primary,
            fontSize: '14px',
            marginBottom: '4px',
          }}>
            Transaction failed
          </p>
          <p style={{
            color: theme.text.secondary,
            fontSize: '12px',
            wordBreak: 'break-word',
          }}>
            {error?.message || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}