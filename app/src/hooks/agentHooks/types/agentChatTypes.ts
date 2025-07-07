/**
 * Types and interfaces for Agent Chat functionality
 */

// Language detection types
export interface LanguageDetectionResult {
  /** Kod języka ISO 639-1 */
  language: string;
  /** Nazwa języka */
  languageName: string;
  /** Pewność wykrycia (0-1) */
  confidence: number;
  /** Czy język jest obsługiwany przez aplikację */
  isSupported: boolean;
  /** Czy użyto fallback na język domyślny */
  usedFallback: boolean;
  /** Oryginalny tekst który był analizowany */
  originalText: string;
}

// Core agent types
export interface AgentInfo {
  tokenId: bigint;
  owner: `0x${string}`;
  agentName: string;
  createdAt: bigint;
  lastUpdated: bigint;
  intelligenceLevel: bigint;
  dreamCount: bigint;
  conversationCount: bigint;
  personalityInitialized: boolean;
  totalEvolutions: bigint;
  lastEvolutionDate: bigint;
  personality: PersonalityTraits;
}

export interface PersonalityTraits {
  creativity: number;
  analytical: number;
  empathy: number;
  intuition: number;
  resilience: number;
  curiosity: number;
  dominantMood: string;
  lastDreamDate: bigint;
}

// Conversation types
export interface ConversationInput {
  message: string;
  contextType?: ContextType;
}

export interface ConversationResult {
  userMessage: string;
  aiResponse: string;
  contextType: ContextType;
  timestamp: string;
  /** Wynik wykrywania języka wiadomości użytkownika */
  languageDetection?: LanguageDetectionResult;
}

// Chat state management
export interface ChatState {
  isLoadingContext: boolean;
  isProcessingWithAI: boolean;
  isSavingToStorage: boolean;
  isRecordingOnChain: boolean;
  isWaitingForReceipt: boolean;
  isComplete: boolean;
  error: string;
  currentStep: 'input' | 'context' | 'ai' | 'storage' | 'blockchain' | 'complete' | 'error';
  lastConversation?: ConversationResult;
  storageHash?: string;
  txHash?: string;
  // 🆕 Lokalna sesja konwersacji
  localConversationHistory: ConversationResult[];
  sessionStartTime: string;
}

// Context types from contract ABI
export enum ContextType {
  DREAM_DISCUSSION = 0,    // Discussing previous dreams
  GENERAL_CHAT = 1,        // General conversation
  PERSONALITY_QUERY = 2,   // Asking about personality/traits
  THERAPEUTIC = 3,         // Therapeutic conversation
  ADVICE_SEEKING = 4       // Seeking advice/guidance
}

// Configuration types
export interface StorageConfig {
  storageRpc: string;
  l1Rpc: string;
}

export interface ComputeConfig {
  backendUrl: string;
}

// Service response types
export interface ChatContextData {
  agentInfo?: AgentInfo;
  conversationHashes?: string[];
  dreamHashes?: string[];
}

export interface SaveConversationResult {
  storageHash: string;
  txHash: string;
} 