# 📋 0G SDK Complete Analysis - Implementation Guide dla Dreamscape

## 🤖 **0G Compute Network SDK** - AI Dream Analysis

### **Available Models (Current)**
```typescript
// Oficjalne modele dostępne w sieci
const OFFICIAL_MODELS = {
  "llama-3.3-70b-instruct": {
    provider: "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
    description: "State-of-the-art 70B parameter model for general AI tasks",
    verification: "TEE (TeeML)", // Trusted Execution Environment
    useCases: ["general reasoning", "dream interpretation", "psychology analysis"]
  },
  "deepseek-r1-70b": {
    provider: "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3", 
    description: "Advanced reasoning model optimized for complex problem solving",
    verification: "TEE (TeeML)",
    useCases: ["complex analysis", "pattern recognition", "deep dream insights"]
  }
};
```

### **Complete API Flow dla Dream Analysis**
```typescript
// 1. INITIALIZATION
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);

// 2. ACCOUNT MANAGEMENT (Prepaid System)
await broker.ledger.addLedger(ethers.parseEther("0.1")); // ~10,000 requests
const account = await broker.ledger.getLedger();
console.log(`Balance: ${ethers.formatEther(account.balance)} OG`);

// 3. SERVICE DISCOVERY
const services = await broker.inference.listService();
const dreamAnalysisProvider = "0xf07240Efa67755B5311bc75784a061eDB47165Dd"; // Llama 3.3

// 4. PROVIDER ACKNOWLEDGMENT (Required!)
await broker.inference.acknowledgeProviderSigner(dreamAnalysisProvider);

// 5. DREAM ANALYSIS WORKFLOW
async function analyzeDream(dreamText: string) {
  // Get service metadata
  const { endpoint, model } = await broker.inference.getServiceMetadata(dreamAnalysisProvider);
  
  // Generate auth headers (SINGLE USE ONLY!)
  const headers = await broker.inference.getRequestHeaders(dreamAnalysisProvider, dreamText);
  
  // Prepare dream analysis prompt
  const psychologyPrompt = `
    Analyze this dream using Jungian and Freudian psychology principles:
    "${dreamText}"
    
    Provide analysis in JSON format:
    {
      "emotions": ["emotion1", "emotion2"],
      "symbols": [{"symbol": "meaning"}],
      "themes": ["theme1", "theme2"], 
      "interpretation": "detailed interpretation",
      "recommendations": ["actionable insight"]
    }
  `;
  
  // Send request to 0G Compute
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      messages: [{ role: "user", content: psychologyPrompt }],
      model: model,
    }),
  });
  
  const data = await response.json();
  const analysis = data.choices[0].message.content;
  
  // 6. RESPONSE VERIFICATION (for TEE services)
  const isValid = await broker.inference.processResponse(
    dreamAnalysisProvider,
    analysis
  );
  
  return { analysis: JSON.parse(analysis), verified: isValid };
}
```

### **Critical Implementation Notes**
```typescript
// ❌ WRONG - Headers are single-use!
const headers = await broker.inference.getRequestHeaders(provider, content);
await makeRequest(headers);
await makeRequest(headers); // Will FAIL!

// ✅ CORRECT - Generate new headers for each request
const headers1 = await broker.inference.getRequestHeaders(provider, content1);
await makeRequest1(headers1);
const headers2 = await broker.inference.getRequestHeaders(provider, content2);
await makeRequest2(headers2);

// 💰 Cost Management
// 0.1 OG ≈ 10,000 requests (very affordable!)
// Fee settlement occurs automatically at scheduled intervals
```

## 💾 **0G Storage SDK** - Dream Data Persistence

### **Network Configuration**
```typescript
// Testnet endpoints
const STORAGE_CONFIG = {
  rpcUrl: "https://evmrpc-testnet.0g.ai/",
  indexerRpc: "https://indexer-storage-testnet-turbo.0g.ai",
  // Contract addresses from Galileo V3
  flowContract: "0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628",
  mineContract: "0x3A0d1d67497Ad770d6f72e7f4B8F0BAbaa2A649C"
};
```

