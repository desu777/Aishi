import { Router, Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { authenticateAIAnalysis } from '../middleware/auth';
import { aiQueryRateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../types';
import { HTTP_STATUS, OPERATION_LIMITS } from '../config/constants';
import { logOperation } from '../utils/logger';

const router = Router();
const aiService = new AIService();

/**
 * POST /api/ai/analyze
 * Analyze dream text using AI
 */
router.post('/analyze', 
  authenticateAIAnalysis,
  aiQueryRateLimit,
  async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { userAddress } = req as AuthenticatedRequest;
      const { dreamText, options } = req.body;
      
      if (!userAddress) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'User address not found',
          code: 'MISSING_ADDRESS'
        });
      }

      // Validate dream text
      if (!dreamText || typeof dreamText !== 'string') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Dream text is required',
          code: 'MISSING_DREAM_TEXT'
        });
      }

      if (dreamText.length < OPERATION_LIMITS.MIN_DREAM_TEXT_LENGTH) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `Dream text must be at least ${OPERATION_LIMITS.MIN_DREAM_TEXT_LENGTH} characters`,
          code: 'DREAM_TEXT_TOO_SHORT'
        });
      }

      if (dreamText.length > OPERATION_LIMITS.MAX_DREAM_TEXT_LENGTH) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `Dream text must be no more than ${OPERATION_LIMITS.MAX_DREAM_TEXT_LENGTH} characters`,
          code: 'DREAM_TEXT_TOO_LONG'
        });
      }

      // Extract options
      const model = options?.model || 'llama';
      
      if (!['llama', 'deepseek'].includes(model)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid model. Must be "llama" or "deepseek"',
          code: 'INVALID_MODEL'
        });
      }

      logOperation('ai_analysis_request', userAddress, false, {
        model,
        dreamTextLength: dreamText.length,
        agentLevel: options?.level
      });

      // Perform AI analysis
      const result = await aiService.analyzeDream(userAddress, dreamText, model);
      
      const responseTime = Date.now() - startTime;
      
      logOperation('ai_analysis_response', userAddress, true, {
        model,
        responseTime,
        success: result.success
      });

      res.status(HTTP_STATUS.OK).json(result);

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      logOperation('ai_analysis_error', req.body.address || 'unknown', false, {
        error: error.message,
        responseTime
      });

      res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        code: error.code || 'AI_ANALYSIS_ERROR',
        responseTime
      });
    }
  }
);

/**
 * GET /api/ai/models
 * Get available AI models with detailed info
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = [
      {
        ...aiService.getModelInfo('llama'),
        id: 'llama',
        available: true,
        costPerQuery: '~0.001-0.003 OG (Testnet: FREE)',
        testnetNote: 'All operations are free on 0G Galileo Testnet'
      },
      {
        ...aiService.getModelInfo('deepseek'),
        id: 'deepseek',
        available: true,
        costPerQuery: '~0.001-0.003 OG (Testnet: FREE)',
        testnetNote: 'All operations are free on 0G Galileo Testnet'
      }
    ];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      models,
      network: 'Galileo Testnet',
      pricing: 'Free for all operations'
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: 'GET_AI_MODELS_ERROR'
    });
  }
});

/**
 * POST /api/ai/quick-test
 * Quick test endpoint for AI functionality
 */
router.post('/quick-test', async (req: Request, res: Response) => {
  try {
    const { address, model = 'llama' } = req.body;
    
    if (!address) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Address is required for testing',
        code: 'MISSING_ADDRESS'
      });
    }

    // Use a simple test dream
    const testDream = "I dreamed I was flying over a beautiful landscape with blue skies and green fields below.";
    
    const result = await aiService.analyzeDream(address, testDream, model as 'llama' | 'deepseek');
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'AI test completed successfully',
      testDream,
      result
    });
    
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: error.code || 'AI_TEST_ERROR'
    });
  }
});

/**
 * GET /api/ai/model-info/:model
 * Get detailed information about a specific model
 */
router.get('/model-info/:model', async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    
    if (!['llama', 'deepseek'].includes(model)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid model. Must be "llama" or "deepseek"',
        code: 'INVALID_MODEL'
      });
    }

    const modelInfo = aiService.getModelInfo(model as 'llama' | 'deepseek');
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      modelInfo: {
        ...modelInfo,
        id: model,
        testnetPricing: 'Free on Galileo Testnet',
        capabilities: {
          dreamAnalysis: true,
          symbolInterpretation: true,
          emotionalAnalysis: true,
          personalizedInsights: model === 'deepseek'
        }
      }
    });
    
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: 'GET_MODEL_INFO_ERROR'
    });
  }
});

export default router; 