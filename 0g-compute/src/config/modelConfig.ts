import './envLoader';

// Mapping of simple model names to full model names
export const MODEL_MAPPING = {
  deepseek: 'deepseek-r1-70b',
  llama: 'llama-3.3-70b-instruct'
} as const;

// Official 0G providers mapping
export const OFFICIAL_PROVIDERS: Record<string, string> = {
  "llama-3.3-70b-instruct": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
};

// Model costs will be fetched dynamically from providers
// No more static costs - they were misleading users!

// Type definitions
export type ModelPickedType = keyof typeof MODEL_MAPPING;
export type FullModelType = typeof MODEL_MAPPING[ModelPickedType];

/**
 * Gets the selected model from environment variable
 * Defaults to 'deepseek' if not set or invalid
 */
export function getSelectedModel(): FullModelType {
  const modelPicked = process.env.MODEL_PICKED as ModelPickedType;
  
  if (!modelPicked || !MODEL_MAPPING[modelPicked]) {
    if (process.env.TEST_ENV === 'true') {
      console.log(`⚠️  MODEL_PICKED not set or invalid (${modelPicked}), using default: deepseek`);
    }
    return MODEL_MAPPING.deepseek;
  }
  
  if (process.env.TEST_ENV === 'true') {
    console.log(`🤖 Selected model: ${modelPicked} -> ${MODEL_MAPPING[modelPicked]}`);
  }
  
  return MODEL_MAPPING[modelPicked];
}

/**
 * Gets the provider address for the selected model
 */
export function getSelectedProvider(): string {
  const model = getSelectedModel();
  const provider = OFFICIAL_PROVIDERS[model];
  
  if (!provider) {
    throw new Error(`No provider found for model: ${model}`);
  }
  
  return provider;
}

/**
 * Gets the cost for the selected model from broker service
 * This should be called dynamically from aiService to get real-time pricing
 */
export function getSelectedModelCost(): number {
  // This is now a placeholder - real costs must be fetched from broker
  // See aiService.ts for dynamic pricing implementation
  console.warn('⚠️  getSelectedModelCost() is deprecated - use dynamic pricing from broker');
  return 0.001; // Fallback only
}

/**
 * Gets all available models (without costs - they are dynamic)
 */
export function getAvailableModels(): Array<{
  key: ModelPickedType;
  name: FullModelType;
  provider: string;
}> {
  return Object.entries(MODEL_MAPPING).map(([key, name]) => ({
    key: key as ModelPickedType,
    name: name as FullModelType,
    provider: OFFICIAL_PROVIDERS[name]
  }));
}

/**
 * Validates if a model is supported
 */
export function isValidModel(model: string): model is FullModelType {
  return Object.values(MODEL_MAPPING).includes(model as FullModelType);
}

/**
 * Gets model info for display (without cost - it's dynamic)
 */
export function getModelInfo(): {
  selected: FullModelType;
  provider: string;
  available: string[];
} {
  const selected = getSelectedModel();
  
  return {
    selected,
    provider: getSelectedProvider(),
    available: Object.values(MODEL_MAPPING)
  };
} 