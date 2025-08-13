'use client';

import Image from 'next/image';
import { useTheme } from '../../../contexts/ThemeContext';
import { FiCheck, FiX, FiLoader, FiZap } from 'react-icons/fi';
import { formatEther } from 'viem';

interface MintFormProps {
  agentName: string;
  setAgentName: (name: string) => void;
  nameError: string;
  isCheckingName: boolean;
  canMint: boolean;
  isProcessing: boolean;
  maxNameLength: number;
  mintingFee: bigint;
  onMint: () => void;
}

export default function MintForm({
  agentName,
  setAgentName,
  nameError,
  isCheckingName,
  canMint,
  isProcessing,
  maxNameLength,
  mintingFee,
  onMint,
}: MintFormProps) {
  const { theme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Title */}
      <div>
        {/* Motivational Slogan */}
        <p style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#8B5CF6',
          marginBottom: '12px',
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '0.5px',
        }}>
          Are you ready to train your digital soul?
        </p>
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: theme.text.primary,
          marginBottom: '8px',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Birth Your Digital Companion
        </h1>
        
        <p style={{
          color: theme.text.secondary,
          fontSize: '14px',
        }}>
          One agent per wallet • Evolves through your interactions
        </p>
      </div>

      {/* Name Input */}
      <div>
        <label style={{
          display: 'block',
          color: theme.text.secondary,
          fontSize: '14px',
          marginBottom: '8px',
          fontWeight: '500',
        }}>
          Give Name For Your Agent
        </label>
        
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Choose a unique name..."
            style={{
              width: '100%',
              padding: '14px 16px',
              paddingRight: '60px',
              backgroundColor: `${theme.bg.primary}88`,
              border: `1px solid ${nameError ? theme.accent.error : theme.accent.primary}44`,
              borderRadius: '8px',
              color: '#000000',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.accent.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accent.primary}22`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = `${nameError ? theme.accent.error : theme.accent.primary}44`;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          
          {/* Character counter */}
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: agentName.length > maxNameLength ? theme.accent.error : theme.text.secondary,
            fontSize: '12px',
            fontFamily: 'monospace',
          }}>
            {agentName.length}/{maxNameLength}
          </div>
        </div>
        
        {/* Name validation feedback */}
        {agentName && (
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: nameError ? theme.accent.error : theme.accent.success,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {isCheckingName ? (
              <>
                <FiLoader style={{ animation: 'spin 1s linear infinite' }} />
                Checking availability...
              </>
            ) : nameError ? (
              <>
                <FiX />
                {nameError}
              </>
            ) : (
              <>
                <FiCheck />
                Name available!
              </>
            )}
          </div>
        )}
      </div>

      {/* Minting Fee Info */}
      <div style={{
        padding: '16px',
        backgroundColor: `${theme.bg.primary}44`,
        borderRadius: '8px',
        border: `1px solid ${theme.accent.primary}22`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            color: theme.text.secondary,
            fontSize: '14px',
          }}>
            Minting Fee
          </span>
          <span style={{
            color: theme.accent.primary,
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}>
            {formatEther(mintingFee)} OG
          </span>
        </div>
      </div>

      {/* Mint Button */}
      <button
        onClick={onMint}
        disabled={!canMint || isProcessing}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: canMint && !isProcessing ? theme.bg.primary : theme.text.secondary,
          backgroundColor: canMint && !isProcessing ? theme.accent.primary : `${theme.accent.primary}44`,
          border: 'none',
          borderRadius: '8px',
          cursor: canMint && !isProcessing ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
        onMouseEnter={(e) => {
          if (canMint && !isProcessing) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${theme.accent.primary}66`;
          }
        }}
        onMouseLeave={(e) => {
          if (canMint && !isProcessing) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {isProcessing ? (
          <>
            <FiLoader style={{ animation: 'spin 1s linear infinite' }} />
            Processing...
          </>
        ) : (
          <>
            <FiZap />
            Create Agent
          </>
        )}
      </button>

      {/* Contract Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: 0.7,
      }}>
        <span style={{
          fontSize: '11px',
          color: theme.text.secondary,
        }}>
          Network:
        </span>
        <Image
          src="/og.png"
          alt="0G Network"
          width={60}
          height={30}
          style={{
            opacity: 0.8,
          }}
        />
      </div>
    </div>
  );
}