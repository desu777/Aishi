'use client';

import WalletConnection from './WalletConnection';
import TransactionStatus from './TransactionStatus';
import MintForm from './MintForm';

interface MintStatusProps {
  // Wallet & Connection
  isConnected: boolean;
  hasExistingAgent: boolean;
  existingTokenId: any;
  hasInsufficientBalance: boolean;
  balance: any;
  
  // Form State
  agentName: string;
  setAgentName: (name: string) => void;
  nameError: string;
  isCheckingName: boolean;
  canMint: boolean;
  
  // Transaction
  isProcessing: boolean;
  isWritePending: boolean;
  writeError: any;
  txError: any;
  txHash: any;
  showSuccess: boolean;
  mintedTokenId: number | null;
  
  // Actions
  handleMint: () => void;
  shareOnX: () => void;
  reset: () => void;
  
  // Constants
  mintingFee: bigint;
  maxNameLength: number;
}

export default function MintStatus(props: MintStatusProps) {
  const {
    isConnected,
    hasExistingAgent,
    existingTokenId,
    hasInsufficientBalance,
    balance,
    showSuccess,
    mintedTokenId,
    agentName,
    isProcessing,
    isWritePending,
    writeError,
    txError,
    txHash,
    shareOnX,
    reset,
    mintingFee,
  } = props;

  // Show success state
  if (showSuccess) {
    return (
      <TransactionStatus
        showSuccess={showSuccess}
        mintedTokenId={mintedTokenId}
        agentName={agentName}
        isProcessing={false}
        isWritePending={false}
        writeError={null}
        txError={null}
        txHash={txHash}
        onShare={shareOnX}
        onReset={reset}
      />
    );
  }

  // Show wallet connection or existing agent
  if (!isConnected || hasExistingAgent) {
    return (
      <WalletConnection
        isConnected={isConnected}
        hasExistingAgent={hasExistingAgent}
        existingTokenId={existingTokenId}
        hasInsufficientBalance={hasInsufficientBalance}
        balance={balance}
        mintingFee={mintingFee}
      />
    );
  }

  // Show processing state
  if (isProcessing) {
    return (
      <TransactionStatus
        showSuccess={false}
        mintedTokenId={null}
        agentName={agentName}
        isProcessing={isProcessing}
        isWritePending={isWritePending}
        writeError={writeError}
        txError={txError}
        txHash={txHash}
        onShare={shareOnX}
        onReset={reset}
      />
    );
  }

  // Show error state
  if (writeError || txError) {
    return (
      <>
        <TransactionStatus
          showSuccess={false}
          mintedTokenId={null}
          agentName={agentName}
          isProcessing={false}
          isWritePending={false}
          writeError={writeError}
          txError={txError}
          txHash={txHash}
          onShare={shareOnX}
          onReset={reset}
        />
        <MintForm {...props} />
      </>
    );
  }

  // Show mint form with balance warning if needed
  return (
    <>
      {hasInsufficientBalance && (
        <WalletConnection
          isConnected={isConnected}
          hasExistingAgent={false}
          existingTokenId={null}
          hasInsufficientBalance={hasInsufficientBalance}
          balance={balance}
          mintingFee={mintingFee}
        />
      )}
      <MintForm
        agentName={props.agentName}
        setAgentName={props.setAgentName}
        nameError={props.nameError}
        isCheckingName={props.isCheckingName}
        canMint={props.canMint}
        isProcessing={props.isProcessing}
        maxNameLength={props.maxNameLength}
        mintingFee={props.mintingFee}
        onMint={props.handleMint}
      />
    </>
  );
}