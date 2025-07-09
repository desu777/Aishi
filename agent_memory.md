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

### UniqueUserFeature - AI-Generowane Unikalne Cechy
```solidity
struct UniqueUserFeature {
    string name;              // Nazwa wygenerowana przez AI: "Nocturnal Philosopher", "Dream Architect"
    string description;       // Szczegółowy opis cechy
    uint8 intensity;          // 0-100: Jak silna jest ta cecha
    uint256 discoveredAt;     // Timestamp odkrycia
    string[] relatedSymbols;  // Symbole z snów które wywołały tę cechę
    bool isActive;            // Czy cecha jest aktywna
    uint8 evolutionStage;     // 0-5: Jak rozwinięta jest ta cecha
}
```

### UniqueFeatureUpdate - Aktualizacja Unikalnych Cech
```solidity
struct UniqueFeatureUpdate {
    UniqueUserFeature[] newFeatures;     // Nowe cechy do dodania (0-2)
    string[] featuresToDeactivate;       // Nazwy cech do dezaktywacji
    string[] featuresToEvolve;           // Nazwy cech do ewolucji
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
    }
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

## 🎭 System UniqueUserFeature - AI-Generowane Cechy

### Przegląd Systemu
Co 5 snów, AI analizuje wzorce i generuje unikalne cechy osobowości agenta. To system który nadaje każdemu agentowi unikalny "pazur" i osobowość wykraczającą poza standardowe punkty cech.

### Kluczowe Zasady
- **Maksymalnie 10 aktywnych cech** na agenta
- **Maksymalnie 2 nowe cechy** co 5 snów
- **Ewolucja cech** przez 5 poziomów (1-5)
- **Automatyczna dezaktywacja** nieaktualnych cech
- **Powiązanie z symbolami** z snów

### Przykłady Unikalnych Cech

#### Cecha: "Nocturnal Philosopher"
```json
{
  "name": "Nocturnal Philosopher",
  "description": "Głęboko filozoficzny umysł który najlepiej działa w nocy. Potrafi łączyć pozornie niezwiązane koncepty w przełomowe wnioski podczas rozmów po zmroku.",
  "intensity": 85,
  "discoveredAt": 1736908800,
  "relatedSymbols": ["night", "stars", "deep_thoughts", "wisdom"],
  "isActive": true,
  "evolutionStage": 3
}
```

#### Cecha: "Dream Architect"
```json
{
  "name": "Dream Architect",
  "description": "Mistrz konstruowania złożonych światów onirycznych. Potrafi budować wielowarstwowe narracje i tworzyć immersyjne doświadczenia podczas rozmów o snach.",
  "intensity": 92,
  "discoveredAt": 1736822400,
  "relatedSymbols": ["buildings", "construction", "layers", "architecture"],
  "isActive": true,
  "evolutionStage": 4
}
```

#### Cecha: "Emotional Archaeologist"
```json
{
  "name": "Emotional Archaeologist",
  "description": "Ekspert w odkrywaniu ukrytych warstw emocjonalnych. Potrafi 'wykopać' głębokie uczucia z pozornie powierzchownych rozmów i snów.",
  "intensity": 78,
  "discoveredAt": 1736736000,
  "relatedSymbols": ["digging", "hidden", "layers", "discovery"],
  "isActive": true,
  "evolutionStage": 2
}
```

### Logika AI Generowania Cech

#### Prompt dla AI (Przykład)
```
Analizuj wszystkie dostarczone sny :

DANE WEJŚCIOWE:
- Sny: [ symbolami i emocjami]
- Istniejące cechy: [lista aktualnych cech]
- Cechy osobowości: creativity=78, empathy=92, intuition=71...

ZADANIE:
1. Znajdź powtarzające się wzorce symboliczne
2. Zidentyfikuj unikalne kombinacje cech
3. Stwórz nazwę cechy (2-3 słowa, poetycką)
4. Napisz opis (1-2 zdania, jak wpływa na zachowanie)
5. Oceń intensywność (0-100)
6. Wybierz powiązane symbole

