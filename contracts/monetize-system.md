# 💰 Dreamscape Monetization & Intelligence System

## 🎯 **Obecny Stan (Testing)**
Aktualnie w `DreamAgentNFTv2.sol`:
- `intelligenceLevel` startuje od 1
- +1 poziom co 3 sny (`dreamCount % 3 == 0`)
- +1 poziom co 10 rozmów (`conversationCount % 10 == 0`)
- **Status:** Do testów, do replacement w przyszłości

## 🚀 **Docelowy System (Production)**

### **Poziomy 1-5: Automatyczna Progresja (Free)**
```javascript
// Frontend Logic (Off-chain)
function getBasicLevel(dreamCount) {
    if (dreamCount >= 35) return 5; // Dream Master
    if (dreamCount >= 20) return 4; // Advanced Guide  
    if (dreamCount >= 10) return 3; // Developing Analyst
    if (dreamCount >= 5) return 2;  // Learning Assistant
    return 1; // Novice Helper
}
```

**Różnice między poziomami:**
- **Level 1:** Ostatnie 2 sny + 2 rozmowy do kontekstu AI
- **Level 2:** Ostatnie 5 snów + 5 rozmów do kontekstu AI
- **Level 3:** Ostatnie 8 snów + 8 rozmów do kontekstu AI
- **Level 4:** Ostatnie 10 snów + 10 rozmów + advanced features
- **Level 5:** Ostatnie 15 snów + 15 rozmów + lucid dream coaching

### **Poziomy 6-7: Premium (Token-Gated)**

#### **Smart Contract Implementation:**
```solidity
// Dodać do DreamAgentNFTv2.sol
import "./interfaces/IERC20.sol";

contract DreamAgentNFTv2 {
    IERC20 public dreamToken; // $DREAM token contract
    
    constructor(address _verifier, address _treasury, address _dreamToken) {
        // ...
        dreamToken = IERC20(_dreamToken);
    }
    
    /// @notice Get agent's full intelligence level (1-7)
    /// @param tokenId Agent to check
    /// @return level Intelligence level including premium tiers
    function getIntelligenceLevel(uint256 tokenId) external view returns (uint8 level) {
        address owner = agents[tokenId].owner;
        uint256 dreamBalance = dreamToken.balanceOf(owner);
        
        // Premium Levels (Token-Gated)
        if (dreamBalance >= 1000 * 10**18) return 7; // Dream Architect ($1000 worth)
        if (dreamBalance >= 500 * 10**18) return 6;  // Dream Oracle ($500 worth)
        
        // Free Levels (Dream-Based)
        uint256 dreams = agents[tokenId].dreamCount;
        if (dreams >= 35) return 5; // Dream Master
        if (dreams >= 20) return 4; // Advanced Guide
        if (dreams >= 10) return 3; // Developing Analyst
        if (dreams >= 5) return 2;  // Learning Assistant
        return 1; // Novice Helper
    }
    
    /// @notice Check if user has premium access
    /// @param user User address to check
    /// @return hasPremium True if user holds enough tokens
    function hasPremiumAccess(address user) external view returns (bool hasPremium) {
        return dreamToken.balanceOf(user) >= 500 * 10**18;
    }
}
```

## 💎 **Premium Features Implementation**

### **Level 6: Dream Oracle ($500 DREAM)**
```javascript
// Premium Features
const oracleFeatures = {
    memoryContext: 20, // Last 20 dreams + conversations
    predictionWindow: 7, // 7-day future forecasting
    processingPriority: 'premium', // 50% faster
    symbolDatabase: 5000, // Extended symbol access
    advancedAnalytics: true,
    emailSummaries: true,
    exclusiveForum: true
};
```

### **Level 7: Dream Architect ($1000 DREAM)**
```javascript
// VIP Features
const architectFeatures = {
    memoryContext: 'unlimited', // Complete history
    predictionWindow: 30, // 30-day life planning
    processingPriority: 'instant', // Zero wait time
    symbolDatabase: 'unlimited',
    dreamVisualization: true, // AI-generated artwork
    apiAccess: true,
    customTraining: true, // Personalized AI
    lifePlanningSessions: true // Monthly coaching
};
```

## 🔧 **Implementation Roadmap**

### **Phase 1: Testing (Current)**
- [x] Basic `intelligenceLevel` w kontrakcie
- [x] Simple progression every 3 dreams
- [x] Events dla level up

### **Phase 2: Enhanced Free Tiers**
- [ ] Frontend logic dla poziomów 1-5
- [ ] Context management based on level
- [ ] Progressive AI capabilities
- [ ] Remove hardcoded `intelligenceLevel` z kontraktu

