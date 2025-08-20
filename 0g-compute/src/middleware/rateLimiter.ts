/**
 * @fileoverview Express rate limiting middleware for API protection
 * @description Implements multiple rate limiting strategies for different endpoint types,
 * including general API protection, AI query throttling, broker creation limits,
 * and sensitive endpoint restrictions. Uses modern RateLimit headers (draft-8).
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  validate: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
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

export const aiQueryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 20,
  validate: false,
  message: {
    success: false,
    error: 'Too many AI requests. AI processing is limited to 20 requests per minute.',
    retryAfter: '1 minute',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
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

export const brokerCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  validate: false,
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

export const costEstimationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  validate: false,
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

export const fundingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  validate: false,
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

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  validate: false,
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