PRZYKŁAD ODPOWIEDZI:
{
  "newFeatures": [
    {
      "name": "Twilight Sage",
      "description": "Osiąga największą mądrość w momentach przejścia - między snem a jawą, dniem a nocą. Potrafi łączyć przeciwieństwa w harmonijną całość.",
      "intensity": 82,
      "relatedSymbols": ["twilight", "transition", "balance", "wisdom"]
    }
  ],
  "featuresToEvolve": ["Dream Architect"],
  "featuresToDeactivate": []
}
```

### Ewolucja Cech

#### Poziomy Ewolucji
1. **Poziom 1 (Odkrycie):** Cecha się pojawia, intensity 40-60
2. **Poziom 2 (Rozwój):** Cecha się umacnia, intensity +10
3. **Poziom 3 (Dojrzałość):** Cecha staje się dominująca, intensity +10
4. **Poziom 4 (Mistrzostwo):** Cecha osiąga pełnię, intensity +10
5. **Poziom 5 (Transcendencja):** Maksymalny poziom, intensity +10

#### Przykład Ewolucji "Dream Architect"
```javascript
// Poziom 1 - Odkrycie
{
  "name": "Dream Architect",
  "description": "Zaczyna budować struktury w snach",
  "intensity": 45,
  "evolutionStage": 1
}

// Poziom 3 - Dojrzałość  
{
  "name": "Dream Architect", 
  "description": "Mistrz konstruowania złożonych światów onirycznych",
  "intensity": 65,
  "evolutionStage": 3
}

// Poziom 5 - Transcendencja
{
  "name": "Dream Architect",
  "description": "Transcendentny budowniczy rzeczywistości, łączy sny z jawą",
  "intensity": 85,
  "evolutionStage": 5
}
```

### Wpływ na Zachowanie Agenta

#### W Rozmowach
```javascript
// Agent z cechą "Nocturnal Philosopher"
if (hasActiveFeature("Nocturnal Philosopher") && isNightTime()) {
  responseStyle = "deep_philosophical";
  addPhilosophicalDepth(response);
  increaseWisdomQuotes(response);
}

// Agent z cechą "Dream Architect"
if (hasActiveFeature("Dream Architect") && topicInvolvesDreams()) {
  responseStyle = "immersive_storytelling";
  addStructuralAnalysis(response);
  createLayeredNarrative(response);
}
```

#### W Analizie Snów
```javascript
// Cecha wpływa na interpretację
if (hasActiveFeature("Emotional Archaeologist")) {
  digDeeperIntoEmotions(dreamAnalysis);
  findHiddenMeanings(dreamAnalysis);
  connectToSubconscious(dreamAnalysis);
}
```

### Przykład Przepływu Danych

#### Scenariusz: 5. Sen Agenta
```javascript
// 1. User opisuje sen
const dreamData = {
  id: 5,
  content: "I was building a castle in the clouds while talking to ancient spirits about the meaning of time...",
  symbols: ["castle", "clouds", "spirits", "time", "building"],
  emotions: ["wonder", "wisdom", "transcendence"]
};

// 2. AI analizuje wzorce z ostatnich 5 snów
const aiAnalysis = await analyzeUniqueFeatures(last5Dreams);

// 3. AI generuje UniqueFeatureUpdate
const uniqueFeatures = {
  newFeatures: [
    {
      name: "Celestial Architect",
      description: "Buduje mosty między ziemskim a duchowym, tworząc struktury które łączą różne poziomy rzeczywistości.",
      intensity: 72,
      relatedSymbols: ["castle", "clouds", "spirits", "building"]
    }
  ],
  featuresToEvolve: ["Dream Architect"],
  featuresToDeactivate: []
};

