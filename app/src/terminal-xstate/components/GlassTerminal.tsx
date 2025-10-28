'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MinimalOutput } from './MinimalOutput';
import { PremiumCommandBar } from './PremiumCommandBar';
import { TerminalSystemHeader } from './TerminalSystemHeader';
import AIOrb from './AIOrb';
import TerminalStatusLine from './TerminalStatusLine';
import { MemoryDownloadHandler } from './MemoryDownloadHandler';
import { useTerminal } from '../hooks/useTerminal';
import { useTerminalAgent } from '../hooks/useTerminalAgent';
import { useConsolidationStatus } from '../hooks/useConsolidationStatus';
import { zIndex } from '../../styles/zIndex';
import { useAccount, usePublicClient } from 'wagmi';
import { useSafeActorState } from '../hooks/useSafeSelector';
import { breakpoints } from '../../utils/responsive';
import {
  useWatchAishiAgentConsolidationCompletedEvent,
  useWatchAishiAgentYearlyReflectionAvailableEvent
} from '../../generated';

interface GlassTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel?: string;
  selectedVoice?: string;
}

// Premium color palette
const colors = {
  noir: '#0A0A0A',
  charcoal: '#1A1A1A',
  slate: '#2D2D2D',
  silver: '#8A8A8A',
  pearl: '#F0F0F0',
  accent: '#8B5CF6',
  accentMuted: 'rgba(139, 92, 246, 0.1)',
  glassBg: 'rgba(26, 26, 26, 0.7)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)'
};

