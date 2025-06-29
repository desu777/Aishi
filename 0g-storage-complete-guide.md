# 🔧 0G Storage - Kompletny Przewodnik Użycia (JavaScript)

## 📊 **Przegląd 0G Storage**

### **Co to jest 0G Storage?**
0G Storage is a decentralized data storage system designed to address the challenges of high-throughput and low-latency data storage and retrieval, particularly for areas such as AI. System składa się z dwóch głównych ścieżek:
- **Data Publishing Lane**: Szybkie zatwierdzanie i weryfikacja danych przez blockchain
- **Data Storage Lane**: Zarządzanie dużymi transferami i przechowywaniem z użyciem erasure-coding

### **Kluczowe cechy:**
- General Purpose Design: Supports atomic transactions, mutable key-value stores, and archive log systems, enabling a wide range of applications with various data types.
- Validated Incentivization: Utilizes the PoRA (Proof of Random Access) mining algorithm to mitigate the data outsourcing issue and to ensure rewards are distributed to nodes who contribute to the storage network.

---

## 🚀 **Quick Start - Instalacja SDK**

### **1. Instalacja podstawowych zależności**
```bash
npm install @0glabs/0g-ts-sdk ethers
```

### **2. Konfiguracja dla Galileo Testnet V3**
```javascript
// config.js
const CONFIG = {
  RPC_URL: 'https://evmrpc-testnet.0g.ai/',
  INDEXER_RPC: 'https://indexer-storage-testnet-turbo.0g.ai', // Turbo (szybszy)
  // lub
  // INDEXER_RPC: 'https://indexer-storage-testnet-standard.0g.ai', // Standard (tańszy)
  
  // Contract addresses for Galileo V3
  FLOW_CONTRACT: '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628',
  MINE_CONTRACT: '0x3A0d1d67497Ad770d6f72e7f4B8F0BAbaa2A649C',
  
  // Chain info
  CHAIN_ID: 16601,
  FAUCET_URL: 'https://faucet.0g.ai'
};

module.exports = CONFIG;
```

---

## 📁 **Podstawowe Operacje - Upload & Download**

### **1. Inicjalizacja**
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk'; import { ethers } from 'ethers'; // Initialize provider and signer const provider = new ethers.JsonRpcProvider(RPC_URL); const signer = new ethers.Wallet(PRIVATE_KEY, provider); // Initialize indexer with new syntax const indexer = new Indexer(INDEXER_RPC);

```javascript
// storage.js
const { Indexer, ZgFile } = require('@0glabs/0g-ts-sdk');
const { ethers } = require('ethers');
const CONFIG = require('./config');

class StorageService {
  constructor(privateKey) {
    this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.indexer = new Indexer(CONFIG.INDEXER_RPC);
  }
}
```

### **2. Upload pliku**
// Create ZgFile from file path const zgFile = await ZgFile.fromFilePath(filePath); const [tree, treeErr] = await zgFile.merkleTree(); // Upload file with new API syntax const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer); // Get file identifier and transaction hash const rootHash = tree?.rootHash(); const transactionHash = tx;

```javascript
async uploadFile(filePath) {
  try {
    // Tworzenie obiektu pliku
    const file = await ZgFile.fromFilePath(filePath);
    
    // Generowanie Merkle tree (dla weryfikacji)
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) {
      throw new Error(`Merkle tree error: ${treeErr}`);
    }
    
    console.log("File Root Hash:", tree.rootHash());
    
    // Upload do sieci 0G
    const [tx, uploadErr] = await this.indexer.upload(
      file, 
      CONFIG.RPC_URL, 
      this.signer
    );
    
    if (uploadErr !== null) {
      throw new Error(`Upload error: ${uploadErr}`);
    }
    
    // WAŻNE: Zawsze zamknij plik!
    await file.close();
    
    return {
      success: true,
      rootHash: tree.rootHash(),
      transactionHash: tx,
      message: "File uploaded successfully!"
    };
    
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
```