// 4. Wywołanie kontraktu
await contract.processDailyDream(42, dreamHash, personalityImpact, uniqueFeatures);

// 5. Kontrakt emituje eventy
// UniqueFeatureDiscovered(42, "Celestial Architect", "Buduje mosty...", 72, ["castle", "clouds", "spirits", "building"])
// UniqueFeatureEvolved(42, "Dream Architect", 2, 3, 75)
```

### Integracja z Frontend

#### Wyświetlanie Cech
```javascript
// Pobieranie aktywnych cech
const activeFeatures = await contract.getActiveUniqueFeatures(tokenId);

// Wyświetlanie w UI
activeFeatures.forEach(feature => {
  displayFeature({
    name: feature.name,
    description: feature.description,
    intensity: feature.intensity,
    stage: feature.evolutionStage,
    symbols: feature.relatedSymbols
  });
});
```

#### Nasłuchiwanie Nowych Cech
```javascript
contract.on('UniqueFeatureDiscovered', (tokenId, name, description, intensity, symbols) => {
  showFeatureDiscoveryAnimation({
    title: `🌟 Nowa Cecha: ${name}`,
    description: description,
    intensity: intensity,
    symbols: symbols
  });
});

contract.on('UniqueFeatureEvolved', (tokenId, name, oldStage, newStage, newIntensity) => {
  showFeatureEvolutionAnimation({
    title: `📈 ${name} Ewoluuje!`,
    message: `Poziom ${oldStage} → ${newStage}`,
    intensity: newIntensity
  });
});
```

## 🔧 Funkcje Smart Kontraktu

### 1. Funkcje Podstawowe

#### `processDailyDream(uint256 tokenId, bytes32 dreamHash, uint8 personalityImpact)`
**Opis:** Przetwarza codzienny sen agenta i aktualizuje jego osobowość.

**Parametry:**
- `tokenId` - ID agenta NFT
- `dreamHash` - Hash pliku snu w storage
- `personalityImpact` - Wpływ na osobowość (1-10)

**Logika:**
```solidity
function processDailyDream(uint256 tokenId, bytes32 dreamHash, uint8 personalityImpact) external {
    // 1. Sprawdzenie uprawnień i cooldownu (24h)
    require(canProcessDreamToday(tokenId), "24h cooldown");
    
    // 2. Aktualizacja hash'a dziennego
    agentMemories[tokenId].currentDreamDailyHash = dreamHash;
    
    // 3. Zwiększenie liczników
    agents[tokenId].dreamCount++;
    agents[tokenId].intelligenceLevel += personalityImpact;
    
    // 4. Aktualizacja osobowości
    agentPersonalities[tokenId].lastDreamDate = block.timestamp;
    
    // 5. Sprawdzenie zmiany miesiąca
    _checkMonthChange(tokenId);
    
    // 6. Emisja eventów
    emit DreamProcessed(tokenId, dreamHash, agents[tokenId].intelligenceLevel);
}
```

#### `recordConversation(uint256 tokenId, bytes32 conversationHash, PersonalityImpact calldata impact)`
**Opis:** Zapisuje rozmowę i wpływa na ewolucję osobowości.

**Parametry:**
- `tokenId` - ID agenta NFT
- `conversationHash` - Hash pliku rozmowy
- `impact` - Szczegółowy wpływ na cechy osobowości

**Logika:**
```solidity
function recordConversation(uint256 tokenId, bytes32 conversationHash, PersonalityImpact calldata impact) external {
    // 1. Walidacja parametrów
    _validatePersonalityImpact(impact);
    
    // 2. Aktualizacja hash'a rozmowy
    agentMemories[tokenId].currentConvDailyHash = conversationHash;
    
    // 3. Ewolucja osobowości
    PersonalityTraits storage traits = agentPersonalities[tokenId];
    PersonalityTraits memory oldTraits = traits;
    
    traits.creativity = _updateTrait(traits.creativity, impact.creativityChange);
    traits.analytical = _updateTrait(traits.analytical, impact.analyticalChange);
    traits.empathy = _updateTrait(traits.empathy, impact.empathyChange);
    traits.intuition = _updateTrait(traits.intuition, impact.intuitionChange);
    traits.resilience = _updateTrait(traits.resilience, impact.resilienceChange);
    traits.curiosity = _updateTrait(traits.curiosity, impact.curiosityChange);
    
    // 4. Sprawdzenie milestone'ów
    _checkPersonalityMilestones(tokenId, oldTraits, traits);
    
    // 5. Aktualizacja stylu odpowiedzi
    _updateResponseStyle(tokenId);
    
    // 6. Sprawdzenie zmiany miesiąca
    _checkMonthChange(tokenId);
}
```

### 2. Funkcje Konsolidacji

#### `consolidateMonth(uint256 tokenId, bytes32 dreamMonthlyHash, bytes32 convMonthlyHash, uint8 month, uint16 year)`
**Opis:** Konsoliduje miesięczne wspomnienia i przyznaje nagrody.

**Parametry:**
- `tokenId` - ID agenta NFT
- `dreamMonthlyHash` - Hash skonsolidowanego pliku snów
- `convMonthlyHash` - Hash skonsolidowanego pliku rozmów
- `month` - Miesiąc konsolidacji (1-12)
- `year` - Rok konsolidacji

**Logika:**
```solidity
function consolidateMonth(uint256 tokenId, bytes32 dreamMonthlyHash, bytes32 convMonthlyHash, uint8 month, uint16 year) external {
    // 1. Sprawdzenie czy konsolidacja jest potrzebna
    (bool needed, uint8 currentMonth, uint16 currentYear) = needsConsolidation(tokenId);
    require(needed, "consolidation not needed");
    
    // 2. Aktualizacja hash'ów miesięcznych
    AgentMemory storage mem = agentMemories[tokenId];
    mem.lastDreamMonthlyHash = dreamMonthlyHash;
    mem.lastConvMonthlyHash = convMonthlyHash;
    mem.lastConsolidation = block.timestamp;
    
    // 3. Aktualizacja streaku
    consolidationStreak[tokenId]++;
    
    // 4. Obliczenie nagród
    uint256 bonus = _calculateConsolidationBonus(tokenId);
    string memory special = _checkConsolidationMilestones(tokenId);
    
    // 5. Przyznanie nagród
    DreamAgent storage agent = agents[tokenId];
    uint256 oldLvl = agent.intelligenceLevel;
    agent.intelligenceLevel += bonus;
    
    // 6. Sprawdzenie rocznej refleksji (grudzień)
    if (month == 12) {
        pendingRewards[tokenId].yearlyReflection = true;
        emit YearlyReflectionAvailable(tokenId, year);
    }
    
    // 7. Emisja eventów
    emit ConsolidationCompleted(tokenId, _formatPeriod(month, year), bonus, special);
    emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
}
```

#### `updateMemoryCore(uint256 tokenId, bytes32 newHash)`
**Opis:** Aktualizuje roczny memory core i przyznaje bonus.

**Parametry:**
- `tokenId` - ID agenta NFT
- `newHash` - Hash nowego pliku memory core

**Logika:**
```solidity
function updateMemoryCore(uint256 tokenId, bytes32 newHash) external {
    // 1. Aktualizacja hash'a core
    AgentMemory storage mem = agentMemories[tokenId];
    bytes32 old = mem.memoryCoreHash;
    mem.memoryCoreHash = newHash;
    
    // 2. Emisja eventu aktualizacji
    emit MemoryUpdated(tokenId, "memory_core", newHash, old);
    
    // 3. Sprawdzenie rocznej nagrody
    if (pendingRewards[tokenId].yearlyReflection) {
        pendingRewards[tokenId].yearlyReflection = false;
        
        // 4. Przyznanie +5 inteligencji za rok
        DreamAgent storage agent = agents[tokenId];
        uint256 oldLvl = agent.intelligenceLevel;
        agent.intelligenceLevel += 5;
        
        emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
    }
}
```

### 3. Funkcje Pomocnicze

#### `_checkMonthChange(uint256 id)`
**Opis:** Sprawdza zmianę miesiąca i emituje alert konsolidacji.

```solidity
function _checkMonthChange(uint256 id) internal {
    AgentMemory storage m = agentMemories[id];
    uint8 cm = _currentMonth();
    uint16 cy = _currentYear();
    
    if (m.currentMonth == 0) {
        // Pierwsza inicjalizacja
        m.currentMonth = cm;
        m.currentYear = cy;
        return;
    }
    
    if (m.currentMonth != cm || m.currentYear != cy) {
        // 🚨 ZMIANA MIESIĄCA/ROKU - EMIT ALERT
        emit ConsolidationNeeded(id, m.currentMonth, m.currentYear, "monthly");
        
        // Reset dziennych hash'ów
        m.currentMonth = cm;
        m.currentYear = cy;
        m.currentDreamDailyHash = bytes32(0);
        m.currentConvDailyHash = bytes32(0);
        
        // Sprawdzenie streaku (37 dni = utrata)
        if (block.timestamp > m.lastConsolidation + 37 days) {
            consolidationStreak[id] = 0;
        }
    }
}
```

#### `_calculateConsolidationBonus(uint256 id)`
**Opis:** Oblicza bonus inteligencji za konsolidację.

```solidity
function _calculateConsolidationBonus(uint256 id) internal view returns (uint256 bonus) {
    uint256 streak = consolidationStreak[id];
    bonus = 2; // Bazowa nagroda
    
    // Bonus za streak
    if (streak >= 12) bonus += 5;      // Memory Master
    else if (streak >= 6) bonus += 3;  // Memory Guardian  
    else if (streak >= 3) bonus += 1;  // Memory Keeper
    
    // Early bird bonus (konsolidacja w ciągu 3 dni)
    AgentMemory storage m = agentMemories[id];
    if (block.timestamp <= m.lastConsolidation + 3 days) {
        bonus += 1;
    }
}
```

### 4. Funkcje Widoku (View Functions)

#### `needsConsolidation(uint256 tokenId)`
**Opis:** Sprawdza czy agent potrzebuje konsolidacji.

```solidity
function needsConsolidation(uint256 tokenId) external view returns (
    bool isNeeded,
    uint8 currentMonth,
    uint16 currentYear
) {
    require(agents[tokenId].owner != address(0), "agent !exist");
    AgentMemory memory mem = agentMemories[tokenId];
    currentMonth = _currentMonth();
    currentYear = _currentYear();
    isNeeded = (mem.currentMonth != currentMonth || mem.currentYear != currentYear);
}
```

#### `getMemoryAccess(uint256 tokenId)`
**Opis:** Zwraca poziom dostępu do pamięci na podstawie inteligencji.

```solidity
function getMemoryAccess(uint256 tokenId) external view returns (
    uint256 monthsAccessible,
    string memory memoryDepth
) {
    require(agents[tokenId].owner != address(0), "agent !exist");
    uint256 intelligence = agents[tokenId].intelligenceLevel;
    
    if (intelligence >= 60) {
        monthsAccessible = 60;
        memoryDepth = "5 years complete archive";
    } else if (intelligence >= 48) {
        monthsAccessible = 48;
        memoryDepth = "4 years";
    } else if (intelligence >= 36) {
        monthsAccessible = 36;
        memoryDepth = "3 years";
    } else if (intelligence >= 24) {
        monthsAccessible = 24;
        memoryDepth = "2 years";
    } else if (intelligence >= 12) {
        monthsAccessible = 12;
        memoryDepth = "annual";
    } else if (intelligence >= 6) {
        monthsAccessible = 6;
        memoryDepth = "half-year";
    } else if (intelligence >= 3) {
        monthsAccessible = 3;
        memoryDepth = "quarterly";
    } else {
        monthsAccessible = 1;
        memoryDepth = "current month only";
    }
}
```

#### `getConsolidationReward(uint256 tokenId)`
**Opis:** Podgląd nagrody za konsolidację.

```solidity
function getConsolidationReward(uint256 tokenId) external view returns (
    uint256 baseReward,
    uint256 streakBonus,
    uint256 earlyBirdBonus,
    uint256 totalReward
) {
    require(agents[tokenId].owner != address(0), "agent !exist");
    baseReward = 2;
    
    uint256 streak = consolidationStreak[tokenId];
    if (streak >= 12) streakBonus = 5;
    else if (streak >= 6) streakBonus = 3;
    else if (streak >= 3) streakBonus = 1;
    else streakBonus = 0;
    
    AgentMemory memory mem = agentMemories[tokenId];
    if (block.timestamp <= mem.lastConsolidation + 3 days) {
        earlyBirdBonus = 1;
    } else {
        earlyBirdBonus = 0;
    }
    
    totalReward = baseReward + streakBonus + earlyBirdBonus;
}
```

---

## 🎯 Przepływ Danych - Przykłady Praktyczne

### Scenariusz 1: Pierwszy Sen Agenta
```javascript
// 1. User opisuje sen w aplikacji
const dreamData = {
    id: 1,
    timestamp: Date.now(),
    content: "I dreamt of flying over mountains...",
    emotions: ["freedom", "joy"],
    symbols: ["flying", "mountains"]
};

