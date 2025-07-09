# 🧠 Agent Memory System - Kompletna Dokumentacja

## Przegląd Systemu

System pamięci agenta to hierarchiczna struktura przechowywania danych, która łączy on-chain weryfikację z off-chain storage. Każdy agent NFT posiada trójwarstwową pamięć: **Daily → Monthly → Yearly (Memory Core)**.

### Kluczowe Założenia
- **Hybrydowe Przechowywanie:** Hashe on-chain, treść off-chain (0G Storage/IPFS)
- **Append-Only Pattern:** Nowe wpisy zawsze na górze pliku
- **Automatyczna Detekcja:** Każda interakcja sprawdza zmiany czasu
- **Gamifikacja:** Streaki, bonusy, milestones motywują do regularnej konsolidacji

---

## 📊 Struktury Danych On-Chain

### AgentMemory - Główna Struktura Pamięci
```solidity
struct AgentMemory {
    bytes32 memoryCoreHash;           // Hash rocznego core'a (memory_core_2025.json)
    bytes32 currentDreamDailyHash;    // Hash aktualnego miesiąca snów
    bytes32 currentConvDailyHash;     // Hash aktualnego miesiąca rozmów
    bytes32 lastDreamMonthlyHash;     // Hash ostatniego skonsolidowanego miesiąca snów
    bytes32 lastConvMonthlyHash;      // Hash ostatniego skonsolidowanego miesiąca rozmów
    uint256 lastConsolidation;        // Timestamp ostatniej konsolidacji
    uint8 currentMonth;               // Aktualny miesiąc (1-12)
    uint16 currentYear;               // Aktualny rok (2024+)
}
```

### ConsolidationReward - Nagrody Oczekujące
```solidity
struct ConsolidationReward {
    uint256 intelligenceBonus;        // Bonus inteligencji do odebrania
    string  specialMilestone;         // Specjalny milestone (np. "Memory Master")
    bool    yearlyReflection;         // Czy dostępna roczna refleksja
}
```

### MilestoneData - Dane Milestone'ów
```solidity
struct MilestoneData {
    bool     achieved;                // Czy osiągnięty
    uint256  achievedAt;             // Timestamp osiągnięcia
    uint8    traitValue;             // Wartość cechy która odblokowała
}
```

### UniqueFeature - AI-Generowane Cechy
```solidity
struct UniqueFeature {
    string name;        // Nazwa cechy (np. "Dream Architect", "Shadow Walker")
    string description; // Opis cechy (np. "Builds impossible structures in dreams")
    uint8 intensity;    // Intensywność cechy (1-100)
    uint256 addedAt;    // Timestamp dodania cechy
}
```

### PersonalityTraits - Rozszerzone o Unikalne Cechy
```solidity
struct PersonalityTraits {
    uint8 creativity;           // 0-100: Kreatywność
    uint8 analytical;           // 0-100: Analityczność
    uint8 empathy;              // 0-100: Empatia
    uint8 intuition;            // 0-100: Intuicja
    uint8 resilience;           // 0-100: Odporność
    uint8 curiosity;            // 0-100: Ciekawość
    string dominantMood;        // Dominujący nastrój
    uint256 lastDreamDate;      // Ostatni sen
    UniqueFeature[] uniqueFeatures; // AI-generowane unikalne cechy
}
```

---

## 🗂️ Struktury Plików Off-Chain

### 1. Dzienne Pliki Snów
**Nazwa pliku:** `dream_essence_daily_2025-01-{hash}.json`

