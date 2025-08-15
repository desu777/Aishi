/**
 * @fileoverview Terminal System Header Component
 * @description Professional header showing system info, AI model, broker status, and agent sync
 */

import React, { useState } from 'react';
import { useSafeActorState } from '../hooks/useSafeSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccount } from 'wagmi';
import { FundBrokerModal } from './FundBrokerModal';

interface TerminalSystemHeaderProps {
  agentName: string | null;
  isLoading: boolean;
  selectedModel?: string;
  terminalState?: any;
  brokerRef?: any;
  modelRef?: any;
}


export const TerminalSystemHeader: React.FC<TerminalSystemHeaderProps> = ({ 
  agentName, 
  isLoading,
  selectedModel,
  terminalState,
  brokerRef: propBrokerRef,
  modelRef: propModelRef
}) => {
  const { theme } = useTheme();
  const { address } = useAccount();
  const [showFundModal, setShowFundModal] = useState(false);
  
  // Debug helper - defined first
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
      console.log(`[TerminalSystemHeader] ${message}`, data || '');
    }
  };
  
  // Use props if provided
  const brokerRef = propBrokerRef;
  const modelRef = propModelRef;
  
  // Subscribe to actor states using safe selector
  const brokerState = useSafeActorState(brokerRef);
  const modelState = useSafeActorState(modelRef);
  
  // Extract broker info
  const brokerStatus = brokerState?.context?.status || 'uninitialized';
  const brokerBalance = brokerState?.context?.balance || 0;
  
  // Debug broker state
  debugLog('Broker state', { 
    status: brokerStatus, 
    balance: brokerBalance,
    error: brokerState?.context?.errorMessage,
    walletAddress: brokerState?.context?.walletAddress
  });
  
  // Extract model info - use prop first, then actor state
  const currentModel = selectedModel || modelState?.context?.selectedModel || 'auto';
  
  // Check if current model needs broker (only 0G models with phala/ prefix)
  const modelNeedsBroker = currentModel.startsWith('phala/') ||
                          (modelState?.context?.availableModels?.find(
                            (m: any) => m.id === currentModel
                          )?.needsBroker || false);
  
  // Format display names
  const formatModelName = (modelId: string) => {
    if (modelId === 'auto') return 'Auto Select';
    if (modelId === 'gemini-2.5-flash') return 'Gemini 2.5 Flash';
    if (modelId.startsWith('phala/')) {
      // Extract model name after "phala/" and add 0G indicator
      const modelName = modelId.replace('phala/', '');
      return `${modelName} (0G)`;
    }
    return modelId;
  };
  
  const handleFundBroker = () => {
    if (brokerRef && address) {
      if (brokerStatus === 'uninitialized') {
        // Initialize broker first
        brokerRef.send({ type: 'INITIALIZE', walletAddress: address });
      } else if (brokerStatus === 'initialized') {
        // Open fund modal for initialized broker
        setShowFundModal(true);
      }
    }
  };
  
  const handleCreateBroker = () => {
    if (brokerRef && address) {
      debugLog('Creating broker for wallet', { address });
      brokerRef.send({ type: 'CREATE' });
    }
  };
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
      gap: '1.5rem',
      background: 'rgba(0, 0, 0, 0.2)',
      fontFamily: 'monospace',
      fontSize: '0.85rem'
    }}>
      {/* Logo */}
      <img 
        src="/logo_clean.png" 
        alt="Aishi"
        style={{ 
          height: '28px',
          width: 'auto',
          objectFit: 'contain',
          opacity: 0.9
        }} 
      />
      
      {/* Separator */}
      <span style={{ color: theme.text.secondary, opacity: 0.3 }}>|</span>
      
      {/* System Info */}
      <div style={{ 
        color: theme.accent.primary,
        fontWeight: '600',
        letterSpacing: '0.05em'
      }}>
        aishiOS v1.0
      </div>
      
      {/* Separator */}
      <span style={{ color: theme.text.secondary, opacity: 0.3 }}>|</span>
      
      {/* AI Model */}
      <div style={{ 
        color: theme.text.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ color: theme.text.secondary }}>AI:</span>
        <span style={{ color: theme.text.primary }}>
          {formatModelName(currentModel)}
        </span>
      </div>
      
      {/* Broker Status - Only show for 0G models */}
      {modelNeedsBroker && (
        <>
          {/* Separator */}
          <span style={{ color: theme.text.secondary, opacity: 0.3 }}>|</span>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: theme.text.secondary }}>Broker:</span>
            {brokerStatus === 'uninitialized' ? (
              <>
                <span style={{ color: theme.text.secondary }}>checking...</span>
              </>
            ) : brokerStatus === 'not_initialized' ? (
              <>
                <span style={{ color: '#FCD34D' }}>not_initialized</span>
              </>
            ) : brokerStatus === 'loading' ? (
              <span style={{ color: theme.text.secondary }}>loading...</span>
            ) : brokerStatus === 'error' ? (
              <span style={{ color: '#EF4444' }}>error</span>
            ) : brokerStatus === 'initialized' ? (
              <>
                <span style={{ color: '#10B981' }}>initialized</span>
                <span style={{ color: theme.text.primary }}>
                  ({brokerBalance.toFixed(2)} 0G)
                </span>
              </>
            ) : null}
            
            {/* Action Buttons */}
            {address && (
              <>
                {/* Create Button - only when not_initialized */}
                {brokerStatus === 'not_initialized' && (
                  <button
                    onClick={handleCreateBroker}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '2px 8px',
                      background: 'transparent',
                      border: `1px solid ${theme.accent.primary}`,
                      borderRadius: '3px',
                      color: theme.accent.primary,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'monospace'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.accent.primary;
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = theme.accent.primary;
                    }}
                  >
                    [create]
                  </button>
                )}
                
                {/* Fund Button - only when initialized */}
                {brokerStatus === 'initialized' && (
                  <button
                    onClick={handleFundBroker}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '2px 6px',
                      background: 'transparent',
                      border: `1px solid ${theme.accent.primary}`,
                      borderRadius: '3px',
                      color: theme.accent.primary,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'monospace'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.accent.primary;
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = theme.accent.primary;
                    }}
                  >
                    [+]
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
      
      {/* Fund Broker Modal */}
      {brokerRef && (
        <FundBrokerModal
          isOpen={showFundModal}
          onClose={() => setShowFundModal(false)}
          brokerRef={brokerRef}
          currentBalance={brokerBalance}
        />
      )}
    </div>
  );
};