### **File Storage Implementation**
```typescript
import { ZgFile, Indexer, Batcher, KvClient } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

// Initialize once and reuse
const indexer = new Indexer(STORAGE_CONFIG.indexerRpc);
const provider = new ethers.JsonRpcProvider(STORAGE_CONFIG.rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

// Dream Audio Upload
async function uploadDreamAudio(audioBlob: Blob, userId: string) {
  // Create file from blob (browser) or path (Node.js)
  const file = new ZgFile(audioBlob); // Browser
  // const file = await ZgFile.fromFilePath(filePath); // Node.js
  
  // Generate Merkle tree for verification
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null) {
    throw new Error(`Merkle tree error: ${treeErr}`);
  }
  
  const rootHash = tree?.rootHash();
  console.log("Audio Root Hash:", rootHash);
  
  // Upload to 0G Storage
  const [tx, uploadErr] = await indexer.upload(file, STORAGE_CONFIG.rpcUrl, signer);
  if (uploadErr !== null) {
    throw new Error(`Upload error: ${uploadErr}`);
  }
  
  // ALWAYS close file after operations!
  await file.close();
  
  return { rootHash, txHash: tx };
}

// Dream Text Download
async function downloadDreamAudio(rootHash: string, outputPath: string) {
  // withProof = true enables Merkle verification
  const err = await indexer.download(rootHash, outputPath, true);
  if (err !== null) {
    throw new Error(`Download error: ${err}`);
  }
  
  console.log("Dream audio downloaded successfully!");
}
```

### **Key-Value Storage dla Structured Data**
```typescript
// Store dream metadata and analysis results
async function storeDreamData(userId: string, dreamData: any) {
  // Select storage nodes
  const [nodes, err] = await indexer.selectNodes(1);
  if (err !== null) {
    throw new Error(`Node selection error: ${err}`);
  }
  
  // Create batcher for KV operations
  const batcher = new Batcher(1, nodes, STORAGE_CONFIG.flowContract, STORAGE_CONFIG.rpcUrl);
  
  // Prepare key-value pairs
  const dreamKey = `user_${userId}_dream_${Date.now()}`;
  const keyBytes = Uint8Array.from(Buffer.from(dreamKey, 'utf-8'));
  const valueBytes = Uint8Array.from(Buffer.from(JSON.stringify(dreamData), 'utf-8'));
  
  // Set data in stream
  const streamId = "000000000000000000000000000000000000000000000000000000000000f2bd"; // Dream stream
  batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);
  
  // Execute batch operation
  const [tx, batchErr] = await batcher.exec();
  if (batchErr !== null) {
    throw new Error(`Batch execution error: ${batchErr}`);
  }
  
  return { dreamKey, txHash: tx };
}

// Retrieve dream data
async function getDreamData(dreamKey: string) {
  const kvClient = new KvClient("http://3.101.147.150:6789"); // Default KV endpoint
  const streamId = "000000000000000000000000000000000000000000000000000000000000f2bd";
  
  const keyBytes = Uint8Array.from(Buffer.from(dreamKey, 'utf-8'));
  const value = await kvClient.getValue(streamId, ethers.encodeBase64(keyBytes));
  
  return JSON.parse(Buffer.from(ethers.decodeBase64(value), 'base64').toString('utf-8'));
}
```

