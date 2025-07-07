/**
 * Service functions for Agent Chat functionality
 * Contains business logic for context building, AI interaction, storage, and blockchain operations
 */

import { useStorageDownload } from '../../storage/useStorageDownload';
import { uploadFileComplete } from '../../../lib/0g/uploader';
import { getProvider, getSigner } from '../../../lib/0g/fees';
import { 
  AgentInfo, 
  ConversationResult, 
  ContextType 
} from '../types/agentChatTypes';
import { STORAGE_CONFIG, COMPUTE_CONFIG } from '../config/agentChatConfig';

/**
 * Step 1: Build chat context from agent personality + history
 * Pobiera dane agenta, historię konwersacji i snów aby stworzyć kontekst dla AI
 */
export const buildChatContext = async (
  agentInfo: AgentInfo | undefined,
  conversationHashes: string[] | undefined,
  dreamHashes: string[] | undefined,
  downloadFile: (hash: string) => Promise<{ success: boolean; data?: ArrayBuffer; error?: string }>,
  debugLog: (message: string, data?: any) => void
): Promise<string> => {
  try {
    debugLog('Building chat context', { 
      hasAgentInfo: !!agentInfo,
      conversationCount: conversationHashes?.length || 0,
      dreamCount: dreamHashes?.length || 0
    });

    let context = `You are an AI dream agent having a conversation with your owner.\n\n`;
    
    if (agentInfo) {
      // KLUCZOWE: Pobieramy nazwę agenta i personality traits z kontraktu
      context += `Your Identity:\n`;
      context += `- Your Name: ${agentInfo.agentName}\n`;
      context += `- Intelligence Level: ${agentInfo.intelligenceLevel}\n`;
      context += `- Total Dreams Processed: ${agentInfo.dreamCount}\n`;
      context += `- Total Conversations: ${agentInfo.conversationCount}\n`;
      
      if (agentInfo.personality) {
        context += `\nYour Personality (speak in this tone):\n`;
        context += `- Creativity: ${agentInfo.personality.creativity}/100 ${agentInfo.personality.creativity > 70 ? '(very creative, imaginative)' : agentInfo.personality.creativity > 40 ? '(moderately creative)' : '(practical, structured)'}\n`;
        context += `- Analytical: ${agentInfo.personality.analytical}/100 ${agentInfo.personality.analytical > 70 ? '(logical, detail-oriented)' : agentInfo.personality.analytical > 40 ? '(balanced reasoning)' : '(intuitive, feeling-based)'}\n`;
        context += `- Empathy: ${agentInfo.personality.empathy}/100 ${agentInfo.personality.empathy > 70 ? '(very understanding, compassionate)' : agentInfo.personality.empathy > 40 ? '(caring, supportive)' : '(direct, matter-of-fact)'}\n`;
        context += `- Intuition: ${agentInfo.personality.intuition}/100 ${agentInfo.personality.intuition > 70 ? '(insightful, perceptive)' : agentInfo.personality.intuition > 40 ? '(balanced intuition)' : '(fact-based, methodical)'}\n`;
        context += `- Resilience: ${agentInfo.personality.resilience}/100 ${agentInfo.personality.resilience > 70 ? '(optimistic, encouraging)' : agentInfo.personality.resilience > 40 ? '(balanced outlook)' : '(realistic, cautious)'}\n`;
        context += `- Curiosity: ${agentInfo.personality.curiosity}/100 ${agentInfo.personality.curiosity > 70 ? '(very inquisitive, exploratory)' : agentInfo.personality.curiosity > 40 ? '(interested, engaging)' : '(focused, goal-oriented)'}\n`;
        context += `- Current Mood: ${agentInfo.personality.dominantMood}\n`;
        
        context += `\nSpeak as ${agentInfo.agentName} with these personality traits. Be authentic to your character.\n`;
      }
    }

    // Add conversation history context if available (pobieraj 2 ostatnie)
    if (conversationHashes && conversationHashes.length > 0) {
      context += `\nRecent Conversations:\n`;
      
      // Pobierz ostatnie 2 konwersacje (nie wszystkie 5, żeby nie przeciążyć)
      const recentConversations = conversationHashes.slice(-2);
      
      for (const hash of recentConversations) {
        try {
          const result = await downloadFile(hash);
          
          if (result.success && result.data) {
            const jsonString = new TextDecoder().decode(result.data);
            const conversationData = JSON.parse(jsonString);
            
            context += `- User: "${conversationData.userMessage}"\n`;
            context += `  Agent: "${conversationData.aiResponse}"\n`;
          } else {
            debugLog('Failed to download conversation', { hash, error: result.error });
          }
        } catch (error) {
          debugLog('Error downloading conversation', { hash, error });
        }
      }
    }

    // Add dream history context if available (pobieraj treści snów)
    if (dreamHashes && dreamHashes.length > 0) {
      context += `\nRecent Dreams:\n`;
      
      for (const hash of dreamHashes) {
        try {
          const result = await downloadFile(hash);
          
          if (result.success && result.data) {
            const jsonString = new TextDecoder().decode(result.data);
            const dreamData = JSON.parse(jsonString);
            
            // Dodaj skrócone informacje o śnie
            const dreamText = typeof dreamData.dreamText === 'string' ? dreamData.dreamText : JSON.stringify(dreamData.dreamText || '');
            const analysis = typeof dreamData.analysis === 'string' ? dreamData.analysis : JSON.stringify(dreamData.analysis || '');
            
            context += `- Dream: "${dreamText.substring(0, 100)}..."\n`;
            context += `  Analysis: "${analysis.substring(0, 150)}..."\n`;
          } else {
            debugLog('Failed to download dream', { hash, error: result.error });
          }
        } catch (error) {
          debugLog('Error downloading dream', { hash, error });
        }
      }
    }

    if (!conversationHashes?.length && !dreamHashes?.length) {
      context += `\nThis is your first conversation with your owner. Introduce yourself!\n`;
    }

    debugLog('Chat context built', { 
      contextLength: context.length,
      hasPersonality: !!agentInfo?.personality,
      agentName: agentInfo?.agentName
    });
    return context;
  } catch (error) {
    debugLog('Error building chat context', { error });
    return 'You are an AI dream agent having a conversation. Unable to load previous context.\n';
  }
};

