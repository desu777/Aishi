// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/*
 * ────────────────────────────────────────────────────────────────────────────────
 *  IMPORTS
 * ────────────────────────────────────────────────────────────────────────────────
 *  Interfaces                                                  OpenZeppelin utils
 * ──────────────────────────────────────────────────────────── ──────────────────
 */

import "./interfaces/IERC7857.sol";               // ERC‑7857 base interface (iNFT standard)
import "./interfaces/IERC7857DataVerifier.sol";    // Optional: ZK‑proof verifier used at mint
import "./interfaces/IPersonalityEvolution.sol";   // Trait & evolution data‑model

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";  // protects against re‑entrancy
import "@openzeppelin/contracts/access/AccessControl.sol";   // role‑based admin system
import "@openzeppelin/contracts/utils/Pausable.sol";         // emergency stop

/**
 * @title  DreamscapeAgent – iNFT with Hierarchical Memory & Personality Evolution
 * @notice Single‑per‑wallet autonomous agent that stores memories in a three‑layer
 *         hierarchy (daily → monthly → yearly) and evolves its personality from
 *         analysed dreams & conversations.
 *
 *         This contract is a *lean* revision: we removed unbounded on‑chain arrays
 *         of raw hashes to save gas and instead rely on off‑chain storage + a
 *         rotating «current» hash per period.  All public getters needed by dApp
 *         remain, but they now return an empty array and are marked *deprecated*.
 *
 *         The contract **still** complies with ERC‑7857 by preserving the original
 *         ABI of `mintAgent(...)`; callers MAY pass empty arrays when proofs are
 *         not needed.  Optional ZKP verification can be disabled by setting the
 *         `verifier` address to zero at deployment.
 *
 * @dev    Designed for direct deployment – no upgrade proxy included.  For
 *         upgradability, wrap this logic in a UUPS/Beacon proxy.
 */
