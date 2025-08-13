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
          
          .shimmer-border-success {
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
          
          .shimmer-content-success {
            background: ${theme.bg.card};
            border-radius: 18px;
            backdrop-filter: blur(20px);
            padding: 40px 20px;
          }
        `}</style>
        
        <div className="shimmer-border-success">
          <div className="shimmer-content-success">
            <div style={{
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                color: theme.accent.primary,
              }}>
                <FiCheck />
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                fontSize: '24px',
                fontWeight: '600',
                color: theme.text.primary,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Agent created
                <AnimatedDots color={theme.accent.primary} size={6} />
              </div>
        
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
            onClick={() => window.location.href = '/aishiOS'}
            style={{
              padding: '12px 24px',
              backgroundColor: theme.accent.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Open Terminal
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
          <div style={{ marginTop: '20px' }}>
            <p style={{
              fontSize: '12px',
              color: theme.text.secondary,
              marginBottom: '8px',
            }}>
              Transaction completed:
            </p>
            <a
              href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: theme.accent.primary,
                textDecoration: 'underline',
                cursor: 'pointer',
                wordBreak: 'break-all',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.accent.primary;
              }}
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          </div>
        )}
            </div>
          </div>
        </div>
      </>
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