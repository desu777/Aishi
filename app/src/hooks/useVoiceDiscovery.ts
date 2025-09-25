/**
 * @fileoverview Voice Discovery Hook
 * @description Manages voice profile discovery, selection, and testing
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';

export interface VoiceProfile {
  id: 'aria' | 'nova' | 'atlas' | 'echo';
  name: string;
  description: string;
  personality: string;
  gender: 'female' | 'male' | 'neutral';
  style: string;
  emotionalRange: string[];
  sampleText?: string;
  available: boolean;
}

const DEFAULT_VOICES: VoiceProfile[] = [
  {
    id: 'aria',
    name: 'Aria',
    description: 'Warm and empathetic voice',
    personality: 'Nurturing, understanding, and emotionally intelligent',
    gender: 'female',
    style: 'Soft, melodic, with gentle inflections',
    emotionalRange: ['warmth', 'empathy', 'comfort', 'encouragement'],
    sampleText: 'Hello! I\'m Aria. I\'m here to listen and understand your dreams with warmth and empathy.',
    available: true
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Professional and clear voice',
    personality: 'Confident, articulate, and engaging',
    gender: 'female',
    style: 'Clear, professional, with dynamic energy',
    emotionalRange: ['confidence', 'enthusiasm', 'clarity', 'professionalism'],
    sampleText: 'Hi there! I\'m Nova. Let\'s explore your thoughts with clarity and confidence.',
    available: true
  },
  {
    id: 'atlas',
    name: 'Atlas',
    description: 'Deep and reassuring voice',
    personality: 'Calm, wise, and grounding',
    gender: 'male',
    style: 'Deep, resonant, with measured pace',
    emotionalRange: ['calm', 'wisdom', 'stability', 'reassurance'],
    sampleText: 'Greetings. I am Atlas. Together we\'ll find deeper meaning in your experiences.',
    available: true
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Adaptive and contextual voice',
    personality: 'Versatile, intuitive, and responsive',
    gender: 'neutral',
    style: 'Adaptive tone that matches conversation context',
    emotionalRange: ['adaptability', 'intuition', 'balance', 'responsiveness'],
    sampleText: 'Hello, I\'m Echo. I adapt to match the energy and tone of our conversation.',
    available: true
  }
];

export const useVoiceDiscovery = () => {
  const [voices, setVoices] = useState<VoiceProfile[]>(DEFAULT_VOICES);
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    // Load saved voice from localStorage or select random
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aishi-selected-voice');
      if (saved && ['aria', 'nova', 'atlas', 'echo'].includes(saved)) {
        return saved;
      }
      // Random selection on first visit
      const voiceIds = ['aria', 'nova', 'atlas', 'echo'];
      return voiceIds[Math.floor(Math.random() * voiceIds.length)];
    }
    return 'aria';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available voices from backend
  const discoverVoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/voice/voices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.voices && Array.isArray(data.voices)) {
        // Map backend voices to our VoiceProfile format
        const mappedVoices = data.voices.map((voiceId: string) => {
          const defaultVoice = DEFAULT_VOICES.find(v => v.id === voiceId);
          return defaultVoice || {
            id: voiceId,
            name: voiceId.charAt(0).toUpperCase() + voiceId.slice(1),
            description: `${voiceId} voice profile`,
            personality: 'AI voice assistant',
            gender: 'neutral',
            style: 'Natural conversational tone',
            emotionalRange: ['neutral'],
            available: true
          };
        });

        setVoices(mappedVoices);
      } else {
        // Use default voices if backend doesn't provide list
        setVoices(DEFAULT_VOICES);
      }
    } catch (error) {
      console.error('Failed to discover voices:', error);
      setError(error instanceof Error ? error.message : 'Failed to discover voices');
      // Fallback to default voices
      setVoices(DEFAULT_VOICES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test a voice by synthesizing sample text
  const testVoice = useCallback(async (voiceId: string) => {
    const debugLog = (msg: string, data?: any) => {
      if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
        console.log(`[VoiceTest] ${msg}`, data || '');
      }
    };

    debugLog('Starting voice test', { voiceId });
    setIsTesting(true);
    setError(null);

    try {
      const voice = voices.find(v => v.id === voiceId);
      if (!voice) {
        throw new Error('Voice not found');
      }

      const sampleText = voice.sampleText || `Hello! This is a test of the ${voice.name} voice.`;

      // Request TTS synthesis
      debugLog('Sending TTS request', { sampleText, voiceId, url: `${BACKEND_URL}/voice/synthesize` });

      const response = await fetch(`${BACKEND_URL}/voice/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sampleText,
          voiceId: voiceId,
          emotionalTone: 'neutral',
          speed: 1.0,
          pitch: 1.0
        }),
      });

      debugLog('TTS response received', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`Failed to synthesize voice: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Handle API response structure { success: true, data: { audioData, format, ... } }
      const data = responseData.data || responseData;

      debugLog('TTS response structure', {
        hasSuccess: 'success' in responseData,
        hasData: 'data' in responseData,
        topLevelKeys: Object.keys(responseData)
      });

      debugLog('TTS response data', {
        hasAudioData: !!data.audioData,
        audioDataLength: data.audioData?.length,
        format: data.format,
        duration: data.duration,
        voiceUsed: data.voiceUsed
      });

      if (data.audioData) {
        // Check WAV header (first few bytes)
        const headerBytes = data.audioData.substring(0, 8);
        debugLog('Audio header (base64)', { headerBytes });

        // Create audio element and play
        const dataUri = `data:audio/wav;base64,${data.audioData}`;
        debugLog('Creating audio element', { dataUriLength: dataUri.length });

        const audio = new Audio(dataUri);
        audio.volume = 0.8;

        // Add debug event listeners
        audio.addEventListener('loadstart', () => debugLog('Audio event: loadstart'));
        audio.addEventListener('loadeddata', () => debugLog('Audio event: loadeddata'));
        audio.addEventListener('canplay', () => debugLog('Audio event: canplay'));
        audio.addEventListener('play', () => debugLog('Audio event: play'));
        audio.addEventListener('playing', () => debugLog('Audio event: playing'));
        audio.addEventListener('error', (e) => {
          debugLog('Audio event: error', {
            error: e,
            audioError: audio.error,
            errorCode: audio.error?.code,
            errorMessage: audio.error?.message
          });
        });

        // Play the audio
        debugLog('Attempting to play audio', {
          readyState: audio.readyState,
          networkState: audio.networkState,
          duration: audio.duration
        });

        try {
          const playPromise = audio.play();
          debugLog('Play promise created');
          await playPromise;
          debugLog('Audio playback started successfully');
        } catch (playError) {
          debugLog('Play promise rejected', {
            error: playError,
            errorMessage: (playError as Error).message
          });
          throw playError;
        }

        // Wait for playback to complete
        return new Promise((resolve) => {
          audio.addEventListener('ended', () => {
            debugLog('Audio playback ended');
            resolve(true);
          });

          // Error handler already added above, but add resolution
          const errorHandler = (e: Event) => {
            debugLog('Audio playback error in promise', { event: e });
            resolve(false);
          };

          // If error wasn't already added
          if (!audio.onerror) {
            audio.addEventListener('error', errorHandler);
          }
        });
      }
    } catch (error) {
      console.error('Failed to test voice:', error);
      setError(error instanceof Error ? error.message : 'Failed to test voice');
      return false;
    } finally {
      setIsTesting(false);
    }
  }, [voices]);

  // Test current selected voice
  const testSelectedVoice = useCallback(async () => {
    return testVoice(selectedVoice);
  }, [selectedVoice, testVoice]);

  // Initial discovery on mount
  useEffect(() => {
    discoverVoices();
  }, []);

  // Save selected voice to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aishi-selected-voice', selectedVoice);
    }
  }, [selectedVoice]);

  // Get the currently selected voice object
  const getSelectedVoice = useCallback(() => {
    return voices.find(v => v.id === selectedVoice) || voices[0];
  }, [selectedVoice, voices]);

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    isLoading,
    isTesting,
    error,
    testVoice,
    testSelectedVoice,
    getSelectedVoice,
    refreshVoices: discoverVoices
  };
};

export default useVoiceDiscovery;