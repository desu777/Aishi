/**
 * @fileoverview Main server entry point for Dreamscape 0G Compute Backend
 * @description Initializes Express server with security middleware, API routes, and all core services.
 * Handles service initialization, graceful shutdown, and global error handling.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './config/envLoader';
import apiRoutes from './routes/api';
import { generalLimiter } from './middleware/rateLimiter';
import aiService from './services/aiService';
import masterWallet from './services/masterWallet';
import virtualBrokers from './services/virtualBrokers';
import queryManager from './services/queryManager';
import consolidationChecker from './services/consolidationChecker';
import geminiService from './services/geminiService';

const expressApplication = express();
const SERVER_PORT = process.env.PORT || 3001;

// Trust proxy headers from Nginx/Cloudflare
expressApplication.set('trust proxy', true);

expressApplication.use(helmet());
expressApplication.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

expressApplication.use('/api', generalLimiter);

expressApplication.use(express.json({ limit: '10mb' }));
expressApplication.use(express.urlencoded({ extended: true }));

expressApplication.use((request, response, next) => {
  if (process.env.TEST_ENV === 'true') {
    console.log(`${new Date().toISOString()} - ${request.method} ${request.path}`);
  }
  next();
});

expressApplication.use('/api', apiRoutes);

expressApplication.get('/', (request, response) => {
  response.json({
    service: 'Dreamscape 0G Compute Backend',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      'create-broker': 'POST /api/create-broker',
      'fund': 'POST /api/fund',
      'balance': 'GET /api/balance/:walletAddress',
      '0g-compute': 'POST /api/0g-compute',
      'models': 'GET /api/models',
      'master-wallet-address': 'GET /api/master-wallet-address',
      'estimate-cost': 'POST /api/estimate-cost',
      'consolidation-status': 'GET /api/consolidation/:walletAddress',
      'consolidation-check': 'POST /api/consolidation/check',
      'consolidation-start': 'POST /api/consolidation/start',
      'consolidation-stop': 'POST /api/consolidation/stop',
      'transactions': 'GET /api/transactions/:walletAddress',
      'gemini': 'POST /api/gemini',
      'gemini-status': 'GET /api/gemini/status'
    }
  });
});

expressApplication.use('*', (request, response) => {
  response.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: request.originalUrl,
    timestamp: new Date().toISOString()
  });
});

expressApplication.use((errorObject: any, request: express.Request, response: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', errorObject);
  
  response.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: errorObject.stack })
  });
});

/**
 * Initialize all backend services in proper order
 * @returns {Promise<void>}
 */
async function initializeAllBackendServices() {
  console.log('🚀 Initializing Dreamscape 0G Compute Backend...');
  
  try {
    /* Initialize AI service first as it sets up master wallet */
    console.log('🤖 Initializing AI Service...');
    await aiService.initialize();
    
    console.log('🌟 Initializing Gemini AI Service...');
    await geminiService.initialize();
    
    console.log('👁️  Starting transaction monitor...');
    await masterWallet.startTransactionMonitor(async (senderAddress, transactionAmount, transactionHash) => {
      try {
        await virtualBrokers.processFundingTransaction(senderAddress, transactionAmount, transactionHash);
        console.log(`✅ Auto-funded broker ${senderAddress} with ${transactionAmount} OG`);
      } catch (error: any) {
        console.error(`❌ Failed to auto-fund broker ${senderAddress}:`, error.message);
      }
    });
    
    console.log('✅ All services initialized successfully');
    
    console.log('\n📋 Configuration:');
    console.log(`   Master Wallet: ${masterWallet.getWalletAddress()}`);
    console.log(`   RPC URL: ${process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai'}`);
    console.log(`   Database: ${process.env.DATABASE_PATH || './data/brokers.db'}`);
    console.log(`   Port: ${SERVER_PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Max Concurrent Queries: ${process.env.MAX_CONCURRENT_QUERIES || '5'}`);
    
    const currentQueueStatus = queryManager.getQueueStatus();
    console.log(`   Query Manager: Ready (Queue: ${currentQueueStatus.queueLength}, Active: ${currentQueueStatus.activeQueries}/${currentQueueStatus.maxConcurrent}`);
    
    const consolidationCheckIntervalMinutes = parseInt(process.env.CONSOLIDATION_CHECK_INTERVAL_MINUTES || '60');
    consolidationChecker.startChecker(consolidationCheckIntervalMinutes);
    console.log(`   Consolidation Checker: Started (interval: ${consolidationCheckIntervalMinutes} minutes)`);
    
  } catch (error: any) {
    console.error('❌ Failed to initialize services:', error.message);
    process.exit(1);
  }
}

process.on('SIGTERM', performGracefulShutdown);
process.on('SIGINT', performGracefulShutdown);

/**
 * Perform graceful shutdown of all services
 * @returns {Promise<void>}
 */
async function performGracefulShutdown() {
  console.log('\n🛑 Graceful shutdown initiated...');
  
  try {
    console.log('🛑 Stopping Consolidation Checker...');
    consolidationChecker.stopChecker();
    
    console.log('🛑 Cleaning up Query Manager...');
    /* QueryManager cleanup would happen here if needed */
    
    await aiService.cleanup();
    await geminiService.cleanup();
    await masterWallet.cleanup();
    
    console.log('✅ Services cleaned up successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
}

/**
 * Start the Express server and initialize all services
 * @returns {Promise<void>}
 */
async function startExpressServer() {
  try {
    await initializeAllBackendServices();
    
    expressApplication.listen(SERVER_PORT, () => {
      console.log(`\n🎯 Dreamscape 0G Compute Backend running on port ${SERVER_PORT}`);
      console.log(`🌐 API available at: http://localhost:${SERVER_PORT}`);
      console.log(`📊 Health check: http://localhost:${SERVER_PORT}/api/health`);
      console.log(`📋 Status: http://localhost:${SERVER_PORT}/api/status`);
      
      if (process.env.TEST_ENV === 'true') {
        console.log('🔧 Debug mode enabled (TEST_ENV=true)');
      }
      
      console.log('\n🎉 Ready to serve AI dream analysis requests!');
    });
    
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

process.on('uncaughtException', (uncaughtError) => {
  console.error('❌ Uncaught Exception:', uncaughtError);
  process.exit(1);
});

process.on('unhandledRejection', (rejectionReason, rejectedPromise) => {
  console.error('❌ Unhandled Rejection at:', rejectedPromise, 'reason:', rejectionReason);
  process.exit(1);
});

startExpressServer();

export default expressApplication; 