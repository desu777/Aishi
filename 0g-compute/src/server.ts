import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './config/envLoader';
import apiRoutes from './routes/api';
import aiService from './services/aiService';
import masterWallet from './services/masterWallet';
import virtualBrokers from './services/virtualBrokers';
import queryManager from './services/queryManager';
import consolidationChecker from './services/consolidationChecker';
import geminiService from './services/geminiService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.TEST_ENV === 'true') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
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
      'analyze-dream': 'POST /api/analyze-dream',
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize services
async function initializeServices() {
  console.log('🚀 Initializing Dreamscape 0G Compute Backend...');
  
  try {
    // Initialize AI service (which initializes master wallet)
    console.log('🤖 Initializing AI Service...');
    await aiService.initialize();
    
    // Initialize Gemini service
    console.log('🌟 Initializing Gemini AI Service...');
    await geminiService.initialize();
    
    // Start transaction monitoring
    console.log('👁️  Starting transaction monitor...');
    await masterWallet.startTransactionMonitor(async (from, amount, txHash) => {
      try {
        await virtualBrokers.processFundingTransaction(from, amount, txHash);
        console.log(`✅ Auto-funded broker ${from} with ${amount} OG`);
      } catch (error: any) {
        console.error(`❌ Failed to auto-fund broker ${from}:`, error.message);
      }
    });
    
    console.log('✅ All services initialized successfully');
    
    // Display configuration
    console.log('\n📋 Configuration:');
    console.log(`   Master Wallet: ${masterWallet.getWalletAddress()}`);
    console.log(`   RPC URL: ${process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai'}`);
    console.log(`   Database: ${process.env.DATABASE_PATH || './data/brokers.db'}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Max Concurrent Queries: ${process.env.MAX_CONCURRENT_QUERIES || '5'}`);
    
    // Display queue status
    const queueStatus = queryManager.getQueueStatus();
    console.log(`   Query Manager: Ready (Queue: ${queueStatus.queueLength}, Active: ${queueStatus.activeQueries}/${queueStatus.maxConcurrent})`);
    
    // Start consolidation checker
    const consolidationInterval = parseInt(process.env.CONSOLIDATION_CHECK_INTERVAL_MINUTES || '60');
    consolidationChecker.startChecker(consolidationInterval);
    console.log(`   Consolidation Checker: Started (interval: ${consolidationInterval} minutes)`);
    
  } catch (error: any) {
    console.error('❌ Failed to initialize services:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  console.log('\n🛑 Graceful shutdown initiated...');
  
  try {
    // Cleanup services
    console.log('🛑 Stopping Consolidation Checker...');
    consolidationChecker.stopChecker();
    
    console.log('🛑 Cleaning up Query Manager...');
    // QueryManager cleanup would happen here if needed
    
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

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`\n🎯 Dreamscape 0G Compute Backend running on port ${PORT}`);
      console.log(`🌐 API available at: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 Status: http://localhost:${PORT}/api/status`);
      
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app; 