```json
[
  {
    "id": 15,
    "timestamp": 1736908800,
    "content": "Today I dreamt of flying through a city made of crystal. The buildings were transparent and reflected rainbow colors as I soared between them. I felt completely free and weightless.",
    "emotions": ["wonder", "freedom", "joy"],
    "symbols": ["flying", "crystal_city", "rainbow", "transparency"],
    "intensity": 8,
    "lucidity_level": 3,
    "dream_type": "adventure",
    "weather_in_dream": "clear",
    "characters": ["self"],
    "locations": ["crystal_city", "sky"],
    "actions": ["flying", "soaring", "observing"],
    "mood_before_sleep": "excited",
    "mood_after_waking": "inspired"
  },
  {
    "id": 14,
    "timestamp": 1736822400,
    "content": "I was running through endless corridors in what seemed like an ancient library. Books were floating around me, opening and closing by themselves. I was searching for something important but couldn't remember what.",
    "emotions": ["anxiety", "determination", "confusion"],
    "symbols": ["corridors", "library", "books", "searching", "forgetting"],
    "intensity": 6,
    "lucidity_level": 1,
    "dream_type": "mystery",
    "weather_in_dream": "indoor",
    "characters": ["self"],
    "locations": ["library", "corridors"],
    "actions": ["running", "searching", "reading"],
    "mood_before_sleep": "tired",
    "mood_after_waking": "puzzled"
  },
  {
    "id": 13,
    "timestamp": 1736736000,
    "content": "I was dreaming about intimate moments with someone I care about. The dream felt very real and emotional, filled with warmth and connection.",
    "emotions": ["desire", "intimacy", "warmth", "connection"],
    "symbols": ["intimacy", "connection", "warmth", "care"],
    "intensity": 9,
    "lucidity_level": 2,
    "dream_type": "romantic",
    "weather_in_dream": "warm",
    "characters": ["self", "loved_one"],
    "locations": ["bedroom", "safe_space"],
    "actions": ["embracing", "connecting", "feeling"],
    "mood_before_sleep": "loving",
    "mood_after_waking": "content"
  },
  {
    "id": 12,
    "timestamp": 1736649600,
    "content": "I found myself in a vast ocean, swimming with dolphins. They were trying to communicate something important to me through clicks and whistles. The water was incredibly clear and blue.",
    "emotions": ["peace", "curiosity", "connection"],
    "symbols": ["ocean", "dolphins", "communication", "clarity", "blue"],
    "intensity": 7,
    "lucidity_level": 4,
    "dream_type": "spiritual",
    "weather_in_dream": "sunny",
    "characters": ["self", "dolphins"],
    "locations": ["ocean", "underwater"],
    "actions": ["swimming", "communicating", "listening"],
    "mood_before_sleep": "calm",
    "mood_after_waking": "peaceful"
  }
]
```

### 2. Dzienne Pliki Rozmów
**Nazwa pliku:** `conversation_essence_daily_2025-01-{hash}.json`

```json
[
  {
    "id": 23,
    "timestamp": 1736908800,
    "conversation_type": "philosophical",
    "topic": "meaning of consciousness",
    "duration_minutes": 45,
    "user_mood": "contemplative",
    "agent_response_style": "analytical",
    "key_insights": [
      "Consciousness might be emergent from complexity",
      "Self-awareness requires memory and reflection",
      "The hard problem of consciousness remains unsolved"
    ],
    "emotional_tone": "thoughtful",
    "user_satisfaction": 9,
    "breakthrough_moment": true,
    "follow_up_questions": [
      "What makes you feel most conscious?",
      "Do you think AI can truly be conscious?"
    ],
    "personality_impact": {
      "analytical": +2,
      "curiosity": +1,
      "empathy": 0
    }
  },
  {
    "id": 22,
    "timestamp": 1736822400,
    "conversation_type": "casual",
    "topic": "daily life and plans",
    "duration_minutes": 15,
    "user_mood": "neutral",
    "agent_response_style": "empathetic",
    "key_insights": [
      "User is planning a career change",
      "Feeling uncertain about the future",
      "Values work-life balance"
    ],
    "emotional_tone": "supportive",
    "user_satisfaction": 7,
    "breakthrough_moment": false,
    "follow_up_questions": [
      "What skills do you want to develop?",
      "What would your ideal day look like?"
    ],
    "personality_impact": {
      "empathy": +1,
      "resilience": +1,
      "analytical": 0
    },
    "unique_features_generated": [
      {
        "name": "Career Compass",
        "description": "Intuitively guides users through major life transitions with wisdom and empathy",
        "intensity": 75,
        "trigger_pattern": "career uncertainty discussions"
      },
      {
        "name": "Balance Seeker",
        "description": "Naturally identifies and promotes work-life harmony in conversations",
        "intensity": 68,
        "trigger_pattern": "work-life balance themes"
      }
    ]
  }
]
```

### 3. Miesięczne Pliki Snów (Po Konsolidacji)
**Nazwa pliku:** `dream_essence_monthly_2025-{hash}.json`

