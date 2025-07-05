import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { serverConfig, rateLimitConfig } from '../config/env';
import { getUserSession, incrementUserAIQueries, incrementUserFundOperations } from '../utils/cache';
import { RateLimitError } from '../types';
import { HTTP_STATUS } from '../config/constants';
import logger from '../utils/logger';

// Global rate limiting (per IP)
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: serverConfig.maxRequestsPerMinute,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user address if available, otherwise IP
    const userAddress = (req as any).userAddress;
    return userAddress || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    const userAddress = (req as any).userAddress;
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAddress,
      url: req.url,
      method: req.method
    });
    
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Rate limit exceeded, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    });
  }
});

// AI query rate limiting (per user per day)
export function aiQueryRateLimit(req: Request, res: Response, next: Function): void {
  try {
    const userAddress = (req as any).userAddress;
    
    if (!userAddress) {
      throw new RateLimitError('User address not found for rate limiting');
    }
    
    const session = getUserSession(userAddress);
    
    if (!session) {
      throw new RateLimitError('User session not found for rate limiting');
    }
    
    // Check if user has exceeded daily AI query limit
    if (session.aiQueriesUsed >= rateLimitConfig.maxAiQueriesPerDay) {
      logger.warn('AI query daily limit exceeded', {
        userAddress,
        queriesUsed: session.aiQueriesUsed,
        limit: rateLimitConfig.maxAiQueriesPerDay
      });
      
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: `Daily AI query limit exceeded (${rateLimitConfig.maxAiQueriesPerDay} queries per day)`,
        code: 'AI_QUERY_LIMIT_EXCEEDED',
        queriesUsed: session.aiQueriesUsed,
        limit: rateLimitConfig.maxAiQueriesPerDay,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Increment query count for this request
    incrementUserAIQueries(userAddress);
    
    next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      logger.error('AI rate limiting error', error as Error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal rate limiting error'
      });
    }
  }
}

// Fund operation rate limiting (per user per hour)
export function fundOperationRateLimit(req: Request, res: Response, next: Function): void {
  try {
    const userAddress = (req as any).userAddress;
    
    if (!userAddress) {
      throw new RateLimitError('User address not found for rate limiting');
    }
    
    const session = getUserSession(userAddress);
    
    if (!session) {
      throw new RateLimitError('User session not found for rate limiting');
    }
    
    // For hourly limits, we need to check if it's a new hour
    // Simple implementation: reset count every hour based on session creation
    const hoursSinceLastActivity = (Date.now() - session.lastActivity.getTime()) / (1000 * 60 * 60);
    
    // Reset fund operations if more than 1 hour has passed
    if (hoursSinceLastActivity >= 1) {
      session.fundOperationsUsed = 0;
    }
    
    // Check if user has exceeded hourly fund operation limit
    if (session.fundOperationsUsed >= rateLimitConfig.maxFundOperationsPerHour) {
      logger.warn('Fund operation hourly limit exceeded', {
        userAddress,
        operationsUsed: session.fundOperationsUsed,
        limit: rateLimitConfig.maxFundOperationsPerHour
      });
      
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: `Hourly fund operation limit exceeded (${rateLimitConfig.maxFundOperationsPerHour} operations per hour)`,
        code: 'FUND_OPERATION_LIMIT_EXCEEDED',
        operationsUsed: session.fundOperationsUsed,
        limit: rateLimitConfig.maxFundOperationsPerHour,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Increment operation count for this request
    incrementUserFundOperations(userAddress);
    
    next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      logger.error('Fund operation rate limiting error', error as Error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal rate limiting error'
      });
    }
  }
} 