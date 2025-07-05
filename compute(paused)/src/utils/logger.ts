import winston from 'winston';
import { serverConfig } from '../config/env';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: serverConfig.logLevel,
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  ]
});

// Add file transport in production
if (serverConfig.nodeEnv === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  }));
}

// Helper functions for structured logging
export const logWithContext = (level: string, message: string, context: any = {}) => {
  logger.log(level, message, context);
};

export const logError = (message: string, error?: Error, context: any = {}) => {
  logger.error(message, {
    ...context,
    error: error?.message,
    stack: error?.stack
  });
};

export const logRequest = (method: string, url: string, address?: string, duration?: number) => {
  logger.info('API Request', {
    method,
    url,
    address,
    duration: duration ? `${duration}ms` : undefined
  });
};

export const logOperation = (
  operation: string, 
  address: string, 
  success: boolean, 
  details: any = {}
) => {
  logger.info('Compute Operation', {
    operation,
    address,
    success,
    ...details
  });
};

export default logger; 