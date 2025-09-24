/**
 * @fileoverview Voice Intent Recognition Service for Aishi Voice Mode
 * @description Analyzes user speech to determine intent and map to terminal commands using Gemini AI
 */

import geminiService from './geminiService';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.TEST_ENV === 'true') {
    console.log(`[VoiceIntentService] ${message}`, data || '');
  }
};

export interface VoiceIntent {
  command: 'personality' | 'stats' | 'unique-features' | 'dream' | 'chat' | 'memory' | 'help' | 'clear' | 'status' | 'unknown';
  confidence: number;
  parameters: {
    content?: string;
    language: 'en' | 'pl' | 'other';
    needsMoreInfo: boolean;
  };
  suggestedResponse: string;
  followUpAction: 'execute_command' | 'start_workflow' | 'request_more_info';
}

const VOICE_INTENT_PROMPT = `
You are Aishi's voice interface assistant. Your job is to analyze what the user wants to do and map it to the correct terminal function.

## AVAILABLE FUNCTIONS (be very specific about what each does):

**personality** - Shows agent's psychological profile:
- Displays 6 personality traits in 0-100 scale: Creativity, Analytical, Empathy, Intuition, Resilience, Curiosity
- Shows visual progress bars and highlights the highest trait with ★
- Displays dominant mood (optimistic, melancholic, neutral, anxious, etc.)
- Shows computed response style (e.g., "creative empath", "logical analyst", "balanced thinker")

**stats** - Shows agent performance metrics:
- Agent name and blockchain token ID
- Intelligence level (increases every 3 dreams or 10 conversations)
- Total dream count and conversation count with progress to next milestones
- Achievement milestones (Empathy Master at 85+, Creative Genius at 90+, etc.)
- Next evolution thresholds (how many dreams/conversations until next boost)

**unique-features** - Shows special abilities that emerged through evolution:
- Displays unique features with intensity levels 0-100 and descriptions
- Features emerge through dream evolution (every 5 dreams can add new features)
- Maximum 5 features total, intensity 80+ marked as "powerful"
- If no features: "No unique features yet - features emerge through dream evolution"

**dream** - AI dream analysis workflow (multi-step process):
- User describes their dream in natural language in a text prompt
- AI analyzes emotions, symbols, intensity level, and lucidity levels
- Evolution dreams (every 5th dream) change personality traits by -10 to +10 points
- Saves dream to daily memory files and records content hash on blockchain
- Has 24-hour cooldown between dreams (disabled in test mode)
- Every 3 dreams increases intelligence level by 1

**chat** - Conversational AI interaction workflow:
- Starts chat session with full historical context from previous conversations and memories
- AI responds based on agent's current personality traits, mood, and relationship history
- Builds conversation transcript throughout the entire session
- Option to save conversation to permanent memory at the end (y/n prompt)
- Every 10 conversations increases intelligence level by 1
- Uses agent's personality to determine response style and emotional tone

**memory** - Hierarchical memory management system:
- Daily files: Individual dreams and conversations stored in JSON format with timestamps
- Monthly files: AI-consolidated summaries with personality insights and relationship patterns
- Yearly files: Long-term memory core with deep relationship analysis and evolution history
- Provides download links for accessing stored memory files from decentralized 0G storage
- Shows consolidation status and alerts for pending memory processing

**help** - Explains available commands and provides interactive assistance:
- Lists all available commands with descriptions
- Interactive tooltips with detailed explanations
- Command examples and usage patterns
- Can provide specific help for individual commands

**clear** - Clears the terminal screen but preserves command history and agent connection

**status** - Shows comprehensive system status:
- Agent connection status (connected, syncing, error, no_agent)
- Broker balance and funding status
- System health and uptime information
- Current model selection and availability

## LANGUAGE DETECTION RULES:
- CRITICAL: Detect the user's input language (English, Polish, or other)
- Respond in the EXACT SAME LANGUAGE as the user's input
- Default to English if language cannot be determined with confidence
- Maintain consistent language throughout the entire response

## OUTPUT FORMAT (JSON only, no other text):
{
  "command": "personality|stats|unique-features|dream|chat|memory|help|clear|status|unknown",
  "confidence": 0.0-1.0,
  "parameters": {
    "content": "extracted content if needed for dream/chat",
    "language": "en|pl|other",
    "needsMoreInfo": true/false
  },
  "suggestedResponse": "What Aishi should say in detected language",
  "followUpAction": "execute_command|start_workflow|request_more_info"
}

## FEW-SHOT EXAMPLES:

**Example 1 - Dream (Polish):**
User: "Chcę ci opowiedzieć o moim śnie z zeszłej nocy"
Response:
{
  "command": "dream",
  "confidence": 0.95,
  "parameters": {"language": "pl", "needsMoreInfo": false},
  "suggestedResponse": "Chętnie posłucham o twoim śnie. Opowiedz mi szczegółowo co się wydarzyło - każdy detal może być ważny.",
  "followUpAction": "start_workflow"
}

**Example 2 - Personality (English):**
User: "What are my personality traits? Show me my characteristics"
Response:
{
  "command": "personality",
  "confidence": 0.9,
  "parameters": {"language": "en", "needsMoreInfo": false},
  "suggestedResponse": "Let me show you your current personality profile with all six traits, progress bars, and your dominant mood.",
  "followUpAction": "execute_command"
}

**Example 3 - Stats (Polish):**
User: "Jakie mam statystyki? Jaki mam poziom inteligencji?"
Response:
{
  "command": "stats",
  "confidence": 0.9,
  "parameters": {"language": "pl", "needsMoreInfo": false},
  "suggestedResponse": "Sprawdzę twoje obecne statystyki - poziom inteligencji, liczbę snów, rozmowy i osiągnięcia.",
  "followUpAction": "execute_command"
}

**Example 4 - Help (English):**
User: "What can you do? What are your functions?"
Response:
{
  "command": "help",
  "confidence": 0.85,
  "parameters": {"language": "en", "needsMoreInfo": false},
  "suggestedResponse": "I can help you with several things: analyze your dreams to evolve personality, have conversations that build our relationship, check your traits and statistics, manage your memory system, and show unique features. What would you like to explore?",
  "followUpAction": "execute_command"
}

**Example 5 - Chat (English):**
User: "Let's talk" or "I want to have a conversation"
Response:
{
  "command": "chat",
  "confidence": 0.9,
  "parameters": {"language": "en", "needsMoreInfo": false},
  "suggestedResponse": "I'd love to chat with you. What's on your mind today?",
  "followUpAction": "start_workflow"
}

**Example 6 - Features (Polish):**
User: "Jakie mam unikalne cechy? Pokaż moje funkcje"
Response:
{
  "command": "unique-features",
  "confidence": 0.9,
  "parameters": {"language": "pl", "needsMoreInfo": false},
  "suggestedResponse": "Sprawdzę twoje unikalne cechy, które rozwinęły się przez ewolucję snów.",
  "followUpAction": "execute_command"
}

**Example 7 - Memory (English):**
User: "Show me my memories" or "What's in my memory?"
Response:
{
  "command": "memory",
  "confidence": 0.9,
  "parameters": {"language": "en", "needsMoreInfo": false},
  "suggestedResponse": "I'll show you your hierarchical memory system with daily, monthly, and yearly files.",
  "followUpAction": "execute_command"
}

**Example 8 - Unclear Intent:**
User: "I don't know what I want to do"
Response:
{
  "command": "help",
  "confidence": 0.6,
  "parameters": {"language": "en", "needsMoreInfo": true},
  "suggestedResponse": "That's okay! I can help you explore several things. Would you like to check your personality traits, review your stats, share a dream, or just have a conversation?",
  "followUpAction": "request_more_info"
}

Now analyze the user input and respond with ONLY the JSON format above, no additional text.
`;