### **Stream Support dla Real-time Processing**
```typescript
import { Readable } from 'stream';

// Upload dream from stream (useful for real-time processing)
async function uploadDreamStream(dreamText: string) {
  const stream = new Readable();
  stream.push(dreamText);
  stream.push(null);
  
  const file = await ZgFile.fromStream(stream, `dream_${Date.now()}.txt`);
  const [tx, err] = await indexer.upload(file, STORAGE_CONFIG.rpcUrl, signer);
  
  if (err === null) {
    console.log("Dream stream uploaded!");
  }
  
  await file.close();
  return tx;
}

// Download as stream for processing
async function downloadDreamStream(rootHash: string) {
  const stream = await indexer.downloadFileAsStream(rootHash);
  // Process stream data in chunks
  stream.on('data', (chunk) => {
    console.log('Processing dream chunk:', chunk.toString());
  });
}
```

## 🏗️ **Complete Dreamscape Implementation Architecture**

### **Dream Processing Pipeline**
```typescript
class DreamscapeService {
  private broker: any;
  private indexer: Indexer;
  private signer: ethers.Wallet;
  
  constructor() {
    this.initializeServices();
  }
  
  async processDreamWorkflow(audioBlob: Blob, userId: string) {
    try {
      // 1. Upload audio to 0G Storage
      const { rootHash: audioHash } = await this.uploadDreamAudio(audioBlob, userId);
      
      // 2. Transcribe audio (Whisper API - external)
      const dreamText = await this.transcribeAudio(audioBlob);
      
      // 3. Analyze dream using 0G Compute
      const { analysis, verified } = await this.analyzeDream(dreamText);
      
      // 4. Store results in 0G Storage (KV)
      const dreamData = {
        userId,
        timestamp: Date.now(),
        audioHash,
        originalText: dreamText,
        analysis,
        verified,
        mood: analysis.emotions[0] || 'neutral'
      };
      
      const { dreamKey } = await this.storeDreamData(userId, dreamData);
      
      // 5. Update user profile on 0G Chain
      await this.updateUserProfile(userId, dreamKey);
      
      return {
        success: true,
        dreamKey,
        analysis,
        verified
      };
      
    } catch (error) {
      console.error('Dream processing failed:', error);
      throw error;
    }
  }
  
  async getDreamHistory(userId: string, limit: number = 10) {
    // Query KV storage for user's dreams
    // Implementation depends on indexing strategy
  }
}
```

### **Best Practices dla Production**
```typescript
// ✅ Resource Management
const indexer = new Indexer(INDEXER_RPC); // Initialize once, reuse
await file.close(); // Always close files

// ✅ Error Handling
try {
  const result = await indexer.upload(file, RPC_URL, signer);
} catch (error) {
  console.error('Upload failed:', error);
  // Implement retry logic
}

// ✅ Security
// Never expose private keys in browser!
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider); // Server-side only

// ✅ Cost Optimization  
// 0.1 0G ≈ 10,000 AI requests (very affordable!)
// Monitor account balance regularly
const balance = await broker.ledger.getLedger();
if (ethers.formatEther(balance.balance) < "0.01") {
  await broker.ledger.addLedger(ethers.parseEther("0.1"));
}

// ✅ Verification
// Always enable proof verification for sensitive data
await indexer.download(rootHash, outputPath, true); // withProof = true
```

## 🎯 **Implementation Priority dla MVP**

### **Phase 1: Core Dream Flow**
1. ✅ Audio upload via 0G Storage
2. ✅ Dream analysis via 0G Compute (Llama 3.3)
3. ✅ Result storage via 0G KV
4. ✅ Basic user profiles on 0G Chain

### **Phase 2: Advanced Features** 
1. 🔄 Pattern recognition across multiple dreams
2. 🔄 Community sharing (anonymous KV storage)
3. 🔄 TEE verification for premium insights
4. 🔄 Dream NFT minting for special moments

### **Key Success Metrics**
- **Storage Cost**: $10-11/TB (1,500x cheaper than Arweave!)
- **AI Inference**: ~$0.01 per dream analysis
- **Throughput**: 2,500 TPS on Galileo V3
- **Verification**: TEE-backed AI analysis available

**Ready to implement?** Wszystkie API endpoints i integration patterns są gotowe! 🚀