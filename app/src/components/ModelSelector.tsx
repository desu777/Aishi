'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Cpu, Cloud, Check, AlertCircle, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export interface Model {
  id: string;
  name: string;
  type: 'decentralized' | 'centralized';
  provider: string;
  verifiability?: string;
  inputPrice?: string;
  outputPrice?: string;
  available: boolean;
  badge?: string | null;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isLoading?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  isLoading = false
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentModel = selectedModel === 'auto' 
    ? { name: 'Auto-select best model', type: 'auto' as any }
    : models.find(m => m.id === selectedModel) || { name: 'Select a model', type: 'auto' as any };

  const decentralizedModels = models.filter(m => m.type === 'decentralized');
  const centralizedModels = models.filter(m => m.type === 'centralized');

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          backgroundColor: isOpen ? theme.bg.panel : theme.bg.card,
          color: theme.text.primary,
          cursor: isLoading ? 'wait' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          minWidth: '200px',
          justifyContent: 'space-between',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.borderColor = theme.accent.primary;
            e.currentTarget.style.backgroundColor = theme.bg.panel;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.border;
          e.currentTarget.style.backgroundColor = isOpen ? theme.bg.panel : theme.bg.card;
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentModel.type === 'decentralized' ? (
            <Cpu size={16} color={theme.accent.primary} />
          ) : currentModel.type === 'centralized' ? (
            <Cloud size={16} color={theme.accent.secondary} />
          ) : (
            <img 
              src="/logo_clean.png" 
              alt="Aishi AI" 
              style={{ 
                width: '16px', 
                height: '16px',
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
          )}
          <span style={{ fontSize: '13px' }}>
            {isLoading ? 'Loading models...' : currentModel.name}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {isOpen && !isLoading && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          minWidth: '320px',
          backgroundColor: theme.bg.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          zIndex: 1000,
          animation: 'slideDown 0.2s ease'
        }}>
          {/* Auto-select option */}
          <div style={{ padding: '8px' }}>
            <div
              onClick={() => {
                onModelChange('auto');
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedModel === 'auto' ? theme.bg.card : 'transparent',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                if (selectedModel !== 'auto') {
                  e.currentTarget.style.backgroundColor = theme.bg.card;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedModel !== 'auto') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src="/logo_clean.png" 
                  alt="Aishi AI" 
                  style={{ 
                    width: '16px', 
                    height: '16px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} 
                />
                <span style={{ fontSize: '13px', fontWeight: selectedModel === 'auto' ? '600' : '400' }}>
                  Auto-select best model
                </span>
              </div>
              {selectedModel === 'auto' && <Check size={14} color={theme.accent.primary} />}
            </div>
          </div>

          {/* Decentralized Models */}
          <div style={{ borderTop: `1px solid ${theme.border}` }}>
            <div style={{ padding: '8px' }}>
              <span style={{
                display: 'block',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: theme.text.secondary,
                letterSpacing: '0.5px'
              }}>
                Decentralized (0G Network)
              </span>
              {decentralizedModels.length > 0 ? (
                decentralizedModels.map(model => (
                  <ModelOption
                    key={model.id}
                    model={model}
                    isSelected={selectedModel === model.id}
                    onSelect={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    theme={theme}
                  />
                ))
              ) : (
                <div style={{
                  padding: '12px 12px 8px 12px',
                  textAlign: 'center',
                  color: theme.text.secondary,
                  fontSize: '12px',
                  fontStyle: 'italic',
                  opacity: 0.8
                }}>
                  No models available
                </div>
              )}
            </div>
          </div>

          {/* Centralized Models */}
          {centralizedModels.length > 0 && (
            <div style={{ borderTop: `1px solid ${theme.border}` }}>
              <div style={{ padding: '8px' }}>
                <span style={{
                  display: 'block',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: theme.text.secondary,
                  letterSpacing: '0.5px'
                }}>
                  Centralized
                </span>
                {centralizedModels.map(model => (
                  <ModelOption
                    key={model.id}
                    model={model}
                    isSelected={selectedModel === model.id}
                    onSelect={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Info footer */}
          <div style={{
            borderTop: `1px solid ${theme.border}`,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: theme.bg.card,
            opacity: 0.8
          }}>
            <Info size={12} color={theme.text.secondary} />
            <span style={{ fontSize: '11px', color: theme.text.secondary }}>
              Models refresh every 5 minutes
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Model Option Component
const ModelOption: React.FC<{
  model: Model;
  isSelected: boolean;
  onSelect: () => void;
  theme: any;
}> = ({ model, isSelected, onSelect, theme }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        backgroundColor: isSelected ? theme.bg.card : (isHovered ? theme.bg.card : 'transparent'),
        transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        {model.type === 'decentralized' ? (
          <Cpu size={14} color={theme.accent.primary} />
        ) : (
          <Cloud size={14} color={theme.accent.secondary} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ 
            fontSize: '13px', 
            fontWeight: isSelected ? '600' : '400',
            color: theme.text.primary
          }}>
            {model.name}
          </span>
          {model.verifiability && model.verifiability !== 'none' && (
            <span style={{ fontSize: '10px', color: theme.text.secondary }}>
              {model.verifiability}
            </span>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {model.badge && (
          <span style={{
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            backgroundColor: model.badge === 'Verified' ? theme.accent.success : theme.accent.primary,
            color: '#ffffff'
          }}>
            {model.badge}
          </span>
        )}
        {!model.available && (
          <AlertCircle size={14} color={theme.accent.error} />
        )}
        {isSelected && (
          <Check size={14} color={theme.accent.primary} />
        )}
      </div>
    </div>
  );
};

export default ModelSelector;