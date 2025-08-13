import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate Limiting Security Middleware
 * Implements 2025 best practices for API protection
 */

// General API rate limiter - applies to all API routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // requests per IP per window
  message: {
    success: false,
    error: 'Too many requests. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8', // Use modern RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req: Request, res: Response) => {
    console.warn(`🚫 Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again in 15 minutes.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

// AI Query rate limiter - for computationally expensive operations
export const aiQueryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 20, // AI queries per IP per minute
  message: {
    success: false,
    error: 'Too many AI requests. AI processing is limited to 20 requests per minute.',
    retryAfter: '1 minute',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
  handler: (req: Request, res: Response) => {
    console.warn(`🤖 AI query rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many AI requests. AI processing is limited to 20 requests per minute.',
      retryAfter: '1 minute',
      timestamp: new Date().toISOString()
    });
  }
});

// Broker creation rate limiter - prevent spam account creation
export const brokerCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // 3 broker creations per IP per hour
  message: {
    success: false,
    error: 'Too many broker creation attempts. Limited to 3 per hour.',
    retryAfter: '1 hour',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`👤 Broker creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many broker creation attempts. Limited to 3 per hour.',
      retryAfter: '1 hour',
      timestamp: new Date().toISOString()
    });
  }
});

// Cost estimation rate limiter - prevent cost calculation abuse
export const costEstimationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20, // 20 cost estimations per IP per 5 minutes
  message: {
    success: false,
    error: 'Too many cost estimation requests. Limited to 20 per 5 minutes.',
    retryAfter: '5 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`💰 Cost estimation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many cost estimation requests. Limited to 20 per 5 minutes.',
      retryAfter: '5 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

// Funding rate limiter - prevent funding spam
export const fundingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5, // 5 funding operations per IP per 10 minutes
  message: {
    success: false,
    error: 'Too many funding requests. Limited to 5 per 10 minutes.',
    retryAfter: '10 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`💸 Funding rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many funding requests. Limited to 5 per 10 minutes.',
      retryAfter: '10 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

// Strict rate limiter for sensitive endpoints
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Very restrictive - 5 requests per 15 minutes
  message: {
    success: false,
    error: 'Rate limit exceeded for sensitive endpoint. Limited to 5 requests per 15 minutes.',
    retryAfter: '15 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`🔐 Strict rate limit exceeded for IP: ${req.ip} on sensitive endpoint: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded for sensitive endpoint. Limited to 5 requests per 15 minutes.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate Limiter Configuration Summary:
 * 
 * generalLimiter: 100 requests / 15 minutes (standard API protection)
 * aiQueryLimiter: 20 requests / 1 minute (AI processing protection)
 * brokerCreationLimiter: 3 requests / 1 hour (account creation protection)
 * costEstimationLimiter: 20 requests / 5 minutes (cost calculation protection)
 * fundingLimiter: 5 requests / 10 minutes (funding operation protection)
 * strictLimiter: 5 requests / 15 minutes (sensitive endpoint protection)
 */