'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useWallet } from './useWallet';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';

// Types
interface BrokerInfo {
  initialized: boolean;
  balance?: string;
  lastUsed?: Date;
  walletAddress?: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  costPerQuery: string;
  features: string[];
  available: boolean;
  averageResponseTime?: string;
  bestFor?: string;
  testnetNote?: string;
}

interface DreamAnalysis {
  interpretation: string;
  symbols: string[];
  emotions: string[];
  insights: string[];
  model: string;
  responseTime: number;
}

interface AIAnalysisResponse {
  success: boolean;
  analysis?: DreamAnalysis;
  cost: string;
  remainingBalance: string;
  error?: string;
}

interface HealthStatus {
  status: string;
  version: string;
  uptime: string;
  network: string;
  models: string[];
}

// Signature request types
interface SignatureRequest {
  operationId: string;
  operation: {
    type: 'signMessage' | 'signTransaction' | 'signTypedData';
    message?: string;
    transaction?: any;
    domain?: any;
    types?: any;
    value?: any;
  };
  timestamp: number;
}

// Create axios instance with default config and retry logic
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for AI responses
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for rate limit handling
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 429) {
      // Rate limited - wait and retry once
      const retryAfter = parseInt(error.response.headers['retry-after'] || '2');
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

// Main compute hook
export function useCompute() {
  const { debugLog } = useTheme();
  const { address, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brokerInfo, setBrokerInfo] = useState<BrokerInfo | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [pendingSignatures, setPendingSignatures] = useState<SignatureRequest[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Refs for cleanup and debouncing
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const loadInitialDataRef = useRef<NodeJS.Timeout | null>(null);
  const processingRequestRef = useRef<string | null>(null);

  // Helper to sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!window.ethereum) throw new Error('No wallet found');
    
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.signMessage(message);
  }, []);

  // Helper to send transaction (MetaMask will sign and send)
  const sendTransaction = useCallback(async (tx: any): Promise<string> => {
    if (!window.ethereum) throw new Error('No wallet found');
    
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Send the transaction (MetaMask will sign and send)
    const txResponse = await signer.sendTransaction(tx);
    return txResponse.hash;
  }, []);

  // Helper to sign typed data
  const signTypedData = useCallback(async (domain: any, types: any, value: any): Promise<string> => {
    if (!window.ethereum) throw new Error('No wallet found');
    
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    return await signer.signTypedData(domain, types, value);
  }, []);

  // Check for pending signature requests
  const checkPendingSignatures = useCallback(async () => {
    if (!address) return;
    
    try {
      const response = await api.get(`/signature/pending/${address}`);
      if (response.data.success) {
        const newRequests = response.data.requests || [];
        
        // Always update with fresh list from backend
        setPendingSignatures(prev => {
          // Only log if there are actual new requests
          const existingIds = prev.map(r => r.operationId);
          const reallyNew = newRequests.filter((req: any) => !existingIds.includes(req.operationId));
          
          if (reallyNew.length > 0) {
            debugLog('New pending signature requests', reallyNew);
          }
          
          // Return the fresh list from backend (already filtered for unresolved)
          return newRequests;
        });
      }
    } catch (err: any) {
      debugLog('Failed to check pending signatures', err);
    }
  }, [address, debugLog]);

  // Process signature request
  const processSignatureRequest = useCallback(async (request: SignatureRequest) => {
    try {
      debugLog('Processing signature request', { 
        operationId: request.operationId, 
        type: request.operation.type 
      });
      
      let signature: string;
      
      switch (request.operation.type) {
        case 'signMessage':
          debugLog('Signing message', request.operation.message);
          signature = await signMessage(request.operation.message!);
          break;
          
        case 'signTransaction':
          debugLog('Sending transaction', request.operation.transaction);
          signature = await sendTransaction(request.operation.transaction);
          debugLog('Transaction sent', { txHash: signature });
          break;
          
        case 'signTypedData':
          debugLog('Signing typed data', request.operation);
          signature = await signTypedData(
            request.operation.domain,
            request.operation.types,
            request.operation.value
          );
          break;
          
        default:
          throw new Error(`Unknown operation type: ${request.operation.type}`);
      }
      
      // Send signature back to backend
      const timestamp = Date.now();
      const authMessage = `Provide signature for ${address} at ${timestamp}`;
      const authSignature = await signMessage(authMessage);
      
      debugLog('Sending signature to backend', { 
        operationId: request.operationId,
        hasSignature: !!signature 
      });
      
      await api.post('/signature/provide', {
        operationId: request.operationId,
        signature,
        address,
        authSignature,
        timestamp
      });
      
      debugLog('Signature provided successfully', { operationId: request.operationId });
      
    } catch (err: any) {
      debugLog('Failed to process signature request', { 
        error: err.message,
        operationId: request.operationId 
      });
      setError(`Failed to sign: ${err.message}`);
      throw err; // Re-throw to trigger finally block
    }
  }, [address, signMessage, sendTransaction, signTypedData, debugLog]);

  // Start polling for signatures when address is available
  useEffect(() => {
    if (address) {
      // Start polling (reduced frequency to avoid rate limits)
      pollingInterval.current = setInterval(checkPendingSignatures, 5000); // 3s instead of 2s
      
      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [address, checkPendingSignatures]);

  // Auto-process pending signatures (with debouncing to prevent spam)
  useEffect(() => {
    if (pendingSignatures.length > 0 && !processingRequestRef.current) {
      // Process first pending signature
      const request = pendingSignatures[0];
      
      // Mark as processing to prevent duplicate processing
      processingRequestRef.current = request.operationId;
      
      // Process the request
      processSignatureRequest(request).finally(() => {
        // Clear processing flag when done
        processingRequestRef.current = null;
      });
    }
  }, [pendingSignatures, processSignatureRequest]);

  // Initialize broker
  const initializeBroker = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return { success: false };
    }

    setIsLoading(true);
    setIsInitializing(true);
    setError(null);

    try {
      debugLog('Initializing broker', { address });

      const timestamp = Date.now();
      const message = `Initialize 0G Broker for ${address} at ${timestamp}`;
      const signature = await signMessage(message);

      const response = await api.post('/broker/init', {
        address,
        signature,
        timestamp
      });

      if (response.data.success) {
        setBrokerInfo({ initialized: true });
        debugLog('Broker initialized', response.data);
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.error || 'Initialization failed');
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to initialize broker';
      debugLog('Broker init error', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  }, [isConnected, address, signMessage, debugLog]);

  // Check balance
  const checkBalance = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      debugLog('Checking balance', { address });

      const timestamp = Date.now();
      const message = `Check balance for ${address} at ${timestamp}`;
      const signature = await signMessage(message);

      const response = await api.get(`/broker/balance/${address}`, {
        headers: {
          'X-Signature': signature,
          'X-Timestamp': timestamp.toString()
        }
      });

      debugLog('Balance retrieved', response.data);
      return response.data;

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to check balance';
      debugLog('Balance check error', err);
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, signMessage, debugLog]);

  // Fund account
  const fundAccount = useCallback(async (amount: string) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return { success: false };
    }

    setIsLoading(true);
    setIsInitializing(true); // Enable signature polling
    setError(null);

    try {
      debugLog('Funding account', { address, amount });

      const timestamp = Date.now();
      const message = `Fund ${amount} OG for ${address} at ${timestamp}`;
      const signature = await signMessage(message);

      const response = await api.post('/broker/fund', {
        address,
        amount,
        signature,
        timestamp
      });

      if (response.data.success) {
        debugLog('Account funded', response.data);
        return { 
          success: true, 
          newBalance: response.data.newBalance,
          message: response.data.message 
        };
      } else {
        throw new Error(response.data.error || 'Funding failed');
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fund account';
      debugLog('Fund account error', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
      setIsInitializing(false); // Disable signature polling
    }
  }, [isConnected, address, signMessage, debugLog]);

  // Get available models
  const getModels = useCallback(async (): Promise<AIModel[]> => {
    try {
      debugLog('Fetching AI models');
      const response = await api.get('/ai/models');
      debugLog('Models retrieved', response.data);
      const fetchedModels = response.data.models || [];
      setModels(fetchedModels);
      return fetchedModels;
    } catch (err: any) {
      debugLog('Get models error', err);
      setError('Failed to fetch AI models');
      return [];
    }
  }, [debugLog]);

  // Analyze dream
  const analyzeDream = useCallback(async (
    dreamText: string, 
    model: 'llama' | 'deepseek' = 'llama'
  ): Promise<AIAnalysisResponse | null> => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      debugLog('Analyzing dream', { address, model, textLength: dreamText.length });

      const timestamp = Date.now();
      const message = `Analyze dream for ${address} at ${timestamp}`;
      const signature = await signMessage(message);

      const response = await api.post('/ai/analyze', {
        address,
        dreamText,
        signature,
        timestamp,
        options: { model }
      });

      if (response.data.success) {
        debugLog('Dream analyzed', response.data);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to analyze dream';
      debugLog('Dream analysis error', err);
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, signMessage, debugLog]);

  // Quick test
  const quickTest = useCallback(async (model: 'llama' | 'deepseek' = 'llama') => {
    if (!address) {
      setError('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      debugLog('Running quick test', { address, model });
      
      const response = await api.post('/ai/quick-test', {
        address,
        model
      });

      debugLog('Quick test complete', response.data);
      return response.data;

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Quick test failed';
      debugLog('Quick test error', err);
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, debugLog]);

  // Get broker info
  const getBrokerInfo = useCallback(async () => {
    if (!address) return null;

    try {
      debugLog('Getting broker info', { address });
      const response = await api.get(`/broker/info/${address}`);
      debugLog('Broker info retrieved', response.data);
      const info = response.data.info;
      setBrokerInfo(info);
      return info;
    } catch (err: any) {
      debugLog('Get broker info error', err);
      return null;
    }
  }, [address, debugLog]);

  // Check health
  const checkHealth = useCallback(async () => {
    try {
      const response = await api.get('/health/detailed');
      debugLog('Health check', response.data);
      setHealthStatus(response.data);
      return response.data;
    } catch (err: any) {
      debugLog('Health check error', err);
      return null;
    }
  }, [debugLog]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data with debounce to prevent rate limiting
  const loadInitialData = useCallback(async () => {
    if (!address) return;

    // Clear any pending load
    if (loadInitialDataRef.current) {
      clearTimeout(loadInitialDataRef.current);
    }

    // Debounce the load to prevent multiple rapid calls
    loadInitialDataRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        // Load data sequentially with delays to avoid rate limiting
        await getModels();
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        await getBrokerInfo();
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        await checkHealth();
      } catch (err: any) {
        debugLog('Failed to load initial data', err);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1 second debounce
  }, [address, getModels, getBrokerInfo, checkHealth, debugLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadInitialDataRef.current) {
        clearTimeout(loadInitialDataRef.current);
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  // Load initial data when address changes
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Return hook interface
  return {
    // State
    isLoading,
    error,
    brokerInfo,
    models,
    healthStatus,
    pendingSignatures,
    isInitializing,

    // Actions
    initializeBroker,
    checkBalance,
    fundAccount,
    getModels,
    analyzeDream,
    quickTest,
    getBrokerInfo,
    checkHealth,
    clearError,
    processSignatureRequest,

    // Utilities
    isConnected: isConnected && !!address,
    address
  };
}