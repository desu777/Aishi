import { Router, Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { getCacheStats } from '../utils/cache';
import { serverConfig, networkConfig } from '../config/env';

const router = Router();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Dreamscape Compute Backend',
    version: '1.0.0'
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with system info
 */
router.get('/detailed', (req: Request, res: Response) => {
  try {
    const cacheStats = getCacheStats();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: {
        name: 'Dreamscape Compute Backend',
        version: '1.0.0',
        environment: serverConfig.nodeEnv,
        uptime: `${Math.floor(uptime / 60)} minutes`
      },
      network: {
        computeRpc: networkConfig.computeRpcUrl,
        defaultModel: networkConfig.defaultModel,
        modelsEnabled: {
          llama: networkConfig.enableLlama,
          deepseek: networkConfig.enableDeepseek
        }
      },
      cache: {
        userSessions: cacheStats.userSessions,
        brokerSessions: cacheStats.brokerSessions
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
        }
      }
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/network
 * Check 0G network connectivity
 */
router.get('/network', async (req: Request, res: Response) => {
  try {
    const { ethers } = await import('ethers');
    const provider = new ethers.JsonRpcProvider(networkConfig.computeRpcUrl);
    
    // Test network connectivity
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      status: 'connected',
      network: {
        name: network.name,
        chainId: Number(network.chainId),
        blockNumber,
        rpcUrl: networkConfig.computeRpcUrl
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      status: 'disconnected',
      error: error.message,
      network: {
        rpcUrl: networkConfig.computeRpcUrl,
        attempted: true
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/cache
 * Check cache system status
 */
router.get('/cache', (req: Request, res: Response) => {
  try {
    const stats = getCacheStats();
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      status: 'operational',
      cache: {
        userSessions: stats.userSessions,
        brokerSessions: stats.brokerSessions,
        lastChecked: stats.timestamp
      },
      config: {
        sessionTtlMinutes: 30,
        brokerTtlMinutes: 60,
        cleanupIntervalMinutes: 5
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 