// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857DataVerifier.sol";

/// @title DreamAgentNFT - Intelligent NFT for Dream Analysis Agents
/// @notice Manages dream agents with encrypted intelligence stored in 0G Storage
/// @dev Simplified version for Dreamscape testing, based on ERC-7857 standard
contract DreamAgentNFT is IERC7857 {
    
    // Data types for dream agents
    string constant DREAM_PATTERNS = "dream_patterns";
    string constant EMOTIONAL_PROFILE = "emotional_profile";
    string constant AGENT_INTELLIGENCE = "agent_intelligence";
    
    struct DreamAgent {
        address owner;
        uint256 createdAt;
        uint256 lastUpdated;
        string[] dataDescriptions;  // Types of data stored
        bytes32[] dataHashes;       // 0G Storage hashes
        address[] authorizedUsers;  // Authorized to use but not own
        uint256 intelligenceLevel;  // Agent's learning progress
        uint256 dreamCount;         // Number of dreams processed
    }
    
    // Contract state
    mapping(uint256 => DreamAgent) public agents;
    uint256 public nextTokenId = 1;
    uint256 public totalAgents = 0;
    
    // Contract metadata
    string public name = "Dream Agent NFT";
    string public symbol = "DREAM";
    
    // Verifier for proof validation
    IERC7857DataVerifier public immutable verifier;
    
    // Events
    event Updated(uint256 indexed tokenId, bytes32[] oldDataHashes, bytes32[] newDataHashes);
    event DreamProcessed(uint256 indexed tokenId, bytes32 dreamHash, uint256 newIntelligenceLevel);
    event AgentEvolved(uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel);
    
    constructor(address _verifier) {
        require(_verifier != address(0), "Verifier cannot be zero address");
        verifier = IERC7857DataVerifier(_verifier);
    }
    
    /// @notice Mint a new dream agent for a user
    /// @param proofs Ownership proofs for initial data
    /// @param descriptions Data type descriptions
    /// @param to Address to mint agent for
    /// @return tokenId The newly minted agent token ID
    function mint(
        bytes[] calldata proofs,
        string[] calldata descriptions,
        address to
    ) external payable override returns (uint256 tokenId) {
        require(to != address(0), "Cannot mint to zero address");
        require(descriptions.length == proofs.length, "Descriptions and proofs length mismatch");
        
        // Verify proofs
        PreimageProofOutput[] memory proofOutputs = verifier.verifyPreimage(proofs);
        bytes32[] memory dataHashes = new bytes32[](proofOutputs.length);
        
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            require(proofOutputs[i].isValid, "Invalid proof");
            dataHashes[i] = proofOutputs[i].dataHash;
        }
        
        // Create new agent
        tokenId = nextTokenId++;
        agents[tokenId] = DreamAgent({
            owner: to,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            dataDescriptions: descriptions,
            dataHashes: dataHashes,
            authorizedUsers: new address[](0),
            intelligenceLevel: 1,
            dreamCount: 0
        });
        
        totalAgents++;
        
        emit Minted(tokenId, msg.sender, to, dataHashes, descriptions);
        
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
        
        // Evolution logic: increase intelligence every 5 dreams
        if (agents[tokenId].dreamCount % 5 == 0) {
            uint256 oldLevel = agents[tokenId].intelligenceLevel;
            agents[tokenId].intelligenceLevel++;
            emit AgentEvolved(tokenId, oldLevel, agents[tokenId].intelligenceLevel);
        }
        
        emit Updated(tokenId, oldDataHashes, newDataHashes);
        emit DreamProcessed(tokenId, newDataHashes[0], agents[tokenId].intelligenceLevel);
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
    
    /// @notice Clone agent (create copy with same intelligence)
    /// @param to Address to clone agent for
    /// @param tokenId Agent to clone
    /// @param proofs Clone proofs
    /// @return newTokenId The cloned agent token ID
    function clone(
        address to,
        uint256 tokenId,
        bytes[] calldata proofs
    ) external payable override returns (uint256 newTokenId) {
        require(to != address(0), "Cannot clone to zero address");
        require(agents[tokenId].owner == msg.sender, "Not agent owner");
        
        // Verify clone proofs (same as transfer proofs)
        TransferValidityProofOutput[] memory proofOutputs = verifier.verifyTransferValidity(proofs);
        
        bytes32[] memory newDataHashes = new bytes32[](proofOutputs.length);
        for (uint256 i = 0; i < proofOutputs.length; i++) {
            require(proofOutputs[i].isValid, "Invalid clone proof");
            newDataHashes[i] = proofOutputs[i].newDataHash;
        }
        
        // Create cloned agent
        newTokenId = nextTokenId++;
        agents[newTokenId] = DreamAgent({
            owner: to,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            dataDescriptions: agents[tokenId].dataDescriptions,
            dataHashes: newDataHashes,
            authorizedUsers: new address[](0),
            intelligenceLevel: agents[tokenId].intelligenceLevel, // Same intelligence!
            dreamCount: 0 // Reset dream count for new owner
        });
        
        totalAgents++;
        
        emit Cloned(tokenId, newTokenId, msg.sender, to);
        emit Minted(newTokenId, msg.sender, to, newDataHashes, agents[tokenId].dataDescriptions);
        
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
        uint256 intelligenceLevel,
        uint256 dreamCount,
        uint256 lastUpdated,
        string[] memory dataDescriptions
    ) {
        DreamAgent memory agent = agents[tokenId];
        return (
            agent.owner,
            agent.intelligenceLevel,
            agent.dreamCount,
            agent.lastUpdated,
            agent.dataDescriptions
        );
    }
    
    // Not implemented for testing (would require complex logic)
    function transferPublic(address, uint256) external pure override {
        revert("Public transfer not implemented");
    }
    
    function clonePublic(address, uint256) external payable override returns (uint256) {
        revert("Public clone not implemented");
    }
} 