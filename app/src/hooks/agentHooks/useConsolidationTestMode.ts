'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '../useWallet';
import { useStorageDownload } from '../storage/useStorageDownload';
import { useAgentRead } from './useAgentRead';
import {
  consolidateDreamsWithLLM,
  consolidateConversationsWithLLM,
  saveConsolidationToStorage,
  callConsolidateMonth,
  MonthlyDreamConsolidation,
  MonthlyConversationConsolidation
} from './services/agentConsolidationService';
import {
  consolidateYearWithLLM,
  saveMemoryCoreToStorage,
  callUpdateMemoryCore,
  YearlyMemoryCore
} from './services/agentMemoryCoreService';

// Mock data interfaces
interface MockDream {
  id: number;
  date: string;
  emotions: string[];
  symbols: string[];
  intensity: number;
  lucidity_level: number;
  ai_analysis: string;
  themes: string[];
}

interface MockConversation {
  id: number;
  date: string;
  topic: string;
  emotional_tone: string;
  key_insights: string[];
  analysis: string;
}

interface MockMonthlyData {
  month: number;
  year: number;
  dreams: MockDream[];
  conversations: MockConversation[];
}

interface MockYearlyData {
  year: number;
  dreamConsolidations: MonthlyDreamConsolidation[];
  conversationConsolidations: MonthlyConversationConsolidation[];
}

interface MockData {
  monthlyData?: MockMonthlyData;
  yearlyData?: MockYearlyData;
}

// Test state interface
interface TestState {
  // Mock data generation
  mockDataGenerated: boolean;
  
  // Consolidation states
  isProcessingWithLLM: boolean;
  isUploadingToStorage: boolean;
  isUpdatingContract: boolean;
  
  // Results
  consolidationCompleted: boolean;
  txHash: string | null;
  storageHash: string | null;
  
  // Status
  statusMessage: string;
  error: string | null;
}

