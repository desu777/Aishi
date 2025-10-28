'use client';

import { formatEther, parseEther } from 'viem';
import { useTheme } from '../../../contexts/ThemeContext';
import { FiTrendingUp, FiUsers } from 'react-icons/fi';

interface PriceDisplayProps {
  currentMintPrice: bigint;
  totalAgents: number;
}

export default function PriceDisplay({
  currentMintPrice,
  totalAgents
}: PriceDisplayProps) {
  const { theme } = useTheme();

  // Calculate current tier and next tier info
  const PRICE_STEP_INTERVAL = 10;
  const PRICE_STEP = parseEther('0.01');

  const currentTier = Math.floor(totalAgents / PRICE_STEP_INTERVAL);
  const nextTierAgents = (currentTier + 1) * PRICE_STEP_INTERVAL;
  const nextTierPrice = currentMintPrice + PRICE_STEP;

  // Format prices for display
  const currentPriceFormatted = formatEther(currentMintPrice);
  const nextPriceFormatted = formatEther(nextTierPrice);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing.xl,
    }}>
      {/* Price Display */}
      <div style={{
        textAlign: 'center',
        padding: theme.spacing.xl,
      }}>
        <div style={{
          fontSize: `clamp(${theme.typography.fontSizes.xl}, 6vw, ${theme.typography.fontSizes.xxl})`,
          fontWeight: theme.typography.fontWeights.bold,
          color: theme.accent.primary,
          fontFamily: theme.typography.fontFamilies.monospace,
          marginBottom: theme.spacing.sm,
          lineHeight: 1,
        }}>
          {currentPriceFormatted} OG
        </div>

        <div style={{
          fontSize: `clamp(${theme.typography.fontSizes.xs}, 3vw, ${theme.typography.fontSizes.sm})`,
          color: theme.text.secondary,
          marginBottom: `clamp(${theme.spacing.md}, 3vw, ${theme.spacing.xl})`,
        }}>
          Current Mint Price
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing.xs,
          fontSize: theme.typography.fontSizes.xs,
          color: theme.text.secondary,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}>
            <FiUsers />
            <span style={{
              fontSize: `clamp(11px, 2.5vw, ${theme.typography.fontSizes.xs})`,
            }}>
              {totalAgents} agents created
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.xs,
          }}>
            <FiTrendingUp />
            <span style={{
              fontSize: `clamp(10px, 2.5vw, 11px)`,
            }}>
              Next tier at {nextTierAgents}: {nextPriceFormatted} OG
            </span>
          </div>

          <div style={{
            fontSize: `clamp(9px, 2vw, 10px)`,
            color: theme.text.tertiary,
            marginTop: theme.spacing.xs,
          }}>
            +0.01 OG every 10 mints
          </div>
        </div>
      </div>
    </div>
  );
}
