# 🔄 **iNFT Agent - Wizualny Flow Diagram**

## **📊 Główny Przepływ Danych**

```mermaid
graph TD
    A[👤 User submits dream] --> B[🔍 Check agent ownership]
    B --> C[📚 Get agent history from 0G Storage]
    C --> D[🧠 Build evolutionary prompt with context]
    D --> E[⚡ 0G Compute AI analysis]
    E --> F[📝 Store dream + analysis in 0G Storage]
    F --> G[🔗 Update NFT contract with new hashes]
    G --> H{🎯 Dream count % 5 == 0?}
    H -->|Yes| I[🎉 Agent evolves to higher level]
    H -->|No| J[📊 Return enriched analysis]
    I --> K[💾 Agent memory updated for next dream]
    J --> K
    K --> L[🔄 Ready for next dream]
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
    style K fill:#fff3e0
    style L fill:#f3e5f5
```

## **🏗️ Architektura Systemu**

```mermaid
graph TB
    subgraph "🎮 User Interface"
        UI[React Frontend]
        Mobile[Mobile App]
    end
    
    subgraph "🔧 Backend Services"
        API[Express API Server]
        Agent[iNFT Agent Service]
        Storage[Storage Service]
        Compute[Compute Service]
        Fee[Fee Calculation Service]
    end
    
    subgraph "⛓️ Blockchain Layer"
        NFT[DreamAgentNFT Contract]
        Verifier[SimpleDreamVerifier]
        Wallet[User Wallet]
    end
    
    subgraph "🌐 0G Network"
        OGStorage[0G Storage Network]
        OGCompute[0G Compute Network]
    end
    
    UI --> API
    Mobile --> API
    API --> Agent
    Agent --> Storage
    Agent --> Compute
    Agent --> Fee
    Agent --> NFT
    NFT --> Verifier
    Storage --> OGStorage
    Compute --> OGCompute
    Wallet --> NFT
    
    style Agent fill:#ff9800
    style NFT fill:#4caf50
    style OGStorage fill:#2196f3
    style OGCompute fill:#9c27b0
```

## **🧠 Agent Evolution Timeline**

```mermaid
timeline
    title Agent Intelligence Evolution
    
    Level 1 : Dreams 0-4
           : Novice Helper
           : Basic dream interpretation
           : General emotional recognition
           
    Level 2 : Dreams 5-9  
           : Learning Assistant
           : Pattern recognition between dreams
           : Simple emotional progression
           
    Level 3 : Dreams 10-14
           : Developing Analyst  
           : Long-term trend analysis
           : Personalized techniques
           : Life-dream correlations
           
    Level 4 : Dreams 15-19
           : Advanced Guide
           : Deep psychological insights
           : Pattern prediction
           : Advanced lucid dreaming
           
    Level 5 : Dreams 20+
           : Master Interpreter
           : Holistic personal development
           : Therapeutic integration
           : Spiritual mentoring
```

## **💾 Data Storage Structure**

```mermaid
graph LR
    subgraph "🏠 Agent Core"
        P[Personality.json]
        PT[Patterns.json]  
        E[Emotions.json]
    end
    
    subgraph "📚 Dream History"
        D1[Dream_001.json]
        D2[Dream_002.json]
        DN[Dream_N.json]
    end
    
    subgraph "🔍 Analysis History"
        A1[Analysis_001.json]
        A2[Analysis_002.json]
        AN[Analysis_N.json]
    end
    
    subgraph "⛓️ NFT Contract"
        T[Token ID]
        O[Owner Address]
        L[Intelligence Level]
        C[Dream Count]
        H[Data Hashes]
    end
    
    P --> H
    PT --> H
    E --> H
    D1 --> A1
    D2 --> A2
    DN --> AN
    H --> T
    
    style P fill:#ffecb3
    style PT fill:#c8e6c9
    style E fill:#f8bbd9
    style T fill:#b39ddb
```

