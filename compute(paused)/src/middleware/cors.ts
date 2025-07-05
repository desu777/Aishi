import cors from 'cors';
import { serverConfig } from '../config/env';
import logger from '../utils/logger';

// CORS configuration for compute backend
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (serverConfig.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost variations
    if (serverConfig.nodeEnv === 'development') {
      const localhostPattern = /^https?:\/\/localhost(:\d+)?$/;
      const localhostIPPattern = /^https?:\/\/127\.0\.0\.1(:\d+)?$/;
      
      if (localhostPattern.test(origin) || localhostIPPattern.test(origin)) {
        return callback(null, true);
      }
    }
    
    logger.warn('CORS: Blocked request from unauthorized origin', { origin });
    return callback(new Error('Not allowed by CORS'), false);
  },
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Signature',
    'X-Timestamp',
    'X-Requested-With'
  ],
  
  credentials: true,
  
  // Preflight cache duration
  maxAge: 86400, // 24 hours
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 200
};

export const corsMiddleware = cors(corsOptions);

// Log CORS configuration on startup
logger.info('CORS configured for origins:', { 
  origins: serverConfig.corsOrigins,
  development: serverConfig.nodeEnv === 'development' 
}); 