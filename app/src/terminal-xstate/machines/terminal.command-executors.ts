/**
 * @fileoverview Terminal Command Executors
 * @description XState v5 actors for executing terminal commands asynchronously
 */

import { fromPromise } from 'xstate';
import { ContractReaderService } from '../services/contractReader';
import type { TerminalLine } from './types';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
    console.log(`[Terminal] ${message}`, data || '');
  }
};

/**
 * Command executor actors using fromPromise pattern (XState v5 best practice)
 * These replace setTimeout patterns with proper actor-based async handling
 */
export const commandExecutors = {
  /**
   * Execute personality command
   */
  personalityExecutor: fromPromise(async ({ input }: { 
    input: { 
      tokenId: number; 
      agentName: string;
    } 
  }) => {
    debugLog('Processing personality command', input);
    
    try {
      // Import formatter dynamically
      const { formatPersonalityOutput } = await import('../services/formatHelpers');
      
      // Fetch agent data
      const contractReader = new ContractReaderService();
      const agentData = await contractReader.getCompleteAgentData(input.tokenId);
      
      debugLog('Agent data fetched', {
        hasData: !!agentData,
        agentName: agentData?.basic?.agentName
      });
      
      // Format and return lines
      const formattedLines = formatPersonalityOutput(agentData);
      
      debugLog('Formatted lines', {
        count: formattedLines.length
      });
      
      return {
        success: true,
        lines: formattedLines
      };
    } catch (error) {
      debugLog('Error fetching personality', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }),

  /**
   * Execute unique features command
   */
  uniqueFeaturesExecutor: fromPromise(async ({ input }: { 
    input: { 
      tokenId: number; 
      agentName: string;
    } 
  }) => {
    debugLog('Processing unique-features command', input);
    
    try {
      // Import formatter dynamically
      const { formatUniqueFeaturesOutput } = await import('../services/formatHelpers');
      
      // Fetch agent data
      const contractReader = new ContractReaderService();
      const agentData = await contractReader.getCompleteAgentData(input.tokenId);
      
      debugLog('Agent data fetched', {
        hasData: !!agentData,
        features: agentData?.features?.length || 0
      });
      
      // Format and return lines
      const formattedLines = formatUniqueFeaturesOutput(agentData);
      
      debugLog('Formatted lines', {
        count: formattedLines.length
      });
      
      return {
        success: true,
        lines: formattedLines
      };
    } catch (error) {
      debugLog('Error fetching unique features', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }),

  /**
   * Execute stats command
   */
  statsExecutor: fromPromise(async ({ input }: { 
    input: { 
      tokenId: number; 
      agentName: string;
    } 
  }) => {
    debugLog('Processing stats command', input);
    
    try {
      // Import formatter dynamically
      const { formatStatsOutput } = await import('../services/formatHelpers');
      
      // Fetch agent data
      const contractReader = new ContractReaderService();
      const agentData = await contractReader.getCompleteAgentData(input.tokenId);
      
      debugLog('Agent data fetched', {
        hasData: !!agentData,
        stats: agentData?.basic
      });
      
      // Format and return lines
      const formattedLines = formatStatsOutput(agentData);
      
      debugLog('Formatted lines', {
        count: formattedLines.length
      });
      
      return {
        success: true,
        lines: formattedLines
      };
    } catch (error) {
      debugLog('Error fetching stats', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }),

  /**
   * Execute memory command
   */
  memoryExecutor: fromPromise(async ({ input }: { 
    input: { 
      tokenId: number; 
      agentName: string;
    } 
  }) => {
    debugLog('Processing memory command', input);
    
    try {
      // Import formatter dynamically
      const { formatMemoryOutput } = await import('../services/formatHelpers');
      
      // Fetch agent data
      const contractReader = new ContractReaderService();
      const agentData = await contractReader.getCompleteAgentData(input.tokenId);
      
      debugLog('Agent memory data fetched', {
        hasData: !!agentData,
        memory: agentData?.memory
      });
      
      // Format and return lines
      const formattedLines = formatMemoryOutput(agentData);
      
      debugLog('Formatted memory lines', {
        count: formattedLines.length
      });
      
      return {
        success: true,
        lines: formattedLines
      };
    } catch (error) {
      debugLog('Error fetching memory', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }),

  /**
   * Execute help command
   */
  helpExecutor: fromPromise(async ({ input }: {
    input: {
      args: string[];
    }
  }) => {
    debugLog('Processing help command', { args: input.args });

    try {
      const {
        getInteractiveHelp,
        getDetailedCommandHelp,
        COMMAND_TOOLTIPS
      } = await import('../services/commandParser');

      const timestamp = Date.now();
      const lines: TerminalLine[] = [];
      const helpArg = input.args[0];

      if (helpArg) {
        // Detailed help for specific command
        const detailedHelp = getDetailedCommandHelp(helpArg);
        detailedHelp.forEach((line, index) => {
          lines.push({
            type: 'help-command',
            content: line,
            timestamp: timestamp + index
          });
        });
      } else {
        // Interactive help
        const interactiveHelp = getInteractiveHelp();

        interactiveHelp.forEach((line, index) => {
          const hasInfoIcon = line.includes('ⓘ');
          let lineType: TerminalLine['type'] = 'help-command';
          let command: string | undefined = undefined;
          let tooltip: string | undefined = undefined;

          if (hasInfoIcon) {
            lineType = 'help-interactive';
            const match = line.match(/^\s*(\w+)/);
            if (match) {
              command = match[1];
              tooltip = COMMAND_TOOLTIPS[command];
            }
          }

          lines.push({
            type: lineType,
            content: line,
            timestamp: timestamp + index,
            command,
            hasTooltip: hasInfoIcon,
            tooltip
          });
        });
      }

      return {
        success: true,
        lines
      };
    } catch (error) {
      debugLog('Error processing help', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }),

  /**
   * Execute month-learn command - Monthly memory consolidation
   * Self-contained implementation (does not import external hooks)
   */
  monthLearnExecutor: fromPromise(async ({ input }: {
    input: {
      tokenId: number;
      agentName: string;
      walletAddress: string;
      modelId?: string;
    }
  }) => {
    debugLog('Processing month-learn command', input);

    try {
      const lines: TerminalLine[] = [];
      let timestamp = Date.now();

      // Validate wallet address
      if (!input.walletAddress) {
        throw new Error('Wallet address not available. Please ensure agent is synced.');
      }

      // Step 1: Initialize services
      const { XStateStorageService } = await import('../services/xstateStorage');
      const storage = new XStateStorageService();

      // Step 2: Get agent memory hashes from contract
      const contractReader = new ContractReaderService();
      const agentData = await contractReader.getCompleteAgentData(input.tokenId);

      if (!agentData || !agentData.memory) {
        throw new Error('Unable to fetch agent memory data from contract');
      }

      const { currentDreamDailyHash, currentConvDailyHash, lastDreamMonthlyHash, lastConvMonthlyHash } = agentData.memory;
      const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      // Progress line - initiation
      lines.push({
        type: 'info',
        content: `>> ${input.agentName} initiating monthly memory consolidation...`,
        timestamp: timestamp++
      });

      // Step 3: Download daily data from 0G Storage
      let dailyDreams: any[] = [];
      let dailyConversations: any[] = [];

      if (currentDreamDailyHash && currentDreamDailyHash !== emptyHash) {
        lines.push({
          type: 'system',
          content: '>> Loading daily dreams from 0G Storage...',
          timestamp: timestamp++
        });

        const dreamResult = await storage.downloadJson(currentDreamDailyHash);
        if (dreamResult.success && dreamResult.data) {
          dailyDreams = Array.isArray(dreamResult.data) ? dreamResult.data : [dreamResult.data];
          debugLog('Daily dreams loaded', { count: dailyDreams.length });
        }
      }

      if (currentConvDailyHash && currentConvDailyHash !== emptyHash) {
        lines.push({
          type: 'system',
          content: '>> Loading daily conversations from 0G Storage...',
          timestamp: timestamp++
        });

        const convResult = await storage.downloadJson(currentConvDailyHash);
        if (convResult.success && convResult.data) {
          dailyConversations = Array.isArray(convResult.data) ? convResult.data : [convResult.data];
          debugLog('Daily conversations loaded', { count: dailyConversations.length });
        }
      }

      lines.push({
        type: 'success',
        content: `Loaded ${dailyDreams.length} dreams and ${dailyConversations.length} conversations`,
        timestamp: timestamp++
      });

      if (dailyDreams.length === 0 && dailyConversations.length === 0) {
        throw new Error('No daily data available for consolidation');
      }

      // Step 4: Generate AI consolidation
      lines.push({
        type: 'system',
        content: `>> ${input.agentName} analyzing subconscious patterns with AI...`,
        timestamp: timestamp++
      });

      const { buildMonthLearnConsolidationPrompt } = await import('../../prompts/monthLearnConsolidationPrompt');
      const { parseMonthLearnResponse } = await import('../../prompts/monthLearnResponseParser');

      // Use test mode dates or current date based on environment
      let currentYear: number;
      let currentMonth: number;

      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        currentYear = 2024;
        currentMonth = 1; // January 2024 for testing
        debugLog('Using test mode dates', { year: currentYear, month: currentMonth });
      } else {
        const now = new Date();
        currentYear = now.getFullYear();
        currentMonth = now.getMonth() + 1;
        debugLog('Using current dates', { year: currentYear, month: currentMonth });
      }

      const promptData = {
        dreams: dailyDreams,
        conversations: dailyConversations,
        month: currentMonth,
        year: currentYear,
        agentPersonality: agentData.personality
      };

      const prompt = buildMonthLearnConsolidationPrompt(promptData);

      debugLog('Sending to AI', {
        promptLength: prompt.length,
        modelId: input.modelId,
        walletAddress: input.walletAddress
      });

      // Call AI API with selected model
      const apiUrl = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/0g-compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: input.walletAddress,
          query: prompt,
          modelId: input.modelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResult = await response.json();
      if (!apiResult.success) {
        throw new Error(apiResult.error || 'AI consolidation failed');
      }

      const aiResponse = apiResult.data.response;
      debugLog('AI response received', { responseLength: aiResponse.length });

      const parseResult = parseMonthLearnResponse(aiResponse);

      if (!parseResult.success) {
        throw new Error(`Failed to parse AI response: ${parseResult.error}`);
      }

      lines.push({
        type: 'success',
        content: 'AI consolidation completed',
        timestamp: timestamp++
      });

      // Step 5: Save to storage using APPEND pattern
      lines.push({
        type: 'system',
        content: '>> Encoding neural patterns to 0G Storage...',
        timestamp: timestamp++
      });

      let dreamStorageHash: string | null = null;
      let conversationStorageHash: string | null = null;

      // Save dreams consolidation (APPEND pattern)
      if (parseResult.dreamConsolidation) {
        let existingDreamConsolidations: any[] = [];

        if (lastDreamMonthlyHash && lastDreamMonthlyHash !== emptyHash) {
          const downloadResult = await storage.downloadJson(lastDreamMonthlyHash);
          if (downloadResult.success && downloadResult.data) {
            existingDreamConsolidations = Array.isArray(downloadResult.data) ? downloadResult.data : [downloadResult.data];
            debugLog('Existing dream consolidations loaded', { count: existingDreamConsolidations.length });
          }
        }

        // Append new consolidation to beginning (newest first)
        existingDreamConsolidations.unshift(parseResult.dreamConsolidation);

        const dreamFile = storage.jsonToFile(
          existingDreamConsolidations,
          `dream_essence_monthly_${currentYear}-${String(currentMonth).padStart(2, '0')}.json`
        );
        const dreamUpload = await storage.uploadBlob(dreamFile);

        if (!dreamUpload.success) {
          throw new Error(`Dream consolidation upload failed: ${dreamUpload.error}`);
        }
        dreamStorageHash = dreamUpload.rootHash!;
        debugLog('Dream consolidation uploaded', { hash: dreamStorageHash });
      }

      // Save conversations consolidation (APPEND pattern)
      if (parseResult.conversationConsolidation) {
        let existingConvConsolidations: any[] = [];

        if (lastConvMonthlyHash && lastConvMonthlyHash !== emptyHash) {
          const downloadResult = await storage.downloadJson(lastConvMonthlyHash);
          if (downloadResult.success && downloadResult.data) {
            existingConvConsolidations = Array.isArray(downloadResult.data) ? downloadResult.data : [downloadResult.data];
            debugLog('Existing conversation consolidations loaded', { count: existingConvConsolidations.length });
          }
        }

        // Append new consolidation to beginning (newest first)
        existingConvConsolidations.unshift(parseResult.conversationConsolidation);

        const convFile = storage.jsonToFile(
          existingConvConsolidations,
          `conversation_essence_monthly_${currentYear}-${String(currentMonth).padStart(2, '0')}.json`
        );
        const convUpload = await storage.uploadBlob(convFile);

        if (!convUpload.success) {
          throw new Error(`Conversation consolidation upload failed: ${convUpload.error}`);
        }
        conversationStorageHash = convUpload.rootHash!;
        debugLog('Conversation consolidation uploaded', { hash: conversationStorageHash });
      }

      lines.push({
        type: 'success',
        content: 'Storage upload completed',
        timestamp: timestamp++
      });

      // Step 6: Update blockchain contract
      lines.push({
        type: 'system',
        content: '>> Upgrading consciousness parameters on blockchain...',
        timestamp: timestamp++
      });

      const { getViemSigner } = await import('../../lib/0g/fees');
      const { getContractConfig } = await import('../services/contractService');
      const { getActiveChain } = await import('../../config/chains');

      const [walletClient, walletErr] = await getViemSigner();
      if (!walletClient || walletErr) {
        throw new Error(`WalletClient error: ${walletErr?.message || 'Failed to get wallet client'}`);
      }

      const [account] = await walletClient.getAddresses();
      if (!account) {
        throw new Error('No account available from wallet client');
      }

      const contractConfig = getContractConfig();

      const txHash = await walletClient.writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'consolidateMonth',
        chain: getActiveChain(),
        account,
        args: [
          BigInt(input.tokenId),
          (dreamStorageHash || emptyHash) as `0x${string}`,
          (conversationStorageHash || emptyHash) as `0x${string}`,
          currentMonth,
          currentYear
        ]
      });

      debugLog('ConsolidateMonth transaction sent', { txHash });

      lines.push({
        type: 'success',
        content: `✓ Month-learn consolidation completed successfully!`,
        timestamp: timestamp++
      });

      lines.push({
        type: 'info',
        content: `TX: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
        timestamp: timestamp++
      });

      lines.push({
        type: 'system',
        content: `Daily memory hashes cleared. Monthly essence preserved.`,
        timestamp: timestamp++
      });

      return {
        success: true,
        lines
      };
    } catch (error) {
      debugLog('Error in month-learn executor', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }),

  /**
   * Execute memory-core command - Yearly memory core consolidation
   * Self-contained implementation (does not import external hooks)
   */
  memoryCoreExecutor: fromPromise(async ({ input }: {
    input: {
      tokenId: number;
      agentName: string;
      walletAddress: string;
      modelId?: string;
    }
  }) => {
    debugLog('Processing memory-core command', input);

    try {
      const lines: TerminalLine[] = [];
      let timestamp = Date.now();

      // Validate wallet address
      if (!input.walletAddress) {
        throw new Error('Wallet address not available. Please ensure agent is synced.');
      }

      // Step 1: Initialize services
      const { XStateStorageService } = await import('../services/xstateStorage');
      const storage = new XStateStorageService();

      // Step 2: Get agent memory hashes from contract
      const contractReader = new ContractReaderService();
      const agentData = await contractReader.getCompleteAgentData(input.tokenId);

      if (!agentData || !agentData.memory) {
        throw new Error('Unable to fetch agent memory data from contract');
      }

      const { lastDreamMonthlyHash, lastConvMonthlyHash, memoryCoreHash } = agentData.memory;
      const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      // Progress line - initiation
      lines.push({
        type: 'info',
        content: `>> ${input.agentName} initiating annual consciousness synthesis...`,
        timestamp: timestamp++
      });

      // Step 3: Download monthly consolidations from 0G Storage
      let dreamConsolidations: any[] = [];
      let conversationConsolidations: any[] = [];

      if (lastDreamMonthlyHash && lastDreamMonthlyHash !== emptyHash) {
        lines.push({
          type: 'system',
          content: '>> Loading monthly dream consolidations from 0G Storage...',
          timestamp: timestamp++
        });

        const dreamResult = await storage.downloadJson(lastDreamMonthlyHash);
        if (dreamResult.success && dreamResult.data) {
          dreamConsolidations = Array.isArray(dreamResult.data) ? dreamResult.data : [dreamResult.data];
          debugLog('Dream consolidations loaded', { count: dreamConsolidations.length });
        }
      }

      if (lastConvMonthlyHash && lastConvMonthlyHash !== emptyHash) {
        lines.push({
          type: 'system',
          content: '>> Loading monthly conversation consolidations from 0G Storage...',
          timestamp: timestamp++
        });

        const convResult = await storage.downloadJson(lastConvMonthlyHash);
        if (convResult.success && convResult.data) {
          conversationConsolidations = Array.isArray(convResult.data) ? convResult.data : [convResult.data];
          debugLog('Conversation consolidations loaded', { count: conversationConsolidations.length });
        }
      }

      lines.push({
        type: 'success',
        content: `Loaded ${dreamConsolidations.length} dream + ${conversationConsolidations.length} conversation consolidations`,
        timestamp: timestamp++
      });

      if (dreamConsolidations.length === 0 && conversationConsolidations.length === 0) {
        throw new Error('No monthly consolidation data available for memory core creation');
      }

      // Step 4: Generate AI memory core
      lines.push({
        type: 'system',
        content: `>> ${input.agentName} evolving consciousness matrix with AI...`,
        timestamp: timestamp++
      });

      const { buildYearLearnConsolidationPrompt } = await import('../../prompts/yearLearnConsolidationPrompt');
      const { parseYearLearnResponse, validateMemoryCoreQuality } = await import('../../prompts/yearLearnResponseParser');

      // Use test mode dates or current date
      let currentYear: number;

      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        currentYear = 2024; // Test mode
        debugLog('Using test mode year', { year: currentYear });
      } else {
        const now = new Date();
        currentYear = now.getFullYear();
        debugLog('Using current year', { year: currentYear });
      }

      const promptData = {
        dreamConsolidations,
        conversationConsolidations,
        year: currentYear,
        agentPersonality: agentData.personality
      };

      const prompt = buildYearLearnConsolidationPrompt(promptData);

      debugLog('Sending to AI for memory core generation', {
        promptLength: prompt.length,
        modelId: input.modelId,
        walletAddress: input.walletAddress
      });

      // Call AI API with selected model
      const apiUrl = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/0g-compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: input.walletAddress,
          query: prompt,
          modelId: input.modelId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResult = await response.json();
      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Memory core generation failed');
      }

      const aiResponse = apiResult.data.response;
      debugLog('AI response received', { responseLength: aiResponse.length });

      const parseResult = parseYearLearnResponse(aiResponse);

      if (!parseResult.success || !parseResult.memoryCore) {
        throw new Error(`Failed to parse memory core: ${parseResult.error}`);
      }

      // Validate memory core quality
      const qualityCheck = validateMemoryCoreQuality(parseResult.memoryCore);
      if (!qualityCheck.isValid) {
        throw new Error(`Memory core quality insufficient: ${qualityCheck.warnings.join(', ')}`);
      }

      lines.push({
        type: 'success',
        content: 'Memory core consciousness matrix generated',
        timestamp: timestamp++
      });

      // Step 5: Save memory core to storage (APPEND pattern)
      lines.push({
        type: 'system',
        content: '>> Crystallizing soul essence to 0G Storage...',
        timestamp: timestamp++
      });

      let existingMemoryCores: any[] = [];

      if (memoryCoreHash && memoryCoreHash !== emptyHash) {
        const downloadResult = await storage.downloadJson(memoryCoreHash);
        if (downloadResult.success && downloadResult.data) {
          existingMemoryCores = Array.isArray(downloadResult.data) ? downloadResult.data : [downloadResult.data];
          debugLog('Existing memory cores loaded', { count: existingMemoryCores.length });
        }
      }

      // Append new memory core to beginning (newest first)
      existingMemoryCores.unshift(parseResult.memoryCore);

      const memoryCoreFile = storage.jsonToFile(existingMemoryCores, `memory_core_${currentYear}.json`);
      const memoryCoreUpload = await storage.uploadBlob(memoryCoreFile);

      if (!memoryCoreUpload.success) {
        throw new Error(`Memory core upload failed: ${memoryCoreUpload.error}`);
      }

      const memoryCoreStorageHash = memoryCoreUpload.rootHash!;
      debugLog('Memory core uploaded', { hash: memoryCoreStorageHash });

      lines.push({
        type: 'success',
        content: 'Memory core stored in 0G Network',
        timestamp: timestamp++
      });

      // Step 6: Update contract with memory core hash
      lines.push({
        type: 'system',
        content: '>> Embedding neural pathways (updateMemoryCore)...',
        timestamp: timestamp++
      });

      const { getViemSigner } = await import('../../lib/0g/fees');
      const { getContractConfig } = await import('../services/contractService');
      const { getActiveChain } = await import('../../config/chains');

      const [walletClient, walletErr] = await getViemSigner();
      if (!walletClient || walletErr) {
        throw new Error(`WalletClient error: ${walletErr?.message || 'Failed to get wallet client'}`);
      }

      const [account] = await walletClient.getAddresses();
      if (!account) {
        throw new Error('No account available from wallet client');
      }

      const contractConfig = getContractConfig();

      const txHash = await walletClient.writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'updateMemoryCore',
        chain: getActiveChain(),
        account,
        args: [BigInt(input.tokenId), memoryCoreStorageHash as `0x${string}`]
      });

      debugLog('UpdateMemoryCore transaction sent', { txHash });

      // Check if yearly reflection bonus was applied
      const bonusMessage = agentData.pendingRewards?.yearlyReflection
        ? ' (+5 INT yearly reflection bonus applied!)'
        : '';

      lines.push({
        type: 'success',
        content: `✓ Memory core consciousness crystallized!${bonusMessage}`,
        timestamp: timestamp++
      });

      lines.push({
        type: 'info',
        content: `TX: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
        timestamp: timestamp++
      });

      lines.push({
        type: 'system',
        content: `Monthly hashes cleared. Yearly wisdom preserved.`,
        timestamp: timestamp++
      });

      return {
        success: true,
        lines
      };
    } catch (error) {
      debugLog('Error in memory-core executor', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  })
};