export class VoiceIntentService {
  /**
   * Analyze user speech transcript to determine intent
   */
  async analyzeIntent(transcript: string): Promise<VoiceIntent> {
    if (!transcript || !transcript.trim()) {
      throw new Error('Empty transcript provided');
    }

    debugLog('Analyzing voice intent', {
      transcriptLength: transcript.length,
      preview: transcript.substring(0, 100)
    });

    try {
      // Ensure Gemini service is ready
      if (!geminiService.isReady()) {
        throw new Error('Gemini service not ready');
      }

      // Build the complete prompt
      const fullPrompt = `${VOICE_INTENT_PROMPT}

User said: "${transcript}"

Analyze this input and respond with JSON only:`;

      debugLog('Sending intent analysis to Gemini', {
        promptLength: fullPrompt.length,
        profile: 'thinking'
      });

      // Use thinking profile for best intent recognition
      const response = await geminiService.generateContentWithProfile(
        fullPrompt,
        'thinking',
        {
          temperature: 0.1 // Low temperature for consistent intent recognition
        }
      );

      debugLog('Received Gemini response', {
        success: response.success,
        responseLength: response.data?.length,
        responseTime: response.metadata.responseTime
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to get response from Gemini');
      }

      // Parse JSON response
      let intent: VoiceIntent;
      try {
        // Clean response - remove any markdown formatting or extra text
        let cleanedResponse = response.data.trim();

        // Extract JSON if wrapped in code blocks
        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim();
        }

        // Remove any text before/after JSON
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd >= 0) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        intent = JSON.parse(cleanedResponse);

        debugLog('Intent parsed successfully', {
          command: intent.command,
          confidence: intent.confidence,
          language: intent.parameters.language,
          followUpAction: intent.followUpAction
        });

      } catch (parseError) {
        debugLog('Failed to parse intent JSON', {
          error: String(parseError),
          rawResponse: response.data.substring(0, 200)
        });

        // Fallback intent for parsing errors
        intent = {
          command: 'unknown',
          confidence: 0.1,
          parameters: {
            language: 'en',
            needsMoreInfo: true
          },
          suggestedResponse: "I didn't quite understand that. Could you try rephrasing your request?",
          followUpAction: 'request_more_info'
        };
      }

      // Validate intent structure
      if (!intent.command || !intent.parameters || !intent.suggestedResponse) {
        debugLog('Invalid intent structure', { intent });
        throw new Error('Invalid intent structure returned from AI');
      }

      // Ensure confidence is within valid range
      intent.confidence = Math.max(0, Math.min(1, intent.confidence || 0));

      return intent;

    } catch (error) {
      debugLog('Error analyzing intent', { error: String(error) });

      // Return fallback intent
      return {
        command: 'unknown',
        confidence: 0.1,
        parameters: {
          language: 'en',
          needsMoreInfo: true
        },
        suggestedResponse: `I'm having trouble understanding your request. Please try again or say "help" to see what I can do.`,
        followUpAction: 'request_more_info'
      };
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isReady: boolean;
    geminiReady: boolean;
  } {
    return {
      isReady: geminiService.isReady(),
      geminiReady: geminiService.isReady()
    };
  }
}

// Export singleton instance
export default new VoiceIntentService();