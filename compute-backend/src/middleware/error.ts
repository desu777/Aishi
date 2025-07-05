import { Request, Response, NextFunction } from 'express';
import { ComputeBackendError } from '../types';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { logError } from '../utils/logger';

// Global error handler middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }
  
  // Handle known ComputeBackendError types
  if (error instanceof ComputeBackendError) {
    logError('Compute backend error', error, {
      url: req.url,
      method: req.method,
      userAddress: (req as any).userAddress
    });
    
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    logError('Validation error', error, {
      url: req.url,
      method: req.method
    });
    
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  if (error.name === 'SyntaxError' && 'body' in error) {
    logError('JSON parsing error', error, {
      url: req.url,
      method: req.method
    });
    
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Handle network/timeout errors
  if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
    logError('Network error', error, {
      url: req.url,
      method: req.method
    });
    
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      error: ERROR_MESSAGES.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Handle all other errors as internal server errors
  logError('Unhandled error', error, {
    url: req.url,
    method: req.method,
    userAddress: (req as any).userAddress,
    stack: error.stack
  });
  
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: ERROR_MESSAGES.INTERNAL_ERROR,
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
}

// 404 handler for undefined routes
export function notFoundHandler(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userAddress = (req as any).userAddress;
    
    // Don't log health checks in production
    if (req.url === '/api/health' && process.env.NODE_ENV === 'production') {
      return;
    }
    
    logError('Request completed', undefined, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAddress: userAddress || 'anonymous',
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
} 