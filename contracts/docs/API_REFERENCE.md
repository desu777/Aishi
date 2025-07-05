# 🔗 Dreamscape iNFT API Reference

## Overview

This document provides a complete API reference for interacting with Dreamscape's evolving personality iNFT system. The system includes smart contracts, data structures, and integration examples.

## 📋 Table of Contents

1. [Smart Contract Functions](#smart-contract-functions)
2. [Data Structures](#data-structures)
3. [Events](#events)
4. [Integration Examples](#integration-examples)
5. [Error Codes](#error-codes)

---

## 🔧 Smart Contract Functions

### Core Agent Management

#### `mintWithPersonality(proofs, descriptions, agentName, to, initialPersonality)`

Mint a new dream agent with initial personality traits.

**Parameters:**
- `proofs`: `bytes[]` - Ownership proofs for initial data
- `descriptions`: `string[]` - Data type descriptions
- `agentName`: `string` - Unique name for the agent (max 32 chars)
- `to`: `address` - Address to mint agent for
- `initialPersonality`: `PersonalityTraits` - Starting personality traits

**Returns:**
- `tokenId`: `uint256` - The newly minted agent token ID

**Example:**
```javascript
const initialPersonality = {
  creativity: 50,
  analytical: 40,
  empathy: 60,
  intuition: 45,
  resilience: 35,
  curiosity: 55,
  dominantMood: "curious",
  lastDreamDate: 0
};

const tx = await dreamAgentContract.mintWithPersonality(
  [], // proofs
  ["initial_personality"], // descriptions
  "MyDreamAgent", // agent name
  userAddress, // to
  initialPersonality, // initial personality
  { value: ethers.parseEther("0.1") } // minting fee
);
```

#### `ownerOf(tokenId)`

Get the owner of an agent.

**Parameters:**
- `tokenId`: `uint256` - Agent token ID

**Returns:**
- `owner`: `address` - Current owner address

### Personality Evolution

#### `processDailyDream(tokenId, dreamHash, dreamAnalysisHash, impact)`

Process a daily dream and evolve agent personality.

**Parameters:**
- `tokenId`: `uint256` - Agent to evolve
- `dreamHash`: `bytes32` - 0G Storage hash of encrypted dream data
- `dreamAnalysisHash`: `bytes32` - 0G Storage hash of AI analysis
- `impact`: `PersonalityImpact` - Personality changes from dream analysis

**Example:**
```javascript
const personalityImpact = {
  creativityChange: 5,
  analyticalChange: -2,
  empathyChange: 8,
  intuitionChange: 3,
  resilienceChange: 1,
  curiosityChange: 4,
  moodShift: "peaceful",
  evolutionWeight: 75
};

await dreamAgentContract.processDailyDream(
  tokenId,
  dreamStorageHash,
  analysisStorageHash,
  personalityImpact
);
```

#### `recordConversation(tokenId, conversationHash, contextType)`

Record a conversation without personality evolution.

**Parameters:**
- `tokenId`: `uint256` - Agent having conversation
- `conversationHash`: `bytes32` - 0G Storage hash of conversation data
- `contextType`: `ContextType` - Type of conversation

**Context Types:**
- `0`: `DREAM_DISCUSSION` - Discussing previous dreams
- `1`: `GENERAL_CHAT` - General conversation
- `2`: `PERSONALITY_QUERY` - Asking about personality/traits
- `3`: `THERAPEUTIC` - Therapeutic conversation
- `4`: `ADVICE_SEEKING` - Seeking advice/guidance

**Example:**
```javascript
await dreamAgentContract.recordConversation(
  tokenId,
  conversationStorageHash,
  1 // GENERAL_CHAT
);
```

### Personality Queries

#### `getPersonalityTraits(tokenId)`

Get agent's current personality traits.

**Returns:**
- `traits`: `PersonalityTraits` - Current personality traits

**Example:**
```javascript
const personality = await dreamAgentContract.getPersonalityTraits(tokenId);
console.log("Creativity:", personality.creativity);
console.log("Empathy:", personality.empathy);
console.log("Mood:", personality.dominantMood);
```

#### `getDominantTraits(tokenId)`

Get agent's top 3 personality traits.

**Returns:**
- `traits`: `string[]` - Array of trait names
- `values`: `uint8[]` - Array of trait values

**Example:**
```javascript
const [traitNames, traitValues] = await dreamAgentContract.getDominantTraits(tokenId);
// traitNames: ["empathy", "creativity", "curiosity"]
// traitValues: [85, 72, 68]
```

#### `getResponseStyle(tokenId)`

Get agent's response style based on personality.

**Returns:**
- `style`: `string` - Response style description
- `primaryTrait`: `string` - Most dominant trait

**Response Styles:**
- `"empathetic"` - Warm, supportive responses
- `"creative"` - Imaginative, metaphorical responses
- `"analytical"` - Logical, detailed responses
- `"intuitive"` - Wise, spiritual responses
- `"empathetic_creative"` - Combined style
- `"balanced"` - No dominant traits

#### `calculatePersonalityRarity(tokenId)`

Calculate personality rarity score.

**Returns:**
- `rarityScore`: `uint256` - Rarity score (higher = rarer)

#### `calculateCompatibility(agentA, agentB)`

Calculate compatibility between two agents.

**Returns:**
- `compatibilityScore`: `uint256` - Compatibility score (0-100)

### History and Analytics

#### `getDreamHistory(tokenId, limit)`

Get agent's dream history hashes.

**Parameters:**
- `limit`: `uint256` - Max dreams to return (0 = all)

**Returns:**
- `dreamHashes`: `bytes32[]` - Array of dream storage hashes

#### `getConversationHistory(tokenId, limit)`

Get agent's conversation history hashes.

**Parameters:**
- `limit`: `uint256` - Max conversations to return (0 = all)

**Returns:**
- `conversationHashes`: `bytes32[]` - Array of conversation storage hashes

#### `getEvolutionStats(tokenId)`

Get personality evolution statistics.

**Returns:**
- `totalEvolutions`: `uint256` - Number of personality changes
- `evolutionRate`: `uint256` - Rate of change (per 100 days)
- `lastEvolution`: `uint256` - Timestamp of last evolution

#### `getTraitEvolution(tokenId, traitName, limit)`

Get trait evolution history.

**Parameters:**
- `traitName`: `string` - Trait to track ("creativity", "empathy", etc.)
- `limit`: `uint256` - Max history entries (0 = all)

**Returns:**
- `timestamps`: `uint256[]` - Evolution timestamps
- `values`: `uint8[]` - Trait values at each timestamp

#### `hasMilestone(tokenId, milestone)`

Check if agent has reached a specific milestone.

**Parameters:**
- `milestone`: `string` - Milestone name

**Milestone Names:**
- `"empathy_master"` - Empathy > 85
- `"creative_genius"` - Creativity > 90
- `"logic_lord"` - Analytical > 90
- `"spiritual_guide"` - Intuition > 90
- `"balanced_soul"` - All traits > 60

**Returns:**
- `achieved`: `bool` - True if milestone achieved
- `achievedAt`: `uint256` - Timestamp when achieved

### Utility Functions

#### `canProcessDreamToday(tokenId)`

Check if agent can process a dream today (24h cooldown).

**Returns:**
- `canProcess`: `bool` - True if agent can process a dream

#### `findAgentsByTrait(traitName, minValue, maxValue, offset, limit)`

Find agents with specific trait ranges.

**Parameters:**
- `traitName`: `string` - Trait to filter by
- `minValue`: `uint8` - Minimum trait value (inclusive)
- `maxValue`: `uint8` - Maximum trait value (inclusive)
- `offset`: `uint256` - Pagination offset
- `limit`: `uint256` - Maximum results to return

**Returns:**
- `tokenIds`: `uint256[]` - Array of matching agent IDs

---

## 📊 Data Structures

### PersonalityTraits

```solidity
struct PersonalityTraits {
    uint8 creativity;      // 0-100: Innovation and imagination
    uint8 analytical;      // 0-100: Logic and problem-solving
    uint8 empathy;         // 0-100: Emotional understanding
    uint8 intuition;       // 0-100: Gut feelings and insights
    uint8 resilience;      // 0-100: Stress handling and recovery
    uint8 curiosity;       // 0-100: Learning desire and exploration
    string dominantMood;   // Current emotional state
    uint256 lastDreamDate; // Timestamp of last dream processing
}
```

### PersonalityImpact

```solidity
struct PersonalityImpact {
    int8 creativityChange;     // -10 to +10 change
    int8 analyticalChange;     // -10 to +10 change
    int8 empathyChange;        // -10 to +10 change
    int8 intuitionChange;      // -10 to +10 change
    int8 resilienceChange;     // -10 to +10 change
    int8 curiosityChange;      // -10 to +10 change
    string moodShift;          // New dominant mood
    uint8 evolutionWeight;     // 1-100: Impact strength
}
```

### ContextType Enum

```solidity
enum ContextType {
    DREAM_DISCUSSION,    // 0: Discussing previous dreams
    GENERAL_CHAT,        // 1: General conversation
    PERSONALITY_QUERY,   // 2: Asking about personality/traits
    THERAPEUTIC,         // 3: Therapeutic conversation
    ADVICE_SEEKING      // 4: Seeking advice/guidance
}
```

---

## 📡 Events

### PersonalityEvolved

Emitted when agent personality evolves from dream processing.

```solidity
event PersonalityEvolved(
    uint256 indexed tokenId,
    bytes32 indexed dreamHash,
    PersonalityTraits newPersonality,
    PersonalityImpact impact
);
```

### AgentConversation

Emitted when agent has a conversation.

```solidity
event AgentConversation(
    uint256 indexed tokenId,
    bytes32 indexed conversationHash,
    ContextType contextType,
    uint256 conversationCount
);
```

### PersonalityMilestone

Emitted when agent reaches personality milestones.

```solidity
event PersonalityMilestone(
    uint256 indexed tokenId,
    string milestone,
    uint8 traitValue,
    string traitName
);
```

### ResponseStyleEvolved

Emitted when agent's response style evolves.

```solidity
event ResponseStyleEvolved(
    uint256 indexed tokenId,
    string newStyle,
    string[] dominantTraits
);
```

---

## 🔗 Integration Examples

### Complete Dream Processing Flow

```javascript
// 1. Submit dream for analysis
const dreamText = "I dreamed about flying over a peaceful ocean...";

// 2. AI analysis (via 0G Compute)
const analysis = await analyzeWithAI(dreamText, agentPersonality);

// 3. Extract personality impact
const personalityImpact = {
  creativityChange: 7,   // Flying = creativity boost
  empathyChange: 5,      // Peaceful = empathy boost
  intuitionChange: 4,    // Ocean = intuition boost
  analyticalChange: 0,
  resilienceChange: 2,
  curiosityChange: 3,
  moodShift: "peaceful",
  evolutionWeight: 80
};

// 4. Store on 0G Storage
const dreamData = {
  userInput: { dreamDescription: dreamText },
  aiAnalysis: analysis,
  evolutionTriggers: { personalityChanges: personalityImpact }
};
const dreamHash = await uploadEncrypted(dreamData);
const analysisHash = await uploadEncrypted(analysis);

// 5. Process dream evolution
await dreamAgentContract.processDailyDream(
  tokenId,
  dreamHash,
  analysisHash,
  personalityImpact
);

// 6. Get updated personality
const newPersonality = await dreamAgentContract.getPersonalityTraits(tokenId);
console.log("Agent evolved!", newPersonality);
```

### Context-Aware Chat

```javascript
// 1. Load conversation context
const dreamHistory = await dreamAgentContract.getDreamHistory(tokenId, 5);
const chatHistory = await dreamAgentContract.getConversationHistory(tokenId, 3);
const personality = await dreamAgentContract.getPersonalityTraits(tokenId);

// 2. Build AI context
const context = await buildChatContext({
  recentDreams: await loadDreamsFromStorage(dreamHistory),
  recentChats: await loadChatsFromStorage(chatHistory),
  personality: personality
});

// 3. Generate response
const userMessage = "I'm feeling anxious about work";
const agentResponse = await chatWithAI({
  message: userMessage,
  context: context,
  agentPersonality: personality
});

// 4. Store conversation
const conversationData = {
  messages: [
    { role: "user", content: userMessage },
    { role: "agent", content: agentResponse }
  ],
  contextType: "therapeutic",
  personalityReflection: {
    traitsDisplayed: ["empathy", "intuition"],
    emotionalTone: "supportive",
    responseStyle: "empathetic"
  }
};
const conversationHash = await uploadEncrypted(conversationData);

// 5. Record conversation
await dreamAgentContract.recordConversation(
  tokenId,
  conversationHash,
  3 // THERAPEUTIC
);
```

### Personality Analytics Dashboard

```javascript
// Get comprehensive agent stats
async function getAgentDashboard(tokenId) {
  const [
    personality,
    [dominantTraits, dominantValues],
    [responseStyle, primaryTrait],
    [totalEvolutions, evolutionRate, lastEvolution],
    rarityScore,
    dreamCount,
    conversationCount
  ] = await Promise.all([
    contract.getPersonalityTraits(tokenId),
    contract.getDominantTraits(tokenId),
    contract.getResponseStyle(tokenId),
    contract.getEvolutionStats(tokenId),
    contract.calculatePersonalityRarity(tokenId),
    contract.agents(tokenId).then(agent => agent.dreamCount),
    contract.agents(tokenId).then(agent => agent.conversationCount)
  ]);

  return {
    personality,
    dominantTraits: dominantTraits.map((trait, i) => ({
      name: trait,
      value: dominantValues[i]
    })),
    responseStyle,
    primaryTrait,
    evolution: {
      totalEvolutions,
      evolutionRate,
      lastEvolution: new Date(lastEvolution * 1000)
    },
    rarityScore,
    interactions: {
      dreamCount,
      conversationCount
    }
  };
}
```

---

## ❌ Error Codes

### Common Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `"Not agent owner"` | Caller is not the agent owner | Use correct wallet |
| `"Personality not initialized"` | Agent personality not set up | Use `mintWithPersonality()` |
| `"Daily dream already processed"` | 24h cooldown active | Wait until next day |
| `"Invalid creativity change"` | Change value outside -10 to +10 range | Use valid range |
| `"Agent name already exists"` | Name is taken | Choose different name |
| `"Insufficient payment for minting"` | Payment less than 0.1 OG | Send correct amount |
| `"Maximum agents limit reached"` | 1000 agent limit hit | Wait for increased limit |

### Validation Errors

| Field | Valid Range | Description |
|-------|-------------|-------------|
| Personality traits | 0-100 | All trait values must be 0-100 |
| Trait changes | -10 to +10 | Evolution changes per dream |
| Evolution weight | 1-100 | Impact strength of dream |
| Agent name | 1-32 chars | Name length limits |
| Mood string | Non-empty | Dominant mood required |

---

## 🔮 Advanced Usage

### Personality-Based Agent Trading

```javascript
// Find compatible agents for trading
const compatibility = await contract.calculateCompatibility(agentA, agentB);
if (compatibility > 80) {
  console.log("Highly compatible agents!");
}

// Find rare personality combinations
const creativeAgents = await contract.findAgentsByTrait(
  "creativity", 85, 100, 0, 10
);
```

### Evolution History Analysis

```javascript
// Track trait development over time
const empathyHistory = await contract.getTraitEvolution(
  tokenId, "empathy", 0
);

// Analyze growth patterns
const growthRate = calculateGrowthRate(empathyHistory);
console.log(`Empathy growth rate: ${growthRate}% per week`);
```

### Milestone Achievement System

```javascript
// Check all major milestones
const milestones = [
  "empathy_master", "creative_genius", "logic_lord",
  "spiritual_guide", "balanced_soul"
];

const achievements = await Promise.all(
  milestones.map(m => contract.hasMilestone(tokenId, m))
);

console.log("Agent achievements:", achievements);
```

---

**This API enables the creation of truly intelligent, evolving digital companions.** 🌟 