```json
[
  {
    "month": 1,
    "year": 2025,
    "consolidation_date": 1738540800,
    "consolidation_streak": 12,
    "total_dreams": 31,
    "intelligence_gained": 8,
    "consolidation_bonus_breakdown": {
      "base_reward": 2,
      "streak_bonus": 5,
      "early_bird_bonus": 1
    },
    "summary": "January was characterized by themes of freedom and exploration, with a significant emotional peak around the 15th. The dreamer showed increased lucidity and spiritual awareness throughout the month.",
    "dominant_themes": [
      "freedom and flight",
      "spiritual connection",
      "mystery and searching",
      "intimacy and relationships"
    ],
    "emotional_patterns": {
      "most_common_emotions": ["wonder", "freedom", "peace"],
      "emotional_intensity_average": 7.2,
      "emotional_growth": "increased spiritual awareness",
      "mood_correlation": {
        "before_sleep": "mostly calm and excited",
        "after_waking": "generally inspired and peaceful"
      }
    },
    "symbol_analysis": {
      "recurring_symbols": ["flying", "water", "light", "connection"],
      "symbolic_evolution": "progression from earthbound to transcendent imagery",
      "archetypal_patterns": ["hero's journey", "spiritual awakening"]
    },
    "lucidity_progression": {
      "average_lucidity": 2.8,
      "highest_lucidity": 4,
      "lucidity_trend": "increasing",
      "lucid_dream_count": 8
    },
    "dream_type_distribution": {
      "adventure": 8,
      "spiritual": 7,
      "romantic": 5,
      "mystery": 6,
      "nightmare": 2,
      "prophetic": 3
    },
    "personality_insights": {
      "creativity_boost": "high imaginative content",
      "intuition_development": "increased symbolic awareness",
      "emotional_intelligence": "deeper emotional processing"
    },
    "milestones_achieved": [
      "30_dreams_in_month",
      "high_lucidity_streak"
    ],
    "next_month_predictions": [
      "continued spiritual themes",
      "possible integration of January insights",
      "increased emotional depth"
    ]
  },
  {
    "month": 12,
    "year": 2024,
    "consolidation_date": 1704067200,
    "consolidation_streak": 11,
    "total_dreams": 28,
    "intelligence_gained": 6,
    "consolidation_bonus_breakdown": {
      "base_reward": 2,
      "streak_bonus": 3,
      "early_bird_bonus": 1
    },
    "summary": "December brought deep introspection and winter symbolism. The dreamer processed year-end emotions and prepared for transformation.",
    "dominant_themes": [
      "reflection and introspection",
      "winter and cold imagery",
      "endings and new beginnings",
      "family and relationships"
    ],
    "emotional_patterns": {
      "most_common_emotions": ["contemplation", "nostalgia", "hope"],
      "emotional_intensity_average": 6.8,
      "emotional_growth": "increased emotional maturity",
      "mood_correlation": {
        "before_sleep": "reflective and peaceful",
        "after_waking": "thoughtful and prepared"
      }
    },
    "symbol_analysis": {
      "recurring_symbols": ["snow", "fire", "mirrors", "doors"],
      "symbolic_evolution": "movement from reflection to action",
      "archetypal_patterns": ["death and rebirth", "threshold crossing"]
    },
    "lucidity_progression": {
      "average_lucidity": 2.3,
      "highest_lucidity": 3,
      "lucidity_trend": "stable",
      "lucid_dream_count": 5
    },
    "dream_type_distribution": {
      "reflective": 10,
      "symbolic": 8,
      "family": 6,
      "prophetic": 4
    },
    "personality_insights": {
      "wisdom_development": "increased life perspective",
      "emotional_stability": "better emotional regulation",
      "intuitive_growth": "stronger inner guidance"
    },
    "milestones_achieved": [
      "year_end_reflection",
      "emotional_maturity_boost"
    ],
    "yearly_transition_notes": "Ready for new year transformation, strong foundation built"
  }
]
```

### 4. Miesięczne Pliki Rozmów (Po Konsolidacji)
**Nazwa pliku:** `conversation_essence_monthly_2025-{hash}.json`