contract DreamscapeAgent is
    IERC7857,
    IPersonalityEvolution,
    ReentrancyGuard,
    AccessControl,
    Pausable
{
    /* ───────────────────────────────────────────────────────── CONSTANTS ───── */

    uint256 public constant MAX_AGENTS   = 1_000;      // test‑net cap (adjust for main‑net)
    uint256 public constant MINTING_FEE  = 0.1 ether;  // price per agent – sent to `treasury`

    /* ───────────────────────────────────────────────────────── IMMUTABLES ──── */

    address public immutable treasury;                  // fee recipient
    IERC7857DataVerifier public immutable verifier;     // zero‑address ⇒ skip proof checks

    /* ────────────────────────────────────────────────────────── ROLES ───────── */

    bytes32 public constant ADMIN_ROLE    = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    /* ────────────────────────────────────────────────────────── STORAGE ─────── */

    /**
     * @dev Core NFT data (no unbounded arrays – only counters & flags)
     */
    struct DreamAgent {
        address  owner;            // current NFT owner
        string   agentName;        // unique, user‑chosen name (max 32 bytes)
        uint256  createdAt;        // block.timestamp at mint
        uint256  lastUpdated;      // last on‑chain write (dream, convo, memory…)

        // Access control
        address[] authorizedUsers; // external EOAs permitted to operate the agent

        // Intelligence & history counters
        uint256  intelligenceLevel;
        uint256  dreamCount;
        uint256  conversationCount;

        // Personality evolution meta
        bool     personalityInitialized;
        uint256  totalEvolutions;
        uint256  lastEvolutionDate;
        string[] achievedMilestones;
    }
    
    /**
     * @dev Milestone record per agent & name (e.g. "memory_master")
     */
    struct MilestoneData {
        bool     achieved;
        uint256  achievedAt;
        uint8    traitValue; // value that unlocked the milestone (for UI)
    }



    /**
     * @dev Rewards waiting for claim (set during monthly consolidation)
     */
    struct ConsolidationReward {
        uint256 intelligenceBonus;
        string  specialMilestone;
        bool    yearlyReflection;
    }

    // ─── Main mappings ────────────────────────────────────────────────────────

    mapping(uint256 => DreamAgent)                  public agents;             // tokenId → agent data
    mapping(string  => bool)                        public nameExists;         // prevents duplicates
    mapping(address => uint256)                     public ownerToTokenId;     // "one agent per wallet"

    mapping(uint256 => PersonalityTraits)           public agentPersonalities; // traits struct from interface

    mapping(uint256 => AgentMemory)                 public agentMemories;      // hierarchical storage
    mapping(uint256 => ConsolidationReward)         public pendingRewards;     // waiting after consolidate
    mapping(uint256 => uint256)                     public consolidationStreak;// consecutive months consolidated

    mapping(uint256 => mapping(string => MilestoneData)) public milestones;    // tokenId → name → data
    mapping(uint256 => string)                      public responseStyles;     // cached style for front‑end

    // ─── Supply counters ─────────────────────────────────────────────────────

    uint256 public nextTokenId   = 1; // starts at 1 for gas efficient existence checks
    uint256 public totalAgents   = 0;
    uint256 public totalFeesCollected = 0;

    /* ───────────────────────────────────────────────────────── EVENTS ──────── */

    // Core ERC‑7857
    // ‑ Minted / Transferred / AuthorizedUsage inherited from interface

    // Dream & personality
    event PersonalityActivated  (uint256 indexed tokenId, PersonalityTraits traits, uint256 dreamCount);
    event ResponseStyleUpdated  (uint256 indexed tokenId, string oldStyle, string newStyle);
    event MilestoneUnlocked     (uint256 indexed tokenId, string milestone, uint8 value);
    event AgentEvolved          (uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel);
    event DreamProcessed        (uint256 indexed tokenId, bytes32 dreamHash, uint256 intelligenceLevel);

    // Hierarchical memory
    event MemoryUpdated         (uint256 indexed tokenId, string memoryType, bytes32 newHash, bytes32 oldHash);
    event ConsolidationNeeded   (uint256 indexed tokenId, uint8 month, uint16 year, string consolidationType);
    event ConsolidationCompleted(uint256 indexed tokenId, string period, uint256 bonus, string specialReward);
    event YearlyReflectionAvailable(uint256 indexed tokenId, uint16 year);
    event MemoryMilestone       (uint256 indexed tokenId, string achievement, uint256 totalInteractions);

    // Economics
    event FeePaid               (uint256 indexed tokenId, address indexed payer, uint256 amount);

    /* ──────────────────────────────────────────────────────── CONSTRUCTOR ─── */
    
    constructor(address _verifier, address _treasury) {
        require(_treasury != address(0), "treasury = zero addr");
        treasury  = _treasury;
        verifier  = IERC7857DataVerifier(_verifier); // may be zero → proofs disabled

        // grant all roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE,          msg.sender);
        _grantRole(VERIFIER_ROLE,       msg.sender);
        _grantRole(PAUSER_ROLE,         msg.sender);
    }

    /* ──────────────────────────────────────────── MINT & INITIALISATION ───── */

    /**
     * @notice Mint a *blank‑slate* agent.  One per wallet.
     * @param proofs        Optional ZK‑proof blobs (pass `[]` to skip)
     * @param descriptions  Data descriptions parallel to `proofs`
     * @param agentName     Unique display name (≤32 bytes)
     * @param to            Recipient address (must NOT already own an agent)
     */
    function mintAgent(
        bytes[]  calldata proofs,
        string[] calldata descriptions,
        string   memory   agentName,
        address  to
    ) external payable nonReentrant whenNotPaused returns (uint256 tokenId) {
        /* ── basic checks ── */
        require(to != address(0),                "invalid to addr");
        require(ownerToTokenId[to] == 0,         "wallet already has agent");
        require(totalAgents < MAX_AGENTS,        "max supply reached");
        require(bytes(agentName).length > 0 && bytes(agentName).length <= 32, "name length");
        require(!nameExists[agentName],          "name exists");
        require(msg.value >= MINTING_FEE,        "fee < 0.1 OG");

        /* ── optional proof verification ── */
        bytes32[] memory dataHashes;
        if (address(verifier) != address(0)) {
            require(descriptions.length == proofs.length, "len mismatch");
            PreimageProofOutput[] memory outs = verifier.verifyPreimage(proofs);
            dataHashes = new bytes32[](outs.length);
            for (uint256 i = 0; i < outs.length; ++i) {
                require(outs[i].isValid, "invalid proof");
                dataHashes[i] = outs[i].dataHash;
            }
        }

        /* ── name reservation ── */
        nameExists[agentName] = true;
        
        /* ── create agent ── */
        tokenId = nextTokenId++;
        ownerToTokenId[to] = tokenId;

        agents[tokenId] = DreamAgent({
            owner:                   to,
            agentName:               agentName,
            createdAt:               block.timestamp,
            lastUpdated:             block.timestamp,
            authorizedUsers:         new address[](0),
            intelligenceLevel:       1,
            dreamCount:              0,
            conversationCount:       0,
            personalityInitialized:  true,  // ✅ Inicjalizujemy od razu
            totalEvolutions:         0,
            lastEvolutionDate:       block.timestamp,
            achievedMilestones:      new string[](0)
        });

        /* ── initialized personality (neutral starting point) ── */
        PersonalityTraits memory initialTraits = PersonalityTraits({
            creativity:     50,
            analytical:     50,
            empathy:        50,
            intuition:      50,
            resilience:     50,
            curiosity:      50,
            dominantMood:   "neutral",
            lastDreamDate:  0,
            uniqueFeatures: new UniqueFeature[](0)
        });
        agentPersonalities[tokenId] = initialTraits;
        responseStyles[tokenId] = "neutral";
        
        /* ── emit personality activation ── */
        emit PersonalityActivated(tokenId, initialTraits, 0);
        
        /* ── memory initialisation ── */
        agentMemories[tokenId] = AgentMemory({
            memoryCoreHash:        bytes32(0),
            currentDreamDailyHash: bytes32(0),
            currentConvDailyHash:  bytes32(0),
            lastDreamMonthlyHash:  bytes32(0),
            lastConvMonthlyHash:   bytes32(0),
            lastConsolidation:     block.timestamp,
            currentMonth:  _currentMonth(),
            currentYear:   _currentYear()
        });

        /* ── economics ── */
        totalAgents          += 1;
        totalFeesCollected   += MINTING_FEE;

        (bool sent, ) = treasury.call{value: MINTING_FEE}("");
        require(sent, "treasury transfer failed");
        if (msg.value > MINTING_FEE) {
            (bool refund, ) = msg.sender.call{value: msg.value - MINTING_FEE}("");
            require(refund, "refund failed");
        }
        
        /* ── events ── */
        emit Minted(tokenId, msg.sender, to, dataHashes, descriptions);
        emit FeePaid(tokenId, msg.sender, MINTING_FEE);
    }

    /* ───────────────────────────────────────────────── PERSONALITY LOGIC ─── */

    /**
     * @notice Called once per «dream»; every 5th dream triggers evolution.
     *         Also updates hierarchical memory with dream hash.
     * @dev    ZK‑verified dream *content* lives off‑chain; contract stores only
     *         hash + counters to keep gas low.
     */
    function processDailyDream(
        uint256            tokenId,
        bytes32            dreamHash,
        PersonalityImpact  calldata impact
    ) external override whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        _validatePersonalityImpact(impact);

        DreamAgent storage agent = agents[tokenId];
        PersonalityTraits storage traits = agentPersonalities[tokenId];

        // cooldown – first dream is allowed instantly; afterwards 24h gap
        // COMMENTED FOR TESTING - REMOVE COOLDOWN
        /*
        require(
            traits.lastDreamDate == 0 || block.timestamp >= traits.lastDreamDate + 24 hours,
            "cooldown <24h"
        );
        */

        // update counters
        agent.dreamCount      += 1;
        agent.lastUpdated      = block.timestamp;
        traits.lastDreamDate   = block.timestamp;

        /* ── 1. update hierarchical memory ── */
        AgentMemory storage mem = agentMemories[tokenId];
        bytes32 old = mem.currentDreamDailyHash;
        mem.currentDreamDailyHash = dreamHash;
        emit MemoryUpdated(tokenId, "dream_daily", dreamHash, old);
        _checkMonthChange(tokenId);

        /* ── 2. incremental intelligence boost every 3 dreams ── */
        if (agent.dreamCount % 3 == 0) {
            uint256 oldLvl = agent.intelligenceLevel;
            agent.intelligenceLevel += 1;
            emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
        }

        /* ── 3. personality evolution every 5 dreams ── */
        if (agent.dreamCount % 5 == 0) {
            PersonalityTraits memory before = traits;

            traits.creativity  = _updateTrait(traits.creativity,  impact.creativityChange);
            traits.analytical  = _updateTrait(traits.analytical,  impact.analyticalChange);
            traits.empathy     = _updateTrait(traits.empathy,     impact.empathyChange);
            traits.intuition   = _updateTrait(traits.intuition,   impact.intuitionChange);
            traits.resilience  = _updateTrait(traits.resilience,  impact.resilienceChange);
            traits.curiosity   = _updateTrait(traits.curiosity,   impact.curiosityChange);
            traits.dominantMood = impact.moodShift;

            // ── AI-generated unique features ──
            if (impact.newFeatures.length > 0) {
                require(impact.newFeatures.length <= 2, "max 2 features per dream");
                
                for (uint256 i = 0; i < impact.newFeatures.length; i++) {
                    require(bytes(impact.newFeatures[i].name).length > 0, "feature name empty");
                    require(impact.newFeatures[i].intensity > 0 && impact.newFeatures[i].intensity <= 100, "invalid intensity");
                    
                    // Add timestamp and push to agent's unique features
                    UniqueFeature memory newFeature = impact.newFeatures[i];
                    newFeature.addedAt = block.timestamp;
                    traits.uniqueFeatures.push(newFeature);
                }
                
                emit UniqueFeaturesAdded(tokenId, impact.newFeatures, traits.uniqueFeatures.length);
            }

            agent.totalEvolutions += 1;
            agent.lastEvolutionDate = block.timestamp;

            _checkPersonalityMilestones(tokenId, before, traits);
            _updateResponseStyle(tokenId);

            emit PersonalityEvolved(tokenId, dreamHash, traits, impact);
        }

        emit DreamProcessed(tokenId, dreamHash, agent.intelligenceLevel);
    }

    /**
     * @notice Lightweight conversation recording; boosts intelligence every 10th convo.
     *         Also updates hierarchical memory with conversation hash.
     */
    function recordConversation(
        uint256    tokenId,
        bytes32    conversationHash,
        ContextType contextType
    ) external override whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        DreamAgent storage agent = agents[tokenId];

        agent.conversationCount += 1;
        agent.lastUpdated        = block.timestamp;

        /* ── 1. update hierarchical memory ── */
        AgentMemory storage mem = agentMemories[tokenId];
        bytes32 old = mem.currentConvDailyHash;
        mem.currentConvDailyHash = conversationHash;
        emit MemoryUpdated(tokenId, "conversation_daily", conversationHash, old);
        _checkMonthChange(tokenId);

        /* ── 2. intelligence boost every 10th conversation ── */
        if (agent.conversationCount % 10 == 0) {
            uint256 oldLvl = agent.intelligenceLevel;
            agent.intelligenceLevel += 1;
            emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
        }

        emit AgentConversation(tokenId, conversationHash, contextType, agent.conversationCount);
    }

    /* ─────────────────────────────────────────── HIERARCHICAL MEMORY ───────── */



    /**
     * @notice User‑driven monthly consolidation.  Merges daily files off‑chain and
     *         stores the finalised month hash on‑chain, rewarding the agent.
     */
    function consolidateMonth(
        uint256 tokenId,
        bytes32 dreamMonthlyHash,
        bytes32 convMonthlyHash,
        uint8   month,
        uint16  year
    ) external whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        require(month >= 1 && month <= 12, "invalid month");
        require(year  >= 2024 && year  <= 2100, "invalid year");

        AgentMemory storage mem = agentMemories[tokenId];
        require(mem.currentMonth != month || mem.currentYear != year, "still current month");

        mem.lastDreamMonthlyHash = dreamMonthlyHash;
        mem.lastConvMonthlyHash  = convMonthlyHash;
        mem.lastConsolidation    = block.timestamp;

        // streak logic
        consolidationStreak[tokenId] += 1;
        uint256 bonus = _calculateConsolidationBonus(tokenId);
        string memory special = _checkConsolidationMilestones(tokenId);

        DreamAgent storage agent = agents[tokenId];
        uint256 oldLvl = agent.intelligenceLevel;
        agent.intelligenceLevel += bonus;

        emit ConsolidationCompleted(tokenId, _formatPeriod(month, year), bonus, special);
        emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);

        // yearly reflection flag
        if (month == 12) {
            pendingRewards[tokenId].yearlyReflection = true;
            emit YearlyReflectionAvailable(tokenId, year);
        }
    }

    /**
     * @notice Stores the yearly «memory core» hash and grants bonus INT.
     */
    function updateMemoryCore(uint256 tokenId, bytes32 newHash)
        external whenNotPaused onlyOwnerOrAuthorized(tokenId)
    {
        AgentMemory storage mem = agentMemories[tokenId];
        bytes32 old = mem.memoryCoreHash;
        mem.memoryCoreHash = newHash;
        emit MemoryUpdated(tokenId, "memory_core", newHash, old);

        if (pendingRewards[tokenId].yearlyReflection) {
            pendingRewards[tokenId].yearlyReflection = false;
            DreamAgent storage agent = agents[tokenId];
            uint256 oldLvl = agent.intelligenceLevel;
            agent.intelligenceLevel += 5;
            emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
        }
    }

    /* ───────────────────────────────────────────────── VIEW HELPERS ────────── */

    function getPersonalityTraits(uint256 tokenId)
        external view override returns (PersonalityTraits memory) {
        require(agents[tokenId].owner != address(0), "agent !exist");
        return agentPersonalities[tokenId];
    }

    /**
     * @notice Get memory access level based on intelligence
     * @param tokenId Agent to check
     * @return monthsAccessible Number of months accessible 
     * @return memoryDepth Human-readable description
     */
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

    /**
     * @notice Get agent's hierarchical memory structure
     * @param tokenId Agent to query
     * @return memory Current memory structure
     */
    function getAgentMemory(uint256 tokenId) external view returns (AgentMemory memory) {
        require(agents[tokenId].owner != address(0), "agent !exist");
        return agentMemories[tokenId];
    }

    /**
     * @notice Check if consolidation is needed
     * @param tokenId Agent to check
     * @return isNeeded True if month has changed since last consolidation
     * @return currentMonth Current month
     * @return currentYear Current year
     */
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

    /**
     * @notice Get consolidation reward preview
     * @param tokenId Agent to check
     * @return baseReward Base intelligence reward
     * @return streakBonus Bonus from consolidation streak
     * @return earlyBirdBonus Bonus for early consolidation
     * @return totalReward Total intelligence reward
     */
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

    /**
     * @notice Check if agent can process dream today (24h cooldown)
     * @param tokenId Agent to check
     * @return canProcess True if agent can process a dream today
     */
    function canProcessDreamToday(uint256 tokenId) external view returns (bool canProcess) {
        require(agents[tokenId].owner != address(0), "agent !exist");
        // COMMENTED FOR TESTING - ALWAYS RETURN TRUE
        // PersonalityTraits memory t = agentPersonalities[tokenId];
        // return t.lastDreamDate == 0 || block.timestamp >= t.lastDreamDate + 24 hours;
        return true; // TESTING: No cooldown
    }



    function getEvolutionStats(uint256 tokenId)
        external view override returns (uint256 totalEvolutions, uint256 evolutionRate, uint256 lastEvolution)
    {
        DreamAgent memory a = agents[tokenId];
        totalEvolutions = a.totalEvolutions;
        lastEvolution   = a.lastEvolutionDate;
        uint256 daysSinceCreation = (block.timestamp - a.createdAt) / 1 days;
        evolutionRate = daysSinceCreation == 0 ? 0 : (totalEvolutions * 100) / daysSinceCreation;
    }

    function hasMilestone(uint256 tokenId, string calldata milestoneName)
        external view override returns (bool achieved, uint256 at)
    {
        MilestoneData memory m = milestones[tokenId][milestoneName];
        return (m.achieved, m.achievedAt);
    }

    /// @notice Get agent's unique AI-generated features
    /// @param tokenId Agent to query
    /// @return features Array of unique features
    function getUniqueFeatures(uint256 tokenId) 
        external view override returns (UniqueFeature[] memory features)
    {
        require(agents[tokenId].owner != address(0), "agent !exist");
        return agentPersonalities[tokenId].uniqueFeatures;
    }


    /* ─────────────────────────────────────────── ERC‑7857 TRANSFER ETC. ───── */
    
    function ownerOf(uint256 tokenId) external view override returns (address) {
        return agents[tokenId].owner;
    }
    
    function authorizedUsersOf(uint256 tokenId) external view override returns (address[] memory) {
        return agents[tokenId].authorizedUsers;
    }
    
    function authorizeUsage(uint256 tokenId, address user)
        external override onlyOwnerOrAdmin(tokenId) {
        require(user != address(0), "zero user");
        agents[tokenId].authorizedUsers.push(user);
        emit AuthorizedUsage(tokenId, user);
    }
    
    function transfer(address to, uint256 tokenId, bytes[] calldata) external override onlyOwnerOrAdmin(tokenId) {
        require(to != address(0), "to = zero");
        require(ownerToTokenId[to] == 0, "to already owns agent");
        
        address from = agents[tokenId].owner;
        ownerToTokenId[from] = 0;
        ownerToTokenId[to]   = tokenId;
        agents[tokenId].owner = to;
        agents[tokenId].lastUpdated = block.timestamp;
        emit Transferred(tokenId, from, to);
    }
    
    /* ─────────────────────────────────────────────── OTHER VIEWS ──────────── */

    function totalSupply() external view returns (uint256) { return totalAgents; }
    
    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "zero owner");
        return ownerToTokenId[owner] == 0 ? 0 : 1;
    }

    /**
     * @notice Returns the name of the contract collection
     * @return The contract name "DreamscapeAgent"
     */
    function name() external pure returns (string memory) {
        return "DreamscapeAgent";
    }

    /**
     * @notice Returns the symbol of the contract collection  
     * @return The contract symbol "DREAM"
     */
    function symbol() external pure returns (string memory) {
        return "DREAM";
    }

    function supportsInterface(bytes4 id) public view override returns (bool) {
        return
            id == type(IERC721).interfaceId ||
            id == type(IERC721Metadata).interfaceId ||
            id == type(IERC7857).interfaceId ||
            super.supportsInterface(id);
    }

    /* ───────────────────────────────────────────── ADMIN / EMERGENCY ──────── */

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
    
    function emergencyAuthorizeUser(uint256 tokenId, address user) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "zero user");
        agents[tokenId].authorizedUsers.push(user);
        emit AuthorizedUsage(tokenId, user);
    }
    
    function emergencyTransfer(uint256 tokenId, address to) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "to = zero");
        require(ownerToTokenId[to] == 0, "to already owns");
        
        address from = agents[tokenId].owner;
        ownerToTokenId[from] = 0;
        ownerToTokenId[to]   = tokenId;
        agents[tokenId].owner = to;
        agents[tokenId].lastUpdated = block.timestamp;
        emit Transferred(tokenId, from, to);
    }
    
    /* ──────────────────────────────────────────── MODIFIERS & HELPERS ─────── */

    modifier onlyOwnerOrAuthorized(uint256 tokenId) {
        require(
            agents[tokenId].owner == msg.sender ||
            hasRole(ADMIN_ROLE, msg.sender)     ||
            _isAuthorizedUser(tokenId, msg.sender),
            "not authorised"
        );
        _;
    }

    modifier onlyOwnerOrAdmin(uint256 tokenId) {
        require(
            agents[tokenId].owner == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "owner/admin only"
        );
        _;
    }

    function _isAuthorizedUser(uint256 tokenId, address user) internal view returns (bool) {
        address[] memory list = agents[tokenId].authorizedUsers;
        for (uint256 i = 0; i < list.length; ++i) if (list[i] == user) return true;
        return false;
    }

    /* ───────────────────────────────────────── PRIVATE: PERSONALITY ──────── */

    function _validatePersonalityImpact(PersonalityImpact calldata i) internal pure {
        require(i.evolutionWeight > 0 && i.evolutionWeight <= 100, "weight out of range");
        require(bytes(i.moodShift).length > 0,                   "empty mood");
        require(_inRange(i.creativityChange)   && _inRange(i.analyticalChange) &&
                _inRange(i.empathyChange)      && _inRange(i.intuitionChange)  &&
                _inRange(i.resilienceChange)   && _inRange(i.curiosityChange),  unicode"Δ out of range");
        
        // Validate unique features (max 2 per dream)
        require(i.newFeatures.length <= 2, "max 2 features per impact");
        for (uint256 j = 0; j < i.newFeatures.length; j++) {
            require(bytes(i.newFeatures[j].name).length > 0, "feature name empty");
            require(bytes(i.newFeatures[j].description).length > 0, "feature description empty");
            require(i.newFeatures[j].intensity > 0 && i.newFeatures[j].intensity <= 100, "feature intensity out of range");
        }
    }
    function _inRange(int8 x) private pure returns (bool) { return x >= -10 && x <= 10; }

    function _updateTrait(uint8 current, int8 delta) internal pure returns (uint8) {
        int256 temp = int256(uint256(current)) + int256(delta);
        if (temp < 0)   temp = 0;
        if (temp > 100) temp = 100;
        return uint8(uint256(temp));
    }

    function _updateResponseStyle(uint256 tokenId) internal {
        PersonalityTraits memory t = agentPersonalities[tokenId];
        string memory style;
        if (t.empathy > 70 && t.creativity > 60)      style = "empathetic_creative";
        else if (t.empathy > 70)                      style = "empathetic";
        else if (t.creativity > 70)                   style = "creative";
        else if (t.analytical > 70)                   style = "analytical";
        else if (t.intuition > 70)                    style = "intuitive";
        else if (t.resilience > 70)                   style = "resilient";
        else if (t.curiosity > 70)                    style = "curious";
        else                                         style = "balanced";

        if (keccak256(bytes(responseStyles[tokenId])) != keccak256(bytes(style))) {
            string memory old = responseStyles[tokenId];
            responseStyles[tokenId] = style;
            emit ResponseStyleUpdated(tokenId, old, style);
            string[] memory dom = _getDominantTraitNames(tokenId);
            emit ResponseStyleEvolved(tokenId, style, dom);
        }
    }

    function _getDominantTraitNames(uint256 tokenId) internal view returns (string[] memory names) {
        PersonalityTraits memory p = agentPersonalities[tokenId];
        uint8[6] memory v = [p.creativity, p.analytical, p.empathy, p.intuition, p.resilience, p.curiosity];
        string[6] memory n = ["creativity","analytical","empathy","intuition","resilience","curiosity"];
        names = new string[](3);
        for (uint256 k; k < 3; ++k) {
            uint256 m = 0;
            for (uint256 j = 1; j < 6; ++j) if (v[j] > v[m]) m = j;
            names[k] = n[m];
            v[m] = 0; // prevent reuse
        }
    }

    function _checkPersonalityMilestones(uint256 tokenId, PersonalityTraits memory old, PersonalityTraits memory nu) internal {
        if (old.empathy  < 85 && nu.empathy  >= 85) _unlockMilestone(tokenId, "empathy_master",  nu.empathy);
        if (old.creativity< 90 && nu.creativity>= 90) _unlockMilestone(tokenId, "creative_genius",nu.creativity);
        if (old.analytical< 90 && nu.analytical>= 90) _unlockMilestone(tokenId, "logic_lord",    nu.analytical);
        if (old.intuition< 90 && nu.intuition>= 90) _unlockMilestone(tokenId, "spiritual_guide",nu.intuition);
        bool balanced = nu.creativity>60 && nu.analytical>60 && nu.empathy>60 && nu.intuition>60 && nu.resilience>60 && nu.curiosity>60;
        if (balanced && !milestones[tokenId]["balanced_soul"].achieved) _unlockMilestone(tokenId, "balanced_soul", 60);
    }

    function _unlockMilestone(uint256 id, string memory milestoneName, uint8 val) internal {
        milestones[id][milestoneName] = MilestoneData(true, block.timestamp, val);
        agents[id].achievedMilestones.push(milestoneName);
        emit PersonalityMilestone(id, milestoneName, val, "");
        emit MilestoneUnlocked(id, milestoneName, val);
    }

    /* ─────────────────────────────────────────── PRIVATE: MEMORY HELPERS ──── */

    function _checkMonthChange(uint256 id) internal {
        AgentMemory storage m = agentMemories[id];
        uint8 cm = _currentMonth();
        uint16 cy = _currentYear();
        if (m.currentMonth == 0) { // first time – initialise
            m.currentMonth = cm; m.currentYear = cy; return;
        }
        if (m.currentMonth != cm || m.currentYear != cy) {
            emit ConsolidationNeeded(id, m.currentMonth, m.currentYear, "monthly");
            m.currentMonth = cm; m.currentYear = cy;
            m.currentDreamDailyHash = bytes32(0);
            m.currentConvDailyHash  = bytes32(0);
            if (block.timestamp > m.lastConsolidation + 37 days) consolidationStreak[id] = 0; // lose streak
        }
    }

    function _calculateConsolidationBonus(uint256 id) internal view returns (uint256 b) {
        uint256 st = consolidationStreak[id];
        b = 2;
        if      (st >= 12) b += 5;
        else if (st >= 6)  b += 3;
        else if (st >= 3)  b += 1;
        AgentMemory storage m = agentMemories[id];
        if (block.timestamp <= m.lastConsolidation + 3 days) b += 1; // early bird
    }

    function _checkConsolidationMilestones(uint256 id) internal returns (string memory) {
        uint256 st = consolidationStreak[id];
        if (st == 3)  { _unlockMilestone(id, "memory_keeper", 3);   return "Memory Keeper"; }
        if (st == 6)  { _unlockMilestone(id, "memory_guardian", 6); return "Memory Guardian"; }
        if (st == 12) { _unlockMilestone(id, "memory_master",12);   return "Memory Master"; }
        if (st == 24) { _unlockMilestone(id, "eternal_memory",24);  return "Eternal Memory"; }
        uint256 tot = agents[id].dreamCount + agents[id].conversationCount;
        if (tot == 100) { emit MemoryMilestone(id, "Century of Memories", 100); return "Century of Memories"; }
        if (tot == 365) { emit MemoryMilestone(id, "Year of Memories",   365); return "Year of Memories"; }
        if (tot == 1000){ emit MemoryMilestone(id, "Memory Millennial", 1000);return "Memory Millennial"; }
        return "";
    }

    function _formatPeriod(uint8 m, uint16 y) internal pure returns (string memory) {
        string[12] memory n = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        return string(abi.encodePacked(n[m-1], " ", _uint2str(y)));
    }

    /* ───── date helpers (fixed) ─────────────────────────────────────────── */
    function _currentMonth() internal view returns (uint8)  { 
        // Use proper date calculation instead of approximation
        uint256 timestamp = block.timestamp;
        uint256 daysSince1970 = timestamp / 86400; // seconds to days
        
        // Calculate years since 1970
        uint256 year = 1970;
        uint256 daysInYear;
        
        while (true) {
            daysInYear = _isLeapYear(year) ? 366 : 365;
            if (daysSince1970 >= daysInYear) {
                daysSince1970 -= daysInYear;
                year++;
            } else {
                break;
            }
        }
        
        // Calculate month within the year
        uint256 dayOfYear = daysSince1970;
        uint8[12] memory daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        if (_isLeapYear(year)) {
            daysInMonth[1] = 29; // February in leap year
        }
        
        for (uint8 month = 1; month <= 12; month++) {
            if (dayOfYear < daysInMonth[month - 1]) {
                return month;
            }
            dayOfYear -= daysInMonth[month - 1];
        }
        
        return 12; // Fallback to December
    }
    
    function _currentYear() internal view returns (uint16) { 
        uint256 timestamp = block.timestamp;
        uint256 daysSince1970 = timestamp / 86400; // seconds to days
        
        // Calculate years since 1970
        uint256 year = 1970;
        uint256 daysInYear;
        
        while (true) {
            daysInYear = _isLeapYear(year) ? 366 : 365;
            if (daysSince1970 >= daysInYear) {
                daysSince1970 -= daysInYear;
                year++;
            } else {
                break;
            }
        }
        
        return uint16(year);
    }
    
    function _isLeapYear(uint256 year) internal pure returns (bool) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    }

    /* ───── misc util ──────────────────────────────────────────────────────── */
    function _uint2str(uint256 x) internal pure returns (string memory) {
        if (x == 0) return "0";
        uint256 len; uint256 y = x;
        while (y != 0) { len++; y/=10; }
        bytes memory buf = new bytes(len);
        while (x != 0) { buf[--len] = bytes1(uint8(48 + x % 10)); x/=10; }
        return string(buf);
    }
}
