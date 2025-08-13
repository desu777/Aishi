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
        padding: '40px 20px',
      }}>

        {/* Main Container with Two Sections */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '60px',
          alignItems: 'center',
        }}>
          {/* Left Section - Mint Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
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
            gap: '40px',
          }}>
            {/* Logo */}
            <div style={{
              position: 'relative',
              width: '300px',
              height: '300px',
            }}>
              <Image
                src="/logo.png"
                alt="Aishi Logo"
                width={300}
                height={300}
                style={{
                  filter: `drop-shadow(0 0 20px ${theme.accent.primary}66)`,
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
        
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Layout>
  );
}