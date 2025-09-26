// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPersonalityEvolution.sol";

/**
 * @title AishiAgentStorage
 * @notice Diamond Storage pattern for AishiAgent contract
 * @dev Shared storage layout for all AishiAgent libraries
 */
library AishiAgentStorage {

    bytes32 constant STORAGE_POSITION = keccak256("aishi.agent.storage.v1");

    struct Aishi {
        address  owner;
        string   agentName;
        uint256  createdAt;
        uint256  lastUpdated;
        address[] authorizedUsers;
        uint256  intelligenceLevel;
        uint256  dreamCount;
        uint256  conversationCount;
        bool     personalityInitialized;
        uint256  totalEvolutions;
        uint256  lastEvolutionDate;
        string[] achievedMilestones;
    }

    struct MilestoneData {
        bool     achieved;
        uint256  achievedAt;
        uint8    traitValue;
    }

    struct ConsolidationReward {
        uint256 intelligenceBonus;
        string  specialMilestone;
        bool    yearlyReflection;
    }

    struct Layout {
        // Main mappings
        mapping(uint256 => Aishi)                  agents;
        mapping(string  => bool)                   nameExists;
        mapping(address => uint256)                ownerToTokenId;

        // Personality & memory
        mapping(uint256 => IPersonalityEvolution.PersonalityTraits)  agentPersonalities;
        mapping(uint256 => IPersonalityEvolution.AgentMemory)        agentMemories;
        mapping(uint256 => ConsolidationReward)                       pendingRewards;
        mapping(uint256 => uint256)                                   consolidationStreak;

        // Milestones & styles
        mapping(uint256 => mapping(string => MilestoneData))          milestones;
        mapping(uint256 => string)                                    responseStyles;

        // Supply counters
        uint256 nextTokenId;
        uint256 totalAgents;
        uint256 totalFeesCollected;
    }

    /**
     * @notice Get the storage layout
     * @return l Storage layout struct at the designated slot
     */
    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_POSITION;
        assembly {
            l.slot := slot
        }
    }
}