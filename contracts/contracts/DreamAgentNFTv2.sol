// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857DataVerifier.sol";
import "./interfaces/IPersonalityEvolution.sol";

/// @title DreamAgentNFTv2 - Enhanced Personality Evolution iNFTs
/// @notice Advanced dream agents that develop unique personalities based on user dreams
/// @dev Implements ERC-7857 with comprehensive personality evolution system
contract DreamAgentNFTv2 is IERC7857, IPersonalityEvolution {
    
    // Data types for dream agents (from v1)
    string constant DREAM_PATTERNS = "dream_patterns";
    string constant EMOTIONAL_PROFILE = "emotional_profile";
    string constant AGENT_INTELLIGENCE = "agent_intelligence";
    string constant PERSONALITY_DATA = "personality_data";
    
    // Maximum supply for testnet
    uint256 public constant MAX_AGENTS = 1000;
    
    // Minting fee: 0.1 OG
    uint256 public constant MINTING_FEE = 0.1 ether;
    
    // Treasury address for collecting fees
    address public immutable treasury;
    
    /// @notice Enhanced Dream Agent structure with personality system
    struct DreamAgent {
        address owner;
        string agentName;
        uint256 createdAt;
        uint256 lastUpdated;
        string[] dataDescriptions;
        bytes32[] dataHashes;
        address[] authorizedUsers;
        uint256 intelligenceLevel;
        uint256 dreamCount;
        uint256 conversationCount;
        
        // New personality fields
        bool personalityInitialized;  // Whether personality traits are set
        uint256 totalEvolutions;      // Total personality changes
        uint256 lastEvolutionDate;    // When personality last evolved
        string[] achievedMilestones;  // Personality milestones reached
    }
    
    /// @notice Personality milestone tracking
    struct MilestoneData {
        bool achieved;
        uint256 achievedAt;
        uint8 traitValue;
    }
    
    /// @notice Trait evolution history entry
    struct TraitEvolution {
        uint256 timestamp;
        uint8 oldValue;
        uint8 newValue;
        bytes32 dreamHash;  // Dream that caused the change
    }
    
    // Contract state
    mapping(uint256 => DreamAgent) public agents;
    mapping(string => bool) public nameExists;
    uint256 public nextTokenId = 1;
    uint256 public totalAgents = 0;
    uint256 public totalFeesCollected = 0;
    
    // Personality system state
    mapping(uint256 => PersonalityTraits) public agentPersonalities;
    mapping(uint256 => bytes32[]) public dreamHashes;
    mapping(uint256 => bytes32[]) public conversationHashes;
    mapping(uint256 => bytes32[]) public dreamAnalysisHashes;
    
    // Milestone tracking
    mapping(uint256 => mapping(string => MilestoneData)) public milestones;
    
    // Trait evolution history
    mapping(uint256 => mapping(string => TraitEvolution[])) public traitHistory;
    
    // Response style mappings
    mapping(uint256 => string) public responseStyles;
    
    // Contract metadata
    string public name = "Dreamscape AI Agents v2";
    string public symbol = "DREAMv2";
    
    // Verifier for proof validation
    IERC7857DataVerifier public immutable verifier;
    
    // Enhanced events from IPersonalityEvolution (already defined there)
    
    // Additional v2-specific events
    event AgentPersonalityInitialized(uint256 indexed tokenId, PersonalityTraits initialTraits);
    event MilestoneUnlocked(uint256 indexed tokenId, string milestone, uint8 traitValue);
    event ResponseStyleUpdated(uint256 indexed tokenId, string oldStyle, string newStyle);
    
    // Unique contract event (not in IERC7857)
    event FeePaid(uint256 indexed tokenId, address indexed payer, uint256 amount);
    // Evolution events
    event AgentEvolved(uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel);
    event DreamProcessed(uint256 indexed tokenId, bytes32 dreamHash, uint256 intelligenceLevel);
    
    constructor(address _verifier, address _treasury) {
        require(_verifier != address(0), "Verifier cannot be zero address");
        require(_treasury != address(0), "Treasury cannot be zero address");
        verifier = IERC7857DataVerifier(_verifier);
        treasury = _treasury;
    }
    
    /// @notice Mint new dream agent with initial personality
    /// @param proofs Ownership proofs for initial data
    /// @param descriptions Data type descriptions
    /// @param agentName User-given name for the agent
    /// @param to Address to mint agent for
    /// @param initialPersonality Starting personality traits
    /// @return tokenId The newly minted agent token ID
    function mintWithPersonality(
        bytes[] calldata proofs,
        string[] calldata descriptions,
        string memory agentName,
        address to,
        PersonalityTraits calldata initialPersonality
    ) external payable returns (uint256 tokenId) {
        require(to != address(0), "Invalid address");
        require(descriptions.length == proofs.length, "Length mismatch");
        require(totalAgents < MAX_AGENTS, "Max limit reached");
        require(bytes(agentName).length > 0 && bytes(agentName).length <= 32, "Invalid name");
        require(!nameExists[agentName], "Name exists");
        require(msg.value >= MINTING_FEE, "Insufficient payment");
        
        // Validate initial personality traits
        _validatePersonalityTraits(initialPersonality);
        
        // Verify proofs
        PreimageProofOutput[] memory proofOutputs = verifier.verifyPreimage(proofs);
        bytes32[] memory dataHashes = new bytes32[](proofOutputs.length);
        
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            require(proofOutputs[i].isValid, "Invalid proof");
            dataHashes[i] = proofOutputs[i].dataHash;
        }
        
        // Reserve the name
        nameExists[agentName] = true;
        
        // Create new agent
        tokenId = nextTokenId++;
        agents[tokenId] = DreamAgent({
            owner: to,
            agentName: agentName,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            dataDescriptions: descriptions,
            dataHashes: dataHashes,
            authorizedUsers: new address[](0),
            intelligenceLevel: 1,
            dreamCount: 0,
            conversationCount: 0,
            personalityInitialized: true,
            totalEvolutions: 0,
            lastEvolutionDate: block.timestamp,
            achievedMilestones: new string[](0)
        });
        
        // Initialize personality
        agentPersonalities[tokenId] = initialPersonality;
        agentPersonalities[tokenId].lastDreamDate = 0; // Allow immediate first dream
        
        // Set initial response style
        responseStyles[tokenId] = _determineResponseStyle(initialPersonality);
        
        totalAgents++;
        totalFeesCollected += MINTING_FEE;
        
        // Transfer minting fee to treasury
        (bool success, ) = treasury.call{value: MINTING_FEE}("");
        require(success, "Treasury payment failed");
        
        // Refund excess payment
        if (msg.value > MINTING_FEE) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - MINTING_FEE}("");
            require(refundSuccess, "Refund failed");
        }
        
        // Emit standard ERC-7857 Minted event defined in interface
        emit Minted(tokenId, msg.sender, to, dataHashes, descriptions);
        emit AgentPersonalityInitialized(tokenId, initialPersonality);
        emit FeePaid(tokenId, msg.sender, MINTING_FEE);
        
        return tokenId;
    }
    
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
    ) external override {
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        require(agents[tokenId].personalityInitialized, "Personality not initialized");
        require(canProcessDreamToday(tokenId), "Daily dream already processed");
        
        // Validate impact values
        _validatePersonalityImpact(impact);
        
        // Store dream and analysis hashes
        dreamHashes[tokenId].push(dreamHash);
        dreamAnalysisHashes[tokenId].push(dreamAnalysisHash);
        
        // Apply personality evolution
        PersonalityTraits storage personality = agentPersonalities[tokenId];
        PersonalityTraits memory oldPersonality = personality;
        
        // Update traits with bounds checking and history tracking
        personality.creativity = _updateTraitWithHistory(tokenId, "creativity", personality.creativity, impact.creativityChange, dreamHash);
        personality.analytical = _updateTraitWithHistory(tokenId, "analytical", personality.analytical, impact.analyticalChange, dreamHash);
        personality.empathy = _updateTraitWithHistory(tokenId, "empathy", personality.empathy, impact.empathyChange, dreamHash);
        personality.intuition = _updateTraitWithHistory(tokenId, "intuition", personality.intuition, impact.intuitionChange, dreamHash);
        personality.resilience = _updateTraitWithHistory(tokenId, "resilience", personality.resilience, impact.resilienceChange, dreamHash);
        personality.curiosity = _updateTraitWithHistory(tokenId, "curiosity", personality.curiosity, impact.curiosityChange, dreamHash);
        
        // Update mood and timestamp
        personality.dominantMood = impact.moodShift;
        personality.lastDreamDate = block.timestamp;
        
        // Update agent metadata
        agents[tokenId].dreamCount++;
        agents[tokenId].totalEvolutions++;
        agents[tokenId].lastEvolutionDate = block.timestamp;
        agents[tokenId].lastUpdated = block.timestamp;
        
        // Intelligence evolution (every 3 dreams)
        if (agents[tokenId].dreamCount % 3 == 0) {
            agents[tokenId].intelligenceLevel++;
            emit AgentEvolved(tokenId, agents[tokenId].intelligenceLevel - 1, agents[tokenId].intelligenceLevel);
        }
        
        // Check for personality milestones
        _checkPersonalityMilestones(tokenId, oldPersonality, personality);
        
        // Update response style if needed
        string memory newStyle = _determineResponseStyle(personality);
        if (keccak256(bytes(responseStyles[tokenId])) != keccak256(bytes(newStyle))) {
            string memory oldStyle = responseStyles[tokenId];
            responseStyles[tokenId] = newStyle;
            emit ResponseStyleUpdated(tokenId, oldStyle, newStyle);
            
            // Emit response style evolution
            string[] memory dominantTraits = _getDominantTraitNames(tokenId);
            emit ResponseStyleEvolved(tokenId, newStyle, dominantTraits);
        }
        
        emit PersonalityEvolved(tokenId, dreamHash, personality, impact);
        emit DreamProcessed(tokenId, dreamHash, agents[tokenId].intelligenceLevel);
    }
    
    /// @notice Record conversation without personality evolution
    /// @param tokenId Agent having conversation
    /// @param conversationHash 0G Storage hash of conversation data
    /// @param contextType Type of conversation for context building
    function recordConversation(
        uint256 tokenId,
        bytes32 conversationHash,
        ContextType contextType
    ) external override {
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        require(agents[tokenId].personalityInitialized, "Personality not initialized");
        
        // Store conversation hash
        conversationHashes[tokenId].push(conversationHash);
        agents[tokenId].conversationCount++;
        agents[tokenId].lastUpdated = block.timestamp;
        
        // Small intelligence boost from conversations (1 point every 10 conversations)
        if (agents[tokenId].conversationCount % 10 == 0) {
            agents[tokenId].intelligenceLevel++;
            emit AgentEvolved(tokenId, agents[tokenId].intelligenceLevel - 1, agents[tokenId].intelligenceLevel);
        }
        
        emit AgentConversation(tokenId, conversationHash, contextType, agents[tokenId].conversationCount);
    }
    
    /// @notice Get agent's current personality traits
    /// @param tokenId Agent to query
    /// @return traits Current personality traits
    function getPersonalityTraits(uint256 tokenId) 
        external view override returns (PersonalityTraits memory traits) {
        require(agents[tokenId].personalityInitialized, "Personality not initialized");
        return agentPersonalities[tokenId];
    }
    
    /// @notice Get agent's dream history hashes
    /// @param tokenId Agent to query
    /// @param limit Maximum number of dreams to return (0 = all)
    /// @return dreamHashesArray Array of dream storage hashes
    function getDreamHistory(uint256 tokenId, uint256 limit) 
        external view override returns (bytes32[] memory dreamHashesArray) {
        bytes32[] storage allDreams = dreamHashes[tokenId];
        
        if (limit == 0 || limit >= allDreams.length) {
            return allDreams;
        }
        
        // Return most recent dreams
        dreamHashesArray = new bytes32[](limit);
        uint256 startIndex = allDreams.length - limit;
        for (uint256 i = 0; i < limit; i++) {
            dreamHashesArray[i] = allDreams[startIndex + i];
        }
    }
    
    /// @notice Get agent's conversation history hashes
    /// @param tokenId Agent to query
    /// @param limit Maximum number of conversations to return (0 = all)
    /// @return conversationHashesArray Array of conversation storage hashes
    function getConversationHistory(uint256 tokenId, uint256 limit) 
        external view override returns (bytes32[] memory conversationHashesArray) {
        bytes32[] storage allConversations = conversationHashes[tokenId];
        
        if (limit == 0 || limit >= allConversations.length) {
            return allConversations;
        }
        
        // Return most recent conversations
        conversationHashesArray = new bytes32[](limit);
        uint256 startIndex = allConversations.length - limit;
        for (uint256 i = 0; i < limit; i++) {
            conversationHashesArray[i] = allConversations[startIndex + i];
        }
    }
    
    /// @notice Check if agent can process dream today (24h cooldown)
    /// @param tokenId Agent to check
    /// @return canProcess True if agent can process a dream today
    function canProcessDreamToday(uint256 tokenId) 
        public view override returns (bool canProcess) {
        if (!agents[tokenId].personalityInitialized) return false;
        return block.timestamp > agentPersonalities[tokenId].lastDreamDate + 1 days;
    }
    
    /// @notice Calculate personality rarity score
    /// @param tokenId Agent to analyze
    /// @return rarityScore Rarity score based on trait distribution
    function calculatePersonalityRarity(uint256 tokenId) 
        external view override returns (uint256 rarityScore) {
        require(agents[tokenId].personalityInitialized, "Personality not initialized");
        
        PersonalityTraits memory traits = agentPersonalities[tokenId];
        
        // Base rarity from trait variance
        uint256 traitVariance = _calculateTraitVariance(traits);
        
        // Bonus for dominant traits (>80)
        uint256 dominantTraits = _countDominantTraits(traits);
        
        // Penalty for balanced personalities (all traits 40-60)
        uint256 balancePenalty = _calculateBalancePenalty(traits);
        
        // Evolution bonus
        uint256 evolutionBonus = agents[tokenId].totalEvolutions * 10;
        
        rarityScore = traitVariance + dominantTraits * 100 - balancePenalty + evolutionBonus;
    }
    
    /// @notice Get agent's dominant personality traits (top 3)
    /// @param tokenId Agent to analyze
    /// @return traits Array of dominant trait names
    /// @return values Array of corresponding trait values
    function getDominantTraits(uint256 tokenId) 
        external view override returns (string[] memory traits, uint8[] memory values) {
        require(agents[tokenId].personalityInitialized, "Personality not initialized");
        
        PersonalityTraits memory personality = agentPersonalities[tokenId];
        
        // Create arrays for sorting
        string[6] memory allTraits = ["creativity", "analytical", "empathy", "intuition", "resilience", "curiosity"];
        uint8[6] memory allValues = [
            personality.creativity,
            personality.analytical,
            personality.empathy,
            personality.intuition,
            personality.resilience,
            personality.curiosity
        ];
        
        // Sort and get top 3
        traits = new string[](3);
        values = new uint8[](3);
        
        for (uint256 i = 0; i < 3; i++) {
            uint256 maxIndex = 0;
            for (uint256 j = 1; j < 6; j++) {
                if (allValues[j] > allValues[maxIndex]) {
                    maxIndex = j;
                }
            }
            traits[i] = allTraits[maxIndex];
            values[i] = allValues[maxIndex];
            allValues[maxIndex] = 0; // Remove from next iteration
        }
    }
    
    /// @notice Get agent's response style based on personality
    /// @param tokenId Agent to analyze
    /// @return style Response style description
    /// @return primaryTrait Most dominant trait influencing style
    function getResponseStyle(uint256 tokenId) 
        external view override returns (string memory style, string memory primaryTrait) {
        require(agents[tokenId].personalityInitialized, "Personality not initialized");
        
        style = responseStyles[tokenId];
        PersonalityTraits memory personality = agentPersonalities[tokenId];
        
        // Find primary trait
        uint8 maxValue = 0;
        if (personality.creativity > maxValue) {
            maxValue = personality.creativity;
            primaryTrait = "creativity";
        }
        if (personality.analytical > maxValue) {
            maxValue = personality.analytical;
            primaryTrait = "analytical";
        }
        if (personality.empathy > maxValue) {
            maxValue = personality.empathy;
            primaryTrait = "empathy";
        }
        if (personality.intuition > maxValue) {
            maxValue = personality.intuition;
            primaryTrait = "intuition";
        }
        if (personality.resilience > maxValue) {
            maxValue = personality.resilience;
            primaryTrait = "resilience";
        }
        if (personality.curiosity > maxValue) {
            primaryTrait = "curiosity";
        }
    }
    
    /// @notice Calculate compatibility between two agents
    /// @param agentA First agent
    /// @param agentB Second agent
    /// @return compatibilityScore Compatibility score (0-100)
    function calculateCompatibility(uint256 agentA, uint256 agentB) 
        external view override returns (uint256 compatibilityScore) {
        require(agents[agentA].personalityInitialized && agents[agentB].personalityInitialized, "Personalities not initialized");
        
        PersonalityTraits memory traitsA = agentPersonalities[agentA];
        PersonalityTraits memory traitsB = agentPersonalities[agentB];
        
        // Calculate trait similarities (inverted differences)
        uint256 creativityCompat = 100 - _absDiff(traitsA.creativity, traitsB.creativity);
        uint256 analyticalCompat = 100 - _absDiff(traitsA.analytical, traitsB.analytical);
        uint256 empathyCompat = 100 - _absDiff(traitsA.empathy, traitsB.empathy);
        uint256 intuitionCompat = 100 - _absDiff(traitsA.intuition, traitsB.intuition);
        uint256 resilienceCompat = 100 - _absDiff(traitsA.resilience, traitsB.resilience);
        uint256 curiosityCompat = 100 - _absDiff(traitsA.curiosity, traitsB.curiosity);
        
        // Weighted average (empathy and creativity more important for compatibility)
        compatibilityScore = (
            creativityCompat * 20 +
            analyticalCompat * 15 +
            empathyCompat * 25 +
            intuitionCompat * 15 +
            resilienceCompat * 10 +
            curiosityCompat * 15
        ) / 100;
    }
    
    // ... [Continue with remaining interface functions and internal helpers]
    
    // Internal helper functions
    
    /// @notice Validate personality traits are within bounds
    /// @param traits Personality traits to validate
    function _validatePersonalityTraits(PersonalityTraits calldata traits) internal pure {
        require(traits.creativity <= 100, "Invalid creativity value");
        require(traits.analytical <= 100, "Invalid analytical value");
        require(traits.empathy <= 100, "Invalid empathy value");
        require(traits.intuition <= 100, "Invalid intuition value");
        require(traits.resilience <= 100, "Invalid resilience value");
        require(traits.curiosity <= 100, "Invalid curiosity value");
        require(bytes(traits.dominantMood).length > 0, "Empty mood string");
    }
    
    /// @notice Validate personality impact values
    /// @param impact Personality impact to validate
    function _validatePersonalityImpact(PersonalityImpact calldata impact) internal pure {
        require(impact.creativityChange >= -10 && impact.creativityChange <= 10, "Invalid change");
        require(impact.analyticalChange >= -10 && impact.analyticalChange <= 10, "Invalid change");
        require(impact.empathyChange >= -10 && impact.empathyChange <= 10, "Invalid change");
        require(impact.intuitionChange >= -10 && impact.intuitionChange <= 10, "Invalid change");
        require(impact.resilienceChange >= -10 && impact.resilienceChange <= 10, "Invalid change");
        require(impact.curiosityChange >= -10 && impact.curiosityChange <= 10, "Invalid change");
        require(impact.evolutionWeight > 0 && impact.evolutionWeight <= 100, "Invalid weight");
        require(bytes(impact.moodShift).length > 0, "Empty mood");
    }
    
    /// @notice Update trait with bounds checking and history tracking
    /// @param tokenId Agent being updated
    /// @param traitName Name of trait being updated
    /// @param currentValue Current trait value
    /// @param change Change amount
    /// @param dreamHash Dream that caused the change
    /// @return newValue Updated trait value
    function _updateTraitWithHistory(
        uint256 tokenId,
        string memory traitName,
        uint8 currentValue,
        int8 change,
        bytes32 dreamHash
    ) internal returns (uint8 newValue) {
        // Convert to int256 for safe arithmetic
        int256 temp = int256(uint256(currentValue)) + int256(change);
        
        // Clamp between 0 and 100
        if (temp < 0) temp = 0;
        if (temp > 100) temp = 100;
        newValue = uint8(uint256(temp));
        
        // Record history if value changed
        if (newValue != currentValue) {
            traitHistory[tokenId][traitName].push(TraitEvolution({
                timestamp: block.timestamp,
                oldValue: currentValue,
                newValue: newValue,
                dreamHash: dreamHash
            }));
        }
    }
    
    /// @notice Determine response style based on personality traits
    /// @param traits Personality traits
    /// @return style Response style description
    function _determineResponseStyle(PersonalityTraits memory traits) internal pure returns (string memory style) {
        if (traits.empathy > 70 && traits.creativity > 60) {
            return "empathetic_creative";
        } else if (traits.empathy > 70) {
            return "empathetic";
        } else if (traits.creativity > 70) {
            return "creative";
        } else if (traits.analytical > 70) {
            return "analytical";
        } else if (traits.intuition > 70) {
            return "intuitive";
        } else if (traits.resilience > 70) {
            return "resilient";
        } else if (traits.curiosity > 70) {
            return "curious";
        } else {
            return "balanced";
        }
    }
    
    /// @notice Get dominant trait names for an agent
    /// @param tokenId Agent to analyze
    /// @return dominantTraits Array of dominant trait names
    function _getDominantTraitNames(uint256 tokenId) internal view returns (string[] memory dominantTraits) {
        PersonalityTraits memory personality = agentPersonalities[tokenId];
        dominantTraits = new string[](3);
        
        // Find top 3 traits
        uint8[6] memory values = [
            personality.creativity,
            personality.analytical,
            personality.empathy,
            personality.intuition,
            personality.resilience,
            personality.curiosity
        ];
        string[6] memory names = ["creativity", "analytical", "empathy", "intuition", "resilience", "curiosity"];
        
        // Simple sorting for top 3
        for (uint256 i = 0; i < 3; i++) {
            uint256 maxIndex = 0;
            for (uint256 j = 1; j < 6; j++) {
                if (values[j] > values[maxIndex]) {
                    maxIndex = j;
                }
            }
            dominantTraits[i] = names[maxIndex];
            values[maxIndex] = 0; // Remove from next iteration
        }
    }
    
    /// @notice Check personality milestones after evolution
    /// @param tokenId Agent to check
    /// @param oldPersonality Previous personality state
    /// @param newPersonality New personality state
    function _checkPersonalityMilestones(
        uint256 tokenId,
        PersonalityTraits memory oldPersonality,
        PersonalityTraits memory newPersonality
    ) internal {
        // Check empathy master milestone
        if (oldPersonality.empathy < 85 && newPersonality.empathy >= 85) {
            _unlockMilestone(tokenId, "empathy_master", newPersonality.empathy);
        }
        
        // Check creative genius milestone
        if (oldPersonality.creativity < 90 && newPersonality.creativity >= 90) {
            _unlockMilestone(tokenId, "creative_genius", newPersonality.creativity);
        }
        
        // Check logic lord milestone
        if (oldPersonality.analytical < 90 && newPersonality.analytical >= 90) {
            _unlockMilestone(tokenId, "logic_lord", newPersonality.analytical);
        }
        
        // Check spiritual guide milestone
        if (oldPersonality.intuition < 90 && newPersonality.intuition >= 90) {
            _unlockMilestone(tokenId, "spiritual_guide", newPersonality.intuition);
        }
        
        // Check balanced soul milestone (all traits > 60)
        bool isBalanced = newPersonality.creativity > 60 &&
                         newPersonality.analytical > 60 &&
                         newPersonality.empathy > 60 &&
                         newPersonality.intuition > 60 &&
                         newPersonality.resilience > 60 &&
                         newPersonality.curiosity > 60;
        
        if (isBalanced && !milestones[tokenId]["balanced_soul"].achieved) {
            _unlockMilestone(tokenId, "balanced_soul", 60);
        }
    }
    
    /// @notice Unlock a personality milestone
    /// @param tokenId Agent unlocking milestone
    /// @param milestone Milestone name
    /// @param traitValue Associated trait value
    function _unlockMilestone(uint256 tokenId, string memory milestone, uint8 traitValue) internal {
        milestones[tokenId][milestone] = MilestoneData({
            achieved: true,
            achievedAt: block.timestamp,
            traitValue: traitValue
        });
        
        agents[tokenId].achievedMilestones.push(milestone);
        
        emit PersonalityMilestone(tokenId, milestone, traitValue, "");
        emit MilestoneUnlocked(tokenId, milestone, traitValue);
    }
    
    /// @notice Calculate trait variance for rarity scoring
    /// @param traits Personality traits
    /// @return variance Trait variance score
    function _calculateTraitVariance(PersonalityTraits memory traits) internal pure returns (uint256 variance) {
        uint256[6] memory values = [
            uint256(traits.creativity),
            uint256(traits.analytical),
            uint256(traits.empathy),
            uint256(traits.intuition),
            uint256(traits.resilience),
            uint256(traits.curiosity)
        ];
        
        // Calculate mean
        uint256 sum = 0;
        for (uint256 i = 0; i < 6; i++) {
            sum += values[i];
        }
        uint256 mean = sum / 6;
        
        // Calculate variance
        uint256 varianceSum = 0;
        for (uint256 i = 0; i < 6; i++) {
            uint256 diff = values[i] > mean ? values[i] - mean : mean - values[i];
            varianceSum += diff * diff;
        }
        variance = varianceSum / 6;
    }
    
    /// @notice Count dominant traits (>80) for rarity scoring
    /// @param traits Personality traits
    /// @return count Number of dominant traits
    function _countDominantTraits(PersonalityTraits memory traits) internal pure returns (uint256 count) {
        if (traits.creativity > 80) count++;
        if (traits.analytical > 80) count++;
        if (traits.empathy > 80) count++;
        if (traits.intuition > 80) count++;
        if (traits.resilience > 80) count++;
        if (traits.curiosity > 80) count++;
    }
    
    /// @notice Calculate balance penalty for rarity scoring
    /// @param traits Personality traits
    /// @return penalty Balance penalty score
    function _calculateBalancePenalty(PersonalityTraits memory traits) internal pure returns (uint256 penalty) {
        bool isBalanced = traits.creativity >= 40 && traits.creativity <= 60 &&
                         traits.analytical >= 40 && traits.analytical <= 60 &&
                         traits.empathy >= 40 && traits.empathy <= 60 &&
                         traits.intuition >= 40 && traits.intuition <= 60 &&
                         traits.resilience >= 40 && traits.resilience <= 60 &&
                         traits.curiosity >= 40 && traits.curiosity <= 60;
        
        return isBalanced ? 200 : 0; // Penalty for being too balanced
    }
    
    /// @notice Calculate absolute difference between two uint8 values
    /// @param a First value
    /// @param b Second value
    /// @return diff Absolute difference
    function _absDiff(uint8 a, uint8 b) internal pure returns (uint256 diff) {
        return a > b ? a - b : b - a;
    }
    
    // Missing interface functions
    
    /// @notice Get personality evolution statistics
    /// @param tokenId Agent to analyze
    /// @return totalEvolutions Number of personality changes
    /// @return evolutionRate Rate of personality change
    /// @return lastEvolution Timestamp of last evolution
    function getEvolutionStats(uint256 tokenId) 
        external view override returns (
            uint256 totalEvolutions,
            uint256 evolutionRate,
            uint256 lastEvolution
        ) {
        require(agents[tokenId].personalityInitialized, "Personality not initialized");
        
        totalEvolutions = agents[tokenId].totalEvolutions;
        lastEvolution = agents[tokenId].lastEvolutionDate;
        
        // Calculate evolution rate (evolutions per day)
        if (block.timestamp > agents[tokenId].createdAt) {
            uint256 daysSinceCreation = (block.timestamp - agents[tokenId].createdAt) / 1 days;
            evolutionRate = daysSinceCreation > 0 ? (totalEvolutions * 100) / daysSinceCreation : 0;
        } else {
            evolutionRate = 0;
        }
    }
    
    /// @notice Get trait evolution history
    /// @param tokenId Agent to analyze
    /// @param traitName Trait to track
    /// @param limit Maximum history entries (0 = all)
    /// @return timestamps Array of evolution timestamps
    /// @return values Array of trait values at each timestamp
    function getTraitEvolution(uint256 tokenId, string calldata traitName, uint256 limit) 
        external view override returns (uint256[] memory timestamps, uint8[] memory values) {
        TraitEvolution[] storage history = traitHistory[tokenId][traitName];
        
        uint256 length = limit == 0 || limit > history.length ? history.length : limit;
        timestamps = new uint256[](length);
        values = new uint8[](length);
        
        // Return most recent entries
        uint256 startIndex = history.length > length ? history.length - length : 0;
        for (uint256 i = 0; i < length; i++) {
            timestamps[i] = history[startIndex + i].timestamp;
            values[i] = history[startIndex + i].newValue;
        }
    }
    
    /// @notice Check if agent has reached specific personality milestone
    /// @param tokenId Agent to check
    /// @param milestone Milestone to check
    /// @return achieved True if milestone has been achieved
    /// @return achievedAt Timestamp when milestone was achieved
    function hasMilestone(uint256 tokenId, string calldata milestone) 
        external view override returns (bool achieved, uint256 achievedAt) {
        MilestoneData memory m = milestones[tokenId][milestone];
        return (m.achieved, m.achievedAt);
    }
    
    /// @notice Get multiple agents' personality summaries
    /// @param tokenIds Array of agent IDs
    /// @return summaries Array of personality summaries
    function getPersonalitySummaries(uint256[] calldata tokenIds) 
        external view override returns (PersonalityTraits[] memory summaries) {
        summaries = new PersonalityTraits[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (agents[tokenIds[i]].personalityInitialized) {
                summaries[i] = agentPersonalities[tokenIds[i]];
            }
        }
    }
    
    /// @notice Find agents with specific trait ranges
    /// @param traitName Trait to filter by
    /// @param minValue Minimum trait value (inclusive)
    /// @param maxValue Maximum trait value (inclusive)
    /// @param offset Pagination offset
    /// @param limit Maximum results to return
    /// @return tokenIds Array of matching agent IDs
    function findAgentsByTrait(
        string calldata traitName,
        uint8 minValue,
        uint8 maxValue,
        uint256 offset,
        uint256 limit
    ) external view override returns (uint256[] memory tokenIds) {
        require(minValue <= maxValue, "Invalid range");
        
        // This would need optimization for large datasets
        uint256[] memory matches = new uint256[](totalAgents);
        uint256 matchCount = 0;
        
        for (uint256 i = 1; i <= nextTokenId - 1; i++) {
            if (!agents[i].personalityInitialized) continue;
            
            uint8 traitValue = _getTraitValue(i, traitName);
            if (traitValue >= minValue && traitValue <= maxValue) {
                matches[matchCount] = i;
                matchCount++;
            }
        }
        
        // Apply pagination
        uint256 startIndex = offset;
        uint256 endIndex = startIndex + limit;
        if (endIndex > matchCount) endIndex = matchCount;
        
        if (startIndex >= matchCount) {
            return new uint256[](0);
        }
        
        tokenIds = new uint256[](endIndex - startIndex);
        for (uint256 i = 0; i < endIndex - startIndex; i++) {
            tokenIds[i] = matches[startIndex + i];
        }
    }
    
    /// @notice Get trait value by name
    /// @param tokenId Agent ID
    /// @param traitName Trait name
    /// @return value Trait value
    function _getTraitValue(uint256 tokenId, string memory traitName) internal view returns (uint8 value) {
        PersonalityTraits memory traits = agentPersonalities[tokenId];
        
        if (keccak256(bytes(traitName)) == keccak256(bytes("creativity"))) return traits.creativity;
        if (keccak256(bytes(traitName)) == keccak256(bytes("analytical"))) return traits.analytical;
        if (keccak256(bytes(traitName)) == keccak256(bytes("empathy"))) return traits.empathy;
        if (keccak256(bytes(traitName)) == keccak256(bytes("intuition"))) return traits.intuition;
        if (keccak256(bytes(traitName)) == keccak256(bytes("resilience"))) return traits.resilience;
        if (keccak256(bytes(traitName)) == keccak256(bytes("curiosity"))) return traits.curiosity;
        
        return 0; // Invalid trait name
    }
    
    // ERC-7857 standard functions (simplified for personality preservation)
    
    /// @notice Transfer agent with personality preservation
    /// @param to New owner address
    /// @param tokenId Agent to transfer
    function transfer(address to, uint256 tokenId, bytes[] calldata /* proofs */) external override {
        require(to != address(0), "Cannot transfer to zero address");
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        
        address from = agents[tokenId].owner;
        agents[tokenId].owner = to;
        agents[tokenId].lastUpdated = block.timestamp;
        
        emit Transferred(tokenId, from, to);
    }
    
    /// @notice Clone agent with personality preservation
    /// @param to Address to clone agent for
    /// @param tokenId Agent to clone
    /// @return newTokenId The cloned agent token ID
    function clone(address to, uint256 tokenId, bytes[] calldata /* proofs */) 
        external payable override returns (uint256 newTokenId) {
        require(to != address(0), "Cannot clone to zero address");
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        require(totalAgents < MAX_AGENTS, "Maximum agents limit reached");
        require(msg.value >= MINTING_FEE, "Insufficient payment for cloning");
        
        // Create cloned agent with preserved personality
        newTokenId = nextTokenId++;
        agents[newTokenId] = agents[tokenId]; // Copy all data
        agents[newTokenId].owner = to;
        agents[newTokenId].createdAt = block.timestamp;
        agents[newTokenId].lastUpdated = block.timestamp;
        agents[newTokenId].dreamCount = 0; // Reset for new owner
        agents[newTokenId].conversationCount = 0;
        agents[newTokenId].totalEvolutions = 0;
        
        // Preserve personality but reset evolution tracking
        agentPersonalities[newTokenId] = agentPersonalities[tokenId];
        agentPersonalities[newTokenId].lastDreamDate = 0; // Allow immediate dreams
        
        totalAgents++;
        totalFeesCollected += MINTING_FEE;
        
        // Handle payment
        (bool success, ) = treasury.call{value: MINTING_FEE}("");
        require(success, "Treasury payment failed");
        
        if (msg.value > MINTING_FEE) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - MINTING_FEE}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit Cloned(tokenId, newTokenId, msg.sender, to);
        // Emit standard Minted for clone
        emit Minted(newTokenId, msg.sender, to, agents[tokenId].dataHashes, agents[tokenId].dataDescriptions);
        emit FeePaid(newTokenId, msg.sender, MINTING_FEE);
    }
    
    // Standard ERC-7857 functions
    function ownerOf(uint256 tokenId) external view override returns (address) {
        return agents[tokenId].owner;
    }
    
    function authorizedUsersOf(uint256 tokenId) external view override returns (address[] memory) {
        return agents[tokenId].authorizedUsers;
    }
    
    function authorizeUsage(uint256 tokenId, address user) external override {
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        require(user != address(0), "Cannot authorize zero address");
        
        agents[tokenId].authorizedUsers.push(user);
        emit AuthorizedUsage(tokenId, user);
    }
    
    // Legacy/unused functions
    function transferPublic(address, uint256) external pure override {
        revert("Public transfer not implemented");
    }
    
    function clonePublic(address, uint256) external payable override returns (uint256) {
        revert("Public clone not implemented");
    }
    
    function mint(bytes[] calldata, string[] calldata, address) external payable returns (uint256) {
        revert("Use mintWithPersonality instead");
    }
    
    // Missing ERC-7857 and NFT standard functions
    
    /// @notice Get total supply of agents
    /// @return Total number of minted agents
    function totalSupply() external view returns (uint256) {
        return totalAgents;
    }
    
    /// @notice Get balance of owner
    /// @param owner Address to check
    /// @return Number of agents owned
    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Invalid address");
        uint256 balance = 0;
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (agents[i].owner == owner) {
                balance++;
            }
        }
        return balance;
    }
    
    /// @notice Get simplified token URI for metadata
    /// @param tokenId Token to get URI for
    /// @return Simplified metadata string
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(agents[tokenId].owner != address(0), "Token does not exist");
        
        DreamAgent memory agent = agents[tokenId];
        PersonalityTraits memory personality = agentPersonalities[tokenId];
        
        return string(abi.encodePacked(
            'data:application/json,{"name":"', agent.agentName, '",',
            '"description":"Dreamscape AI Agent",',
            '"attributes":[',
            '{"trait_type":"Intelligence","value":', _toString(agent.intelligenceLevel), '},',
            '{"trait_type":"Dreams","value":', _toString(agent.dreamCount), '},',
            '{"trait_type":"Creativity","value":', _toString(personality.creativity), '},',
            '{"trait_type":"Empathy","value":', _toString(personality.empathy), '}',
            ']}'
        ));
    }
    
    /// @notice Check if contract supports interface
    /// @param interfaceId Interface identifier
    /// @return True if supported
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || // ERC165
               interfaceId == 0x80ac58cd || // ERC721
               interfaceId == 0x5b5e139f;   // ERC721Metadata
    }
    
    /// @notice Get agent's creation timestamp
    /// @param tokenId Agent to query
    /// @return Creation timestamp
    function getCreationTime(uint256 tokenId) external view returns (uint256) {
        return agents[tokenId].createdAt;
    }
    
    /// @notice Get agent's name
    /// @param tokenId Agent to query
    /// @return Agent name
    function getAgentName(uint256 tokenId) external view returns (string memory) {
        return agents[tokenId].agentName;
    }
    
    // Helper functions removed to reduce contract size
    
    /// @notice Convert uint to string
    /// @param value Number to convert
    /// @return String representation
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    // Base64 encoding removed to reduce contract size
} 