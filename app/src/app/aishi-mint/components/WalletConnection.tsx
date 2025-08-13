'use client';

import { useTheme } from '../../../contexts/ThemeContext';
import { FiWallet } from 'react-icons/fi';
import { formatEther } from 'viem';
import ConnectButton from '../../../components/wallet/ConnectButton';
import WalletPrompt from '../../../components/wallet/WalletPrompt';

interface WalletConnectionProps {
  isConnected: boolean;
  hasExistingAgent: boolean;
  existingTokenId: any;
  hasInsufficientBalance: boolean;
  balance: any;
  mintingFee: bigint;
}

export default function WalletConnection({
  isConnected,
  hasExistingAgent,
  existingTokenId,
  hasInsufficientBalance,
  balance,
  mintingFee,
}: WalletConnectionProps) {
  const { theme } = useTheme();

  if (!isConnected) {
    return (
      <div style={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        <WalletPrompt />
        <ConnectButton />
      </div>
    );
  }

  if (hasExistingAgent) {
    return (
      <>
        <style jsx>{`
          @keyframes shimmer-existing {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
          
          .shimmer-border-existing {
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
            animation: shimmer-existing 2s infinite;
          }
          
          .shimmer-content-existing {
            background: ${theme.bg.card};
            border-radius: 18px;
            backdrop-filter: blur(20px);
            padding: 20px;
            text-align: center;
          }
        `}</style>
        
        <div className="shimmer-border-existing">
          <div className="shimmer-content-existing">
            <h3 style={{
              color: theme.text.primary,
              fontSize: '18px',
              marginBottom: '10px',
            }}>
              You Already Have an Agent
            </h3>
            <p style={{
              color: theme.text.secondary,
              marginBottom: '15px',
            }}>
              Token ID #{existingTokenId?.toString()}
            </p>
            <button
              onClick={() => window.location.href = '/aishiOS'}
              style={{
                padding: '10px 20px',
                backgroundColor: theme.accent.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Go to Terminal
            </button>
          </div>
        </div>
      </>
    );
  }

  if (hasInsufficientBalance) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: `${theme.accent.error}22`,
        border: `1px solid ${theme.accent.error}66`,
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <p style={{ 
          color: theme.text.primary, 
          fontSize: '14px',
          marginBottom: '8px',
        }}>
          Insufficient balance
        </p>
        <p style={{ 
          color: theme.text.secondary, 
          fontSize: '12px' 
        }}>
          You need {formatEther(mintingFee)} OG to mint
        </p>
        {balance && (
          <p style={{ 
            color: theme.text.secondary, 
            fontSize: '12px',
            marginTop: '4px',
          }}>
            Current balance: {formatEther(balance.value)} OG
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: `${theme.bg.card}cc`,
      backdropFilter: 'blur(10px)',
      borderRadius: '8px',
      border: `1px solid ${theme.accent.primary}22`,
    }}>
      <span style={{
        color: theme.text.secondary,
        fontSize: '12px',
      }}>
        Connected
      </span>
      <ConnectButton />
    </div>
  );
}