### **3. Download pliku**
err = await indexer.download(<root_hash>, <output_file>, <with_proof>); if (err !== null) { console.log("Error downloading file: ", err); }

```javascript
async downloadFile(rootHash, outputPath, verifyProof = true) {
  try {
    // Download z opcjonalną weryfikacją Merkle proof
    const err = await this.indexer.download(
      rootHash, 
      outputPath, 
      verifyProof // true = weryfikuj integralność
    );
    
    if (err !== null) {
      throw new Error(`Download error: ${err}`);
    }
    
    console.log(`File downloaded successfully to: ${outputPath}`);
    return { success: true, path: outputPath };
    
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
```

---

## 💾 **Praca z różnymi typami danych**

### **1. Upload z Buffer (np. dla audio z przeglądarki)**
```javascript
async uploadFromBuffer(buffer, filename) {
  try {
    // Tworzenie ZgFile z Buffer
    const file = new ZgFile(buffer, filename);
    
    // Reszta jak wyżej
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) throw new Error(treeErr);
    
    const [tx, uploadErr] = await this.indexer.upload(
      file,
      CONFIG.RPC_URL,
      this.signer
    );
    
    if (uploadErr !== null) throw new Error(uploadErr);
    
    await file.close();
    
    return {
      rootHash: tree.rootHash(),
      tx: tx,
      size: buffer.length,
      estimatedCost: this.calculateCost(buffer.length)
    };
    
  } catch (error) {
    throw error;
  }
}

// Helper do kalkulacji kosztów
calculateCost(bytes) {
  const TB = 1024 * 1024 * 1024 * 1024;
  const costPerTB = 11; // $11 per TB
  return (bytes / TB) * costPerTB;
}
```

### **2. Upload JSON (metadata)**
```javascript
async uploadJSON(jsonData) {
  try {
    // Konwertuj JSON na string, potem na Buffer
    const jsonString = JSON.stringify(jsonData);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    // Użyj filename z .json extension
    const filename = `metadata_${Date.now()}.json`;
    
    return await this.uploadFromBuffer(buffer, filename);
    
  } catch (error) {
    throw error;
  }
}
```

### **3. Download i parse JSON**
```javascript
async downloadJSON(rootHash) {
  try {
    // Download do tymczasowego pliku
    const tempPath = `/tmp/temp_${Date.now()}.json`;
    await this.downloadFile(rootHash, tempPath, true);
    
    // Odczytaj i sparsuj
    const fs = require('fs');
    const jsonContent = fs.readFileSync(tempPath, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    // Cleanup
    fs.unlinkSync(tempPath);
    
    return data;
    
  } catch (error) {
    throw error;
  }
}
```

---

## 🔑 **Key-Value Storage (dla metadanych)**

The log system is addressed at the level of fixed-size sectors, where each sector stores 256 B of data.

### **1. Inicjalizacja KV Storage**
```javascript
const { Batcher, KvClient } = require('@0glabs/0g-ts-sdk');

class KVStorageService {
  constructor(signer) {
    this.signer = signer;
    this.kvClient = new KvClient("http://3.101.147.150:6789"); // Default KV endpoint
    this.streamId = "000000000000000000000000000000000000000000000000000000000000f2bd";
  }
  
  async setData(key, value) {
    try {
      // Wybierz storage nodes
      const [nodes, err] = await this.indexer.selectNodes(1);
      if (err !== null) throw new Error(err);
      
      // Stwórz batcher
      const batcher = new Batcher(1, nodes, CONFIG.FLOW_CONTRACT, CONFIG.RPC_URL);
      
      // Przygotuj dane
      const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
      const valueBytes = Uint8Array.from(Buffer.from(JSON.stringify(value), 'utf-8'));
      
      // Ustaw dane w stream
      batcher.streamDataBuilder.set(this.streamId, keyBytes, valueBytes);
      
      // Wykonaj batch operation
      const [tx, batchErr] = await batcher.exec();
      if (batchErr !== null) throw new Error(batchErr);
      
      return { success: true, tx };
      
    } catch (error) {
      throw error;
    }
  }
  
  async getData(key) {
    try {
      const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
      const value = await this.kvClient.getValue(
        this.streamId, 
        ethers.encodeBase64(keyBytes)
      );
      
      return JSON.parse(
        Buffer.from(ethers.decodeBase64(value), 'base64').toString('utf-8')
      );
      
    } catch (error) {
      throw error;
    }
  }
}
```