export const GlassTerminal: React.FC<GlassTerminalProps> = ({ isOpen, onClose, selectedModel, selectedVoice }) => {
  const { context, send, state, brokerRef, modelRef, agentRef, voiceRef, isDreamActive, dreamStatus, isChatActive, chatStatus, isVoiceEnabled } = useTerminal();
  const { agentName, isLoading: agentLoading } = useTerminalAgent();
  const { shouldShowMonthLearnPrompt, shouldShowYearLearnPrompt } = useConsolidationStatus();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Subscribe to agent state using safe selector
  const agentState = useSafeActorState(agentRef);
  const agentStatus = agentState?.context?.status || 'uninitialized';
  const syncedAgentName = agentState?.context?.agentName || null;
  const syncProgress = agentState?.context?.syncProgress || undefined;
  const intelligenceLevel = agentState?.context?.intelligenceLevel || 0;
  
  // Map agent status to orb status
  const getOrbStatus = () => {
    if (!isConnected) return 'uninitialized';
    if (agentStatus === 'syncing') return 'syncing';
    if (agentStatus === 'connected' && syncedAgentName) {
      // Priority 1: Check if TTS is synthesizing (voice workflow active)
      if (context.isSynthesizing) return 'thinking';
      // Priority 2: Check if any processing with status message
      const lowerDreamStatus = dreamStatus?.toLowerCase() || '';
      const lowerChatStatus = chatStatus?.toLowerCase() || '';
      if (lowerDreamStatus.includes('retry') || lowerChatStatus.includes('retry')) {
        return 'retrying';
      }
      if (dreamStatus) {
        if (dreamStatus.includes('thinking')) return 'thinking';
        if (dreamStatus.includes('learning')) return 'learning';
        if (dreamStatus.includes('evolving')) return 'evolving';
      }
      // Check chat status
      if (chatStatus) {
        if (chatStatus.includes('thinking')) return 'thinking';
        if (chatStatus.includes('learning')) return 'learning';
        if (chatStatus.includes('evolving')) return 'evolving';
      }
      // Priority 3: Check if we're in active processing states (fallback)
      if (state.matches('processing')) return 'thinking';
      if (state.matches('executingCommand')) return 'thinking';
      if (state.matches('dreamWorkflow')) {
        // In dream workflow - check if we have active processing
        if (!dreamStatus || dreamStatus === 'Waiting for your response...') {
          return 'online'; // Only return online if explicitly waiting
        }
        return 'thinking'; // Default to thinking in dream workflow
      }
      if (state.matches('chatWorkflow')) {
        // In chat workflow - check if we have active processing
        if (!chatStatus || chatStatus === 'Type your message...') {
          return 'online'; // Only return online if explicitly waiting
        }
        return 'thinking'; // Default to thinking in chat workflow
      }
      return 'online';
    }
    if (agentStatus === 'no_agent') return 'no_agent';
    if (agentStatus === 'error') return 'error';
    if (state.matches('processing')) return 'thinking';
    if (state.matches('dreamWorkflow')) return 'thinking';
    if (state.matches('chatWorkflow')) return 'thinking';
    if (agentLoading) return 'connecting';
    return 'uninitialized';
  };
  
  // Detect viewport size
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < breakpoints.sm);
      setIsTablet(width >= breakpoints.sm && width < breakpoints.lg);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Handle command submission
  const handleSubmit = useCallback(() => {
    if (context.currentInput.trim()) {
      send({ type: 'INPUT.SUBMIT' });
    }
  }, [context.currentInput, send]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    send({ type: 'INPUT.CHANGE', value });
  }, [send]);

  // Handle history navigation
  const handleHistoryUp = useCallback(() => {
    send({ type: 'HISTORY.UP' });
  }, [send]);

  const handleHistoryDown = useCallback(() => {
    send({ type: 'HISTORY.DOWN' });
  }, [send]);

  // Handle clear
  const handleClear = useCallback(() => {
    send({ type: 'CLEAR' });
  }, [send]);

  const handleQuickSubmit = useCallback((value: string) => {
    send({ type: 'INPUT.CHANGE', value });
    send({ type: 'INPUT.SUBMIT' });
  }, [send]);

  // Handle voice input
  const handleVoiceInput = useCallback((audioBase64: string, audioBlob: Blob) => {
    if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
      console.log('[GlassTerminal] handleVoiceInput triggered', {
        audioBase64Length: audioBase64.length,
        audioBlobSize: audioBlob.size,
        hasVoiceRef: !!voiceRef,
        isDreamActive,
        isChatActive
      });
    }

    // First, display the voice message in terminal
    send({
      type: 'APPEND_VOICE_INPUT',
      audioBase64,
      audioBlob,
      duration: Math.max(1, Math.round(audioBlob.size / 10000)) // Estimate duration
    });

    if (voiceRef) {
      // Mark that this will be voice input
      send({ type: 'SET_VOICE_INPUT', value: true });
      // Send audio to STT through voice machine
      voiceRef.send({ type: 'TRANSCRIBE', audioBase64 });
      if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
        console.log('[GlassTerminal] Sent TRANSCRIBE to voice machine');
      }
    }
  }, [voiceRef, send, isDreamActive, isChatActive]);

  // Initialize broker and agent when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      // Initialize broker
      if (brokerRef) {
        if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
          console.log('[GlassTerminal] Initializing broker', { address });
        }
        brokerRef.send({ type: 'INITIALIZE', walletAddress: address });
      }

      // Sync agent with contract
      if (agentRef && publicClient) {
        if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
          console.log('[GlassTerminal] Syncing agent with viem publicClient', {
            address,
            chainId: publicClient.chain?.id,
            chainName: publicClient.chain?.name,
            transportType: publicClient.transport?.type
          });
        }
        agentRef.send({
          type: 'SYNC',
          walletAddress: address,
          provider: publicClient
        });
      } else {
        if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
          console.log('[GlassTerminal] Cannot sync agent', {
            hasAgentRef: !!agentRef,
            hasPublicClient: !!publicClient,
            address
          });
        }
      }
    }

    // Handle wallet disconnect - reset agent state
    if (!isConnected && agentRef) {
      if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
        console.log('[GlassTerminal] Wallet disconnected, resetting agent');
      }
      agentRef.send({ type: 'RESET' });
    }
  }, [isConnected, address, brokerRef, agentRef, publicClient]);
  
  // Update model in terminal when selectedModel changes
  useEffect(() => {
    if (selectedModel && modelRef) {
      modelRef.send({ type: 'SELECT_MODEL', modelId: selectedModel });
    }
  }, [selectedModel, modelRef]);

  // Update voice in terminal when selectedVoice changes
  useEffect(() => {
    if (selectedVoice && voiceRef) {
      voiceRef.send({ type: 'SELECT_VOICE', voiceId: selectedVoice });
    }
  }, [selectedVoice, voiceRef]);

  // Watch for ConsolidationCompleted events
  useWatchAishiAgentConsolidationCompletedEvent({
    onLogs: (logs) => {
      logs.forEach(log => {
        const { tokenId, period, bonus, specialReward } = log.args;
        const currentTokenId = agentState?.context?.tokenId;

        if (currentTokenId && Number(tokenId) === currentTokenId) {
          send({
            type: 'APPEND_LINES',
            lines: [{
              type: 'success',
              content: `✓ Monthly consolidation completed! Period: ${period}, Bonus: +${bonus} INT${specialReward ? `, Reward: ${specialReward}` : ''}`,
              timestamp: Date.now()
            }]
          });
        }
      });
    }
  });

  // Watch for YearlyReflectionAvailable events
  useWatchAishiAgentYearlyReflectionAvailableEvent({
    onLogs: (logs) => {
      logs.forEach(log => {
        const { tokenId, year } = log.args;
        const currentTokenId = agentState?.context?.tokenId;

        if (currentTokenId && Number(tokenId) === currentTokenId) {
          send({
            type: 'APPEND_LINES',
            lines: [{
              type: 'success',
              content: `✓ Yearly memory core available for ${year}! Type 'memory-core' to crystallize consciousness (+5 INT)`,
              timestamp: Date.now()
            }]
          });
        }
      });
    }
  });

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Memoized MinimalOutput to prevent re-renders on input changes
  const memoizedMinimalOutput = useMemo(() => (
    <MinimalOutput
      lines={context.lines}
      welcomeLines={context.welcomeLines}
      agentStatus={agentStatus}
      agentName={syncedAgentName}
      syncProgress={syncProgress}
      isChatActive={isChatActive}
      onEndSession={() => send({ type: 'END_SESSION' })}
    />
  ), [context.lines, context.welcomeLines, agentStatus, syncedAgentName, syncProgress, isChatActive, send]);

  if (!isOpen) return null;

  // Inline styles for glass terminal
  const glassTerminalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 10, 10, 0.4)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.terminal,
    animation: 'fadeIn 0.3s ease'
  };

  const terminalBodyStyle: React.CSSProperties = {
    width: isMobile ? '100%' : '90%',
    maxWidth: isMobile ? '100%' : '1200px',
    height: isMobile ? '100vh' : '85vh',
    background: colors.glassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: isMobile ? 'none' : `1px solid ${colors.borderSubtle}`,
    borderRadius: isMobile ? '0' : '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: isMobile ? 'none' : `
      0 20px 60px rgba(0, 0, 0, 0.3),
      inset 0 0 0 1px rgba(255, 255, 255, 0.02)
    `,
    animation: isMobile ? 'fadeIn 0.3s ease' : 'slideUp 0.4s ease'
  };

  // Close button removed - will be added to header


  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={glassTerminalStyle}>
        <div style={terminalBodyStyle}>
          {/* Terminal Header with Close Button */}
          <TerminalSystemHeader 
            agentName={syncedAgentName || agentName}
            isLoading={agentLoading}
            selectedModel={selectedModel}
            terminalState={state}
            brokerRef={brokerRef}
            modelRef={modelRef}
            onClose={onClose}
            isMobile={isMobile}
            isTablet={isTablet}
          />

          {/* AI Orb - Central Visual Element */}
          <AIOrb
            status={getOrbStatus()}
            agentName={syncedAgentName}
            intelligenceLevel={intelligenceLevel}
            syncProgress={syncProgress}
            isMobile={isMobile}
            isTablet={isTablet}
          />

          {/* Terminal Status Line */}
          <TerminalStatusLine
            status={isRecording ? 'recording' : getOrbStatus()}
            agentName={syncedAgentName}
            intelligenceLevel={intelligenceLevel}
            isMobile={isMobile}
            isTablet={isTablet}
            isChatActive={isChatActive}
            chatStatus={chatStatus}
            dreamStatus={dreamStatus}
            isRecording={isRecording}
            shouldShowMonthLearnPrompt={shouldShowMonthLearnPrompt}
            shouldShowYearLearnPrompt={shouldShowYearLearnPrompt}
          />

          {/* Minimal Output - Terminal Lines Only */}
          {memoizedMinimalOutput}

          {/* Premium Command Bar */}
          <PremiumCommandBar
            value={context.currentInput}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onHistoryUp={handleHistoryUp}
            onHistoryDown={handleHistoryDown}
            onClear={handleClear}
            disabled={state.matches('processing')}
            isChatActive={isChatActive}
            isDreamActive={isDreamActive}
            onEndSession={() => send({ type: 'END_SESSION' })}
            onVoiceInput={handleVoiceInput}
            isVoiceEnabled={true}
            onRecordingStateChange={setIsRecording}
            dreamStatus={dreamStatus}
            chatStatus={chatStatus}
            onQuickSubmit={handleQuickSubmit}
            promptSymbol={isChatActive ? '~' : isDreamActive ? '~' : '>'}
          />
          
          {/* Memory Download Handler - handles download clicks */}
          <MemoryDownloadHandler send={send} />
        </div>
      </div>
    </>
  );
};