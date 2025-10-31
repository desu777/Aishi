/**
 * @fileoverview AI Parameter Service for Live2D Body Language Control
 * @description Defines controllable parameters, parses AI responses, validates ranges
 */

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_AISHI_COMPANION_DEBUG === 'true') {
    console.log(`[AIParameterService] ${message}`, data || '');
  }
};

/**
 * Live2D Parameter Definition
 */
export interface Live2DParameter {
  id: string;           // Internal Live2D parameter ID
  name: string;         // AI-friendly name (used in prompts)
  min: number;
  max: number;
  default: number;
  description: string;  // For AI understanding
}

/**
 * Parsed AI Response
 */
export interface ParsedAIResponse {
  text: string;                           // Clean text without JSON blocks
  parameters: Record<string, number>;     // Parameter updates from AI
  expressions: string[];                  // Expression triggers from AI
  rawResponse: string;                    // Original AI response
  hasParameters: boolean;
  hasExpressions: boolean;
}

/**
 * Parameter Update for Animation
 */
export interface ParameterUpdate {
  paramId: string;      // Live2D internal ID
  name: string;         // AI name
  currentValue: number;
  targetValue: number;
  isValid: boolean;
  error?: string;
}

/**
 * AI-Controllable Parameters (15 total)
 * Ordered by importance for natural body language
 */
export const CONTROLLABLE_PARAMETERS: Live2DParameter[] = [
  // HEAD MOVEMENT
  {
    id: 'ParamAngleX',
    name: 'HeadX',
    min: -30,
    max: 30,
    default: 0,
    description: 'Head horizontal rotation: -30=full left, +30=full right, 0=center'
  },
  {
    id: 'ParamAngleY',
    name: 'HeadY',
    min: -30,
    max: 30,
    default: 0,
    description: 'Head vertical tilt: -30=down, +30=up, 0=level'
  },
  {
    id: 'ParamAngleZ',
    name: 'HeadZ',
    min: -10,
    max: 10,
    default: 0,
    description: 'Head side lean: -10=lean left, +10=lean right, 0=straight'
  },

  // EYE CONTROL
  {
    id: 'ParamEyeBallX',
    name: 'EyeGazeX',
    min: -1,
    max: 1,
    default: 0,
    description: 'Eye gaze horizontal: -1=left, +1=right, 0=center'
  },
  {
    id: 'ParamEyeBallY',
    name: 'EyeGazeY',
    min: -1,
    max: 1,
    default: 0,
    description: 'Eye gaze vertical: -1=down, +1=up, 0=level'
  },
  {
    id: 'ParamEyeLOpen',
    name: 'LeftEyeOpen',
    min: 0,
    max: 1.9,
    default: 1,
    description: 'Left eye openness: 0=closed, 1=normal, 1.5+=wide open'
  },
  {
    id: 'ParamEyeROpen',
    name: 'RightEyeOpen',
    min: 0,
    max: 1.9,
    default: 1,
    description: 'Right eye openness: 0=closed, 1=normal, 1.5+=wide open'
  },

  // EYEBROWS
  {
    id: 'ParamBrowLY',
    name: 'LeftBrowY',
    min: -1,
    max: 1,
    default: 0,
    description: 'Left eyebrow height: -1=down/angry, +1=up/surprised, 0=neutral'
  },
  {
    id: 'ParamBrowRY',
    name: 'RightBrowY',
    min: -1,
    max: 1,
    default: 0,
    description: 'Right eyebrow height: -1=down/angry, +1=up/surprised, 0=neutral'
  },

  // MOUTH
  {
    id: 'ParamMouthOpenY',
    name: 'MouthOpen',
    min: 0,
    max: 2.1,
    default: 0,
    description: 'Mouth opening: 0=closed, 0.3-0.6=talking, 1.5+=shocked'
  },
  {
    id: 'ParamMouthForm',
    name: 'MouthForm',
    min: -1,
    max: 1,
    default: 0,
    description: 'Mouth shape: -1=frown, 0=neutral, +1=smile'
  },
  {
    id: 'Param59',
    name: 'MouthX',
    min: -1,
    max: 1,
    default: 0,
    description: 'Mouth horizontal shift: -1=left, +1=right, 0=center'
  },
  {
    id: 'Param58',
    name: 'CheekPuff',
    min: 0,
    max: 1,
    default: 0,
    description: 'Cheek inflation: 0=normal, 1=puffed'
  },
  {
    id: 'Param31',
    name: 'MouthPucker',
    min: 0,
    max: 1,
    default: 0,
    description: 'Lip pucker/pout: 0=normal, 1=full pucker'
  },
  {
    id: 'Param76',
    name: 'ChinPosition',
    min: 0,
    max: 1,
    default: 0,
    description: 'Jaw position: 0=normal, 1=lowered'
  }
];

/**
 * Physics parameters set to 70% default (AI doesn't control these)
 */
export const PHYSICS_DEFAULTS: Record<string, number> = {
  'ParamBreath': 0.7,     // Auto-breathing
  'Param45': 21,          // ChestX (70% of max 30)
  'Param46': 28,          // ChestY (70% of max 40)
  'Param27': 31,          // SkirtXZ (70% of max 45)
  'Param29': 31,          // SkirtY (70% of max 45)
};

