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
      gap: theme.spacing.lg,
    }}>
      {/* Title */}
      <div>
        {/* Motivational Slogan */}
        <p style={{
          fontSize: `clamp(${theme.typography.fontSizes.sm}, 3vw, ${theme.typography.fontSizes.md})`,
          fontWeight: theme.typography.fontWeights.semibold,
          color: theme.accent.primary,
          marginBottom: theme.spacing.sm,
          fontFamily: theme.typography.fontFamilies.primary,
          letterSpacing: '0.5px',
        }}>
          Are you ready to train your digital soul?
        </p>
        
        <h1 style={{
          fontSize: `clamp(${theme.typography.fontSizes.lg}, 5vw, ${theme.typography.fontSizes.xl})`,
          fontWeight: theme.typography.fontWeights.bold,
          color: theme.text.primary,
          marginBottom: theme.spacing.xs,
          fontFamily: theme.typography.fontFamilies.primary,
        }}>
          Birth Your Digital Companion
        </h1>
        
        <p style={{
          color: theme.text.secondary,
          fontSize: theme.typography.fontSizes.sm,
        }}>
          One agent per wallet • Evolves through your interactions
        </p>
      </div>

      {/* Name Input */}
      <div>
        <label style={{
          display: 'block',
          color: theme.text.secondary,
          fontSize: theme.typography.fontSizes.sm,
          marginBottom: theme.spacing.xs,
          fontWeight: theme.typography.fontWeights.medium,
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
              padding: `clamp(12px, 2vw, ${theme.spacing.sm}) ${theme.spacing.md}`,
              paddingRight: '60px',
              minHeight: '48px',
              backgroundColor: `${theme.bg.primary}88`,
              border: `1px solid ${nameError ? theme.accent.error : theme.accent.primary}44`,
              borderRadius: theme.radius.md,
              color: '#000000',
              fontSize: `clamp(${theme.typography.fontSizes.sm}, 3vw, ${theme.typography.fontSizes.md})`,
              outline: 'none',
              transition: theme.effects.transitions.normal,
              fontFamily: theme.typography.fontFamilies.primary,
              touchAction: 'manipulation',
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
            right: theme.spacing.md,
            top: '50%',
            transform: 'translateY(-50%)',
            color: agentName.length > maxNameLength ? theme.accent.error : theme.text.secondary,
            fontSize: theme.typography.fontSizes.xs,
            fontFamily: theme.typography.fontFamilies.monospace,
          }}>
            {agentName.length}/{maxNameLength}
          </div>
        </div>
        
        {/* Name validation feedback */}
        {agentName && (
          <div style={{
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSizes.xs,
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
        padding: theme.spacing.md,
        backgroundColor: `${theme.bg.primary}44`,
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.accent.primary}22`,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            color: theme.text.secondary,
            fontSize: theme.typography.fontSizes.sm,
          }}>
            Minting Fee
          </span>
          <span style={{
            color: theme.accent.primary,
            fontSize: theme.typography.fontSizes.lg,
            fontWeight: theme.typography.fontWeights.bold,
            fontFamily: theme.typography.fontFamilies.monospace,
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
          padding: `clamp(14px, 2vw, ${theme.spacing.md})`,
          minHeight: '52px',
          fontSize: `clamp(${theme.typography.fontSizes.sm}, 3vw, ${theme.typography.fontSizes.md})`,
          fontWeight: theme.typography.fontWeights.bold,
          color: canMint && !isProcessing ? theme.bg.primary : theme.text.secondary,
          backgroundColor: canMint && !isProcessing ? theme.accent.primary : `${theme.accent.primary}44`,
          border: 'none',
          borderRadius: theme.radius.md,
          cursor: canMint && !isProcessing ? 'pointer' : 'not-allowed',
          transition: theme.effects.transitions.normal,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          fontFamily: theme.typography.fontFamilies.primary,
          touchAction: 'manipulation',
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
        gap: theme.spacing.xs,
        opacity: 0.7,
      }}>
        <span style={{
          fontSize: theme.typography.fontSizes.xs,
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