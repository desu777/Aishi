import { Router, Request, Response } from 'express';
import { BrokerService } from '../services/broker.service';
import { 
  authenticateInitBroker,
  authenticateBalanceCheck,
  authenticateFundAccount
} from '../middleware/auth';
import { fundOperationRateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../types';
import { HTTP_STATUS } from '../config/constants';
import { logOperation } from '../utils/logger';

const router = Router();
const brokerService = new BrokerService();

/**
 * POST /api/broker/init
 * Initialize broker account for user
 */
router.post('/init', authenticateInitBroker, async (req: Request, res: Response) => {
  try {
    const { userAddress } = req as AuthenticatedRequest;
    
    if (!userAddress) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'User address not found',
        code: 'MISSING_ADDRESS'
      });
    }

    const result = await brokerService.initializeBroker(userAddress);
    
    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: error.code || 'BROKER_INIT_ERROR'
    });
  }
});

/**
 * GET /api/broker/balance/:address
 * Get broker account balance
 */
router.get('/balance/:address', authenticateBalanceCheck, async (req: Request, res: Response) => {
  try {
    const { userAddress } = req as AuthenticatedRequest;
    
    if (!userAddress) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'User address not found',
        code: 'MISSING_ADDRESS'
      });
    }

    const balance = await brokerService.getBalance(userAddress);
    
    res.status(HTTP_STATUS.OK).json(balance);
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: error.code || 'GET_BALANCE_ERROR'
    });
  }
});

/**
 * POST /api/broker/fund
 * Fund broker account
 */
router.post('/fund', 
  authenticateFundAccount, 
  fundOperationRateLimit, 
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req as AuthenticatedRequest;
      const { amount } = req.body;
      
      if (!userAddress) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'User address not found',
          code: 'MISSING_ADDRESS'
        });
      }

      const result = await brokerService.fundAccount(userAddress, amount);
      
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error: any) {
      res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        code: error.code || 'FUND_ACCOUNT_ERROR'
      });
    }
  }
);

/**
 * GET /api/broker/models
 * Get available AI models
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    // For now, return static model info since this doesn't require user authentication
    const models = [
      {
        id: 'llama',
        name: 'LLAMA-3.3-70B-Instruct',
        provider: '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
        costPerQuery: '~0.001-0.003 OG',
        features: ['fast', 'conversational', 'general-purpose'],
        available: true,
        averageResponseTime: '3-7 seconds',
        bestFor: 'Quick dream interpretations'
      },
      {
        id: 'deepseek',
        name: 'DeepSeek-R1-70B',
        provider: '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
        costPerQuery: '~0.001-0.003 OG',
        features: ['detailed', 'analytical', 'reasoning'],
        available: true,
        averageResponseTime: '15-25 seconds',
        bestFor: 'In-depth symbolic analysis'
      }
    ];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      models
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: 'GET_MODELS_ERROR'
    });
  }
});

/**
 * POST /api/broker/acknowledge/:provider
 * Acknowledge provider before first use
 */
router.post('/acknowledge/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { address, signature, timestamp } = req.body;

    // Simple validation for this endpoint
    if (!address || !signature || !timestamp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Missing authentication fields',
        code: 'MISSING_AUTH'
      });
    }

    await brokerService.acknowledgeProvider(address, provider);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Provider ${provider} acknowledged successfully`
    });
  } catch (error: any) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: error.code || 'ACKNOWLEDGE_PROVIDER_ERROR'
    });
  }
});

/**
 * GET /api/broker/info/:address
 * Get broker debug info (development only)
 */
router.get('/info/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    const info = await brokerService.getBrokerInfo(address);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      info
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: 'GET_BROKER_INFO_ERROR'
    });
  }
});

/**
 * DELETE /api/broker/cleanup/:address
 * Cleanup broker session (development only)
 */
router.delete('/cleanup/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    await brokerService.cleanupBroker(address);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Broker session cleaned up'
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
      code: 'CLEANUP_BROKER_ERROR'
    });
  }
});

export default router; 