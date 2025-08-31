/**
 * @fileoverview Conversation File Manager for Terminal XState
 * @description Manages conversation files with append-only pattern like dreams
 */

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[ConversationFileManager] ${message}`, data || '');
  }
};

export class ConversationFileManager {
  /**
   * Manage conversation file - download existing, append new, or create new
   */
  async manageConversationFile(
    agentId: number,
    agentName: string,
    newConversation: any
  ) {
    debugLog('Managing conversation file', {
      agentId,
      agentName,
      hasNewConversation: !!newConversation
    });

    try {
      // Get agent memory to check for existing file
      const { ContractReaderService } = await import('./contractReader');
      const contractReader = new ContractReaderService();
      const agentMemory = await contractReader.getAgentMemory(agentId);

      debugLog('Agent memory fetched', {
        hasExistingConversations: !!agentMemory.currentConvDailyHash && 
          agentMemory.currentConvDailyHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      });

      // Try to download and merge with existing file
      if (agentMemory.currentConvDailyHash && 
          agentMemory.currentConvDailyHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        try {
          return await this.mergeWithExistingFile(
            agentMemory.currentConvDailyHash,
            agentName,
            newConversation
          );
        } catch (error) {
          debugLog('Failed to merge with existing file, creating new', { error: String(error) });
          // Fall back to creating new file
          return await this.createNewFile(agentName, newConversation);
        }
      } else {
        // No existing file, create new
        debugLog('No existing conversations file, creating new');
        return await this.createNewFile(agentName, newConversation);
      }
    } catch (error) {
      debugLog('Error managing conversation file', { error: String(error) });
      throw error;
    }
  }

  /**
   * Merge with existing conversations file
   */
  private async mergeWithExistingFile(
    existingHash: string,
    agentName: string,
    newConversation: any
  ) {
    debugLog('Merging with existing file', { existingHash });

    // Download existing file
    const { downloadFromStorage } = await import('./xstateStorage');
    const existingData = await downloadFromStorage(existingHash);
    
    if (!existingData) {
      throw new Error('Failed to download existing conversations file');
    }

    // Parse existing conversations
    let existingConversations: any[] = [];
    try {
      existingConversations = JSON.parse(existingData);
      if (!Array.isArray(existingConversations)) {
        debugLog('Invalid existing data format, not an array');
        existingConversations = [];
      }
    } catch (error) {
      debugLog('Failed to parse existing conversations', { error: String(error) });
      existingConversations = [];
    }

    debugLog('Existing conversations loaded', { count: existingConversations.length });

    // Generate next ID
    const nextId = this.getNextConversationId(existingConversations);
    newConversation.id = nextId;

    // Append new conversation at the beginning (newest first)
    const updatedConversations = [newConversation, ...existingConversations];

    debugLog('Conversations merged', {
      previousCount: existingConversations.length,
      newCount: updatedConversations.length
    });

    // Create file content
    const fileContent = JSON.stringify(updatedConversations, null, 2);
    const fileName = this.generateFileName(agentName);

    return {
      fileName,
      fileContent,
      isNewFile: false,
      totalConversations: updatedConversations.length,
      conversationId: nextId
    };
  }

  /**
   * Create new conversations file
   */
  private async createNewFile(agentName: string, newConversation: any) {
    debugLog('Creating new conversations file');

    // Set ID for first conversation
    newConversation.id = 1;

    // Create array with single conversation
    const conversations = [newConversation];
    const fileContent = JSON.stringify(conversations, null, 2);
    const fileName = this.generateFileName(agentName);

    debugLog('New file created', {
      fileName,
      conversationId: 1
    });

    return {
      fileName,
      fileContent,
      isNewFile: true,
      totalConversations: 1,
      conversationId: 1
    };
  }

  /**
   * Generate file name with timestamp
   */
  private generateFileName(agentName: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const cleanName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${cleanName}_${timestamp}_daily_conversations.json`;
  }

  /**
   * Get next conversation ID
   */
  private getNextConversationId(conversations: any[]): number {
    if (!conversations || conversations.length === 0) {
      return 1;
    }

    // Find highest ID and increment
    const maxId = Math.max(...conversations.map(c => c.id || 0));
    return maxId + 1;
  }
}

/**
 * Export singleton instance
 */
export const conversationFileManager = new ConversationFileManager();