---

## 🎯 **Praktyczny przykład - Dream Storage dla Dreamscape**

```javascript
// dreamStorage.js - Kompletny serwis dla Dreamscape
class DreamStorageService {
  constructor(privateKey) {
    this.storage = new StorageService(privateKey);
    this.kv = new KVStorageService(this.storage.signer);
  }
  
  async uploadDream(audioBuffer, userId) {
    try {
      console.log("🎙️ Uploading dream audio...");
      
      // 1. Upload audio
      const audioResult = await this.storage.uploadFromBuffer(
        audioBuffer,
        `dream_audio_${Date.now()}.webm`
      );
      
      console.log(`✅ Audio uploaded: ${audioResult.rootHash}`);
      console.log(`💰 Storage cost: $${audioResult.estimatedCost.toFixed(6)}`);
      
      // 2. Create metadata
      const metadata = {
        userId,
        timestamp: Date.now(),
        audioHash: audioResult.rootHash,
        audioSize: audioResult.size,
        format: 'webm',
        uploadTx: audioResult.tx
      };
      
      // 3. Upload metadata
      console.log("📄 Uploading metadata...");
      const metaResult = await this.storage.uploadJSON(metadata);
      
      // 4. Store reference in KV for quick access
      const dreamId = `dream_${metadata.timestamp}`;
      await this.kv.setData(`user_${userId}_${dreamId}`, {
        dreamId,
        audioHash: audioResult.rootHash,
        metadataHash: metaResult.rootHash,
        timestamp: metadata.timestamp
      });
      
      console.log("✨ Dream uploaded successfully!");
      
      return {
        success: true,
        dreamId,
        audioHash: audioResult.rootHash,
        metadataHash: metaResult.rootHash,
        totalCost: audioResult.estimatedCost + metaResult.estimatedCost
      };
      
    } catch (error) {
      console.error("❌ Dream upload failed:", error);
      throw error;
    }
  }
  
  async getDream(userId, dreamId) {
    try {
      // 1. Get reference from KV
      const dreamRef = await this.kv.getData(`user_${userId}_${dreamId}`);
      
      // 2. Download metadata
      const metadata = await this.storage.downloadJSON(dreamRef.metadataHash);
      
      // 3. Return complete dream info
      return {
        dreamId,
        metadata,
        audioHash: dreamRef.audioHash,
        downloadUrl: `/api/dreams/audio/${dreamRef.audioHash}`
      };
      
    } catch (error) {
      console.error("❌ Failed to get dream:", error);
      throw error;
    }
  }
  
  async listUserDreams(userId, limit = 10) {
    // Implementation depends on your KV storage strategy
    // Could store a list of dreamIds per user
    try {
      const dreamList = await this.kv.getData(`user_${userId}_dreams`);
      return dreamList.slice(0, limit);
    } catch (error) {
      return []; // No dreams yet
    }
  }
}

// Użycie
const dreamService = new DreamStorageService(process.env.PRIVATE_KEY);

// Upload dream
const audioBuffer = Buffer.from(audioData); // z nagrania
const result = await dreamService.uploadDream(audioBuffer, "user123");

// Get dream
const dream = await dreamService.getDream("user123", result.dreamId);
```

---

## 🛠️ **Best Practices**

