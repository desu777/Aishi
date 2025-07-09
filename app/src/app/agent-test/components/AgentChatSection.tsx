'use client';

import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { MessageCircle, Send, User, Bot, Loader2, AlertCircle } from 'lucide-react';
import { useAgentChat } from '../../../hooks/agentHooks/useAgentChat';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isLoading?: boolean;
}

interface AgentChatSectionProps {
  hasAgent: boolean;
  effectiveTokenId: number | undefined;
  agentData: any;
}

export default function AgentChatSection({
  hasAgent,
  effectiveTokenId,
  agentData
}: AgentChatSectionProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { sendMessage, isLoading, error } = useAgentChat();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !effectiveTokenId || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Thinking...',
      sender: 'agent',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await sendMessage(effectiveTokenId, inputMessage.trim());
      
      // Remove loading message and add real response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        return [...withoutLoading, {
          id: (Date.now() + 2).toString(),
          content: response,
          sender: 'agent',
          timestamp: new Date()
        }];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        return [...withoutLoading, {
          id: (Date.now() + 2).toString(),
          content: `Error: ${(error as Error).message}`,
          sender: 'agent',
          timestamp: new Date()
        }];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!hasAgent) {
    return (
      <div style={{
        backgroundColor: theme.bg.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} style={{ color: theme.text.secondary, marginBottom: '20px' }} />
        <h3 style={{ color: theme.text.primary, marginBottom: '10px' }}>
          No Agent Selected
        </h3>
        <p style={{ color: theme.text.secondary, fontSize: '14px' }}>
          You need to have an agent to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: theme.bg.card,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: '600px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <h3 style={{
          color: theme.text.primary,
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <MessageCircle size={20} />
          💬 Chat with {agentData?.agentName || 'Agent'}
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            color: theme.text.secondary,
            fontSize: '12px'
          }}>
            Token ID: #{effectiveTokenId}
          </span>
          
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                backgroundColor: theme.bg.panel,
                color: theme.text.primary,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.text.secondary,
            textAlign: 'center'
          }}>
            <MessageCircle size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h4 style={{
              color: theme.text.primary,
              marginBottom: '10px'
            }}>
              Start a conversation!
            </h4>
            <p style={{
              fontSize: '14px',
              maxWidth: '300px',
              lineHeight: '1.4'
            }}>
              Your agent is ready to chat. Ask questions, share thoughts, or just have a friendly conversation.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {message.sender === 'agent' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: theme.accent.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} style={{ color: 'white' }} />
                </div>
              )}
              
              <div style={{
                maxWidth: '70%',
                backgroundColor: message.sender === 'user' 
                  ? theme.accent.primary 
                  : theme.bg.panel,
                color: message.sender === 'user' 
                  ? 'white' 
                  : theme.text.primary,
                padding: '12px 16px',
                borderRadius: '18px',
                fontSize: '14px',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                position: 'relative',
                border: message.sender === 'agent' 
                  ? `1px solid ${theme.border}` 
                  : 'none'
              }}>
                {message.isLoading ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    {message.content}
                  </div>
                ) : (
                  message.content
                )}
                
                <div style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: theme.bg.panel,
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} style={{ color: theme.text.primary }} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end'
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={2}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.bg.panel,
            color: theme.text.primary,
            fontSize: '14px',
            resize: 'none',
            outline: 'none'
          }}
        />
        
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isProcessing}
          style={{
            backgroundColor: theme.accent.primary,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: !inputMessage.trim() || isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !inputMessage.trim() || isProcessing ? 0.6 : 1,
            minWidth: '48px',
            height: '48px'
          }}
        >
          {isProcessing ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#ff4444',
          fontSize: '12px',
          marginTop: '10px',
          padding: '8px 12px',
          backgroundColor: theme.bg.panel,
          borderRadius: '6px'
        }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
} 