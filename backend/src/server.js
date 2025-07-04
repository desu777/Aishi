require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan');
const { checkDeploymentStatus, getDreamAgentNFTInfo } = require('../utils/contractAddresses');

const app = express();
const PORT = process.env.PORT || 3001;

// Debug logging helper
const debugLog = (message, data = null) => {
  if (process.env.DREAMSCAPE_TEST === 'true') {
    console.log(`[🔮 SERVER] ${message}`, data || '');
  }
};

// CORS enabled for all origins
app.use(cors());

// Morgan for request logging
app.use(morgan('combined'));

// File upload with multer (50MB limit, memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// JSON body parser
app.use(express.json());

// Routes
const testRoutes = require('./routes/test');
const dreamRoutes = require('./routes/dreams');
const computeRoutes = require('./routes/compute');
const agentRoutes = require('./routes/agent');
const storageRoutes = require('./routes/storage');

app.use('/api/test', upload.single('file'), testRoutes);
app.use('/api/dreams', upload.single('audio'), dreamRoutes);
app.use('/api/compute', computeRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/storage', storageRoutes);

// Enhanced health check endpoint with deployment status
app.get('/api/health', async (req, res) => {
  try {
    debugLog('Health check requested');

    // Check contract deployment status
    const deploymentStatus = checkDeploymentStatus('galileo');
    const nftInfo = deploymentStatus.deployed ? getDreamAgentNFTInfo('galileo') : null;

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      
      // Environment checks
      whisperConfigured: !!process.env.WHISPER_API,
      computeConfigured: !!process.env.WALLET_PRIVATE_KEY,
      treasuryConfigured: !!process.env.TREASURY_ADDRESS,
      
      // Enhanced contract deployment status
      contractsDeployed: deploymentStatus.deployed,
      deploymentStatus: {
        deployed: deploymentStatus.deployed,
        contracts: deploymentStatus.contracts,
        missing: deploymentStatus.missing || [],
        lastUpdate: deploymentStatus.lastUpdate,
        network: deploymentStatus.network
      },
      
      // Enhanced NFT contract info with fee system
      dreamAgentNFT: deploymentStatus.deployed ? {
        address: nftInfo.address,
        name: nftInfo.name,
        symbol: nftInfo.symbol,
        totalAgents: nftInfo.totalAgents,
        maxAgents: nftInfo.maxAgents,
        remainingSupply: nftInfo.remainingSupply,
        personalizedAgents: true,
        limitedEdition: true,
        // Fee system info
        feeSystem: {
          mintingFee: nftInfo.mintingFeeEther || '0.1',
          currency: 'OG',
          treasury: nftInfo.treasury,
          totalFeesCollected: nftInfo.totalFeesCollected || '0',
          hasFeeSytem: nftInfo.hasFeeSytem || true
        }
      } : null,
      
      // Treasury information
      treasury: {
        address: process.env.TREASURY_ADDRESS || 'Not configured',
        configured: !!process.env.TREASURY_ADDRESS,
        ogPriceUSD: process.env.OG_PRICE_USD || '0.10'
      },
      
      // Legacy environment variables (for backward compatibility)
      inftConfigured: deploymentStatus.deployed,
      verifierConfigured: deploymentStatus.deployed
    };

    debugLog('Health check completed', {
      contractsDeployed: deploymentStatus.deployed,
      treasuryConfigured: !!process.env.TREASURY_ADDRESS,
      remainingSupply: nftInfo?.remainingSupply
    });

    res.json(health);

  } catch (error) {
    console.error('Health check failed:', error);
    debugLog('Health check failed', error.message);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      contractsDeployed: false
    });
  }
});