### **1. Zarządzanie zasobami**
```javascript
// ✅ ZAWSZE zamykaj pliki
const file = await ZgFile.fromFilePath(path);
try {
  // operacje
} finally {
  await file.close();
}

// ✅ Reużywaj Indexer instance
class StorageManager {
  constructor() {
    this.indexer = new Indexer(INDEXER_RPC); // Tylko raz!
  }
}
```

### **2. Error handling**
```javascript
// ✅ Sprawdzaj każdy error
const [result, error] = await someOperation();
if (error !== null) {
  console.error("Operation failed:", error);
  // Handle appropriately
}

// ✅ Retry logic dla network errors
async uploadWithRetry(file, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await this.upload(file);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}
```

### **3. Optymalizacja kosztów**
```javascript
// ✅ Batch small files
async batchUpload(files) {
  const archive = await createArchive(files); // zip/tar
  return await this.uploadFile(archive);
}

// ✅ Compress przed upload
const compressed = await compressAudio(audioBuffer);
const result = await storage.uploadFromBuffer(compressed);
```

---

## 📊 **Storage Nodes - Jak to działa?**

### **Architektura sieci**
- storage systems play a critical role in managing, organizing, and ensuring the accessibility of data in traditional systems, data is often stored centrally, creating risks around availability, censorship, and data loss due to single points of failure decentralized storage, on the other hand, addresses these issues by distributing data across a network of nodes, enhancing security, resilience, and scalability

### **Wymagania sprzętowe dla Storage Node**
component storage node memory 32 gb ram cpu 8 cores disk 500gb / 1tb nvme ssd bandwidth 100 mbps (download / upload)

### **Proof of Random Access (PoRA)**
- The mining process of 0G Storage requires to prove data accessibility to random challenge queries. To maximize the competitive edge of SSD storage, the challenge queries are set to the level of 256 KB chunks
- Nodes muszą udowodnić że rzeczywiście przechowują dane
- Nagrody za utrzymywanie dostępności

---

## 🚀 **Quick Start Examples**

### **1. Prosty upload script**
```javascript
// upload-file.js
const { StorageService } = require('./storage');

async function main() {
  const storage = new StorageService(process.env.PRIVATE_KEY);
  
  const result = await storage.uploadFile('./my-file.pdf');
  console.log("Upload successful!");
  console.log("Root Hash:", result.rootHash);
  console.log("Transaction:", result.transactionHash);
}

main().catch(console.error);
```

### **2. Express.js endpoint**
```javascript
// routes/upload.js
const multer = require('multer');
const upload = multer({ memory: true });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const result = await storage.uploadFromBuffer(
      req.file.buffer,
      req.file.originalname
    );
    
    res.json({
      success: true,
      rootHash: result.rootHash,
      cost: result.estimatedCost
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **3. React upload component**
```javascript
// FileUpload.jsx
function FileUpload() {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('Uploaded:', result.rootHash);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <input 
      type="file" 
      onChange={(e) => handleUpload(e.target.files[0])}
      disabled={uploading}
    />
  );
}
```

---

## 🎯 **Podsumowanie**

**0G Storage oferuje:**
- ✅ **Dowolny format plików** - audio, video, JSON, binary
- ✅ **1,500x tańsze** niż tradycyjne rozwiązania ($11/TB)
- ✅ **Decentralizowane** ale niezawodne (PoRA incentives)
- ✅ **Proste API** - upload/download w kilku liniach kodu
- ✅ **Weryfikowalne** - Merkle proofs dla integralności

**Idealne dla:**
- 🎙️ Aplikacji audio/video (jak Dreamscape)
- 📄 Przechowywania dokumentów
- 🎮 Game assets
- 🤖 AI training data
- 💾 Backup systems

**Zacznij od:**
1. Zainstaluj SDK: `npm install @0glabs/0g-ts-sdk ethers`
2. Pobierz tokeny z faucet: https://faucet.0g.ai
3. Użyj przykładowego kodu powyżej
4. Build amazing decentralized apps! 🚀