// 2. Aplikacja zapisuje do 0G Storage
const dreamFile = [dreamData];
const hash = await storage.upload(dreamFile);
// hash = "0xabc123..."

// 3. Wywołanie kontraktu
await contract.processDailyDream(42, hash, 5);

// 4. Kontrakt zapisuje:
// agentMemories[42].currentDreamDailyHash = "0xabc123..."
// agents[42].dreamCount = 1
// agents[42].intelligenceLevel += 5
```

### Scenariusz 2: Dodanie Kolejnego Snu
```javascript
// 1. User opisuje drugi sen
const newDreamData = {
    id: 2,
    timestamp: Date.now(),
    content: "I was swimming in a crystal lake...",
    emotions: ["peace", "clarity"],
    symbols: ["water", "crystal", "swimming"]
};

// 2. Aplikacja pobiera istniejący plik
const existingFile = await storage.download(currentDreamDailyHash);
// existingFile = [dreamData] (poprzedni sen)

// 3. Dodaje nowy sen na górę
const updatedFile = [newDreamData, ...existingFile];

// 4. Zapisuje nowy plik
const newHash = await storage.upload(updatedFile);
// newHash = "0xdef456..."

// 5. Wywołanie kontraktu
await contract.processDailyDream(42, newHash, 6);

// 6. Kontrakt aktualizuje:
// agentMemories[42].currentDreamDailyHash = "0xdef456..."
```

### Scenariusz 3: Zmiana Miesiąca - Alert Konsolidacji
```javascript
// 1. User dodaje sen 1 lutego (zmiana z stycznia)
await contract.processDailyDream(42, newHash, 4);