// Contract deployment status endpoint
app.get('/api/deployment', async (req, res) => {
  try {
    debugLog('Deployment status requested');

    const deploymentStatus = checkDeploymentStatus('galileo');
    const nftInfo = deploymentStatus.deployed ? getDreamAgentNFTInfo('galileo') : null;

    res.json({
      success: true,
      deployment: {
        ...deploymentStatus,
        nftInfo,
        enhancedFeatures: {
          personalizedAgents: true,
          namedAgents: true,
          conversationTracking: true,
          limitedSupply: true,
          maxAgents: 1000,
          feeSystem: true,
          mintingFee: '0.1 OG',
          treasury: process.env.TREASURY_ADDRESS || 'Not configured'
        }
      }
    });

  } catch (error) {
    console.error('Deployment status check failed:', error);
    debugLog('Deployment status check failed', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  debugLog('Server error', err.message);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Enhanced server startup with deployment status
app.listen(PORT, async () => {
  console.log(`🚀 Dreamscape Backend Server running on port ${PORT}`);
  
  // Check treasury configuration
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const ogPriceUSD = process.env.OG_PRICE_USD || '0.10';
  
  if (!treasuryAddress) {
    console.log('⚠️  TREASURY_ADDRESS not configured - using deployer as treasury');
  } else {
    console.log(`💰 Treasury configured: ${treasuryAddress}`);
  }
  
  console.log(`💵 OG Price: $${ogPriceUSD} USD`);
  
  // Check deployment status on startup
  try {
    const deploymentStatus = checkDeploymentStatus('galileo');
    
    if (deploymentStatus.deployed) {
      const nftInfo = getDreamAgentNFTInfo('galileo');
      console.log('✅ Smart contracts deployed and ready');
      console.log(`📊 Dream Agents: ${nftInfo.totalAgents}/${nftInfo.maxAgents} (${nftInfo.remainingSupply} remaining)`);
      console.log(`🤖 Contract: ${nftInfo.address}`);
      
      // Display fee system information
      if (nftInfo.hasFeeSytem) {
        const mintingFee = nftInfo.mintingFeeEther || '0.1';
        const totalRevenue = nftInfo.totalFeesCollected || '0';
        const maxRevenue = (1000 * parseFloat(mintingFee)).toString();
        
        console.log(`💎 Minting Fee: ${mintingFee} OG (~$${(parseFloat(mintingFee) * parseFloat(ogPriceUSD)).toFixed(4)} USD)`);
        console.log(`🏦 Treasury: ${nftInfo.treasury || treasuryAddress || 'Not set'}`);
        console.log(`📈 Revenue: ${totalRevenue}/${maxRevenue} OG (${nftInfo.totalAgents > 0 ? Math.round((parseFloat(totalRevenue) / parseFloat(maxRevenue)) * 100) : 0}%)`);
      }
      
      debugLog('Server started with deployed contracts', {
        totalAgents: nftInfo.totalAgents,
        remainingSupply: nftInfo.remainingSupply,
        treasury: nftInfo.treasury || treasuryAddress,
        mintingFee: nftInfo.mintingFeeEther || '0.1'
      });
    } else {
      console.log('⚠️  Smart contracts not deployed yet');
      console.log('   Missing:', deploymentStatus.missing.join(', '));
      console.log('   Run: npm run deploy');
      
      debugLog('Server started without deployed contracts', deploymentStatus.missing);
    }
  } catch (error) {
    console.warn('Could not check deployment status:', error.message);
    debugLog('Deployment status check failed on startup', error.message);
  }
  
  console.log('\n🎯 Enhanced Features:');
  console.log('   ✅ Personalized AI Agents (with names)');
  console.log('   ✅ Limited Supply (1000 agents max)');
  console.log('   ✅ Minting Fee System (0.1 OG per agent)');
  console.log('   ✅ Treasury Revenue Collection');
  console.log('   ✅ Conversation Tracking');
  console.log('   ✅ Enhanced Evolution System');
  console.log('   ✅ Debug Logging (DREAMSCAPE_TEST)');
  
  console.log('\n💰 Economics:');
  console.log(`   💎 Agent Cost: 0.1 OG (~$${(0.1 * parseFloat(ogPriceUSD)).toFixed(4)} USD)`);
  console.log(`   🏦 Treasury: ${treasuryAddress || 'Using deployer address'}`);
  console.log(`   📊 Max Revenue: 100 OG (~$${(100 * parseFloat(ogPriceUSD)).toFixed(2)} USD)`);
  console.log(`   🎯 Revenue Per Agent: $${(0.1 * parseFloat(ogPriceUSD)).toFixed(4)} USD`);
});

module.exports = { app, upload }; 