'use client';

import Image from 'next/image';
import Layout from '../../components/layout/Layout';
import { useTheme } from '../../contexts/ThemeContext';
import { useMintAgent } from './hooks/useMintAgent';
import MintStatus from './components/MintStatus';
import AgentCounter from './components/AgentCounter';

export default function AishiMintPage() {
  const { theme } = useTheme();
  const mintAgent = useMintAgent();

  return (
    <Layout backgroundType="faulty-terminal">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 5vw, 2.5rem)',
      }}>

        {/* Main Container with Two Sections */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
          gap: `clamp(${theme.spacing.xl}, 5vw, ${theme.spacing.xxxl})`,
          alignItems: 'center',
        }}>
          {/* Left Section - Mint Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
          }}>
            <MintStatus
              // Wallet & Connection
              isConnected={mintAgent.isConnected}
              hasExistingAgent={mintAgent.hasExistingAgent}
              existingTokenId={mintAgent.existingTokenId}
              hasInsufficientBalance={mintAgent.hasInsufficientBalance}
              balance={mintAgent.balance}
              
              // Form State
              agentName={mintAgent.agentName}
              setAgentName={mintAgent.setAgentName}
              nameError={mintAgent.nameError}
              isCheckingName={mintAgent.isCheckingName}
              canMint={mintAgent.canMint}
              
              // Transaction
              isProcessing={mintAgent.isProcessing}
              isWritePending={mintAgent.isProcessing}
              writeError={mintAgent.writeError}
              txError={mintAgent.txError}
              txHash={mintAgent.txHash}
              showSuccess={mintAgent.showSuccess}
              mintedTokenId={mintAgent.mintedTokenId}
              
              // Actions
              handleMint={mintAgent.handleMint}
              shareOnX={mintAgent.shareOnX}
              reset={mintAgent.reset}
              
              // Constants
              mintingFee={mintAgent.MINTING_FEE}
              maxNameLength={mintAgent.MAX_NAME_LENGTH}
            />
          </div>

          {/* Right Section - Logo and Counter */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing.xxl,
          }}>
            {/* Logo */}
            <div style={{
              position: 'relative',
              width: 'clamp(150px, 30vw, 300px)',
              height: 'clamp(150px, 30vw, 300px)',
              margin: '0 auto',
            }}>
              <Image
                src="/logo.png"
                alt="Aishi Logo"
                fill
                style={{
                  filter: `drop-shadow(0 0 20px ${theme.accent.primary}66)`,
                  objectFit: 'contain',
                }}
              />
            </div>
            
            {/* Agent Counter */}
            <AgentCounter
              agentsMinted={mintAgent.totalAgents}
              agentsRemaining={mintAgent.agentsRemaining}
              maxAgents={mintAgent.maxAgents}
            />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (hover: hover) {
          button:hover {
            transform: translateY(-2px);
          }
        }
        
        /* Touch-friendly adjustments */
        @media (pointer: coarse) {
          button, input, a {
            min-height: 48px;
            touch-action: manipulation;
          }
        }
      `}</style>
    </Layout>
  );
}