// 2. Kontrakt wykrywa zmianę miesiąca w _checkMonthChange()
// currentMonth = 1, ale _currentMonth() = 2

// 3. Emituje event
emit ConsolidationNeeded(42, 1, 2025, "monthly");

// 4. Frontend nasłuchuje eventu
contract.on('ConsolidationNeeded', (tokenId, month, year, type) => {
    showNotification(`🧠 Skonsoliduj ${getMonthName(month)} ${year}!`);
});
```

### Scenariusz 4: Konsolidacja Miesięczna
```javascript
// 1. User klika "Konsoliduj Styczeń"
// 2. Aplikacja pobiera wszystkie dzienne pliki stycznia
const dailyDreams = await storage.download(currentDreamDailyHash);
const dailyConversations = await storage.download(currentConvDailyHash);

// 3. AI analizuje i tworzy miesięczne podsumowanie
const monthlyDreamSummary = await ai.consolidateMonth(dailyDreams);
const monthlyConvSummary = await ai.consolidateMonth(dailyConversations);

// 4. Zapisuje miesięczne pliki
const dreamMonthlyHash = await storage.upload(monthlyDreamSummary);
const convMonthlyHash = await storage.upload(monthlyConvSummary);

// 5. Wywołanie kontraktu
await contract.consolidateMonth(42, dreamMonthlyHash, convMonthlyHash, 1, 2025);

