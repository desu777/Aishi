// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  AishiAgent – iNFT with Hierarchical Memory & Personality Evolution
 * @notice Optimized facade contract using library-based architecture for gas efficiency
 * @dev    Uses Diamond Storage pattern - all logic delegated to libraries
 */

import "./interfaces/IERC7857.sol";
import "./interfaces/IERC7857DataVerifier.sol";
import "./interfaces/IPersonalityEvolution.sol";

import "./libraries/AishiAgentStorage.sol";
import "./libraries/AishiAgentCore.sol";
import "./libraries/AishiAgentPersonality.sol";
import "./libraries/AishiAgentMemory.sol";

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AishiAgent is
    IERC7857,
    IPersonalityEvolution,
    ReentrancyGuard,
    AccessControl,
    Pausable
{
    using AishiAgentStorage for AishiAgentStorage.Layout;
    using AishiAgentCore for AishiAgentStorage.Layout;
    using AishiAgentPersonality for AishiAgentStorage.Layout;
    using AishiAgentMemory for AishiAgentStorage.Layout;

    // ═══════════════════════════════════════════════════════════════════════════
    //                                 CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════════

    uint256 public constant MAX_AGENTS   = 50;
    uint256 public constant MINTING_FEE  = 0.1 ether;

    address public immutable treasury;
    IERC7857DataVerifier public immutable verifier;

    bytes32 public constant ADMIN_ROLE    = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    // ═══════════════════════════════════════════════════════════════════════════
    //                                CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════════

    constructor(address _verifier, address _treasury) {
        require(_treasury != address(0), "treasury = zero addr");
        treasury = _treasury;
        verifier = IERC7857DataVerifier(_verifier);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //                               MINT & TRANSFER
    // ═══════════════════════════════════════════════════════════════════════════

    function mintAgent(
        bytes[] calldata proofs,
        string[] calldata descriptions,
        string memory agentName,
        address to
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        return s.mintAgentInternal(
            proofs,
            descriptions,
            agentName,
            to,
            treasury,
            verifier,
            MINTING_FEE,
            MAX_AGENTS,
            msg.value
        );
    }

    function transfer(
        address to,
        uint256 tokenId,
        bytes[] calldata proofs
    ) external override onlyOwnerOrAdmin(tokenId) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        s.transferInternal(to, tokenId, proofs, verifier);
    }

    function authorizeUsage(uint256 tokenId, address user)
        external override onlyOwnerOrAdmin(tokenId)
    {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        s.authorizeUserInternal(tokenId, user);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //                             PERSONALITY & DREAMS
    // ═══════════════════════════════════════════════════════════════════════════

    function processDailyDream(
        uint256 tokenId,
        bytes32 dreamHash,
        PersonalityImpact calldata impact
    ) external override whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        s.processDailyDreamInternal(tokenId, dreamHash, impact);
    }

    function recordConversation(
        uint256 tokenId,
        bytes32 conversationHash,
        ContextType contextType
    ) external override whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        s.recordConversationInternal(tokenId, conversationHash, contextType);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //                            MEMORY CONSOLIDATION
    // ═══════════════════════════════════════════════════════════════════════════

    function consolidateMonth(
        uint256 tokenId,
        bytes32 dreamMonthlyHash,
        bytes32 convMonthlyHash,
        uint8 month,
        uint16 year
    ) external whenNotPaused onlyOwnerOrAuthorized(tokenId) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        s.consolidateMonthInternal(tokenId, dreamMonthlyHash, convMonthlyHash, month, year);
    }

    function updateMemoryCore(uint256 tokenId, bytes32 newHash)
        external whenNotPaused onlyOwnerOrAuthorized(tokenId)
    {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        s.updateMemoryCoreInternal(tokenId, newHash);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //                           PUBLIC MAPPINGS (GETTERS)
    // ═══════════════════════════════════════════════════════════════════════════

    function agents(uint256 tokenId) public view returns (AishiAgentStorage.Aishi memory) {
        return AishiAgentStorage.layout().agents[tokenId];
    }

    function nameExists(string calldata name) public view returns (bool) {
        return AishiAgentStorage.layout().nameExists[name];
    }

    function ownerToTokenId(address owner) public view returns (uint256) {
        return AishiAgentStorage.layout().ownerToTokenId[owner];
    }

    function agentPersonalities(uint256 tokenId) public view returns (PersonalityTraits memory) {
        return AishiAgentStorage.layout().agentPersonalities[tokenId];
    }

    function agentMemories(uint256 tokenId) public view returns (AgentMemory memory) {
        return AishiAgentStorage.layout().agentMemories[tokenId];
    }

    function pendingRewards(uint256 tokenId) public view returns (AishiAgentStorage.ConsolidationReward memory) {
        return AishiAgentStorage.layout().pendingRewards[tokenId];
    }

    function consolidationStreak(uint256 tokenId) public view returns (uint256) {
        return AishiAgentStorage.layout().consolidationStreak[tokenId];
    }

    function milestones(uint256 tokenId, string calldata milestoneName)
        public view returns (AishiAgentStorage.MilestoneData memory)
    {
        return AishiAgentStorage.layout().milestones[tokenId][milestoneName];
    }

    function responseStyles(uint256 tokenId) public view returns (string memory) {
        return AishiAgentStorage.layout().responseStyles[tokenId];
    }

    function nextTokenId() public view returns (uint256) {
        return AishiAgentStorage.layout().nextTokenId;
    }

    function totalAgents() public view returns (uint256) {
        return AishiAgentStorage.layout().totalAgents;
    }

    function totalFeesCollected() public view returns (uint256) {
        return AishiAgentStorage.layout().totalFeesCollected;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //                                VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    function ownerOf(uint256 tokenId) external view override returns (address) {
        return AishiAgentStorage.layout().agents[tokenId].owner;
    }

    function authorizedUsersOf(uint256 tokenId) external view override returns (address[] memory) {
        return AishiAgentStorage.layout().agents[tokenId].authorizedUsers;
    }

    function getPersonalityTraits(uint256 tokenId)
        external view override returns (PersonalityTraits memory)
    {
        require(AishiAgentStorage.layout().agents[tokenId].owner != address(0), "agent !exist");
        return AishiAgentStorage.layout().agentPersonalities[tokenId];
    }

    function getMemoryAccess(uint256 tokenId) external view override returns (
        uint256 monthsAccessible,
        string memory memoryDepth
    ) {
        require(AishiAgentStorage.layout().agents[tokenId].owner != address(0), "agent !exist");
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        return s.getMemoryAccessInternal(tokenId);
    }

    function getAgentMemory(uint256 tokenId) external view returns (AgentMemory memory) {
        require(AishiAgentStorage.layout().agents[tokenId].owner != address(0), "agent !exist");
        return AishiAgentStorage.layout().agentMemories[tokenId];
    }

    function getConsolidationReward(uint256 tokenId) external view override returns (
        uint256 baseReward,
        uint256 streakBonus,
        uint256 earlyBirdBonus,
        uint256 totalReward
    ) {
        require(AishiAgentStorage.layout().agents[tokenId].owner != address(0), "agent !exist");
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        return s.getConsolidationRewardInternal(tokenId);
    }

    function canProcessDreamToday(uint256 tokenId) external view override returns (bool) {
        require(AishiAgentStorage.layout().agents[tokenId].owner != address(0), "agent !exist");
        // TESTING MODE - no cooldown
        return true;
    }

    function getEvolutionStats(uint256 tokenId)
        external view override returns (uint256 totalEvolutions, uint256 evolutionRate, uint256 lastEvolution)
    {
        AishiAgentStorage.Aishi memory a = AishiAgentStorage.layout().agents[tokenId];
        totalEvolutions = a.totalEvolutions;
        lastEvolution = a.lastEvolutionDate;
        uint256 daysSinceCreation = (block.timestamp - a.createdAt) / 1 days;
        evolutionRate = daysSinceCreation == 0 ? 0 : (totalEvolutions * 100) / daysSinceCreation;
    }

    function hasMilestone(uint256 tokenId, string calldata milestoneName)
        external view override returns (bool achieved, uint256 at)
    {
        AishiAgentStorage.MilestoneData memory m = AishiAgentStorage.layout().milestones[tokenId][milestoneName];
        return (m.achieved, m.achievedAt);
    }

    function getUniqueFeatures(uint256 tokenId)
        external view override returns (UniqueFeature[] memory)
    {
        require(AishiAgentStorage.layout().agents[tokenId].owner != address(0), "agent !exist");
        return AishiAgentStorage.layout().agentPersonalities[tokenId].uniqueFeatures;
    }

    function totalSupply() external view returns (uint256) {
        return AishiAgentStorage.layout().totalAgents;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "zero owner");
        return AishiAgentStorage.layout().ownerToTokenId[owner] == 0 ? 0 : 1;
    }

    function name() external pure returns (string memory) {
        return "AishiAgent";
    }

    function symbol() external pure returns (string memory) {
        return "AISHI";
    }

    function supportsInterface(bytes4 id) public view override returns (bool) {
        return id == type(IERC7857).interfaceId || super.supportsInterface(id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //                           ADMIN & EMERGENCY
    // ═══════════════════════════════════════════════════════════════════════════

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function emergencyAuthorizeUser(uint256 tokenId, address user) external onlyRole(ADMIN_ROLE) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        s.authorizeUserInternal(tokenId, user);
    }

    function emergencyTransfer(uint256 tokenId, address to) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "to = zero");
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        require(s.ownerToTokenId[to] == 0, "to already owns");

        address from = s.agents[tokenId].owner;
        s.ownerToTokenId[from] = 0;
        s.ownerToTokenId[to] = tokenId;
        s.agents[tokenId].owner = to;
        s.agents[tokenId].lastUpdated = block.timestamp;

        emit Transferred(tokenId, from, to);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //                                MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════════

    modifier onlyOwnerOrAuthorized(uint256 tokenId) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        require(
            s.agents[tokenId].owner == msg.sender ||
            hasRole(ADMIN_ROLE, msg.sender) ||
            s.isAuthorizedUser(tokenId, msg.sender),
            "!auth"
        );
        _;
    }

    modifier onlyOwnerOrAdmin(uint256 tokenId) {
        AishiAgentStorage.Layout storage s = AishiAgentStorage.layout();
        require(
            s.agents[tokenId].owner == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "!owner"
        );
        _;
    }
}