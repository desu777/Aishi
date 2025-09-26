// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AishiAgentStorage.sol";
import "../interfaces/IPersonalityEvolution.sol";
import "@quant-finance/solidity-datetime/contracts/DateTime.sol";

/**
 * @title AishiAgentMemory
 * @notice Hierarchical memory management for AishiAgent
 * @dev Handles memory consolidation, rewards, and milestones
 */
library AishiAgentMemory {
    using AishiAgentStorage for AishiAgentStorage.Layout;

    // Events
    event ConsolidationCompleted(uint256 indexed tokenId, string period, uint256 bonus, string specialReward);
    event YearlyReflectionAvailable(uint256 indexed tokenId, uint16 year);
    event MemoryUpdated(uint256 indexed tokenId, string memoryType, bytes32 newHash, bytes32 oldHash);
    event MemoryMilestone(uint256 indexed tokenId, string achievement, uint256 totalInteractions);
    event AgentEvolved(uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel);
    event MilestoneUnlocked(uint256 indexed tokenId, string milestone, uint8 value);

    /**
     * @notice Consolidate monthly memory
     */
    function consolidateMonthInternal(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId,
        bytes32 dreamMonthlyHash,
        bytes32 convMonthlyHash,
        uint8 month,
        uint16 year
    ) public {
        require(month >= 1 && month <= 12, "invalid month");
        require(year  >= 2024 && year  <= 2100, "invalid year");

        IPersonalityEvolution.AgentMemory storage mem = s.agentMemories[tokenId];
        require(mem.currentMonth != month || mem.currentYear != year, "still current month");

        // Cooldown check (commented for testing)
        /*
        require(
            block.timestamp >= mem.lastConsolidation + 25 days,
            "cooldown <25d"
        );
        */

        mem.lastDreamMonthlyHash = dreamMonthlyHash;
        mem.lastConvMonthlyHash  = convMonthlyHash;

        // Update streak
        unchecked { s.consolidationStreak[tokenId] += 1; }

        // Calculate bonus
        uint256 bonus = calculateConsolidationBonus(s, tokenId);

        // Update consolidation timestamp
        mem.lastConsolidation = block.timestamp;

        // Check milestones
        string memory special = checkConsolidationMilestones(s, tokenId);

        // Apply intelligence boost
        AishiAgentStorage.Aishi storage agent = s.agents[tokenId];
        uint256 oldLvl = agent.intelligenceLevel;
        unchecked { agent.intelligenceLevel += bonus; }

        emit ConsolidationCompleted(tokenId, formatPeriod(month, year), bonus, special);
        emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);

        // Yearly reflection flag
        if (month == 12) {
            s.pendingRewards[tokenId].yearlyReflection = true;
            emit YearlyReflectionAvailable(tokenId, year);
        }

        // Clear daily hashes
        mem.currentDreamDailyHash = bytes32(0);
        mem.currentConvDailyHash  = bytes32(0);
    }

    /**
     * @notice Update memory core (yearly)
     */
    function updateMemoryCoreInternal(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId,
        bytes32 newHash
    ) public {
        IPersonalityEvolution.AgentMemory storage mem = s.agentMemories[tokenId];

        // Cooldown check (commented for testing)
        /*
        require(
            block.timestamp >= mem.lastConsolidation + 180 days,
            "cooldown <180d"
        );
        */

        bytes32 old = mem.memoryCoreHash;
        mem.memoryCoreHash = newHash;
        emit MemoryUpdated(tokenId, "memory_core", newHash, old);

        // Apply yearly reflection bonus
        if (s.pendingRewards[tokenId].yearlyReflection) {
            s.pendingRewards[tokenId].yearlyReflection = false;
            AishiAgentStorage.Aishi storage agent = s.agents[tokenId];
            uint256 oldLvl = agent.intelligenceLevel;
            unchecked { agent.intelligenceLevel += 5; }
            emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
        }

        // Clear monthly hashes
        mem.lastDreamMonthlyHash = bytes32(0);
        mem.lastConvMonthlyHash  = bytes32(0);
    }

    /**
     * @notice Calculate consolidation bonus
     */
    function calculateConsolidationBonus(
        AishiAgentStorage.Layout storage s,
        uint256 id
    ) public view returns (uint256 b) {
        uint256 st = s.consolidationStreak[id];
        b = 2; // Base reward

        // Streak bonuses
        if      (st >= 12) b += 5;
        else if (st >= 6)  b += 3;
        else if (st >= 3)  b += 1;

        // Early bird bonus
        IPersonalityEvolution.AgentMemory storage m = s.agentMemories[id];
        if (block.timestamp <= m.lastConsolidation + 3 days) b += 1;
    }

    /**
     * @notice Check consolidation milestones
     */
    function checkConsolidationMilestones(
        AishiAgentStorage.Layout storage s,
        uint256 id
    ) public returns (string memory) {
        uint256 st = s.consolidationStreak[id];

        if (st == 3) {
            unlockMilestone(s, id, "memory_keeper", 3);
            return "Memory Keeper";
        }
        if (st == 6) {
            unlockMilestone(s, id, "memory_guardian", 6);
            return "Memory Guardian";
        }
        if (st == 12) {
            unlockMilestone(s, id, "memory_master", 12);
            return "Memory Master";
        }
        if (st == 24) {
            unlockMilestone(s, id, "eternal_memory", 24);
            return "Eternal Memory";
        }

        // Total interactions milestones
        uint256 tot = s.agents[id].dreamCount + s.agents[id].conversationCount;
        if (tot == 100) {
            emit MemoryMilestone(id, "Century of Memories", 100);
            return "Century of Memories";
        }
        if (tot == 365) {
            emit MemoryMilestone(id, "Year of Memories", 365);
            return "Year of Memories";
        }
        if (tot == 1000) {
            emit MemoryMilestone(id, "Memory Millennial", 1000);
            return "Memory Millennial";
        }

        return "";
    }

    /**
     * @notice Unlock milestone
     */
    function unlockMilestone(
        AishiAgentStorage.Layout storage s,
        uint256 id,
        string memory milestoneName,
        uint8 val
    ) public {
        s.milestones[id][milestoneName] = AishiAgentStorage.MilestoneData(true, block.timestamp, val);
        s.agents[id].achievedMilestones.push(milestoneName);
        emit MilestoneUnlocked(id, milestoneName, val);
    }

    /**
     * @notice Format month/year period
     */
    function formatPeriod(uint8 m, uint16 y) public pure returns (string memory) {
        string[12] memory n = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        return string(abi.encodePacked(n[m-1], " ", uint2str(y)));
    }

    /**
     * @notice Get current month
     */
    function currentMonth() public view returns (uint8) {
        return uint8(DateTime.getMonth(block.timestamp));
    }

    /**
     * @notice Get current year
     */
    function currentYear() public view returns (uint16) {
        return uint16(DateTime.getYear(block.timestamp));
    }

    /**
     * @notice Convert uint to string
     */
    function uint2str(uint256 x) public pure returns (string memory) {
        if (x == 0) return "0";
        uint256 len;
        uint256 y = x;
        while (y != 0) {
            len++;
            y /= 10;
        }
        bytes memory buf = new bytes(len);
        while (x != 0) {
            buf[--len] = bytes1(uint8(48 + x % 10));
            x /= 10;
        }
        return string(buf);
    }

    /**
     * @notice Get memory access level
     */
    function getMemoryAccessInternal(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId
    ) public view returns (uint256 monthsAccessible, string memory memoryDepth) {
        uint256 intelligence = s.agents[tokenId].intelligenceLevel;

        if (intelligence >= 60) {
            monthsAccessible = 60;
            memoryDepth = "Lifetime";
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
     * @notice Get consolidation reward preview
     */
    function getConsolidationRewardInternal(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId
    ) public view returns (
        uint256 baseReward,
        uint256 streakBonus,
        uint256 earlyBirdBonus,
        uint256 totalReward
    ) {
        baseReward = 2;

        uint256 streak = s.consolidationStreak[tokenId];
        if (streak >= 12) streakBonus = 5;
        else if (streak >= 6) streakBonus = 3;
        else if (streak >= 3) streakBonus = 1;
        else streakBonus = 0;

        IPersonalityEvolution.AgentMemory memory mem = s.agentMemories[tokenId];
        if (block.timestamp <= mem.lastConsolidation + 3 days) {
            earlyBirdBonus = 1;
        } else {
            earlyBirdBonus = 0;
        }

        totalReward = baseReward + streakBonus + earlyBirdBonus;
    }
}