### **Phase 3: Token Integration**
- [ ] Deploy $DREAM ERC20 token
- [ ] Add `dreamToken` address do kontraktu
- [ ] Implement `getIntelligenceLevel()` function
- [ ] Real-time balance checking

### **Phase 4: Premium Features**
- [ ] Priority processing queue
- [ ] Extended memory context
- [ ] Advanced prediction algorithms
- [ ] Dream visualization (AI art)
- [ ] API access for Level 7

### **Phase 5: Advanced Monetization**
- [ ] Staking rewards for token holders
- [ ] NFT marketplace for rare symbols
- [ ] Community governance voting
- [ ] Revenue sharing model

## 📊 **Token Economics**

### **$DREAM Token Utility**
- **Access Control:** Premium level gating (Level 6-7)
- **Governance:** Vote on new features, symbols, AI prompts
- **Staking:** Lock tokens for additional benefits
- **Marketplace:** Trade rare symbols, dream interpretations
- **Revenue Share:** Token holders get % of platform fees

### **Pricing Strategy**
- **Level 6 Oracle:** 500 $DREAM (~$500 przy $1/token)
- **Level 7 Architect:** 1000 $DREAM (~$1000 przy $1/token)
- **Dynamic Pricing:** Token value może rosnąć z adoption

### **Revenue Streams**
1. **Premium Subscriptions:** Level 6-7 access fees
2. **Transaction Fees:** Small fee za każdy dream processing
3. **NFT Marketplace:** Commission z trading
4. **API Access:** Enterprise integrations
5. **Custom Training:** Personalized AI models

## 🎮 **Gamification Elements**

### **Achievement System**
```solidity
// Możliwe rozszerzenie kontraktu
mapping(uint256 => string[]) public achievements;
mapping(uint256 => uint256) public streakCount;

// Achievements examples:
// "first_dream", "week_streak", "month_streak", "empathy_master", 
// "creative_genius", "logic_lord", "spiritual_guide", "dream_architect"
```

### **Streak Bonuses**
- **Daily Dreams:** Bonus za codzienne nagrywanie snów
- **Weekly Goals:** Additional AI insights for consistency
- **Monthly Challenges:** Special NFT rewards

### **Community Features**
- **Leaderboards:** Anonymous ranking by insights gained
- **Rare Symbols:** Unlock exclusive symbols through progression
- **Dream Sharing:** Share interesting dreams with community (anonymous)

## 🚨 **Security Considerations**

### **Token Security**
- **Balance Checking:** Real-time verification before premium features
- **Degradation:** Premium access lost if balance drops
- **Grandfathering:** Some features permanent after 6 months
- **Anti-whale:** Prevent single holder dominating governance

### **Smart Contract Security**
- **Reentrancy:** Already protected with ReentrancyGuard
- **Access Control:** Role-based permissions implemented
- **Upgradability:** Consider proxy pattern for future token integration

## 🔮 **Future Enhancements**

### **Cross-Chain Integration**
- Multi-chain token support (Ethereum, Polygon, BSC)
- Bridge dla $DREAM tokens
- Gas optimization dla różnych chains

### **AI Marketplace**
- Custom AI personality models
- Community-created dream symbols
- AI response style trading

### **Enterprise Features**
- Bulk agent management
- Team dream analysis
- Corporate wellness programs
- API dla third-party integrations

---

## 📝 **Implementation Notes**

### **Doors.md Variables**
```bash
# Add to doors.md for token integration
DREAM_TOKEN_ADDRESS=0x...
TOKEN_PRICE_USD=1.00
PREMIUM_ORACLE_THRESHOLD=500
PREMIUM_ARCHITECT_THRESHOLD=1000
```

### **Contract Changes Required**
1. Add `dreamToken` address to constructor
2. Import IERC20 interface
3. Implement `getIntelligenceLevel()` function
4. Add premium access modifiers
5. Update events for premium features

### **Frontend Integration**
```javascript
// Check user's level
const level = await contract.getIntelligenceLevel(tokenId);
const isPremium = await contract.hasPremiumAccess(userAddress);

// Adjust AI context based on level
const contextLimit = getContextLimit(level);
const dreams = await contract.getDreamHistory(tokenId, contextLimit);
```

**Status:** 📋 Planning Phase - Ready for Implementation
**Priority:** 🎯 Medium (After MVP testing)
**Estimated Effort:** 🔧 2-3 weeks development 