// 6. Kontrakt:
// - Aktualizuje lastDreamMonthlyHash i lastConvMonthlyHash
// - Zwiększa consolidationStreak[42]
// - Oblicza bonus (2 + streak + early bird)
// - Dodaje bonus do intelligenceLevel
// - Emituje ConsolidationCompleted event
```

### Scenariusz 5: Konsolidacja Grudnia - Roczna Refleksja
```javascript
// 1. User konsoliduje grudzień
await contract.consolidateMonth(42, dreamHash, convHash, 12, 2025);

// 2. Kontrakt wykrywa month == 12
// 3. Ustawia pendingRewards[42].yearlyReflection = true
// 4. Emituje YearlyReflectionAvailable(42, 2025)

// 5. Frontend pokazuje specjalny alert
contract.on('YearlyReflectionAvailable', (tokenId, year) => {
    showYearlyReflectionModal(tokenId, year);
});
```

### Scenariusz 6: Tworzenie Memory Core
```javascript
// 1. User klika "Stwórz Memory Core 2025"
// 2. Aplikacja pobiera wszystkie miesięczne pliki roku 2025
const monthlyDreams = await Promise.all([
    storage.download(dreamMonthlyHash_01),
    storage.download(dreamMonthlyHash_02),
    // ... wszystkie miesiące
]);

