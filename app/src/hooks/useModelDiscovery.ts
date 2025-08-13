'use client';

import { useState, useEffect, useCallback } from 'react';
import { Model } from '../components/ModelSelector';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useModelDiscovery = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    // Load saved model from localStorage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aishi-selected-model');
      return saved || 'auto';
    }
    return 'auto';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDiscoveryTime, setLastDiscoveryTime] = useState<Date | null>(null);

  const discoverModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/models/discover`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to discover models: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.models) {
        setModels(data.data.models);
        setLastDiscoveryTime(new Date());
        
        // If no model is selected and we have models, select the first one or keep auto
        if (selectedModel === '' && data.data.models.length > 0) {
          setSelectedModel('auto');
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to discover models:', error);
      setError(error instanceof Error ? error.message : 'Failed to discover models');
      
      // Fallback to Gemini only
      const fallbackModels: Model[] = [{
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash (Fallback)',
        type: 'centralized',
        provider: 'Google Vertex AI',
        available: true,
        badge: 'Fallback'
      }];
      
      setModels(fallbackModels);
      
      // If current selection is not available in fallback, switch to first fallback
      if (selectedModel !== 'auto' && !fallbackModels.find(m => m.id === selectedModel)) {
        setSelectedModel('gemini-2.5-flash');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel]);

  // Refresh models manually
  const refreshModels = useCallback(async () => {
    await discoverModels();
  }, [discoverModels]);

  // Initial discovery on mount
  useEffect(() => {
    discoverModels();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      discoverModels();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [discoverModels]);

  // Save selected model to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aishi-selected-model', selectedModel);
    }
  }, [selectedModel]);

  // Get the currently selected model object
  const getSelectedModel = useCallback(() => {
    if (selectedModel === 'auto') {
      // Auto-select logic: prefer cheapest decentralized, then any decentralized, then Gemini
      const decentralized = models.filter(m => m.type === 'decentralized' && m.available);
      if (decentralized.length > 0) {
        // Sort by price if available
        const sorted = decentralized.sort((a, b) => {
          const priceA = parseInt(a.inputPrice || '0');
          const priceB = parseInt(b.inputPrice || '0');
          return priceA - priceB;
        });
        return sorted[0];
      }
      // Fallback to Gemini
      return models.find(m => m.id === 'gemini-2.5-flash') || models[0];
    }
    
    return models.find(m => m.id === selectedModel);
  }, [selectedModel, models]);

  return {
    models,
    selectedModel,
    setSelectedModel,
    isLoading,
    error,
    refreshModels,
    getSelectedModel,
    lastDiscoveryTime
  };
};

export default useModelDiscovery;