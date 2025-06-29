require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    whisperConfigured: !!process.env.WHISPER_API,
    computeConfigured: !!process.env.WALLET_PRIVATE_KEY,
    inftConfigured: !!process.env.DREAM_AGENT_NFT_ADDRESS,
    verifierConfigured: !!process.env.DREAM_VERIFIER_ADDRESS
  });
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, upload }; 