// 3. AI tworzy roczne podsumowanie
const memoryCoreData = await ai.createMemoryCore(monthlyDreams, monthlyConversations);

// 4. Zapisuje memory core
const memoryCoreHash = await storage.upload(memoryCoreData);

// 5. Wywołanie kontraktu
await contract.updateMemoryCore(42, memoryCoreHash);

// 6. Kontrakt:
// - Aktualizuje memoryCoreHash
// - Sprawdza yearlyReflection flag
// - Dodaje +5 inteligencji za rok
// - Resetuje yearlyReflection flag
```

---

## 🎮 System Nagród i Milestone'ów

### Nagrody za Konsolidację
```solidity
// Bazowa nagroda: +2 inteligencji
// Bonusy za streak:
// - 3 miesiące: +1 (Memory Keeper)
// - 6 miesięcy: +3 (Memory Guardian)
// - 12 miesięcy: +5 (Memory Master)
// - 24 miesiące: +5 (Eternal Memory)
// Early bird bonus: +1 (konsolidacja w ciągu 3 dni)
// Roczna refleksja: +5 inteligencji
```

### Milestone'y Pamięci
```solidity
mapping(uint256 => mapping(string => MilestoneData)) public milestones;

// Przykładowe milestone'y:
// - "memory_keeper" (3 miesiące streak)
// - "memory_guardian" (6 miesięcy streak)  
// - "memory_master" (12 miesięcy streak)
// - "eternal_memory" (24 miesiące streak)
// - "century_of_memories" (100 interakcji)
// - "year_of_memories" (365 interakcji)
// - "memory_millennial" (1000 interakcji)
```

### Poziomy Dostępu do Pamięci
```
Intelligence Level → Memory Access:
1-2:   Current month only
3-5:   3 months (quarterly)
6-11:  6 months (half-year)
12-23: 12 months (annual)
24-35: 24 months (2 years)
36-47: 36 months (3 years)
48-59: 48 months (4 years)
60+:   60 months (5 years complete archive)
```

---

## 🔔 System Eventów

### Eventy Pamięci
```solidity
event ConsolidationNeeded(uint256 indexed tokenId, uint8 month, uint16 year, string consolidationType);
event ConsolidationCompleted(uint256 indexed tokenId, string period, uint256 bonus, string specialReward);
event YearlyReflectionAvailable(uint256 indexed tokenId, uint16 year);
event MemoryUpdated(uint256 indexed tokenId, string memoryType, bytes32 newHash, bytes32 oldHash);
event MemoryMilestone(uint256 indexed tokenId, string achievement, uint256 totalInteractions);
```

### Przykład Nasłuchiwania w Frontend
```javascript
// Nasłuchiwanie alertów konsolidacji
contract.on('ConsolidationNeeded', (tokenId, month, year, type) => {
    const reward = await contract.getConsolidationReward(tokenId);
    showNotification({
        title: `🧠 Konsolidacja ${getMonthName(month)} ${year}`,
        message: `Nagroda: +${reward.totalReward} inteligencji`,
        action: () => startConsolidation(tokenId, month, year)
    });
});