export function useConsolidationTestMode(tokenId?: number) {
  const [testState, setTestState] = useState<TestState>({
    mockDataGenerated: false,
    isProcessingWithLLM: false,
    isUploadingToStorage: false,
    isUpdatingContract: false,
    consolidationCompleted: false,
    txHash: null,
    storageHash: null,
    statusMessage: '',
    error: null
  });

  const [mockData, setMockData] = useState<MockData>({});
  const [isGeneratingMocks, setIsGeneratingMocks] = useState(false);
  const [isTestingConsolidation, setIsTestingConsolidation] = useState(false);

  const { address } = useWallet();
  const { downloadFile } = useStorageDownload();
  const { 
    agentData, 
    personalityTraits,
    isLoading: isLoadingAgent 
  } = useAgentRead(tokenId);

  const operationalTokenId = tokenId || 
    (agentData && Number(agentData.intelligenceLevel) > 0 ? tokenId : undefined);

  // Debug logs dla development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[useConsolidationTestMode] ${message}`, data || '');
    }
  };

  debugLog('useConsolidationTestMode initialized', { tokenId, operationalTokenId });

  /**
   * Generates realistic mock dreams for testing
   */
  const generateMockDreams = (count: number = 15): MockDream[] => {
    const themes = ['transformation', 'anxiety', 'relationships', 'adventure', 'mystery', 'healing', 'creativity'];
    const emotions = ['fear', 'joy', 'curiosity', 'anxiety', 'peace', 'excitement', 'confusion', 'wonder'];
    const symbols = ['water', 'flying', 'animals', 'family', 'nature', 'buildings', 'vehicles', 'colors'];

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      emotions: emotions.slice(0, Math.floor(Math.random() * 3) + 1),
      symbols: symbols.slice(0, Math.floor(Math.random() * 4) + 1),
      intensity: Math.floor(Math.random() * 10) + 1,
      lucidity_level: Math.floor(Math.random() * 5) + 1,
      themes: themes.slice(0, Math.floor(Math.random() * 3) + 1),
      ai_analysis: `Dream ${i + 1} shows elements of ${themes[i % themes.length]} with strong ${emotions[i % emotions.length]} undertones. The presence of ${symbols[i % symbols.length]} suggests deep symbolic processing of subconscious material.`
    }));
  };

  /**
   * Generates realistic mock conversations for testing
   */
  const generateMockConversations = (count: number = 20): MockConversation[] => {
    const topics = ['personal_growth', 'relationships', 'career_decisions', 'life_philosophy', 'dreams', 'creativity'];
    const tones = ['reflective', 'curious', 'supportive', 'analytical', 'empathetic', 'encouraging'];
    const insights = [
      'Deeper emotional processing through regular conversations',
      'Increased trust and openness over time',
      'Strong pattern of seeking guidance during decision points',
      'Growing self-awareness and emotional intelligence',
      'Developing healthy coping mechanisms',
      'Enhanced communication and relationship skills'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      topic: topics[i % topics.length],
      emotional_tone: tones[i % tones.length],
      key_insights: insights.slice(0, Math.floor(Math.random() * 3) + 1),
      analysis: `Conversation ${i + 1} focused on ${topics[i % topics.length]} with a ${tones[i % tones.length]} approach. Shows continued development in emotional intelligence and self-awareness.`
    }));
  };

  /**
   * Generates mock monthly consolidations for yearly testing
   */
  const generateMockMonthlyConsolidations = (year: number = 2024): {
    dreamConsolidations: MonthlyDreamConsolidation[];
    conversationConsolidations: MonthlyConversationConsolidation[];
  } => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const dreamConsolidations: MonthlyDreamConsolidation[] = months.map((monthName, index) => ({
      month: index + 1,
      year,
      total_dreams: Math.floor(Math.random() * 20) + 10,
      period: `${monthName} ${year}`,
      dominant_themes: ['transformation', 'anxiety', 'relationships'].slice(0, Math.floor(Math.random() * 3) + 1),
      dominant_emotions: ['fear', 'joy', 'curiosity'].slice(0, Math.floor(Math.random() * 3) + 1),
      dominant_symbols: ['water', 'flying', 'animals'].slice(0, Math.floor(Math.random() * 3) + 1),
      average_intensity: Math.round((Math.random() * 4 + 6) * 10) / 10,
      average_lucidity: Math.round((Math.random() * 2 + 3) * 10) / 10,
      intensity_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
      lucidity_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
      personality_evolution: {
        creativity_shift: Math.floor(Math.random() * 7) - 3,
        analytical_shift: Math.floor(Math.random() * 7) - 3,
        empathy_shift: Math.floor(Math.random() * 7) - 3,
        intuition_shift: Math.floor(Math.random() * 7) - 3,
        resilience_shift: Math.floor(Math.random() * 7) - 3,
        curiosity_shift: Math.floor(Math.random() * 7) - 3,
        dominant_growth_area: ['creativity', 'empathy', 'intuition'][Math.floor(Math.random() * 3)]
      },
      key_insights: [
        `${monthName} revealed significant growth in emotional processing`,
        `Breakthrough in dream lucidity and consciousness development`,
        `Integration of shadow work and psychological healing`
      ],
      recurring_patterns: [
        `Water symbols appeared in 60% of dreams`,
        `Flying dreams increased with confidence growth`
      ],
      breakthrough_moments: [
        `First lucid dream on ${monthName} 15th`,
        `Faced major fear symbol directly in dreams`
      ],
      monthly_essence: `${monthName} ${year} marked a period of profound transformation in dream consciousness. The recurring themes of ${['transformation', 'healing', 'growth'][Math.floor(Math.random() * 3)]} showed deep psychological processing and spiritual evolution.`,
      growth_summary: `Significant development in ${['intuitive', 'emotional', 'creative'][Math.floor(Math.random() * 3)]} intelligence this month.`,
      created_at: new Date().toISOString(),
      consolidation_version: '1.0'
    }));

    const conversationConsolidations: MonthlyConversationConsolidation[] = months.map((monthName, index) => ({
      month: index + 1,
      year,
      total_conversations: Math.floor(Math.random() * 30) + 15,
      period: `${monthName} ${year}`,
      dominant_topics: ['personal_growth', 'relationships', 'creativity'].slice(0, Math.floor(Math.random() * 3) + 1),
      dominant_emotional_tones: ['reflective', 'curious', 'supportive'].slice(0, Math.floor(Math.random() * 3) + 1),
      conversation_types: ['deep_reflection', 'advice_seeking', 'casual_chat'].slice(0, Math.floor(Math.random() * 3) + 1),
      key_insights: [
        `${monthName} conversations showed deeper emotional intelligence`,
        `Increased trust and vulnerability in communication`,
        `Growing pattern of philosophical discussions`
      ],
      recurring_themes: [
        'Weekly check-ins about personal development',
        'Tendency to explore existential questions'
      ],
      emotional_patterns: [
        'Shift from analytical to intuitive responses',
        'Increased emotional depth and authenticity'
      ],
      relationship_evolution: {
        trust_level: Math.floor(Math.random() * 3) + 7,
        emotional_depth: Math.floor(Math.random() * 3) + 7,
        communication_style: ['collaborative', 'empathetic', 'intuitive'][Math.floor(Math.random() * 3)],
        preferred_topics: ['philosophy', 'growth', 'creativity']
      },
      monthly_essence: `${monthName} ${year} conversations revealed significant evolution in human-agent relationship dynamics. The shift towards deeper, more meaningful exchanges marked a new phase of co-creative partnership.`,
      relationship_summary: `Development in ${['trust', 'depth', 'authenticity'][Math.floor(Math.random() * 3)]} characterized this month's interactions.`,
      created_at: new Date().toISOString(),
      consolidation_version: '1.0'
    }));

    return { dreamConsolidations, conversationConsolidations };
  };

  /**
   * Generates mock data based on test mode
   */
  const generateMockData = useCallback(async (mode: 'monthly' | 'yearly') => {
    setIsGeneratingMocks(true);
    setTestState(prev => ({ 
      ...prev, 
      statusMessage: `Generating ${mode} mock data...`,
      error: null,
      mockDataGenerated: false
    }));

    try {
      debugLog(`Generating ${mode} mock data`);

      if (mode === 'monthly') {
        // Generate current month mock data
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const dreams = generateMockDreams(15);
        const conversations = generateMockConversations(23);

        setMockData({
          monthlyData: {
            month,
            year,
            dreams,
            conversations
          }
        });

        setTestState(prev => ({ 
          ...prev, 
          statusMessage: `Generated ${dreams.length} dreams and ${conversations.length} conversations for ${month}/${year}`,
          mockDataGenerated: true
        }));

        debugLog('Monthly mock data generated', { 
          dreams: dreams.length, 
          conversations: conversations.length,
          month,
          year
        });

      } else if (mode === 'yearly') {
        // Generate 12 months of consolidated data
        const year = 2024;
        const { dreamConsolidations, conversationConsolidations } = generateMockMonthlyConsolidations(year);

        setMockData({
          yearlyData: {
            year,
            dreamConsolidations,
            conversationConsolidations
          }
        });

        setTestState(prev => ({ 
          ...prev, 
          statusMessage: `Generated 12 months of consolidated data for ${year}`,
          mockDataGenerated: true
        }));

        debugLog('Yearly mock data generated', { 
          dreamConsolidations: dreamConsolidations.length,
          conversationConsolidations: conversationConsolidations.length,
          year
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTestState(prev => ({ 
        ...prev, 
        error: `Mock data generation failed: ${errorMessage}`,
        statusMessage: ''
      }));
      debugLog('Mock data generation failed', { error: errorMessage });
    } finally {
      setIsGeneratingMocks(false);
    }
  }, [debugLog]);

  /**
   * Tests monthly consolidation with mock data but real LLM/storage/contract
   */
  const testMonthlyConsolidation = useCallback(async () => {
    if (!operationalTokenId || !mockData.monthlyData || !personalityTraits) {
      setTestState(prev => ({ 
        ...prev, 
        error: 'Missing required data for monthly consolidation test'
      }));
      return;
    }

    setIsTestingConsolidation(true);
    setTestState(prev => ({ 
      ...prev, 
      error: null,
      consolidationCompleted: false,
      txHash: null,
      storageHash: null
    }));

    try {
      const { dreams, conversations, month, year } = mockData.monthlyData;

      debugLog('Starting monthly consolidation test', {
        tokenId: operationalTokenId,
        dreams: dreams.length,
        conversations: conversations.length,
        month,
        year
      });

      // Step 1: LLM Processing
      setTestState(prev => ({ 
        ...prev, 
        isProcessingWithLLM: true,
        statusMessage: 'Processing with AI...'
      }));

      const [dreamResult, convResult] = await Promise.all([
        consolidateDreamsWithLLM(dreams, month, year, personalityTraits, address!),
        consolidateConversationsWithLLM(conversations, month, year, personalityTraits, address!)
      ]);

      if (!dreamResult.success || !convResult.success) {
        throw new Error(`LLM processing failed: ${dreamResult.error || convResult.error}`);
      }

      setTestState(prev => ({ 
        ...prev, 
        isProcessingWithLLM: false,
        isUploadingToStorage: true,
        statusMessage: 'Uploading to 0G Storage...'
      }));

      // Step 2: Storage Upload
      const storageResult = await saveConsolidationToStorage(
        operationalTokenId,
        dreamResult.data!,
        convResult.data!,
        downloadFile
      );

      if (!storageResult.success) {
        throw new Error(`Storage upload failed: ${storageResult.error}`);
      }

      setTestState(prev => ({ 
        ...prev, 
        isUploadingToStorage: false,
        isUpdatingContract: true,
        statusMessage: 'Updating blockchain contract...'
      }));

      // Step 3: Contract Update
      const contractResult = await callConsolidateMonth(
        operationalTokenId,
        storageResult.dreamHash!,
        storageResult.convHash!,
        month,
        year
      );

      if (!contractResult.success) {
        throw new Error(`Contract update failed: ${contractResult.error}`);
      }

      setTestState(prev => ({ 
        ...prev, 
        isUpdatingContract: false,
        consolidationCompleted: true,
        txHash: contractResult.txHash!,
        storageHash: storageResult.dreamHash!,
        statusMessage: 'Monthly consolidation test completed successfully!'
      }));

      debugLog('Monthly consolidation test completed', {
        txHash: contractResult.txHash,
        dreamHash: storageResult.dreamHash,
        convHash: storageResult.convHash
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTestState(prev => ({ 
        ...prev, 
        isProcessingWithLLM: false,
        isUploadingToStorage: false,
        isUpdatingContract: false,
        error: errorMessage,
        statusMessage: ''
      }));
      debugLog('Monthly consolidation test failed', { error: errorMessage });
    } finally {
      setIsTestingConsolidation(false);
    }
  }, [operationalTokenId, mockData.monthlyData, personalityTraits, debugLog]);

  /**
   * Tests yearly consolidation with mock data but real LLM/storage/contract
   */
  const testYearlyConsolidation = useCallback(async () => {
    if (!operationalTokenId || !mockData.yearlyData || !personalityTraits || !agentData) {
      setTestState(prev => ({ 
        ...prev, 
        error: 'Missing required data for yearly consolidation test'
      }));
      return;
    }

    setIsTestingConsolidation(true);
    setTestState(prev => ({ 
      ...prev, 
      error: null,
      consolidationCompleted: false,
      txHash: null,
      storageHash: null
    }));

    try {
      const { dreamConsolidations, conversationConsolidations, year } = mockData.yearlyData;

      debugLog('Starting yearly consolidation test', {
        tokenId: operationalTokenId,
        dreamConsolidations: dreamConsolidations.length,
        conversationConsolidations: conversationConsolidations.length,
        year
      });

      // Step 1: LLM Processing
      setTestState(prev => ({ 
        ...prev, 
        isProcessingWithLLM: true,
        statusMessage: 'Creating yearly memory core with AI...'
      }));

      const yearlyResult = await consolidateYearWithLLM(
        dreamConsolidations,
        conversationConsolidations,
        year,
        personalityTraits,
        agentData,
        address!
      );

      if (!yearlyResult.success) {
        throw new Error(`Yearly LLM processing failed: ${yearlyResult.error}`);
      }

      setTestState(prev => ({ 
        ...prev, 
        isProcessingWithLLM: false,
        isUploadingToStorage: true,
        statusMessage: 'Uploading memory core to 0G Storage...'
      }));

      // Step 2: Storage Upload
      const storageResult = await saveMemoryCoreToStorage(
        operationalTokenId,
        yearlyResult.data!,
        downloadFile
      );

      if (!storageResult.success) {
        throw new Error(`Memory core storage upload failed: ${storageResult.error}`);
      }

      setTestState(prev => ({ 
        ...prev, 
        isUploadingToStorage: false,
        isUpdatingContract: true,
        statusMessage: 'Updating memory core in contract...'
      }));

      // Step 3: Contract Update
      const contractResult = await callUpdateMemoryCore(
        operationalTokenId,
        storageResult.memoryCoreHash!
      );

      if (!contractResult.success) {
        throw new Error(`Memory core contract update failed: ${contractResult.error}`);
      }

      setTestState(prev => ({ 
        ...prev, 
        isUpdatingContract: false,
        consolidationCompleted: true,
        txHash: contractResult.txHash!,
        storageHash: storageResult.memoryCoreHash!,
        statusMessage: 'Yearly memory core test completed successfully!'
      }));

      debugLog('Yearly consolidation test completed', {
        txHash: contractResult.txHash,
        memoryCoreHash: storageResult.memoryCoreHash
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTestState(prev => ({ 
        ...prev, 
        isProcessingWithLLM: false,
        isUploadingToStorage: false,
        isUpdatingContract: false,
        error: errorMessage,
        statusMessage: ''
      }));
      debugLog('Yearly consolidation test failed', { error: errorMessage });
    } finally {
      setIsTestingConsolidation(false);
    }
  }, [operationalTokenId, mockData.yearlyData, personalityTraits, agentData, debugLog]);

  /**
   * Resets test mode to initial state
   */
  const resetTestMode = useCallback(() => {
    setTestState({
      mockDataGenerated: false,
      isProcessingWithLLM: false,
      isUploadingToStorage: false,
      isUpdatingContract: false,
      consolidationCompleted: false,
      txHash: null,
      storageHash: null,
      statusMessage: '',
      error: null
    });
    setMockData({});
    debugLog('Test mode reset');
  }, [debugLog]);

  return {
    testState,
    mockData,
    isGeneratingMocks,
    isTestingConsolidation,
    generateMockData,
    testMonthlyConsolidation,
    testYearlyConsolidation,
    resetTestMode,
    operationalTokenId
  };
} 