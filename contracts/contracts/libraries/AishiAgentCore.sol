// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AishiAgentStorage.sol";
import "../interfaces/IERC7857.sol";
import "../interfaces/IERC7857DataVerifier.sol";
import "../interfaces/IPersonalityEvolution.sol";

/**
 * @title AishiAgentCore
 * @notice Core NFT functionality for AishiAgent
 * @dev Handles minting, transfers, and authorization
 */
library AishiAgentCore {
    using AishiAgentStorage for AishiAgentStorage.Layout;

    // Events (will be emitted from main contract)
    event Minted(uint256 indexed tokenId, address indexed creator, address indexed owner, bytes32[] dataHashes, string[] descriptions);
    event Transferred(uint256 tokenId, address indexed from, address indexed to);
    event AuthorizedUsage(uint256 indexed tokenId, address indexed user);
    event FeePaid(uint256 indexed tokenId, address indexed payer, uint256 amount);
    event PersonalityActivated(uint256 indexed tokenId, IPersonalityEvolution.PersonalityTraits traits, uint256 dreamCount);

    /**
     * @notice Internal mint function
     * @dev Handles all minting logic including verification and personality initialization
     */
    function mintAgentInternal(
        AishiAgentStorage.Layout storage s,
        bytes[] calldata proofs,
        string[] calldata descriptions,
        string memory agentName,
        address to,
        address treasury,
        IERC7857DataVerifier verifier,
        uint256 mintingFee,
        uint256 maxAgents,
        uint256 msgValue
    ) public returns (uint256 tokenId) {
        // Basic checks
        require(to != address(0), "!to");
        require(s.ownerToTokenId[to] == 0, "exists");
        require(s.totalAgents < maxAgents, "max");
        require(bytes(agentName).length > 0 && bytes(agentName).length <= 32, "name");
        require(!s.nameExists[agentName], "taken");
        require(msgValue >= mintingFee, "fee");

        // Optional proof verification
        bytes32[] memory dataHashes;
        if (address(verifier) != address(0)) {
            require(descriptions.length == proofs.length, "len");
            PreimageProofOutput[] memory outs = verifier.verifyPreimage(proofs);
            dataHashes = new bytes32[](outs.length);
            uint256 outsLength = outs.length;
            for (uint256 i; i < outsLength;) {
                require(outs[i].isValid, "!proof");
                dataHashes[i] = outs[i].dataHash;
                unchecked { ++i; }
            }
        }

        // Name reservation
        s.nameExists[agentName] = true;

        // Create agent
        tokenId = s.nextTokenId++;
        s.ownerToTokenId[to] = tokenId;

        s.agents[tokenId] = AishiAgentStorage.Aishi({
            owner:                   to,
            agentName:               agentName,
            createdAt:               block.timestamp,
            lastUpdated:             block.timestamp,
            authorizedUsers:         new address[](0),
            intelligenceLevel:       1,
            dreamCount:              0,
            conversationCount:       0,
            personalityInitialized:  true,
            totalEvolutions:         0,
            lastEvolutionDate:       block.timestamp,
            achievedMilestones:      new string[](0)
        });

        // Initialize personality
        IPersonalityEvolution.PersonalityTraits memory initialTraits = IPersonalityEvolution.PersonalityTraits({
            creativity:     50,
            analytical:     50,
            empathy:        50,
            intuition:      50,
            resilience:     50,
            curiosity:      50,
            dominantMood:   "neutral",
            lastDreamDate:  0,
            uniqueFeatures: new IPersonalityEvolution.UniqueFeature[](0)
        });
        s.agentPersonalities[tokenId] = initialTraits;
        s.responseStyles[tokenId] = "neutral";

        emit PersonalityActivated(tokenId, initialTraits, 0);

        // Initialize memory
        s.agentMemories[tokenId] = IPersonalityEvolution.AgentMemory({
            memoryCoreHash:        bytes32(0),
            currentDreamDailyHash: bytes32(0),
            currentConvDailyHash:  bytes32(0),
            lastDreamMonthlyHash:  bytes32(0),
            lastConvMonthlyHash:   bytes32(0),
            lastConsolidation:     block.timestamp,
            currentMonth:          uint8((block.timestamp / 30 days) % 12 + 1),
            currentYear:           uint16(1970 + block.timestamp / 365 days)
        });

        // Economics
        unchecked {
            s.totalAgents          += 1;
            s.totalFeesCollected   += mintingFee;
        }

        // Send fee to treasury
        (bool sent, ) = treasury.call{value: mintingFee}("");
        require(sent, "!sent");

        // Refund excess
        if (msgValue > mintingFee) {
            (bool refund, ) = msg.sender.call{value: msgValue - mintingFee}("");
            require(refund, "!refund");
        }

        // Events
        emit Minted(tokenId, msg.sender, to, dataHashes, descriptions);
        emit FeePaid(tokenId, msg.sender, mintingFee);
    }

    /**
     * @notice Internal transfer function
     * @dev Handles NFT transfers with optional proof verification
     */
    function transferInternal(
        AishiAgentStorage.Layout storage s,
        address to,
        uint256 tokenId,
        bytes[] calldata proofs,
        IERC7857DataVerifier verifier
    ) public {
        require(to != address(0), "to = zero");
        require(s.ownerToTokenId[to] == 0, "to already owns agent");

        // Verify proofs if verifier configured
        if (address(verifier) != address(0)) {
            require(proofs.length > 0, "proofs required");
            TransferValidityProofOutput[] memory outs = verifier.verifyTransferValidity(proofs);
            require(outs.length == proofs.length, "proofs len");
            uint256 outsLength = outs.length;
            for (uint256 i; i < outsLength;) {
                require(outs[i].isValid, "!proof");
                unchecked { ++i; }
            }
        }

        address from = s.agents[tokenId].owner;
        s.ownerToTokenId[from] = 0;
        s.ownerToTokenId[to]   = tokenId;
        s.agents[tokenId].owner = to;
        s.agents[tokenId].lastUpdated = block.timestamp;
        emit Transferred(tokenId, from, to);
    }

    /**
     * @notice Authorize a user to operate the agent
     */
    function authorizeUserInternal(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId,
        address user
    ) public {
        require(user != address(0), "zero user");
        s.agents[tokenId].authorizedUsers.push(user);
        emit AuthorizedUsage(tokenId, user);
    }

    /**
     * @notice Check if user is authorized
     */
    function isAuthorizedUser(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId,
        address user
    ) public view returns (bool) {
        address[] memory list = s.agents[tokenId].authorizedUsers;
        for (uint256 i = 0; i < list.length; ++i) {
            if (list[i] == user) return true;
        }
        return false;
    }
}