/**
 * Create AI name to parameter ID mapping
 */
export const AI_NAME_TO_PARAM_ID = Object.fromEntries(
  CONTROLLABLE_PARAMETERS.map(p => [p.name, p.id])
);

/**
 * Create parameter ID to definition mapping
 */
export const PARAM_ID_TO_DEF = Object.fromEntries(
  CONTROLLABLE_PARAMETERS.map(p => [p.id, p])
);

/**
 * Build parameter specification string for AI prompt
 */
export function buildParameterSpec(currentValues: Map<string, number>): string {
  let spec = '';

  CONTROLLABLE_PARAMETERS.forEach(param => {
    const currentValue = currentValues.get(param.id) ?? param.default;
    spec += `${param.name} [${param.min},${param.max}]: ${currentValue.toFixed(2)} - ${param.description}\n`;
  });

  return spec;
}

/**
 * Parse AI response for JSON block with parameters and expressions
 */
export function parseAIResponse(
  aiResponse: string,
  currentValues: Map<string, number>
): ParsedAIResponse {
  debugLog('Parsing AI response', {
    responseLength: aiResponse.length,
    hasJsonBlock: aiResponse.includes('```json')
  });

  // Extract JSON block
  const jsonBlockRegex = /```json\s*({[\s\S]*?})\s*```/;
  const match = aiResponse.match(jsonBlockRegex);

  if (!match) {
    debugLog('No JSON block found in response');
    return {
      text: aiResponse.trim(),
      parameters: {},
      expressions: [],
      rawResponse: aiResponse,
      hasParameters: false,
      hasExpressions: false
    };
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(match[1]);
    debugLog('JSON block parsed successfully', parsedJson);
  } catch (error) {
    debugLog('Failed to parse JSON block', { error: String(error) });
    return {
      text: aiResponse.replace(jsonBlockRegex, '').trim(),
      parameters: {},
      expressions: [],
      rawResponse: aiResponse,
      hasParameters: false,
      hasExpressions: false
    };
  }

  // Extract parameters
  const rawParameters = parsedJson.parameters || {};
  const validatedParameters: Record<string, number> = {};

  Object.entries(rawParameters).forEach(([aiName, value]) => {
    if (typeof value !== 'number') {
      debugLog(`Invalid parameter value type for ${aiName}`, { value, type: typeof value });
      return;
    }

    // Map AI name to parameter ID
    const paramId = AI_NAME_TO_PARAM_ID[aiName];
    if (!paramId) {
      debugLog(`Unknown parameter name: ${aiName}`);
      return;
    }

    const paramDef = PARAM_ID_TO_DEF[paramId];
    if (!paramDef) {
      debugLog(`Parameter definition not found: ${paramId}`);
      return;
    }

    // Clamp to valid range
    const clampedValue = Math.max(paramDef.min, Math.min(paramDef.max, value));

    if (clampedValue !== value) {
      debugLog(`Clamped ${aiName} from ${value} to ${clampedValue}`);
    }

    validatedParameters[paramId] = clampedValue;
  });

  // Extract expressions
  const expressions = Array.isArray(parsedJson.expressions) ? parsedJson.expressions : [];

  // Remove JSON block from text
  const cleanText = aiResponse.replace(jsonBlockRegex, '').trim();

  debugLog('Response parsing complete', {
    parameterCount: Object.keys(validatedParameters).length,
    expressionCount: expressions.length,
    textLength: cleanText.length
  });

  return {
    text: cleanText,
    parameters: validatedParameters,
    expressions,
    rawResponse: aiResponse,
    hasParameters: Object.keys(validatedParameters).length > 0,
    hasExpressions: expressions.length > 0
  };
}

/**
 * Build updates array for animator
 */
export function buildParameterUpdates(
  parsedParams: Record<string, number>,
  currentValues: Map<string, number>
): ParameterUpdate[] {
  const updates: ParameterUpdate[] = [];

  Object.entries(parsedParams).forEach(([paramId, targetValue]) => {
    const paramDef = PARAM_ID_TO_DEF[paramId];
    if (!paramDef) {
      updates.push({
        paramId,
        name: paramId,
        currentValue: 0,
        targetValue,
        isValid: false,
        error: `Unknown parameter ID: ${paramId}`
      });
      return;
    }

    const currentValue = currentValues.get(paramId) ?? paramDef.default;

    // Skip if no change needed
    if (Math.abs(targetValue - currentValue) < 0.01) {
      debugLog(`Skipping ${paramDef.name} - no change needed`, {
        current: currentValue,
        target: targetValue
      });
      return;
    }

    updates.push({
      paramId,
      name: paramDef.name,
      currentValue,
      targetValue,
      isValid: true
    });
  });

  debugLog('Built parameter updates', {
    totalUpdates: updates.length,
    validUpdates: updates.filter(u => u.isValid).length
  });

  return updates;
}

/**
 * Initialize parameter values to defaults
 */
export function getDefaultParameterValues(): Map<string, number> {
  return new Map(CONTROLLABLE_PARAMETERS.map(p => [p.id, p.default]));
}
