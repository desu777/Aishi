// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857DataVerifier.sol";

/// @title DreamAgentNFT - Personalized AI Dream Analysis Agents
/// @notice Manages personalized dream agents with encrypted intelligence stored in 0G Storage
/// @dev Enhanced version with agent naming, supply limit, and minting fee for testnet deployment
contract DreamAgentNFT is IERC7857 {
    
    // Data types for dream agents
    string constant DREAM_PATTERNS = "dream_patterns";
    string constant EMOTIONAL_PROFILE = "emotional_profile";
    string constant AGENT_INTELLIGENCE = "agent_intelligence";
    string constant PERSONALITY_DATA = "personality_data";
    
    // Maximum supply for testnet (cost control)
    uint256 public constant MAX_AGENTS = 1000;
    
    // Minting fee: 0.1 OG (0.1 * 10^18 wei)
    uint256 public constant MINTING_FEE = 0.1 ether;
    
    // Treasury address for collecting fees
    address public immutable treasury;
    
    struct DreamAgent {
        address owner;
        string agentName;           // NEW: User-given name for personalization
        uint256 createdAt;
        uint256 lastUpdated;
        string[] dataDescriptions;  // Types of data stored
        bytes32[] dataHashes;       // 0G Storage hashes
        address[] authorizedUsers;  // Authorized to use but not own
        uint256 intelligenceLevel;  // Agent's learning progress
        uint256 dreamCount;         // Number of dreams processed
        uint256 conversationCount;  // NEW: Number of chat interactions
    }
    
    // Contract state
    mapping(uint256 => DreamAgent) public agents;
    mapping(string => bool) public nameExists;  // NEW: Prevent duplicate names
    uint256 public nextTokenId = 1;
    uint256 public totalAgents = 0;
    uint256 public totalFeesCollected = 0;      // Track total fees collected
    
    // Contract metadata
    string public name = "Dreamscape AI Agents";
    string public symbol = "DREAM";
    
    // Verifier for proof validation
    IERC7857DataVerifier public immutable verifier;
    
    // Events
    event Updated(uint256 indexed tokenId, bytes32[] oldDataHashes, bytes32[] newDataHashes);
    event DreamProcessed(uint256 indexed tokenId, bytes32 dreamHash, uint256 newIntelligenceLevel);
    event AgentEvolved(uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel);
    event AgentConversation(uint256 indexed tokenId, bytes32 conversationHash); // NEW: Chat tracking
    event PersonalityEvolved(uint256 indexed tokenId, string trait, uint256 strength); // NEW: Personality tracking
    event FeePaid(uint256 indexed tokenId, address indexed payer, uint256 amount); // NEW: Fee tracking
    
    constructor(address _verifier, address _treasury) {
        require(_verifier != address(0), "Verifier cannot be zero address");
        require(_treasury != address(0), "Treasury cannot be zero address");
        verifier = IERC7857DataVerifier(_verifier);
        treasury = _treasury;
    }
    
    /// @notice Mint a new personalized dream agent for a user
    /// @param proofs Ownership proofs for initial data
    /// @param descriptions Data type descriptions
    /// @param agentName User-given name for the agent
    /// @param to Address to mint agent for
    /// @return tokenId The newly minted agent token ID
    function mint(
        bytes[] calldata proofs,
        string[] calldata descriptions,
        string memory agentName,
        address to
    ) external payable returns (uint256 tokenId) {
        require(to != address(0), "Cannot mint to zero address");
        require(descriptions.length == proofs.length, "Descriptions and proofs length mismatch");
        require(totalAgents < MAX_AGENTS, "Maximum agents limit reached");
        require(bytes(agentName).length > 0 && bytes(agentName).length <= 32, "Invalid agent name");
        require(!nameExists[agentName], "Agent name already exists");
        require(msg.value >= MINTING_FEE, "Insufficient payment for minting");
        
        // Verify proofs
        PreimageProofOutput[] memory proofOutputs = verifier.verifyPreimage(proofs);
        bytes32[] memory dataHashes = new bytes32[](proofOutputs.length);
        
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            require(proofOutputs[i].isValid, "Invalid proof");
            dataHashes[i] = proofOutputs[i].dataHash;
        }
        
        // Reserve the name
        nameExists[agentName] = true;
        
        // Create new personalized agent
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
            conversationCount: 0
        });
        
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
        
        emit Minted(tokenId, msg.sender, to, dataHashes, descriptions);
        emit FeePaid(tokenId, msg.sender, MINTING_FEE);
        
        return tokenId;
    }
    
    /// @notice Update agent data with new dream information
    /// @param tokenId Agent to update
    /// @param proofs New data proofs
    function update(uint256 tokenId, bytes[] calldata proofs) external {
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        require(proofs.length == agents[tokenId].dataHashes.length, "Proof count mismatch");
        
        // Verify proofs
        PreimageProofOutput[] memory proofOutputs = verifier.verifyPreimage(proofs);
        bytes32[] memory oldDataHashes = agents[tokenId].dataHashes;
        bytes32[] memory newDataHashes = new bytes32[](proofOutputs.length);
        
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            require(proofOutputs[i].isValid, "Invalid proof");
            newDataHashes[i] = proofOutputs[i].dataHash;
        }
        
        // Update agent
        agents[tokenId].dataHashes = newDataHashes;
        agents[tokenId].lastUpdated = block.timestamp;
        agents[tokenId].dreamCount++;
        
        // Enhanced evolution logic: increase intelligence every 3 dreams (faster evolution)
        if (agents[tokenId].dreamCount % 3 == 0) {
            uint256 oldLevel = agents[tokenId].intelligenceLevel;
            agents[tokenId].intelligenceLevel++;
            emit AgentEvolved(tokenId, oldLevel, agents[tokenId].intelligenceLevel);
            
            // Emit personality evolution based on intelligence milestones
            if (agents[tokenId].intelligenceLevel == 5) {
                emit PersonalityEvolved(tokenId, "analytical", 75);
            } else if (agents[tokenId].intelligenceLevel == 10) {
                emit PersonalityEvolved(tokenId, "empathetic", 90);
            }
        }
        
        emit Updated(tokenId, oldDataHashes, newDataHashes);
        emit DreamProcessed(tokenId, newDataHashes[0], agents[tokenId].intelligenceLevel);
    }
    
    /// @notice Record a conversation with the agent (for personality development)
    /// @param tokenId Agent that had conversation
    /// @param conversationHash Hash of conversation data stored in 0G
    function recordConversation(uint256 tokenId, bytes32 conversationHash) external {
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        
        agents[tokenId].conversationCount++;
        agents[tokenId].lastUpdated = block.timestamp;
        
        // Slight intelligence boost from conversations (1 point every 10 conversations)
        if (agents[tokenId].conversationCount % 10 == 0) {
            uint256 oldLevel = agents[tokenId].intelligenceLevel;
            agents[tokenId].intelligenceLevel++;
            emit AgentEvolved(tokenId, oldLevel, agents[tokenId].intelligenceLevel);
        }
        
        emit AgentConversation(tokenId, conversationHash);
    }
    
    /// @notice Transfer agent with intelligence to new owner
    /// @param to New owner address
    /// @param tokenId Agent to transfer
    /// @param proofs Transfer validity proofs
    function transfer(
        address to,
        uint256 tokenId,
        bytes[] calldata proofs
    ) external override {
        require(to != address(0), "Cannot transfer to zero address");
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        
        // Verify transfer proofs
        TransferValidityProofOutput[] memory proofOutputs = verifier.verifyTransferValidity(proofs);
        
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            require(proofOutputs[i].isValid, "Invalid transfer proof");
            require(proofOutputs[i].oldDataHash == agents[tokenId].dataHashes[i], "Data hash mismatch");
        }
        
        // Update agent data hashes for new owner
        bytes32[] memory newDataHashes = new bytes32[](proofOutputs.length);
        bytes16[] memory sealedKeys = new bytes16[](proofOutputs.length);
        
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            newDataHashes[i] = proofOutputs[i].newDataHash;
            sealedKeys[i] = proofOutputs[i].sealedKey;
        }
        
        // Transfer ownership
        address from = agents[tokenId].owner;
        agents[tokenId].owner = to;
        agents[tokenId].dataHashes = newDataHashes;
        agents[tokenId].lastUpdated = block.timestamp;
        
        emit Transferred(tokenId, from, to);
        emit PublishedSealedKey(to, tokenId, sealedKeys);
    }
    
    /// @notice Clone agent (create copy with same intelligence and personality)
    /// @param to Address to clone agent for
    /// @param tokenId Agent to clone
    /// @param newAgentName Name for the cloned agent
    /// @param proofs Clone proofs
    /// @return newTokenId The cloned agent token ID
    function clone(
        address to,
        uint256 tokenId,
        string memory newAgentName,
        bytes[] calldata proofs
    ) external payable returns (uint256 newTokenId) {
        require(to != address(0), "Cannot clone to zero address");
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        require(totalAgents < MAX_AGENTS, "Maximum agents limit reached");
        require(bytes(newAgentName).length > 0 && bytes(newAgentName).length <= 32, "Invalid agent name");
        require(!nameExists[newAgentName], "Agent name already exists");
        require(msg.value >= MINTING_FEE, "Insufficient payment for cloning");
        
        // Verify clone proofs (same as transfer proofs)
        TransferValidityProofOutput[] memory proofOutputs = verifier.verifyTransferValidity(proofs);
        
        bytes32[] memory newDataHashes = new bytes32[](proofOutputs.length);
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            require(proofOutputs[i].isValid, "Invalid clone proof");
            newDataHashes[i] = proofOutputs[i].newDataHash;
        }
        
        // Reserve the new name
        nameExists[newAgentName] = true;
        
        // Create cloned agent with new name
        newTokenId = nextTokenId++;
        agents[newTokenId] = DreamAgent({
            owner: to,
            agentName: newAgentName,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            dataDescriptions: agents[tokenId].dataDescriptions,
            dataHashes: newDataHashes,
            authorizedUsers: new address[](0),
            intelligenceLevel: agents[tokenId].intelligenceLevel, // Same intelligence!
            dreamCount: 0, // Reset dream count for new owner
            conversationCount: 0 // Reset conversation count
        });
        
        totalAgents++;
        totalFeesCollected += MINTING_FEE;
        
        // Transfer cloning fee to treasury
        (bool success, ) = treasury.call{value: MINTING_FEE}("");
        require(success, "Treasury payment failed");
        
        // Refund excess payment
        if (msg.value > MINTING_FEE) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - MINTING_FEE}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit Cloned(tokenId, newTokenId, msg.sender, to);
        emit Minted(newTokenId, msg.sender, to, newDataHashes, agents[tokenId].dataDescriptions);
        emit FeePaid(newTokenId, msg.sender, MINTING_FEE);
        
        return newTokenId;
    }
    
    /// @notice Authorize user to use agent (but not own)
    /// @param tokenId Agent to authorize
    /// @param user User to authorize
    function authorizeUsage(uint256 tokenId, address user) external override {
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        require(user != address(0), "Cannot authorize zero address");
        
        agents[tokenId].authorizedUsers.push(user);
        
        emit AuthorizedUsage(tokenId, user);
    }
    
    // View functions
    function ownerOf(uint256 tokenId) external view override returns (address) {
        return agents[tokenId].owner;
    }
    
    function authorizedUsersOf(uint256 tokenId) external view override returns (address[] memory) {
        return agents[tokenId].authorizedUsers;
    }
    
    function getAgentInfo(uint256 tokenId) external view returns (
        address owner,
        string memory agentName,
        uint256 intelligenceLevel,
        uint256 dreamCount,
        uint256 conversationCount,
        uint256 lastUpdated,
        string[] memory dataDescriptions
    ) {
        DreamAgent memory agent = agents[tokenId];
        return (
            agent.owner,
            agent.agentName,
            agent.intelligenceLevel,
            agent.dreamCount,
            agent.conversationCount,
            agent.lastUpdated,
            agent.dataDescriptions
        );
    }
    
    /// @notice Get remaining agent supply
    function getRemainingSupply() external view returns (uint256) {
        return MAX_AGENTS - totalAgents;
    }
    
    /// @notice Check if agent name is available
    function isNameAvailable(string memory agentName) external view returns (bool) {
        return !nameExists[agentName];
    }
    
    /// @notice Get minting fee in wei
    function getMintingFee() external pure returns (uint256) {
        return MINTING_FEE;
    }
    
    /// @notice Get treasury address
    function getTreasury() external view returns (address) {
        return treasury;
    }
    
    /// @notice Get total fees collected
    function getTotalFeesCollected() external view returns (uint256) {
        return totalFeesCollected;
    }
    
    // Not implemented for testing (would require complex logic)
    function transferPublic(address, uint256) external pure override {
        revert("Public transfer not implemented");
    }
    
    function clonePublic(address, uint256) external payable override returns (uint256) {
        revert("Public clone not implemented");
    }
    
    // Legacy mint function for compatibility
    function mint(
        bytes[] calldata /* proofs */,
        string[] calldata /* descriptions */,
        address /* to */
    ) external payable returns (uint256) {
        revert("Use mint with agentName parameter");
    }
    
    // Legacy clone function for compatibility  
    function clone(
        address /* to */,
        uint256 /* tokenId */,
        bytes[] calldata /* proofs */
    ) external payable returns (uint256) {
        revert("Use clone with newAgentName parameter");
    }
} 