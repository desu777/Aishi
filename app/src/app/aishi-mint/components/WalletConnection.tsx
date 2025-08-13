'use client';

import { useTheme } from '../../../contexts/ThemeContext';
import { FiWallet } from 'react-icons/fi';
import { formatEther } from 'viem';
import ConnectButton from '../../../components/wallet/ConnectButton';

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
      <div style={{ width: '100%' }}>
        <ConnectButton />
      </div>
    );
  }

  if (hasExistingAgent) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: `${theme.bg.card}cc`,
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: `1px solid ${theme.accent.primary}33`,
        textAlign: 'center',
      }}>
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
          onClick={() => window.location.href = '/agent-dashboard'}
          style={{
            padding: '10px 20px',
            backgroundColor: theme.accent.primary,
            color: theme.bg.primary,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Go to Dashboard
        </button>
      </div>
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