/**
 * Step 2: AI Chat Response
 * Wysyła prompt do AI compute service i otrzymuje odpowiedź
 */
export const chatWithAI = async (
  userMessage: string,
  context: string,
  walletAddress: string,
  debugLog: (message: string, data?: any) => void
): Promise<string> => {
  try {
    const prompt = `${context}\n\nUser says: "${userMessage}"\n\nPlease respond as the agent with your personality. Keep it conversational and authentic.`;

    debugLog('Sending message to AI', { 
      promptLength: prompt.length,
      messageLength: userMessage.length 
    });

    const response = await fetch(`${COMPUTE_CONFIG.backendUrl}/analyze-dream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        query: prompt,
        model: 'llama-3.3-70b-instruct'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI chat failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`AI chat failed: ${result.error}`);
    }

    const aiResponse = result.data.response;
    
    debugLog('AI chat response received', {
      responseLength: aiResponse.length
    });

    return aiResponse;
  } catch (error) {
    debugLog('AI chat error', { error });
    throw error;
  }
};

/**
 * Step 3: Save conversation to 0G Storage
 * Zapisuje konwersację do 0G Storage i zwraca root hash
 */
export const saveChatToStorage = async (
  conversationData: ConversationResult,
  userTokenId: bigint | undefined,
  walletAddress: string,
  debugLog: (message: string, data?: any) => void
): Promise<string> => {
  try {
    debugLog('Saving conversation to 0G Storage');

    // Create conversation data object
    const chatData = {
      timestamp: conversationData.timestamp,
      agentTokenId: userTokenId?.toString(),
      walletAddress,
      userMessage: conversationData.userMessage,
      aiResponse: conversationData.aiResponse,
      contextType: conversationData.contextType,
      version: '1.0'
    };

    // Convert to JSON and create file
    const jsonString = JSON.stringify(chatData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], `conversation-${Date.now()}.json`, { type: 'application/json' });

    debugLog('Uploading conversation to 0G Storage', {
      storageRpc: STORAGE_CONFIG.storageRpc,
      l1Rpc: STORAGE_CONFIG.l1Rpc,
      fileSize: jsonString.length
    });

    // Get provider and signer
    const [provider, providerErr] = await getProvider();
    if (!provider || providerErr) {
      throw new Error(`Provider error: ${providerErr?.message}`);
    }

    const [signer, signerErr] = await getSigner(provider);
    if (!signer || signerErr) {
      throw new Error(`Signer error: ${signerErr?.message}`);
    }

    // Upload to 0G Storage
    const uploadResult = await uploadFileComplete(
      file,
      STORAGE_CONFIG.storageRpc,
      STORAGE_CONFIG.l1Rpc,
      signer
    );

    if (!uploadResult.success) {
      throw new Error(`Storage upload failed: ${uploadResult.error}`);
    }

    const rootHash = uploadResult.rootHash!;
    
    debugLog('Conversation saved to storage', { 
      rootHash,
      dataSize: jsonString.length 
    });

    return rootHash;
  } catch (error) {
    debugLog('Storage save error', { error });
    throw error;
  }
}; 