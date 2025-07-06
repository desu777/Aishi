// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857DataVerifier.sol";
import "./interfaces/IPersonalityEvolution.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title DreamscapeAgent - Enhanced Personality Evolution iNFTs
/// @notice Advanced dream agents that develop unique personalities based on user dreams
/// @dev Implements ERC-7857 with comprehensive personality evolution system. Limited to 1 agent per wallet.
contract DreamscapeAgent is IERC7857, IPersonalityEvolution, ReentrancyGuard, AccessControl, Pausable {
    
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
    
    // Access control roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Access control modifiers
    modifier onlyOwnerOrAuthorized(uint256 tokenId) {
        require(
            agents[tokenId].owner == msg.sender || 
            hasRole(ADMIN_ROLE, msg.sender) ||
            _isAuthorizedUser(tokenId, msg.sender),
            "Unauthorized access"
        );
        _;
    }
    
    modifier onlyOwnerOrAdmin(uint256 tokenId) {
        require(
            agents[tokenId].owner == msg.sender || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Not agent owner or admin"
        );
        _;
    }
    
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
    

    
    // Contract state
    mapping(uint256 => DreamAgent) public agents;
    mapping(string => bool) public nameExists;
    uint256 public nextTokenId = 1;
    uint256 public totalAgents = 0;
    uint256 public totalFeesCollected = 0;
    
    // One agent per wallet optimization
    mapping(address => uint256) public ownerToTokenId; // 0 = no agent
    
    // Personality system state
    mapping(uint256 => PersonalityTraits) public agentPersonalities;
    mapping(uint256 => bytes32[]) public dreamHashes;
    mapping(uint256 => bytes32[]) public conversationHashes;
    mapping(uint256 => bytes32[]) public dreamAnalysisHashes;
    
    // Milestone tracking
    mapping(uint256 => mapping(string => MilestoneData)) public milestones;
    
    // Response style mappings
    mapping(uint256 => string) public responseStyles;
    
    // Contract metadata
    string public name = "DreamscapeAgent";
    string public symbol = "DREAM";
    
    // Verifier for proof validation
    IERC7857DataVerifier public immutable verifier;
    
    // Enhanced events from IPersonalityEvolution (already defined there)
    
    // Additional v2-specific events
    event PersonalityActivated(uint256 indexed tokenId, PersonalityTraits newPersonality, uint256 dreamsSoFar);
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
        
        // Initialize access control
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    /// @notice Mint new dream agent (starts as blank slate)
    /// @param proofs Ownership proofs for initial data
    /// @param descriptions Data type descriptions
    /// @param agentName User-given name for the agent
    /// @param to Address to mint agent for
    /// @return tokenId The newly minted agent token ID
    function mintAgent(
        bytes[] calldata proofs,
        string[] calldata descriptions,
        string memory agentName,
        address to
    ) external payable nonReentrant whenNotPaused returns (uint256 tokenId) {
        require(to != address(0), "Invalid address");
        require(ownerToTokenId[to] == 0, "Wallet already has an agent");
        require(descriptions.length == proofs.length, "Length mismatch");
        require(totalAgents < MAX_AGENTS, "Max limit reached");
        require(bytes(agentName).length > 0 && bytes(agentName).length <= 32, "Invalid name");
        require(!nameExists[agentName], "Name exists");
        require(msg.value >= MINTING_FEE, "Insufficient payment");
        
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
        ownerToTokenId[to] = tokenId; // Update owner mapping
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
            personalityInitialized: false, // Agent starts as blank slate
            totalEvolutions: 0,
            lastEvolutionDate: block.timestamp,
            achievedMilestones: new string[](0)
        });
        
        // Initialize neutral personality (blank slate)
        agentPersonalities[tokenId] = PersonalityTraits({
            creativity: 50,
            analytical: 50,
            empathy: 50,
            intuition: 50,
            resilience: 50,
            curiosity: 50,
            dominantMood: "neutral",
            lastDreamDate: 0 // Allow immediate first dream
        });
        
        // Set neutral response style
        responseStyles[tokenId] = "neutral";
        
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
        emit FeePaid(tokenId, msg.sender, MINTING_FEE);
        
        return tokenId;
    }
    
    /// @notice Process daily dream and evolve agent personality (every 5th dream)
    /// @param tokenId Agent to evolve
    /// @param dreamHash 0G Storage hash of encrypted dream data
    /// @param dreamAnalysisHash 0G Storage hash of AI analysis
    /// @param impact Personality changes from dream analysis (only used every 5th dream)
    function processDailyDream(
        uint256 tokenId,
        bytes32 dreamHash,
        bytes32 dreamAnalysisHash,
        PersonalityImpact calldata impact
    ) external override whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        require(canProcessDreamToday(tokenId), "Daily dream already processed");
        
        // Validate impact values
        _validatePersonalityImpact(impact);
        
        // Store dream and analysis hashes
        dreamHashes[tokenId].push(dreamHash);
        dreamAnalysisHashes[tokenId].push(dreamAnalysisHash);
        
        // Update agent metadata
        agents[tokenId].dreamCount++;
        agents[tokenId].lastUpdated = block.timestamp;
        
        // Update timestamp for cooldown
        PersonalityTraits storage personality = agentPersonalities[tokenId];
        personality.lastDreamDate = block.timestamp;
        
        // Check if it's time for personality evolution (every 5th dream)
        bool shouldEvolve = agents[tokenId].dreamCount % 5 == 0;
        
        if (shouldEvolve) {
            // Validate impact for evolution
            _validatePersonalityImpact(impact);
            
            // Apply personality evolution
            PersonalityTraits memory oldPersonality = personality;
            
            // Update traits with bounds checking
            personality.creativity = _updateTrait(personality.creativity, impact.creativityChange);
            personality.analytical = _updateTrait(personality.analytical, impact.analyticalChange);
            personality.empathy = _updateTrait(personality.empathy, impact.empathyChange);
            personality.intuition = _updateTrait(personality.intuition, impact.intuitionChange);
            personality.resilience = _updateTrait(personality.resilience, impact.resilienceChange);
            personality.curiosity = _updateTrait(personality.curiosity, impact.curiosityChange);
            
            // Update mood
            personality.dominantMood = impact.moodShift;
            
            // Mark personality as initialized after first evolution
            if (!agents[tokenId].personalityInitialized) {
                agents[tokenId].personalityInitialized = true;
                emit PersonalityActivated(tokenId, personality, agents[tokenId].dreamCount);
            }
            
            // Update evolution metadata
            agents[tokenId].totalEvolutions++;
            agents[tokenId].lastEvolutionDate = block.timestamp;
            
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
        }
        
        // Intelligence evolution (every 3 dreams)
        if (agents[tokenId].dreamCount % 3 == 0) {
            agents[tokenId].intelligenceLevel++;
            emit AgentEvolved(tokenId, agents[tokenId].intelligenceLevel - 1, agents[tokenId].intelligenceLevel);
        }
        
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
    ) external override whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        
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
    /// @return traits Current personality traits (neutral if not evolved yet)
    function getPersonalityTraits(uint256 tokenId) 
        external view override returns (PersonalityTraits memory traits) {
        require(agents[tokenId].owner != address(0), "Agent does not exist");
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
    
    /// @notice Update trait with bounds checking
    /// @param currentValue Current trait value
    /// @param change Change amount
    /// @return newValue Updated trait value
    function _updateTrait(uint8 currentValue, int8 change) internal pure returns (uint8 newValue) {
        // Convert to int256 for safe arithmetic
        int256 temp = int256(uint256(currentValue)) + int256(change);
        
        // Clamp between 0 and 100
        if (temp < 0) temp = 0;
        if (temp > 100) temp = 100;
        newValue = uint8(uint256(temp));
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
        require(agents[tokenId].owner != address(0), "Agent does not exist");
        
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
    function transfer(address to, uint256 tokenId, bytes[] calldata /* proofs */) external override onlyOwnerOrAdmin(tokenId) {
        require(to != address(0), "Cannot transfer to zero address");
        require(ownerToTokenId[to] == 0, "Recipient already has an agent");
        
        address from = agents[tokenId].owner;
        
        // Update owner mappings
        ownerToTokenId[from] = 0; // Remove from old owner
        ownerToTokenId[to] = tokenId; // Add to new owner
        
        agents[tokenId].owner = to;
        agents[tokenId].lastUpdated = block.timestamp;
        
        emit Transferred(tokenId, from, to);
    }
    

    
    // Standard ERC-7857 functions
    function ownerOf(uint256 tokenId) external view override returns (address) {
        return agents[tokenId].owner;
    }
    
    function authorizedUsersOf(uint256 tokenId) external view override returns (address[] memory) {
        return agents[tokenId].authorizedUsers;
    }
    
    function authorizeUsage(uint256 tokenId, address user) external override onlyOwnerOrAdmin(tokenId) {
        require(user != address(0), "Cannot authorize zero address");
        
        agents[tokenId].authorizedUsers.push(user);
        emit AuthorizedUsage(tokenId, user);
    }
    

    

    
    

    
    // Missing ERC-7857 and NFT standard functions
    
    /// @notice Get total supply of agents
    /// @return Total number of minted agents
    function totalSupply() external view returns (uint256) {
        return totalAgents;
    }
    
    /// @notice Get balance of owner (0 or 1 due to one agent limit)
    /// @param owner Address to check
    /// @return Number of agents owned (0 or 1)
    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Invalid address");
        return ownerToTokenId[owner] > 0 ? 1 : 0;
    }
    

    
    /// @notice Check if contract supports interface
    /// @param interfaceId Interface identifier
    /// @return True if supported
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == 0x01ffc9a7 || // ERC165
               interfaceId == 0x80ac58cd || // ERC721
               interfaceId == 0x5b5e139f || // ERC721Metadata
               super.supportsInterface(interfaceId); // AccessControl interfaces
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
    
    /// @notice Get owner's agent token ID
    /// @param owner Address to check
    /// @return tokenId Agent token ID (0 if no agent)
    function getOwnerTokenId(address owner) external view returns (uint256) {
        return ownerToTokenId[owner];
    }
    
    /// @notice Get caller's agent token ID
    /// @return tokenId Agent token ID (0 if no agent)
    function getUserTokenId() external view returns (uint256) {
        return ownerToTokenId[msg.sender];
    }
    
    /// @notice Complete agent information structure
    struct AgentInfo {
        uint256 tokenId;
        address owner;
        string agentName;
        uint256 createdAt;
        uint256 lastUpdated;
        uint256 intelligenceLevel;
        uint256 dreamCount;
        uint256 conversationCount;
        bool personalityInitialized;
        uint256 totalEvolutions;
        uint256 lastEvolutionDate;
        PersonalityTraits personality;
    }
    
    /// @notice Get complete agent information by token ID
    /// @param tokenId Agent to query
    /// @return info Complete agent information
    function getAgentInfo(uint256 tokenId) external view returns (AgentInfo memory info) {
        require(agents[tokenId].owner != address(0), "Agent does not exist");
        
        DreamAgent memory agent = agents[tokenId];
        PersonalityTraits memory personality = agentPersonalities[tokenId];
        
        info = AgentInfo({
            tokenId: tokenId,
            owner: agent.owner,
            agentName: agent.agentName,
            createdAt: agent.createdAt,
            lastUpdated: agent.lastUpdated,
            intelligenceLevel: agent.intelligenceLevel,
            dreamCount: agent.dreamCount,
            conversationCount: agent.conversationCount,
            personalityInitialized: agent.personalityInitialized,
            totalEvolutions: agent.totalEvolutions,
            lastEvolutionDate: agent.lastEvolutionDate,
            personality: personality
        });
    }
    
    /// @notice Get owner's agent complete information
    /// @param owner Address to check
    /// @return info Complete agent information (or empty if no agent)
    function getOwnerAgent(address owner) external view returns (AgentInfo memory info) {
        uint256 tokenId = ownerToTokenId[owner];
        if (tokenId == 0) {
            // Return empty struct if no agent
            return AgentInfo({
                tokenId: 0,
                owner: address(0),
                agentName: "",
                createdAt: 0,
                lastUpdated: 0,
                intelligenceLevel: 0,
                dreamCount: 0,
                conversationCount: 0,
                personalityInitialized: false,
                totalEvolutions: 0,
                lastEvolutionDate: 0,
                personality: PersonalityTraits({
                    creativity: 0,
                    analytical: 0,
                    empathy: 0,
                    intuition: 0,
                    resilience: 0,
                    curiosity: 0,
                    dominantMood: "",
                    lastDreamDate: 0
                })
            });
        }
        
        return this.getAgentInfo(tokenId);
    }
    
    /// @notice Get caller's agent complete information
    /// @return info Complete agent information (or empty if no agent)
    function getUserAgent() external view returns (AgentInfo memory info) {
        return this.getOwnerAgent(msg.sender);
    }
    
    // Emergency controls
    
    /// @notice Pause contract operations
    /// @dev Only accounts with PAUSER_ROLE can pause
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /// @notice Unpause contract operations
    /// @dev Only accounts with PAUSER_ROLE can unpause
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /// @notice Emergency admin function to authorize user
    /// @param tokenId Agent to authorize user for
    /// @param user User to authorize
    /// @dev Only ADMIN_ROLE can use this in emergencies
    function emergencyAuthorizeUser(uint256 tokenId, address user) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Cannot authorize zero address");
        agents[tokenId].authorizedUsers.push(user);
        emit AuthorizedUsage(tokenId, user);
    }
    
    /// @notice Emergency admin function to transfer agent
    /// @param tokenId Agent to transfer
    /// @param to New owner
    /// @dev Only ADMIN_ROLE can use this in emergencies
    function emergencyTransfer(uint256 tokenId, address to) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Cannot transfer to zero address");
        require(ownerToTokenId[to] == 0, "Recipient already has an agent");
        
        address from = agents[tokenId].owner;
        
        // Update owner mappings
        ownerToTokenId[from] = 0; // Remove from old owner
        ownerToTokenId[to] = tokenId; // Add to new owner
        
        agents[tokenId].owner = to;
        agents[tokenId].lastUpdated = block.timestamp;
        emit Transferred(tokenId, from, to);
    }
    
    // Helper functions removed to reduce contract size
    
    /// @notice Check if user is authorized to use agent
    /// @param tokenId Agent to check
    /// @param user User to check
    /// @return True if user is authorized
    function _isAuthorizedUser(uint256 tokenId, address user) internal view returns (bool) {
        address[] memory authorizedUsers = agents[tokenId].authorizedUsers;
        for (uint256 i = 0; i < authorizedUsers.length; i++) {
            if (authorizedUsers[i] == user) {
                return true;
            }
        }
        return false;
    }
    

    
    // Base64 encoding removed to reduce contract size
} 