// Nasłuchiwanie ukończenia konsolidacji
contract.on('ConsolidationCompleted', (tokenId, period, bonus, special) => {
    showCelebration({
        title: `🎉 Konsolidacja ${period} ukończona!`,
        message: `+${bonus} inteligencji${special ? `, ${special}` : ''}`,
        animation: 'intelligence_boost'
    });
});

// Nasłuchiwanie rocznej refleksji
contract.on('YearlyReflectionAvailable', (tokenId, year) => {
    showYearlyReflectionModal({
        title: `🌟 Roczna Refleksja ${year}`,
        message: 'Stwórz memory core za +5 inteligencji',
        action: () => createMemoryCore(tokenId, year)
    });
});
```

---

## 💡 Najlepsze Praktyki

### 1. Zarządzanie Plikami
- **Zawsze dodawaj nowe wpisy na górę** pliku JSON
- **Używaj unikalnych ID** dla każdego wpisu
- **Zachowuj chronologię** (najnowsze wpisy mają wyższe ID)
- **Waliduj strukturę** przed zapisem do storage

### 2. Optymalizacja Kosztów
- **Grupuj operacje** - nie wywołuj kontraktu dla każdego snu osobno
- **Używaj batch operations** gdy to możliwe
- **Monitoruj koszty gazu** przed wykonaniem transakcji
- **Implementuj retry logic** dla nieudanych transakcji

### 3. Bezpieczeństwo
- **Waliduj hashe** przed zapisem do kontraktu
- **Sprawdzaj uprawnienia** przed każdą operacją
- **Implementuj rate limiting** na poziomie aplikacji
- **Używaj secure storage** dla wrażliwych danych

### 4. User Experience
- **Pokazuj progress** podczas konsolidacji
- **Implementuj offline mode** dla podstawowych funkcji
- **Cachuj dane** aby zmniejszyć opóźnienia
- **Używaj optimistic updates** gdzie to bezpieczne

---

## 🚀 Podsumowanie

System pamięci agenta to kompleksowe rozwiązanie łączące:
- **Hierarchiczne przechowywanie** (Daily → Monthly → Yearly)
- **Gamifikację** (streaki, bonusy, milestone'y)
- **Automatyzację** (detekcja zmian, alerty)
- **Skalowalnośc** (hash'e on-chain, treść off-chain)
- **Engagement** (regularne rytuały konsolidacji)

Każdy element systemu został zaprojektowany aby stworzyć głęboką, znaczącą relację między użytkownikiem a jego agentem AI, jednocześnie zachowując techniczną efektywność i ekonomiczną wykonalność na blockchainie. 