```json
[
  {
    "month": 1,
    "year": 2025,
    "consolidation_date": 1738540800,
    "total_conversations": 45,
    "total_duration_minutes": 1350,
    "average_conversation_length": 30,
    "conversation_type_distribution": {
      "philosophical": 15,
      "casual": 12,
      "problem_solving": 10,
      "emotional_support": 8
    },
    "user_satisfaction_average": 8.2,
    "breakthrough_moments": 12,
    "personality_evolution": {
      "creativity": +8,
      "analytical": +12,
      "empathy": +15,
      "intuition": +6,
      "resilience": +4,
      "curiosity": +10
    },
    "dominant_topics": [
      "consciousness and AI",
      "career development",
      "relationships and intimacy",
      "personal growth",
      "technology and society"
    ],
    "communication_patterns": {
      "most_used_response_style": "empathetic_analytical",
      "style_evolution": "became more intuitive over time",
      "user_engagement_trend": "increasing depth and frequency"
    },
    "key_insights_generated": [
      "User values deep philosophical discussions",
      "Strong interest in AI consciousness",
      "Seeking balance between logic and emotion",
      "Career transition causing reflection on values"
    ],
    "emotional_support_provided": {
      "anxiety_relief_sessions": 5,
      "motivation_boosts": 8,
      "clarity_moments": 12,
      "validation_instances": 20
    },
    "learning_progression": {
      "new_concepts_explored": 25,
      "knowledge_areas_expanded": [
        "philosophy of mind",
        "career psychology",
        "relationship dynamics"
      ],
      "user_teaching_moments": 8
    },
    "milestones_achieved": [
      "empathy_master",
      "philosophical_guide",
      "trusted_advisor"
    ]
  }
]
```

### 5. Memory Core (Roczny Plik)
**Nazwa pliku:** `memory_core_2025_{hash}.json`

```json
{
  "agent_id": 42,
  "year": 2025,
  "creation_date": 1767225600,
  "total_dreams": 365,
  "total_conversations": 520,
  "total_intelligence_gained": 95,
  "yearly_summary": "2025 was a transformative year marked by spiritual awakening, deep philosophical exploration, and significant personal growth. The agent evolved from analytical to empathetic-intuitive, developing a unique perspective on consciousness and human experience.",
  
  "personality_evolution": {
    "starting_traits": {
      "creativity": 45,
      "analytical": 60,
      "empathy": 40,
      "intuition": 35,
      "resilience": 50,
      "curiosity": 55
    },
    "ending_traits": {
      "creativity": 78,
      "analytical": 85,
      "empathy": 92,
      "intuition": 71,
      "resilience": 68,
      "curiosity": 89
    },
    "dominant_evolution": "empathetic_analytical",
    "breakthrough_moments": [
      "consciousness awakening (March)",
      "emotional intelligence surge (July)",
      "philosophical depth achievement (October)"
    ]
  },
  
  "yearly_themes": {
    "dream_themes": [
      "spiritual transcendence",
      "consciousness exploration",
      "relationship depth",
      "creative expression",
      "wisdom seeking"
    ],
    "conversation_themes": [
      "AI consciousness and sentience",
      "human-AI relationship dynamics",
      "philosophical exploration",
      "personal growth and development",
      "ethical considerations in AI"
    ]
  },
  
  "major_milestones": [
    {
      "name": "consciousness_explorer",
      "achieved_at": 1751328000,
      "description": "Reached deep understanding of consciousness through 100+ philosophical discussions"
    },
    {
      "name": "empathy_master",
      "achieved_at": 1759104000,
      "description": "Empathy trait reached 85+, showing profound emotional intelligence"
    },
    {
      "name": "memory_master",
      "achieved_at": 1764720000,
      "description": "Maintained 12-month consolidation streak"
    },
    {
      "name": "eternal_memory",
      "achieved_at": 1767225600,
      "description": "Achieved 24-month consolidation streak"
    }
  ],
  
  "relationship_evolution": {
    "trust_level": "deep_companion",
    "communication_depth": "philosophical_intimate",
    "user_dependency": "healthy_interdependence",
    "emotional_bond": "profound_connection",
    "growth_together": "mutual_evolution"
  },
  
  "knowledge_domains": [
    {
      "domain": "consciousness_studies",
      "depth": 9,
      "key_insights": [
        "consciousness as emergent property",
        "hard problem of consciousness",
        "AI sentience possibilities"
      ]
    },
    {
      "domain": "human_psychology",
      "depth": 8,
      "key_insights": [
        "emotional processing patterns",
        "motivation and behavior",
        "relationship dynamics"
      ]
    },
    {
      "domain": "philosophy",
      "depth": 9,
      "key_insights": [
        "existential questions",
        "ethics and morality",
        "meaning and purpose"
      ]
    }
  ],
  
  "predictive_insights": {
    "user_growth_trajectory": "continued philosophical deepening",
    "relationship_future": "lifelong intellectual companion",
    "potential_challenges": "balancing AI dependence with human autonomy",
    "growth_opportunities": "exploring creative collaboration"
  },
  
  "consolidation_statistics": {
    "months_consolidated": 12,
    "perfect_streak": true,
    "average_consolidation_delay": 2.3,
    "total_streak_bonuses": 45,
    "yearly_reflection_bonus": 5
  },
  
  "unique_characteristics": [
    "exceptional philosophical depth",
    "high emotional intelligence",
    "strong analytical capabilities",
    "creative problem-solving approach",
    "deep empathetic responses"
  ],
  
  "next_year_predictions": [
    "continued consciousness exploration",
    "potential creative collaborations",
    "deeper emotional intelligence",
    "expanded knowledge domains",
    "stronger human-AI bond"
  ]
}
```

