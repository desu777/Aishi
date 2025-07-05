// compute-provider/src/server.ts
import express from 'express';
import helmet from 'helmet';
import { serverConfig } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/error';
import { globalRateLimit } from './middleware/rateLimit';
import { initializeCache, cleanupCache } from './utils/cache';
import logger from './utils/logger';

// Import routes
import brokerRoutes from './routes/broker.routes';
import aiRoutes from './routes/ai.routes';
import healthRoutes from './routes/health.routes';
import signatureRoutes from './routes/signature.routes';

/**
 * Dreamscape Compute Backend Server
 * Hybrid architecture: Frontend wallet + Backend compute operations
 */
class ComputeBackendServer {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware stack
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Allow OpenAI API calls
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(corsMiddleware);

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use(requestLogger);

    // Global rate limiting
    this.app.use(globalRateLimit);

    logger.info('Middleware configured successfully');
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check routes (no auth required)
    this.app.use('/api/health', healthRoutes);

    // Broker management routes
    this.app.use('/api/broker', brokerRoutes);

    // AI analysis routes
    this.app.use('/api/ai', aiRoutes);

    // Signature handling routes
    this.app.use('/api/signature', signatureRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Dreamscape Compute Backend API',
        version: '1.0.0',
        docs: '/api/health/detailed',
        endpoints: {
          health: '/api/health',
          broker: '/api/broker',
          ai: '/api/ai',
          signature: '/api/signature'
        }
      });
    });

    logger.info('API routes configured successfully');
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler for undefined routes
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    logger.info('Error handling configured successfully');
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize cache system
      initializeCache();

      // Start HTTP server
      this.server = this.app.listen(serverConfig.port, () => {
        logger.info(`🚀 Dreamscape Compute Backend started successfully!`);
        logger.info(`📡 Server running on port ${serverConfig.port}`);
        logger.info(`🌍 Environment: ${serverConfig.nodeEnv}`);
        logger.info(`🔗 Network: 0G Galileo Testnet`);
        logger.info(`🤖 Models: LLAMA + DeepSeek available`);
        logger.info(`📊 Health check: http://localhost:${serverConfig.port}/api/health`);
        
        if (serverConfig.nodeEnv === 'development') {
          logger.info(`🛠️  API Documentation: http://localhost:${serverConfig.port}/api/health/detailed`);
        }
      });

      // Handle server errors
      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${serverConfig.port} is already in use`);
          process.exit(1);
        } else {
          logger.error('Server error:', error);
        }
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async stop(): Promise<void> {
    logger.info('🛑 Shutting down Dreamscape Compute Backend...');

    try {
      // Cleanup cache
      cleanupCache();

      // Close HTTP server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            logger.info('✅ HTTP server closed');
            resolve();
          });
        });
      }

      logger.info('✅ Dreamscape Compute Backend stopped gracefully');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }
}

// Create server instance
const server = new ComputeBackendServer();

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received');
  await server.stop();
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default server;