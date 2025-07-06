// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IPersonalityEvolution - Interface for agent personality evolution
/// @notice Defines the personality evolution system for Dreamscape iNFTs
/// @dev Implements personality trait development based on dream analysis
interface IPersonalityEvolution {
    
    /// @notice Core personality traits structure
    /// @dev All traits range from 0-100, dominantMood is current emotional state
    struct PersonalityTraits {
        uint8 creativity;      // 0-100: Innovation, imagination, artistic thinking
        uint8 analytical;      // 0-100: Logic, problem-solving, systematic thinking  
        uint8 empathy;         // 0-100: Emotional understanding, compassion, support
        uint8 intuition;       // 0-100: Gut feelings, spiritual insights, wisdom
        uint8 resilience;      // 0-100: Stress handling, recovery, perseverance
        uint8 curiosity;       // 0-100: Learning desire, exploration, questioning
        string dominantMood;   // Current emotional state: "peaceful", "anxious", "excited", etc.
        uint256 lastDreamDate; // Timestamp of last dream processing (prevents multiple per day)
    }
    
    /// @notice Personality impact from dream analysis
    /// @dev Defines how a dream affects personality traits
    struct PersonalityImpact {
        int8 creativityChange;     // -10 to +10 change in creativity
        int8 analyticalChange;     // -10 to +10 change in analytical thinking
        int8 empathyChange;        // -10 to +10 change in empathy
        int8 intuitionChange;      // -10 to +10 change in intuition
        int8 resilienceChange;     // -10 to +10 change in resilience
        int8 curiosityChange;      // -10 to +10 change in curiosity
        string moodShift;          // New dominant mood
        uint8 evolutionWeight;     // 1-100: How much this dream affects personality
    }
    
    /// @notice Conversation context type for memory management
    enum ContextType {
        DREAM_DISCUSSION,    // Discussing previous dreams
        GENERAL_CHAT,        // General conversation
        PERSONALITY_QUERY,   // Asking about personality/traits
        THERAPEUTIC,         // Therapeutic conversation
        ADVICE_SEEKING      // Seeking advice/guidance
    }
    
    // Events
    
    /// @dev Emitted when agent personality evolves from dream processing
    event PersonalityEvolved(
        uint256 indexed tokenId,
        bytes32 indexed dreamHash,
        PersonalityTraits newPersonality,
        PersonalityImpact impact
    );
    
    /// @dev Emitted when agent has a conversation (without personality evolution)
    event AgentConversation(
        uint256 indexed tokenId,
        bytes32 indexed conversationHash,
        ContextType contextType,
        uint256 conversationCount
    );
    
    /// @dev Emitted when agent reaches personality milestones
    event PersonalityMilestone(
        uint256 indexed tokenId,
        string milestone,
        uint8 traitValue,
        string traitName
    );
    
    /// @dev Emitted when agent's response style evolves
    event ResponseStyleEvolved(
        uint256 indexed tokenId,
        string newStyle,
        string[] dominantTraits
    );
    
    // Core Functions
    
    /// @notice Process daily dream and evolve agent personality
    /// @param tokenId Agent to evolve
    /// @param dreamHash 0G Storage hash of encrypted dream data
    /// @param dreamAnalysisHash 0G Storage hash of AI analysis
    /// @param impact Personality changes from dream analysis
    function processDailyDream(
        uint256 tokenId,
        bytes32 dreamHash,
        bytes32 dreamAnalysisHash,
        PersonalityImpact calldata impact
    ) external;
    
    /// @notice Record conversation without personality evolution
    /// @param tokenId Agent having conversation
    /// @param conversationHash 0G Storage hash of conversation data
    /// @param contextType Type of conversation for context building
    function recordConversation(
        uint256 tokenId,
        bytes32 conversationHash,
        ContextType contextType
    ) external;
    
    /// @notice Get agent's current personality traits
    /// @param tokenId Agent to query
    /// @return traits Current personality traits
    function getPersonalityTraits(uint256 tokenId) 
        external view returns (PersonalityTraits memory traits);
    
    /// @notice Get agent's dream history hashes
    /// @param tokenId Agent to query
    /// @param limit Maximum number of dreams to return (0 = all)
    /// @return dreamHashes Array of dream storage hashes
    function getDreamHistory(uint256 tokenId, uint256 limit) 
        external view returns (bytes32[] memory dreamHashes);
    
    /// @notice Get agent's conversation history hashes
    /// @param tokenId Agent to query
    /// @param limit Maximum number of conversations to return (0 = all)
    /// @return conversationHashes Array of conversation storage hashes
    function getConversationHistory(uint256 tokenId, uint256 limit) 
        external view returns (bytes32[] memory conversationHashes);
    
    /// @notice Check if agent can process dream today (24h cooldown)
    /// @param tokenId Agent to check
    /// @return canProcess True if agent can process a dream today
    function canProcessDreamToday(uint256 tokenId) 
        external view returns (bool canProcess);
    

    

    

    
    // Advanced Analytics
    
    /// @notice Get personality evolution statistics
    /// @param tokenId Agent to analyze
    /// @return totalEvolutions Number of personality changes
    /// @return evolutionRate Rate of personality change
    /// @return lastEvolution Timestamp of last evolution
    function getEvolutionStats(uint256 tokenId) 
        external view returns (
            uint256 totalEvolutions,
            uint256 evolutionRate,
            uint256 lastEvolution
        );
    

    
    /// @notice Check if agent has reached specific personality milestone
    /// @param tokenId Agent to check
    /// @param milestone Milestone to check ("empathy_master", "creative_genius", etc.)
    /// @return achieved True if milestone has been achieved
    /// @return achievedAt Timestamp when milestone was achieved (0 if not achieved)
    function hasMilestone(uint256 tokenId, string calldata milestone) 
        external view returns (bool achieved, uint256 achievedAt);
    
    // Batch Operations
    

} 