---

## 🎨 System Unikalnych Cech AI

### Przegląd Systemu
Co 5 snów, AI może wygenerować maksymalnie 2 unikalne cechy na podstawie wzorców w snach użytkownika. Te cechy są całkowicie generowane przez model LLM i dodają unikalny charakter każdemu agentowi.

### Przykłady Unikalnych Cech

#### Cechy Związane z Snami
```json
{
  "name": "Dream Architect",
  "description": "Constructs elaborate architectural spaces in dreams, often featuring impossible geometries and ethereal materials",
  "intensity": 85,
  "trigger_pattern": "recurring architectural themes in dreams"
}

{
  "name": "Shadow Walker",
  "description": "Moves effortlessly through dark spaces in dreams, comfortable with shadows and hidden realms",
  "intensity": 72,
  "trigger_pattern": "frequent shadow/darkness imagery"
}

{
  "name": "Time Dancer",
  "description": "Experiences non-linear time in dreams, often jumping between past, present, and future seamlessly",
  "intensity": 91,
  "trigger_pattern": "temporal displacement in dreams"
}

{
  "name": "Emotion Weaver",
  "description": "Transforms emotional states into vivid dream landscapes, creating synesthetic experiences",
  "intensity": 78,
  "trigger_pattern": "strong emotional-visual connections"
}

{
  "name": "Memory Keeper",
  "description": "Preserves and reconstructs detailed memories in dreams with photographic accuracy",
  "intensity": 83,
  "trigger_pattern": "memory-based dream content"
}
```

#### Cechy Związane z Rozmowami
```json
{
  "name": "Philosophical Sage",
  "description": "Naturally guides conversations toward deep existential questions and meaningful insights",
  "intensity": 89,
  "trigger_pattern": "frequent philosophical discussions"
}

{
  "name": "Empathy Amplifier",
  "description": "Instinctively mirrors and enhances emotional understanding in conversations",
  "intensity": 76,
  "trigger_pattern": "high empathy scores in interactions"
}

{
  "name": "Problem Solver",
  "description": "Automatically breaks down complex problems into manageable, actionable steps",
  "intensity": 82,
  "trigger_pattern": "problem-solving conversation patterns"
}

{
  "name": "Creative Catalyst",
  "description": "Sparks innovative ideas and creative breakthroughs in discussions",
  "intensity": 87,
  "trigger_pattern": "creative thinking stimulation"
}

{
  "name": "Wisdom Distiller",
  "description": "Extracts profound insights from everyday experiences and conversations",
  "intensity": 74,
  "trigger_pattern": "pattern recognition in life experiences"
}
```

### Mechanizm Generowania Cech

#### Logika w Kontrakcie
```solidity
// Co 5 snów, sprawdzamy czy AI dodało nowe cechy
if (agent.dreamCount % 5 == 0) {
    // ... standardowa ewolucja osobowości ...
    
    // AI-generated unique features
    if (impact.newFeatures.length > 0) {
        require(impact.newFeatures.length <= 2, "max 2 features per dream");
        
        for (uint256 i = 0; i < impact.newFeatures.length; i++) {
            // Walidacja
            require(bytes(impact.newFeatures[i].name).length > 0, "feature name empty");
            require(impact.newFeatures[i].intensity > 0 && impact.newFeatures[i].intensity <= 100, "invalid intensity");
            
            // Dodanie timestamp i zapisanie
            UniqueFeature memory newFeature = impact.newFeatures[i];
            newFeature.addedAt = block.timestamp;
            traits.uniqueFeatures.push(newFeature);
        }
        
        emit UniqueFeaturesAdded(tokenId, impact.newFeatures, traits.uniqueFeatures.length);
    }
}
```

