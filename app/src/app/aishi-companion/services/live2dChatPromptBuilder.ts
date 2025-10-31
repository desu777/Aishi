/**
 * @fileoverview Live2D Chat Prompt Builder
 * @description Extends terminal chat prompts with Live2D body language control
 */

import { buildChatPrompt } from '@/terminal-xstate/services/chatPromptBuilder';
import type { ChatMessage } from '@/terminal-xstate/machines/chatMachine';
import { buildParameterSpec, CONTROLLABLE_PARAMETERS } from './aiParameterService';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_AISHI_COMPANION_DEBUG === 'true') {
    console.log(`[Live2DChatPromptBuilder] ${message}`, data || '');
  }
};

/**
 * Build Live2D-enhanced chat prompt
 * Wraps existing terminal chat prompt with parameter control specification
 */
export function buildLive2DChatPrompt(params: {
  userMessage: string;
  messages: ChatMessage[];
  agentContext: any;
  historicalData: any;
  agentName: string;
  isFirstMessage: boolean;
  currentParameters: Map<string, number>;
}): string {
  debugLog('Building Live2D-enhanced chat prompt', {
    isFirstMessage: params.isFirstMessage,
    messageCount: params.messages.length,
    parameterCount: params.currentParameters.size
  });

  // Build base chat prompt using existing terminal system
  const baseChatPrompt = buildChatPrompt({
    userMessage: params.userMessage,
    messages: params.messages,
    agentContext: params.agentContext,
    historicalData: params.historicalData,
    agentName: params.agentName,
    isFirstMessage: params.isFirstMessage
  });

  // Build Live2D parameter specification
  const parameterContext = buildLive2DParameterContext(params.currentParameters);

  // Find injection point (before "**Your Response:**" marker)
  const responseMarkerIndex = baseChatPrompt.lastIndexOf('**Your Response:**');

  if (responseMarkerIndex === -1) {
    // Fallback: append at end
    debugLog('Response marker not found, appending Live2D context at end');
    return baseChatPrompt + '\n\n' + parameterContext;
  }

  // Inject parameter context before response marker
  const beforeResponse = baseChatPrompt.substring(0, responseMarkerIndex);
  const afterResponse = baseChatPrompt.substring(responseMarkerIndex);

  const enhancedPrompt = beforeResponse + parameterContext + '\n\n' + afterResponse;

  debugLog('Live2D prompt built successfully', {
    originalLength: baseChatPrompt.length,
    enhancedLength: enhancedPrompt.length,
    addedLength: parameterContext.length
  });

  return enhancedPrompt;
}

/**
 * Build Live2D parameter control context for AI
 */
function buildLive2DParameterContext(currentValues: Map<string, number>): string {
  const paramSpec = buildParameterSpec(currentValues);

  const context = `## LIVE2D BODY LANGUAGE CONTROL

You control a Live2D avatar body. Express emotions through parameter values.

**Format:** Return JSON block at end of response:

\`\`\`json
{
  "parameters": {
    "ParamAngleX": 0,
    "ParamMouthForm": 0.8
  }
}
\`\`\`

**Available Parameters:**
${paramSpec}

**Usage Guidelines:**

Happy: MouthForm 0.6-0.8, HeadY 3-8, LeftBrowY 0.2-0.4, RightBrowY 0.2-0.4
Sad: MouthForm -0.4 to -0.7, HeadY -8 to -15, LeftBrowY -0.3 to -0.5, RightBrowY -0.3 to -0.5
Surprised: LeftEyeOpen 1.4-1.7, RightEyeOpen 1.4-1.7, LeftBrowY 0.7-0.9, RightBrowY 0.7-0.9, MouthOpen 0.5-1.0
Thinking: HeadX -10 to 10, HeadY 8-15, EyeGazeX ±0.3-0.6, EyeGazeY 0.2-0.5
Confident: HeadY 3-6, EyeGazeX 0, EyeGazeY 0, MouthForm 0.3-0.5
Shy: HeadY -5 to -10, EyeGazeX ±0.4-0.7, EyeGazeY -0.2 to -0.4, MouthForm 0.1-0.3

**Rules:**
1. Use subtle values (0.3-0.7 range, not extremes)
2. Only include parameters you want to change
3. Empty object if no body language needed: {"parameters":{}}
4. Match personality traits in movement intensity
`;

  return context;
}

/**
 * Build simplified parameter context for follow-up messages
 * (Shorter version to save tokens after first message)
 */
export function buildSimplifiedParameterContext(currentValues: Map<string, number>): string {
  const currentState = CONTROLLABLE_PARAMETERS
    .map(p => {
      const value = currentValues.get(p.id) ?? p.default;
      return `${p.name}:${value.toFixed(2)}`;
    })
    .join(', ');

  return `
## BODY STATE
Current: ${currentState}

Return JSON: \`\`\`json{"parameters":{"ParamName":value}}\`\`\`
`;
}
