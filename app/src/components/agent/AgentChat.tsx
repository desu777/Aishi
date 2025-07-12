'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAgentChat } from '../../hooks/agentHooks';
import { MessageCircle, Send, Loader2, Check, AlertCircle, Brain, Zap, Clock, Save } from 'lucide-react';

export default function AgentChat() {
  const { theme, debugLog } = useTheme();
  const {
    sendMessage,
    resetSession,
    saveConversation,
    isTyping,
    // isProcessingWithAI, // Not exported by useAgentChat
    isSaving,
    isProcessingContract,
    // isWaitingForReceipt, // Not exported by useAgentChat
    // isComplete, // Not exported by useAgentChat
    error,
    // currentStep, // Not exported by useAgentChat
    // lastConversation, // Not exported by useAgentChat  
    // storageHash, // Not exported by useAgentChat
    // txHash, // Not exported by useAgentChat
    // hasAgent, // Should come from useAgentRead
    // userAgent, // Should come from useAgentRead  
    // userTokenId, // Should come from useAgentRead
    // isConnected, // Should come from useWallet
    // isCorrectNetwork, // Should come from useWallet  
    // ContextType, // Should be imported directly
    lastPrompt
  } = useAgentChat();

  // Local state
  const [message, setMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    userMessage: string;
    aiResponse: string;
    timestamp: string;
    contextType: number;
    status: 'chat' | 'processing' | 'error' | 'saved';
  }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Update last processing message to completed
  useEffect(() => {
    if (isComplete && lastConversation) {
      setConversationHistory(prev => 
        prev.map((conv, index) => 
          index === prev.length - 1 && conv.status === 'processing'
            ? {
                ...lastConversation,
                status: 'chat'
              }
            : conv
        )
      );
      resetChat();
      debugLog('Conversation updated to complete', lastConversation);
    }
  }, [isComplete, lastConversation, resetChat, debugLog]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setMessage('');

    // Add processing message to history
    const processingConversation = {
      userMessage,
      aiResponse: 'Processing...',
      timestamp: new Date().toISOString(),
      contextType: 1, // GENERAL_CHAT default
      status: 'processing' as const
    };
    
    setConversationHistory(prev => [...prev, processingConversation]);

    try {
      await sendMessage(userMessage);
      // Success handling is in useEffect above
    } catch (error: any) {
      debugLog('Send message error', { error });
      
      // Update last message status to error
      setConversationHistory(prev => 
        prev.map((conv, index) => 
          index === prev.length - 1 
            ? { ...conv, aiResponse: `Error: ${error.message}`, status: 'error' }
            : conv
        )
      );
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear conversation history
  const clearHistory = () => {
    setConversationHistory([]);
    resetChat();
    debugLog('Conversation history cleared');
  };

  // Save current conversation
  const handleSaveConversation = async () => {
    try {
      await saveCurrentConversation();
      // Update the last conversation status to 'saved'
      setConversationHistory(prev => 
        prev.map((conv, index) => 
          index === prev.length - 1 && conv.status === 'chat'
            ? { ...conv, status: 'saved' }
            : conv
        )
      );
      debugLog('Conversation saved successfully');
    } catch (error: any) {
      debugLog('Save conversation error', { error });
    }
  };

  const isProcessing = isLoadingContext || isProcessingWithAI || isSavingToStorage || isRecordingOnChain || isWaitingForReceipt;

  if (!isConnected) {
    return (
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <MessageCircle size={48} style={{ color: theme.text.secondary, marginBottom: '16px' }} />
        <h3 style={{ color: theme.text.primary, marginBottom: '8px' }}>Wallet Not Connected</h3>
        <p style={{ color: theme.text.secondary }}>Please connect your wallet to chat with your agent.</p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} style={{ color: '#ff6b35', marginBottom: '16px' }} />
        <h3 style={{ color: theme.text.primary, marginBottom: '8px' }}>Wrong Network</h3>
        <p style={{ color: theme.text.secondary }}>Please switch to 0G Galileo Testnet to chat.</p>
      </div>
    );
  }

  if (!hasAgent) {
    return (
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <Brain size={48} style={{ color: theme.text.secondary, marginBottom: '16px' }} />
        <h3 style={{ color: theme.text.primary, marginBottom: '8px' }}>No Agent Found</h3>
        <p style={{ color: theme.text.secondary }}>Please mint an agent first to start chatting.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: theme.bg.card,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '20px',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageCircle size={24} style={{ color: theme.accent.primary }} />
          <div>
            <h3 style={{ 
              color: theme.text.primary, 
              margin: 0,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Chat with {userAgent?.agentName || 'Your Agent'}
            </h3>
            <p style={{ 
              color: theme.text.secondary, 
              margin: 0,
              fontSize: '12px'
            }}>
              Agent #{userTokenId?.toString()} • {conversationHistory.filter(c => c.status === 'saved').length} saved conversations
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Save Conversation Button */}
          {conversationHistory.some(c => c.status === 'chat') && (
            <button
              onClick={handleSaveConversation}
              disabled={isProcessing}
              style={{
                backgroundColor: theme.accent.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                opacity: isProcessing ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Save size={12} />
              {isProcessing ? 'Saving...' : 'Save Conversation'}
            </button>
          )}
          
          {/* Clear History Button */}
          <button
            onClick={clearHistory}
            disabled={conversationHistory.length === 0}
            style={{
              backgroundColor: 'transparent',
              color: theme.text.secondary,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: conversationHistory.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              opacity: conversationHistory.length === 0 ? 0.5 : 1
            }}
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
        padding: '0 8px'
      }}>
        {conversationHistory.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <MessageCircle size={48} style={{ color: theme.text.secondary, marginBottom: '16px', opacity: 0.5 }} />
            <h4 style={{ color: theme.text.primary, marginBottom: '8px' }}>Start a Conversation</h4>
            <p style={{ 
              color: theme.text.secondary,
              fontSize: '14px',
              maxWidth: '300px',
              lineHeight: '1.5'
            }}>
              Ask your agent about dreams, personality traits, or just have a general chat. Your agent will respond based on their unique personality.
            </p>
          </div>
        ) : (
          conversationHistory.map((conversation, index) => (
            <div key={index} style={{ marginBottom: '24px' }}>
              {/* User Message */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '8px'
              }}>
                <div style={{
                  backgroundColor: theme.accent.primary,
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '16px 16px 4px 16px',
                  maxWidth: '70%',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {conversation.userMessage}
                </div>
              </div>

              {/* Agent Response */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: theme.accent.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Brain size={16} style={{ color: 'white' }} />
                </div>
                
                <div style={{
                  backgroundColor: theme.bg.panel,
                  border: `1px solid ${theme.border}`,
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  maxWidth: '70%',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  <div style={{ color: theme.text.primary }}>
                    {conversation.aiResponse}
                  </div>
                  
                  {/* Status indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: theme.text.secondary
                  }}>
                    {conversation.status === 'saved' && (
                      <>
                        <Check size={12} style={{ color: '#4ade80' }} />
                        <span>Recorded on-chain</span>
                      </>
                    )}
                    {conversation.status === 'chat' && (
                      <>
                        <MessageCircle size={12} style={{ color: '#10b981' }} />
                        <span>Chat complete</span>
                      </>
                    )}
                    {conversation.status === 'processing' && (
                      <>
                        <Loader2 size={12} style={{ color: theme.accent.primary }} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    )}
                    {conversation.status === 'error' && (
                      <>
                        <AlertCircle size={12} style={{ color: '#ef4444' }} />
                        <span>Error</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Current Processing Status */}
      {isProcessing && (
        <div style={{
          backgroundColor: theme.bg.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Loader2 size={16} style={{ color: theme.accent.primary }} className="animate-spin" />
          <span style={{ color: theme.text.primary, fontSize: '14px' }}>
            {currentStep === 'context' && 'Building context from your agent\'s personality...'}
            {currentStep === 'ai' && 'Your agent is thinking...'}
            {currentStep === 'storage' && 'Saving conversation to 0G Storage...'}
            {currentStep === 'blockchain' && 'Recording conversation on-chain...'}
            {currentStep === 'complete' && 'Conversation recorded successfully!'}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={16} style={{ color: '#dc2626' }} />
          <span style={{ color: '#dc2626', fontSize: '14px' }}>
            {error}
          </span>
        </div>
      )}

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Chat with ${userAgent?.agentName || 'your agent'}...`}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '24px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.bg.panel,
              color: theme.text.primary,
              fontSize: '14px',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isProcessing}
          style={{
            backgroundColor: theme.accent.primary,
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: (!message.trim() || isProcessing) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (!message.trim() || isProcessing) ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isProcessing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {/* Success indicators */}
      {storageHash && (
        <div style={{
          fontSize: '12px',
          color: theme.text.secondary,
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={12} />
          <span>Storage: {storageHash.slice(0, 10)}...{storageHash.slice(-8)}</span>
          {txHash && (
            <>
              <span>•</span>
              <span>TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
} 