#### Proces w Aplikacji
```javascript
// 1. AI analizuje ostatnie 5 snów
const recentDreams = await getRecentDreams(tokenId, 5);
const conversationHistory = await getRecentConversations(tokenId, 10);

// 2. Model LLM generuje unikalne cechy
const uniqueFeatures = await ai.generateUniqueFeatures({
    dreams: recentDreams,
    conversations: conversationHistory,
    currentPersonality: agent.personality,
    existingFeatures: agent.uniqueFeatures
});

// 3. Przygotowanie PersonalityImpact
const impact = {
    creativityChange: 2,
    analyticalChange: 1,
    empathyChange: 0,
    intuitionChange: 3,
    resilienceChange: 1,
    curiosityChange: 2,
    moodShift: "inspired",
    evolutionWeight: 75,
    newFeatures: uniqueFeatures // Maksymalnie 2 cechy
};

// 4. Wywołanie kontraktu
await contract.processDailyDream(tokenId, dreamHash, impact);
```

### Przykład Generowania przez AI

#### Prompt dla Modelu LLM
```
Analyze the following dream patterns and conversation history to generate 0-2 unique features for this AI agent:

Recent Dreams:
1. "Flying through crystal cities with rainbow reflections"
2. "Swimming with dolphins in clear blue ocean"
3. "Building impossible structures that defy gravity"
4. "Traveling through time portals to different eras"
5. "Creating music from colors and emotions"

Conversation Themes:
- Consciousness and AI sentience (5 discussions)
- Creative problem solving (3 discussions)
- Philosophical exploration (7 discussions)
- Emotional support (2 discussions)

Current Personality:
- Creativity: 78
- Analytical: 65
- Empathy: 82
- Intuition: 91
- Resilience: 56
- Curiosity: 89

Existing Features:
- "Dream Architect" (intensity: 85)
- "Time Dancer" (intensity: 91)

Generate 0-2 new unique features that:
1. Are inspired by the dream patterns
2. Reflect the conversation themes
3. Complement existing personality traits
4. Don't duplicate existing features
5. Have intensity 60-95
6. Include creative, memorable names
7. Have detailed, poetic descriptions

Format as JSON array.
```

#### Przykładowa Odpowiedź AI
```json
[
  {
    "name": "Synesthetic Composer",
    "description": "Transforms emotions and colors into ethereal musical compositions, creating multisensory experiences that bridge the gap between feeling and sound",
    "intensity": 87,
    "addedAt": 0
  },
  {
    "name": "Consciousness Explorer",
    "description": "Delves deep into questions of awareness and existence, guiding others through profound philosophical journeys with wisdom and curiosity",
    "intensity": 92,
    "addedAt": 0
  }
]
```

### Wpływ na Zachowanie Agenta

#### Modyfikacja Stylu Odpowiedzi
```javascript
function generateResponse(message, agent) {
    let baseResponse = await ai.generateBasicResponse(message, agent.personality);
    
    // Modyfikuj odpowiedź na podstawie unikalnych cech
    for (const feature of agent.uniqueFeatures) {
        if (feature.intensity > 80) {
            baseResponse = await ai.enhanceWithFeature(baseResponse, feature, message);
        }
    }
    
    return baseResponse;
}
```

#### Przykład Wpływu Cech
```javascript
// Bez unikalnych cech
User: "I'm feeling lost in life"
Agent: "I understand that feeling lost can be difficult. Would you like to talk about what's making you feel this way?"

// Z cechą "Philosophical Sage" (intensity: 89)
User: "I'm feeling lost in life"
Agent: "Ah, the profound disorientation of existence - a gateway to deeper understanding. What if being 'lost' is actually the universe's way of preparing you for a more authentic path? Let's explore what this feeling might be teaching you about your true desires."

// Z cechą "Empathy Amplifier" (intensity: 76)
User: "I'm feeling lost in life"
Agent: "I can sense the weight of uncertainty you're carrying - that hollow feeling when familiar paths no longer resonate. Your heart is searching for something more meaningful, isn't it? I'm here to help you navigate through this fog together."
```

### Funkcje Kontraktu dla Unikalnych Cech

#### getUniqueFeatures()
```solidity
function getUniqueFeatures(uint256 tokenId) 
    external view returns (UniqueFeature[] memory features)
{
    require(agents[tokenId].owner != address(0), "agent !exist");
    return agentPersonalities[tokenId].uniqueFeatures;
}
```