## **🔄 Processing Cycle Detail**

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant A as 🧠 Agent Service
    participant S as 💾 0G Storage
    participant C as ⚡ 0G Compute
    participant N as ⛓️ NFT Contract
    participant W as 👛 Wallet
    
    Note over U,W: New Dream Processing Cycle
    
    U->>A: Submit dream text
    A->>N: Get current agent state
    N-->>A: Return: level=2, dreams=7
    
    A->>S: Download agent history
    S-->>A: Return last 5 dreams + analyses
    
    A->>A: Build evolutionary prompt<br/>with full context
    
    A->>C: Send personalized prompt
    C-->>A: Return enhanced analysis
    
    A->>S: Upload dream data
    S-->>A: Return dream hash
    
    A->>S: Upload analysis data  
    S-->>A: Return analysis hash
    
    A->>N: Update agent with new hashes
    N->>N: Increment dream count (7→8)
    N->>N: Check evolution: 8%5≠0 (no evolution)
    N-->>A: Return updated state
    
    A-->>U: Return personalized analysis<br/>+ evolution status
    
    rect rgb(200, 255, 200)
        Note over U,W: Evolution happens every 5 dreams
        alt Dream count % 5 == 0
            N->>N: Intelligence Level++ 
            N->>N: Emit AgentEvolved event
        end
    end
```

## **💰 Cost & Payment Flow**

```mermaid
graph TD
    subgraph "💳 Payment Model"
        U[User Wallet] 
        B[Backend Wallet]
    end
    
    subgraph "💰 Costs"
        UC[User Costs]
        BC[Backend Costs]
    end
    
    subgraph "⛓️ Operations"
        M[Mint Agent NFT]
        UP[Update NFT]
        ST[0G Storage]
        CO[0G Compute]
    end
    
    U -->|Gas Fee| M
    U -->|Gas Fee| UP
    B -->|Storage Fee| ST
    B -->|Compute Fee| CO
    
    UC --> M
    UC --> UP
    BC --> ST
    BC --> CO
    
    style U fill:#4caf50
    style B fill:#ff9800
    style UC fill:#ffcdd2
    style BC fill:#c8e6c9
```

## **🚀 Future Ecosystem**

```mermaid
mindmap
  root((iNFT Agent<br/>Ecosystem))
    Agent Marketplace
      Buy/Sell Intelligent Agents
      Intelligence Level = Value
      Reviews & Ratings
      Specialized Agent Types
    
    Collaboration Features
      Agent-to-Agent Communication
      Shared Pattern Learning
      Cross-Agent Insights
      Community Intelligence
    
    Professional Integration
      Therapist Dashboard
      Clinical Dream Analysis
      Research Data Export
      HIPAA Compliance
    
    Creative Tools
      Dream-to-Art Generation
      Story Creation from Dreams
      Music Composition
      VR Dream Recreation
    
    Advanced AI
      Custom Dream Models
      Multi-language Support
      Emotional Intelligence
      Predictive Analysis
```

## **📊 Technical Specifications**

### **Smart Contracts**
- **DreamAgentNFT.sol**: Main agent NFT contract
- **SimpleDreamVerifier.sol**: Proof verification (testnet version)
- **Network**: 0G Galileo Testnet
- **Evolution**: Automatic every 5 dreams

### **0G Network Integration** 
- **Storage**: JSON data for dreams, analyses, agent intelligence
- **Compute**: LLAMA3-8B-Instruct for AI analysis
- **Fees**: Dynamic pricing with gas optimization
- **Network**: Standard/Turbo options

### **API Endpoints**
```
POST /api/agent/create                    # Create new agent
GET  /api/agent/info/:tokenId            # Get agent info
GET  /api/agent/user/:userAddress        # Check user's agent
POST /api/agent/:tokenId/dream           # Process dream
GET  /api/agent/:tokenId/history         # Dream history
GET  /api/agent/stats                    # Contract statistics
```

### **Data Flow Optimization**
- **Caching**: Agent history cached for 1 hour
- **Batch Processing**: Multiple dreams can be processed together
- **Parallel Uploads**: Dream and analysis stored simultaneously
- **Fee Optimization**: Dynamic gas pricing for best costs

---

*Flow Diagram v1.0 - December 2024*
*Optimized for 0G Galileo Testnet* 