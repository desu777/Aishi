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

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for AI responses
  headers: {
    'Content-Type': 'application/json'
  }
});

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
  
  // Polling interval ref
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Helper to sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!window.ethereum) throw new Error('No wallet found');
    
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.signMessage(message);
  }, []);

  // Helper to sign transaction
  const signTransaction = useCallback(async (tx: any): Promise<string> => {
    if (!window.ethereum) throw new Error('No wallet found');
    
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Sign the transaction
    const signedTx = await signer.signTransaction(tx);
    return signedTx;
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
    if (!address || !isInitializing) return;
    
    try {
      const response = await api.get(`/signature/pending/${address}`);
      if (response.data.success && response.data.requests.length > 0) {
        setPendingSignatures(response.data.requests);
        debugLog('Pending signature requests', response.data.requests);
      }
    } catch (err: any) {
      debugLog('Failed to check pending signatures', err);
    }
  }, [address, isInitializing, debugLog]);

  // Process signature request
  const processSignatureRequest = useCallback(async (request: SignatureRequest) => {
    try {
      let signature: string;
      
      switch (request.operation.type) {
        case 'signMessage':
          debugLog('Signing message', request.operation.message);
          signature = await signMessage(request.operation.message!);
          break;
          
        case 'signTransaction':
          debugLog('Signing transaction', request.operation.transaction);
          signature = await signTransaction(request.operation.transaction);
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
      
      await api.post('/signature/provide', {
        operationId: request.operationId,
        signature,
        address,
        authSignature, // Fixed duplicate key
        timestamp
      });
      
      debugLog('Signature provided', { operationId: request.operationId });
      
      // Remove from pending
      setPendingSignatures(prev => prev.filter(r => r.operationId !== request.operationId));
      
    } catch (err: any) {
      debugLog('Failed to process signature request', err);
      setError(`Failed to sign: ${err.message}`);
    }
  }, [address, signMessage, signTransaction, signTypedData, debugLog]);

  // Start polling for signatures when initializing
  useEffect(() => {
    if (isInitializing && address) {
      // Start polling
      pollingInterval.current = setInterval(checkPendingSignatures, 1000);
      
      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [isInitializing, address, checkPendingSignatures]);

  // Auto-process pending signatures
  useEffect(() => {
    if (pendingSignatures.length > 0) {
      // Process first pending signature
      const request = pendingSignatures[0];
      processSignatureRequest(request);
    }
  }, [pendingSignatures, processSignatureRequest]);

  // Initialize broker (updated to handle signatures)
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

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      await Promise.all([
        getModels(),
        getBrokerInfo(),
        checkHealth()
      ]);
    } catch (err: any) {
      debugLog('Failed to load initial data', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, getModels, getBrokerInfo, checkHealth, debugLog]);

  return {
    // State
    isLoading,
    error,
    brokerInfo,
    models,
    healthStatus,
    isConnected,
    address,
    pendingSignatures,
    isInitializing,
    
    // Broker operations
    initializeBroker,
    checkBalance,
    fundAccount,
    getBrokerInfo,
    
    // AI operations
    getModels,
    analyzeDream,
    quickTest,
    
    // Utils
    checkHealth,
    clearError,
    loadInitialData,
    
    // Signature handling
    processSignatureRequest
  };
} 