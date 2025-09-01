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
  })
};