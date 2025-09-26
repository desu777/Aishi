// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AishiAgentStorage.sol";
import "../interfaces/IPersonalityEvolution.sol";

/**
 * @title AishiAgentPersonality
 * @notice Personality evolution and dream processing for AishiAgent
 * @dev Handles personality traits, dreams, conversations, and milestones
 */
library AishiAgentPersonality {
    using AishiAgentStorage for AishiAgentStorage.Layout;

    // Events
    event PersonalityEvolved(uint256 indexed tokenId, bytes32 indexed dreamHash, IPersonalityEvolution.PersonalityTraits newPersonality, IPersonalityEvolution.PersonalityImpact impact);
    event DreamProcessed(uint256 indexed tokenId, bytes32 dreamHash, uint256 intelligenceLevel);
    event AgentConversation(uint256 indexed tokenId, bytes32 indexed conversationHash, IPersonalityEvolution.ContextType contextType, uint256 conversationCount);
    event AgentEvolved(uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel);
    event PersonalityMilestone(uint256 indexed tokenId, string milestone, uint8 traitValue, string traitName);
    event MilestoneUnlocked(uint256 indexed tokenId, string milestone, uint8 value);
    event ResponseStyleUpdated(uint256 indexed tokenId, string oldStyle, string newStyle);
    event ResponseStyleEvolved(uint256 indexed tokenId, string newStyle, string[] dominantTraits);
    event UniqueFeaturesAdded(uint256 indexed tokenId, IPersonalityEvolution.UniqueFeature[] newFeatures, uint256 totalFeatures);
    event MemoryUpdated(uint256 indexed tokenId, string memoryType, bytes32 newHash, bytes32 oldHash);

    /**
     * @notice Process daily dream and evolve personality
     */
    function processDailyDreamInternal(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId,
        bytes32 dreamHash,
        IPersonalityEvolution.PersonalityImpact calldata impact
    ) public {
        validatePersonalityImpact(impact);

        AishiAgentStorage.Aishi storage agent = s.agents[tokenId];
        IPersonalityEvolution.PersonalityTraits storage traits = s.agentPersonalities[tokenId];

        // Cooldown check (commented for testing)
        /*
        require(
            traits.lastDreamDate == 0 || block.timestamp >= traits.lastDreamDate + 24 hours,
            "cooldown <24h"
        );
        */

        // Update counters
        unchecked {
            agent.dreamCount      += 1;
            agent.lastUpdated      = block.timestamp;
            traits.lastDreamDate   = block.timestamp;
        }

        // Update hierarchical memory
        IPersonalityEvolution.AgentMemory storage mem = s.agentMemories[tokenId];
        bytes32 old = mem.currentDreamDailyHash;
        mem.currentDreamDailyHash = dreamHash;
        emit MemoryUpdated(tokenId, "dream_daily", dreamHash, old);
        checkMonthChange(s, tokenId);

        // Intelligence boost every 3 dreams
        if (agent.dreamCount % 3 == 0) {
            uint256 oldLvl = agent.intelligenceLevel;
            unchecked { agent.intelligenceLevel += 1; }
            emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
        }

        // Personality evolution every 5 dreams
        if (agent.dreamCount % 5 == 0) {
            IPersonalityEvolution.PersonalityTraits memory before = traits;

            traits.creativity  = updateTrait(traits.creativity,  impact.creativityChange);
            traits.analytical  = updateTrait(traits.analytical,  impact.analyticalChange);
            traits.empathy     = updateTrait(traits.empathy,     impact.empathyChange);
            traits.intuition   = updateTrait(traits.intuition,   impact.intuitionChange);
            traits.resilience  = updateTrait(traits.resilience,  impact.resilienceChange);
            traits.curiosity   = updateTrait(traits.curiosity,   impact.curiosityChange);
            traits.dominantMood = impact.moodShift;

            // Add unique features
            if (impact.newFeatures.length > 0) {
                require(impact.newFeatures.length <= 2, "max2");
                require(traits.uniqueFeatures.length + impact.newFeatures.length <= 5, "max5 features");

                uint256 featuresLength = impact.newFeatures.length;
                for (uint256 i; i < featuresLength;) {
                    require(bytes(impact.newFeatures[i].name).length > 0, "!name");
                    require(impact.newFeatures[i].intensity > 0 && impact.newFeatures[i].intensity <= 100, "!int");

                    IPersonalityEvolution.UniqueFeature memory newFeature = impact.newFeatures[i];
                    newFeature.addedAt = block.timestamp;
                    traits.uniqueFeatures.push(newFeature);
                    unchecked { ++i; }
                }

                emit UniqueFeaturesAdded(tokenId, impact.newFeatures, traits.uniqueFeatures.length);
            }

            unchecked {
                agent.totalEvolutions += 1;
                agent.lastEvolutionDate = block.timestamp;
            }

            checkPersonalityMilestones(s, tokenId, before, traits);
            updateResponseStyle(s, tokenId);

            emit PersonalityEvolved(tokenId, dreamHash, traits, impact);
        }

        emit DreamProcessed(tokenId, dreamHash, agent.intelligenceLevel);
    }

    /**
     * @notice Record conversation and boost intelligence
     */
    function recordConversationInternal(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId,
        bytes32 conversationHash,
        IPersonalityEvolution.ContextType contextType
    ) public {
        AishiAgentStorage.Aishi storage agent = s.agents[tokenId];

        unchecked {
            agent.conversationCount += 1;
            agent.lastUpdated        = block.timestamp;
        }

        // Update hierarchical memory
        IPersonalityEvolution.AgentMemory storage mem = s.agentMemories[tokenId];
        bytes32 old = mem.currentConvDailyHash;
        mem.currentConvDailyHash = conversationHash;
        emit MemoryUpdated(tokenId, "conversation_daily", conversationHash, old);
        checkMonthChange(s, tokenId);

        // Intelligence boost every 10 conversations
        if (agent.conversationCount % 10 == 0) {
            uint256 oldLvl = agent.intelligenceLevel;
            unchecked { agent.intelligenceLevel += 1; }
            emit AgentEvolved(tokenId, oldLvl, agent.intelligenceLevel);
        }

        emit AgentConversation(tokenId, conversationHash, contextType, agent.conversationCount);
    }

    /**
     * @notice Validate personality impact parameters
     */
    function validatePersonalityImpact(IPersonalityEvolution.PersonalityImpact calldata i) public pure {
        require(i.evolutionWeight > 0 && i.evolutionWeight <= 100, "weight");
        require(bytes(i.moodShift).length > 0, "mood");
        require(inRange(i.creativityChange)   && inRange(i.analyticalChange) &&
                inRange(i.empathyChange)      && inRange(i.intuitionChange)  &&
                inRange(i.resilienceChange)   && inRange(i.curiosityChange), "range");

        require(i.newFeatures.length <= 2, "max2");
        uint256 featuresLength = i.newFeatures.length;
        for (uint256 j; j < featuresLength;) {
            require(bytes(i.newFeatures[j].name).length > 0, "!name");
            require(bytes(i.newFeatures[j].description).length > 0, "!desc");
            require(i.newFeatures[j].intensity > 0 && i.newFeatures[j].intensity <= 100, "!int");
            unchecked { ++j; }
        }
    }

    /**
     * @notice Check if trait change is in valid range
     */
    function inRange(int8 x) private pure returns (bool) {
        return x >= -10 && x <= 10;
    }

    /**
     * @notice Update trait value with bounds checking
     */
    function updateTrait(uint8 current, int8 delta) public pure returns (uint8) {
        int256 temp = int256(uint256(current)) + int256(delta);
        if (temp < 0)   temp = 0;
        if (temp > 100) temp = 100;
        return uint8(uint256(temp));
    }

    /**
     * @notice Update response style based on traits
     */
    function updateResponseStyle(AishiAgentStorage.Layout storage s, uint256 tokenId) public {
        IPersonalityEvolution.PersonalityTraits memory t = s.agentPersonalities[tokenId];
        string memory style;

        if (t.empathy > 70 && t.creativity > 60)      style = "empathetic_creative";
        else if (t.empathy > 70)                      style = "empathetic";
        else if (t.creativity > 70)                   style = "creative";
        else if (t.analytical > 70)                   style = "analytical";
        else if (t.intuition > 70)                    style = "intuitive";
        else if (t.resilience > 70)                   style = "resilient";
        else if (t.curiosity > 70)                    style = "curious";
        else                                           style = "balanced";

        if (keccak256(bytes(s.responseStyles[tokenId])) != keccak256(bytes(style))) {
            string memory old = s.responseStyles[tokenId];
            s.responseStyles[tokenId] = style;
            emit ResponseStyleUpdated(tokenId, old, style);
            string[] memory dom = getDominantTraitNames(t);
            emit ResponseStyleEvolved(tokenId, style, dom);
        }
    }

    /**
     * @notice Get dominant trait names
     */
    function getDominantTraitNames(IPersonalityEvolution.PersonalityTraits memory p) public pure returns (string[] memory names) {
        uint8[6] memory v = [p.creativity, p.analytical, p.empathy, p.intuition, p.resilience, p.curiosity];
        string[6] memory n = ["creativity","analytical","empathy","intuition","resilience","curiosity"];
        names = new string[](3);
        for (uint256 k; k < 3; ++k) {
            uint256 m = 0;
            for (uint256 j = 1; j < 6; ++j) if (v[j] > v[m]) m = j;
            names[k] = n[m];
            v[m] = 0;
        }
    }

    /**
     * @notice Check personality milestones
     */
    function checkPersonalityMilestones(
        AishiAgentStorage.Layout storage s,
        uint256 tokenId,
        IPersonalityEvolution.PersonalityTraits memory old,
        IPersonalityEvolution.PersonalityTraits memory nu
    ) public {
        if (old.empathy  < 85 && nu.empathy  >= 85) unlockMilestone(s, tokenId, "empathy_master",  nu.empathy);
        if (old.creativity< 90 && nu.creativity>= 90) unlockMilestone(s, tokenId, "creative_genius",nu.creativity);
        if (old.analytical< 90 && nu.analytical>= 90) unlockMilestone(s, tokenId, "logic_lord",    nu.analytical);
        if (old.intuition< 90 && nu.intuition>= 90) unlockMilestone(s, tokenId, "spiritual_guide",nu.intuition);

        bool balanced = nu.creativity>60 && nu.analytical>60 && nu.empathy>60 &&
                       nu.intuition>60 && nu.resilience>60 && nu.curiosity>60;
        if (balanced && !s.milestones[tokenId]["balanced_soul"].achieved) {
            unlockMilestone(s, tokenId, "balanced_soul", 60);
        }
    }

    /**
     * @notice Unlock milestone
     */
    function unlockMilestone(AishiAgentStorage.Layout storage s, uint256 id, string memory milestoneName, uint8 val) public {
        s.milestones[id][milestoneName] = AishiAgentStorage.MilestoneData(true, block.timestamp, val);
        s.agents[id].achievedMilestones.push(milestoneName);
        emit PersonalityMilestone(id, milestoneName, val, "");
        emit MilestoneUnlocked(id, milestoneName, val);
    }

    /**
     * @notice Check if month changed
     */
    function checkMonthChange(AishiAgentStorage.Layout storage s, uint256 id) public {
        IPersonalityEvolution.AgentMemory storage m = s.agentMemories[id];
        uint8 cm = uint8((block.timestamp / 30 days) % 12 + 1);
        uint16 cy = uint16(1970 + block.timestamp / 365 days);

        if (m.currentMonth == 0) {
            m.currentMonth = cm;
            m.currentYear = cy;
            return;
        }

        if (m.currentMonth != cm || m.currentYear != cy) {
            m.currentMonth = cm;
            m.currentYear = cy;
            if (block.timestamp > m.lastConsolidation + 37 days) {
                s.consolidationStreak[id] = 0;
            }
        }
    }
}