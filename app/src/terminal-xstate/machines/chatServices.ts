/**
 * @fileoverview Chat Services for Terminal XState
 * @description Services for chat context loading, AI communication, and persistence
 */

import { ChatMessage } from './chatMachine';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[ChatServices] ${message}`, data || '');
  }
};

/**
 * Fetch full agent context for chat session
 */
export async function fetchChatContext(agentId: number) {
  debugLog('Fetching chat context', { agentId });

  try {
    // Import necessary services
    const { ContractReaderService } = await import('../services/contractReader');
    const contractReader = new ContractReaderService();

    // Create timeout promise (15 seconds for context loading)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Context loading timeout')), 15000);
    });

    // Fetch agent data with timeout
    const fetchDataPromise = async () => {
      const agentData = await contractReader.getAgentData(agentId);
      if (!agentData) {
        throw new Error('Agent not found');
      }

      debugLog('Agent data fetched', {
        name: agentData.agentName,
        intelligence: agentData.intelligenceLevel,
        dreamCount: agentData.dreamCount,
        conversationCount: agentData.conversationCount
      });

      // Fetch personality traits
      const personality = await contractReader.getPersonalityTraits(agentId);
      debugLog('Personality traits fetched', personality);

      // Fetch unique features
      const uniqueFeatures = await contractReader.getUniqueFeatures(agentId);
      debugLog('Unique features fetched', { count: uniqueFeatures.length });

      // Fetch memory data
      const agentMemory = await contractReader.getAgentMemory(agentId);
      debugLog('Agent memory fetched', {
        hasMemoryCore: !!agentMemory.memoryCoreHash,
        hasDailyDreams: !!agentMemory.currentDreamDailyHash,
        hasDailyConversations: !!agentMemory.currentConvDailyHash
      });

      return { agentData, personality, uniqueFeatures, agentMemory };
    };

    // Race between data fetch and timeout
    const result = await Promise.race([
      fetchDataPromise(),
      timeoutPromise
    ]) as any;

    // Build agent context
    const agentContext = {
      agentData: result.agentData,
      personality: result.personality,
      uniqueFeatures: result.uniqueFeatures,
      memory: result.agentMemory
    };

    // Fetch historical data (dreams and conversations)
    const historicalData = await fetchHistoricalData(result.agentMemory, agentId);

    return {
      agentContext,
      historicalData
    };
  } catch (error) {
    debugLog('Error fetching chat context', { error: String(error) });
    
    if (String(error).includes('timeout')) {
      throw new Error('Loading is taking longer than usual. Please wait...');
    } else if (String(error).includes('not found')) {
      throw new Error('Agent not found. Please select a valid agent.');
    } else {
      throw new Error('Failed to load agent context. Please try again.');
    }
  }
}

/**
 * Fetch historical data from storage
 */
async function fetchHistoricalData(agentMemory: any, agentId: number) {
  debugLog('Fetching historical data', { agentId });

  const historicalData: any = {
    dailyDreams: [],
    dailyConversations: [],
    monthlyDreams: [],
    monthlyConversations: [],
    yearlyCore: null
  };

  try {
    const { downloadFromStorage } = await import('../services/xstateStorage');

    // Download daily dreams if available
    if (agentMemory.currentDreamDailyHash && agentMemory.currentDreamDailyHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      try {
        const dreamsData = await downloadFromStorage(agentMemory.currentDreamDailyHash);
        if (dreamsData) {
          historicalData.dailyDreams = JSON.parse(dreamsData);
          debugLog('Daily dreams loaded', { count: historicalData.dailyDreams.length });
        }
      } catch (error) {
        debugLog('Failed to load daily dreams', { error: String(error) });
      }
    }

    // Download daily conversations if available
    if (agentMemory.currentConvDailyHash && agentMemory.currentConvDailyHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      try {
        const convsData = await downloadFromStorage(agentMemory.currentConvDailyHash);
        if (convsData) {
          historicalData.dailyConversations = JSON.parse(convsData);
          debugLog('Daily conversations loaded', { count: historicalData.dailyConversations.length });
        }
      } catch (error) {
        debugLog('Failed to load daily conversations', { error: String(error) });
      }
    }

    // Download memory core if available
    if (agentMemory.memoryCoreHash && agentMemory.memoryCoreHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      try {
        const coreData = await downloadFromStorage(agentMemory.memoryCoreHash);
        if (coreData) {
          historicalData.yearlyCore = JSON.parse(coreData);
          debugLog('Memory core loaded');
        }
      } catch (error) {
        debugLog('Failed to load memory core', { error: String(error) });
      }
    }

  } catch (error) {
    debugLog('Error loading historical data', { error: String(error) });
    // Continue without historical data
  }

  return historicalData;
}

/**
 * Send chat message to AI
 */
export async function sendChatMessage(
  message: string,
  messages: ChatMessage[],
  agentContext: any,
  historicalData: any,
  agentName: string
) {
  debugLog('Sending chat message to AI', {
    messageLength: message.length,
    previousMessages: messages.length,
    agentName
  });

  try {
    // Build chat prompt
    const { buildChatPrompt } = await import('../services/chatPromptBuilder');
    const isFirstMessage = messages.length === 1; // Just added user message
    
    const prompt = buildChatPrompt({
      userMessage: message,
      messages,
      agentContext,
      historicalData,
      agentName,
      isFirstMessage
    });

    debugLog('Chat prompt built', {
      promptLength: prompt.length,
      isFirstMessage
    });

    // Create timeout promise (30 seconds for AI response)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI response timeout after 30 seconds')), 30000);
    });

    // Send to AI with timeout
    const { sendToAI } = await import('../services/apiService');
    const aiResponse = await Promise.race([
      sendToAI(prompt, 'gemini-2.0-flash-exp'),
      timeoutPromise
    ]) as string;

    debugLog('AI response received', {
      responseLength: aiResponse.length
    });

    return {
      response: aiResponse || 'I apologize, but I was unable to generate a response. Please try again.',
      prompt // For debugging
    };
  } catch (error) {
    debugLog('Error sending chat message', { error: String(error) });
    
    // Provide user-friendly error messages
    if (String(error).includes('timeout')) {
      throw new Error('Response is taking longer than usual. Please try again.');
    } else if (String(error).includes('network')) {
      throw new Error('Connection lost. Please check your internet and try again.');
    } else if (String(error).includes('rate limit')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else {
      throw new Error('Failed to process message. Please try again.');
    }
  }
}

/**
 * Generate conversation summary
 */
export async function generateConversationSummary(
  transcript: string,
  messages: ChatMessage[],
  agentId: number
) {
  debugLog('Generating conversation summary', {
    transcriptLength: transcript.length,
    messageCount: messages.length
  });

  try {
    // Build summary prompt
    const { buildSummaryPrompt } = await import('../services/chatPromptBuilder');
    const prompt = buildSummaryPrompt(transcript, messages);

    debugLog('Summary prompt built', {
      promptLength: prompt.length
    });

    // Send to AI for summary generation
    const { sendToAI } = await import('../services/apiService');
    const aiResponse = await sendToAI(prompt, 'gemini-2.0-flash-exp');

    // Parse JSON response
    let summary;
    try {
      // Extract JSON from response (AI might include markdown blocks)
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        summary = JSON.parse(jsonStr);
      } else {
        summary = JSON.parse(aiResponse);
      }

      debugLog('Summary parsed successfully', {
        hasId: 'id' in summary,
        hasDate: 'date' in summary,
        hasTopic: 'topic' in summary
      });

    } catch (parseError) {
      debugLog('Failed to parse summary JSON', { error: String(parseError) });
      // Create a basic summary if parsing fails
      summary = createBasicSummary(transcript, messages);
    }

    return {
      summary,
      rawResponse: aiResponse
    };
  } catch (error) {
    debugLog('Error generating conversation summary', { error: String(error) });
    throw error;
  }
}

/**
 * Create basic summary if AI fails
 */
function createBasicSummary(transcript: string, messages: ChatMessage[]) {
  const now = new Date();
  const startTime = messages[0]?.timestamp || Date.now();
  const endTime = messages[messages.length - 1]?.timestamp || Date.now();
  const duration = Math.round((endTime - startTime) / 60000); // minutes

  return {
    id: Date.now(),
    date: now.toISOString().split('T')[0],
    timestamp: Math.floor(startTime / 1000),
    duration: duration || 1,
    topic: 'General conversation',
    type: 'general_chat',
    emotional_tone: ['neutral'],
    key_insights: ['Conversation with agent'],
    relationship_depth: 5,
    breakthrough: false,
    vulnerability_level: 5,
    references: {
      dreams: [],
      conversations: [],
      themes: []
    },
    summary: `Conversation with agent containing ${messages.length} messages.`,
    growth_markers: {
      self_awareness: 5,
      integration: 5,
      action_readiness: 5
    }
  };
}

/**
 * Persist chat conversation
 */
export async function persistChatConversation(
  agentId: number,
  agentName: string,
  conversationSummary: any,
  transcript: string
) {
  debugLog('Persisting chat conversation', {
    agentId,
    agentName,
    hasSummary: !!conversationSummary
  });

  try {
    // Manage conversation file
    const { ConversationFileManager } = await import('../services/conversationFileManager');
    const fileManager = new ConversationFileManager();
    
    const fileResult = await fileManager.manageConversationFile(
      agentId,
      agentName,
      conversationSummary
    );

    debugLog('Conversation file managed', {
      fileName: fileResult.fileName,
      isNewFile: fileResult.isNewFile,
      totalConversations: fileResult.totalConversations
    });

    // Upload to storage
    const { uploadToStorage } = await import('../services/xstateStorage');
    const uploadResult = await uploadToStorage(
      fileResult.fileContent,
      fileResult.fileName
    );

    debugLog('Conversation uploaded to storage', {
      rootHash: uploadResult.rootHash
    });

    // Update contract
    const { updateConversationContract } = await import('../services/conversationContractUpdater');
    const contractResult = await updateConversationContract(
      agentId,
      uploadResult.rootHash,
      conversationSummary.type
    );

    debugLog('Contract updated', {
      txHash: contractResult.txHash
    });

    return {
      rootHash: uploadResult.rootHash,
      txHash: contractResult.txHash,
      fileName: fileResult.fileName,
      conversationId: conversationSummary.id
    };
  } catch (error) {
    debugLog('Error persisting conversation', { error: String(error) });
    throw error;
  }
}