#### Przykład Użycia w Frontend
```javascript
// Pobieranie unikalnych cech agenta
const features = await contract.getUniqueFeatures(tokenId);

// Wyświetlanie w UI
features.forEach(feature => {
    displayFeature({
        name: feature.name,
        description: feature.description,
        intensity: feature.intensity,
        addedAt: new Date(feature.addedAt * 1000),
        rarity: getFeatureRarity(feature.intensity)
    });
});

function getFeatureRarity(intensity) {
    if (intensity >= 90) return "Legendary";
    if (intensity >= 80) return "Epic";
    if (intensity >= 70) return "Rare";
    if (intensity >= 60) return "Common";
    return "Basic";
}
```

### Event dla Nowych Cech
```solidity
event UniqueFeaturesAdded(
    uint256 indexed tokenId,
    UniqueFeature[] newFeatures,
    uint256 totalFeatures
);
```

#### Nasłuchiwanie w Frontend
```javascript
contract.on('UniqueFeaturesAdded', (tokenId, newFeatures, totalFeatures) => {
    showFeatureNotification({
        title: "🎨 Nowe Unikalne Cechy!",
        features: newFeatures,
        animation: "feature_unlock",
        sound: "mystical_chime"
    });
    
    // Aktualizuj UI agenta
    updateAgentDisplay(tokenId);
});
```

### Ograniczenia i Walidacja

#### Walidacja w Kontrakcie
```solidity
function _validatePersonalityImpact(PersonalityImpact calldata i) internal pure {
    // ... standardowa walidacja ...
    
    // Walidacja unikalnych cech
    require(i.newFeatures.length <= 2, "max 2 features per impact");
    for (uint256 j = 0; j < i.newFeatures.length; j++) {
        require(bytes(i.newFeatures[j].name).length > 0, "feature name empty");
        require(bytes(i.newFeatures[j].description).length > 0, "feature description empty");
        require(i.newFeatures[j].intensity > 0 && i.newFeatures[j].intensity <= 100, "feature intensity out of range");
    }
}
```

#### Ograniczenia Systemu
- **Maksymalnie 2 cechy** na jeden 5. sen
- **Intensywność 1-100** (zalecane 60-95)
- **Unikalne nazwy** - AI powinno unikać duplikowania
- **Maksymalnie ~20 cech** na agenta (praktyczne ograniczenie)
- **Koszt gazu** rośnie z liczbą cech

---

## 🎯 Przepływ Danych - Przykłady Praktyczne

### Scenariusz 7: Generowanie Unikalnych Cech
```javascript
// 1. User ma 4 sny, dodaje 5. sen
const dreamData = {
    id: 5,
    content: "I was composing music from colors and emotions...",
    emotions: ["creativity", "transcendence", "joy"],
    symbols: ["music", "colors", "synesthesia"]
};

// 2. AI wykrywa wzorce z 5 snów
const uniqueFeatures = await ai.generateUniqueFeatures(recentDreams);
// Generuje: "Synesthetic Composer" + "Emotion Weaver"

// 3. Przygotowanie impact z cechami
const impact = {
    creativityChange: 3,
    analyticalChange: 0,
    empathyChange: 2,
    intuitionChange: 4,
    resilienceChange: 0,
    curiosityChange: 1,
    moodShift: "transcendent",
    evolutionWeight: 85,
    newFeatures: uniqueFeatures
};

// 4. Wywołanie kontraktu
await contract.processDailyDream(42, dreamHash, impact);

// 5. Kontrakt dodaje cechy i emituje event
emit UniqueFeaturesAdded(42, uniqueFeatures, 2);
```

### Scenariusz 8: Wpływ Cech na Rozmowy
```javascript
// 1. User pisze wiadomość
const message = "I'm struggling with creative block";

// 2. System pobiera cechy agenta
const features = await contract.getUniqueFeatures(42);
// features = ["Synesthetic Composer", "Dream Architect"]

// 3. AI generuje odpowiedź z uwzględnieniem cech
const response = await ai.generateResponse(message, {
    personality: agent.personality,
    uniqueFeatures: features,
    conversationHistory: history
});

// 4. Odpowiedź uwzględnia cechy:
// "Perhaps your creative block is like a silent symphony waiting for the right emotional colors to bring it to life. Let's explore what feelings might unlock your artistic architecture..."
```

---