import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AishiAgent
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const aishiAgentAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_verifier', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'conversationHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'contextType',
        internalType: 'enum IPersonalityEvolution.ContextType',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'conversationCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AgentConversation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AgentEvolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: '_user',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AuthorizedUsage',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: '_newTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: '_from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: '_to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'Cloned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'period',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'bonus',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'specialReward',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ConsolidationCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'dreamHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'intelligenceLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DreamProcessed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'payer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeePaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'achievement',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'totalInteractions',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MemoryMilestone',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'memoryType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'newHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'oldHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'MemoryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'milestone',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      { name: 'value', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'MilestoneUnlocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: '_creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: '_owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: '_dataHashes',
        internalType: 'bytes32[]',
        type: 'bytes32[]',
        indexed: false,
      },
      {
        name: '_dataDescriptions',
        internalType: 'string[]',
        type: 'string[]',
        indexed: false,
      },
    ],
    name: 'Minted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'traits',
        internalType: 'struct IPersonalityEvolution.PersonalityTraits',
        type: 'tuple',
        components: [
          { name: 'creativity', internalType: 'uint8', type: 'uint8' },
          { name: 'analytical', internalType: 'uint8', type: 'uint8' },
          { name: 'empathy', internalType: 'uint8', type: 'uint8' },
          { name: 'intuition', internalType: 'uint8', type: 'uint8' },
          { name: 'resilience', internalType: 'uint8', type: 'uint8' },
          { name: 'curiosity', internalType: 'uint8', type: 'uint8' },
          { name: 'dominantMood', internalType: 'string', type: 'string' },
          { name: 'lastDreamDate', internalType: 'uint256', type: 'uint256' },
          {
            name: 'uniqueFeatures',
            internalType: 'struct IPersonalityEvolution.UniqueFeature[]',
            type: 'tuple[]',
            components: [
              { name: 'name', internalType: 'string', type: 'string' },
              { name: 'description', internalType: 'string', type: 'string' },
              { name: 'intensity', internalType: 'uint8', type: 'uint8' },
              { name: 'addedAt', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
        indexed: false,
      },
      {
        name: 'dreamCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PersonalityActivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'dreamHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newPersonality',
        internalType: 'struct IPersonalityEvolution.PersonalityTraits',
        type: 'tuple',
        components: [
          { name: 'creativity', internalType: 'uint8', type: 'uint8' },
          { name: 'analytical', internalType: 'uint8', type: 'uint8' },
          { name: 'empathy', internalType: 'uint8', type: 'uint8' },
          { name: 'intuition', internalType: 'uint8', type: 'uint8' },
          { name: 'resilience', internalType: 'uint8', type: 'uint8' },
          { name: 'curiosity', internalType: 'uint8', type: 'uint8' },
          { name: 'dominantMood', internalType: 'string', type: 'string' },
          { name: 'lastDreamDate', internalType: 'uint256', type: 'uint256' },
          {
            name: 'uniqueFeatures',
            internalType: 'struct IPersonalityEvolution.UniqueFeature[]',
            type: 'tuple[]',
            components: [
              { name: 'name', internalType: 'string', type: 'string' },
              { name: 'description', internalType: 'string', type: 'string' },
              { name: 'intensity', internalType: 'uint8', type: 'uint8' },
              { name: 'addedAt', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
        indexed: false,
      },
      {
        name: 'impact',
        internalType: 'struct IPersonalityEvolution.PersonalityImpact',
        type: 'tuple',
        components: [
          { name: 'creativityChange', internalType: 'int8', type: 'int8' },
          { name: 'analyticalChange', internalType: 'int8', type: 'int8' },
          { name: 'empathyChange', internalType: 'int8', type: 'int8' },
          { name: 'intuitionChange', internalType: 'int8', type: 'int8' },
          { name: 'resilienceChange', internalType: 'int8', type: 'int8' },
          { name: 'curiosityChange', internalType: 'int8', type: 'int8' },
          { name: 'moodShift', internalType: 'string', type: 'string' },
          { name: 'evolutionWeight', internalType: 'uint8', type: 'uint8' },
          {
            name: 'newFeatures',
            internalType: 'struct IPersonalityEvolution.UniqueFeature[]',
            type: 'tuple[]',
            components: [
              { name: 'name', internalType: 'string', type: 'string' },
              { name: 'description', internalType: 'string', type: 'string' },
              { name: 'intensity', internalType: 'uint8', type: 'uint8' },
              { name: 'addedAt', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
        indexed: false,
      },
    ],
    name: 'PersonalityEvolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'milestone',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'traitValue',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'traitName',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'PersonalityMilestone',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '_to', internalType: 'address', type: 'address', indexed: true },
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: '_sealedKeys',
        internalType: 'bytes16[]',
        type: 'bytes16[]',
        indexed: false,
      },
    ],
    name: 'PublishedSealedKey',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newStyle',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'dominantTraits',
        internalType: 'string[]',
        type: 'string[]',
        indexed: false,
      },
    ],
    name: 'ResponseStyleEvolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldStyle',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'newStyle',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ResponseStyleUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: '_from',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: '_to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'Transferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newFeatures',
        internalType: 'struct IPersonalityEvolution.UniqueFeature[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'intensity', internalType: 'uint8', type: 'uint8' },
          { name: 'addedAt', internalType: 'uint256', type: 'uint256' },
        ],
        indexed: false,
      },
      {
        name: 'totalFeatures',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UniqueFeaturesAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'year', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'YearlyReflectionAvailable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_AGENTS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTING_FEE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERIFIER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'agentMemories',
    outputs: [
      { name: 'memoryCoreHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'currentDreamDailyHash',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'currentConvDailyHash',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      {
        name: 'lastDreamMonthlyHash',
        internalType: 'bytes32',
        type: 'bytes32',
      },
      { name: 'lastConvMonthlyHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'lastConsolidation', internalType: 'uint256', type: 'uint256' },
      { name: 'currentMonth', internalType: 'uint8', type: 'uint8' },
      { name: 'currentYear', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'agentPersonalities',
    outputs: [
      { name: 'creativity', internalType: 'uint8', type: 'uint8' },
      { name: 'analytical', internalType: 'uint8', type: 'uint8' },
      { name: 'empathy', internalType: 'uint8', type: 'uint8' },
      { name: 'intuition', internalType: 'uint8', type: 'uint8' },
      { name: 'resilience', internalType: 'uint8', type: 'uint8' },
      { name: 'curiosity', internalType: 'uint8', type: 'uint8' },
      { name: 'dominantMood', internalType: 'string', type: 'string' },
      { name: 'lastDreamDate', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'agents',
    outputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'agentName', internalType: 'string', type: 'string' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      { name: 'intelligenceLevel', internalType: 'uint256', type: 'uint256' },
      { name: 'dreamCount', internalType: 'uint256', type: 'uint256' },
      { name: 'conversationCount', internalType: 'uint256', type: 'uint256' },
      { name: 'personalityInitialized', internalType: 'bool', type: 'bool' },
      { name: 'totalEvolutions', internalType: 'uint256', type: 'uint256' },
      { name: 'lastEvolutionDate', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'authorizeUsage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'authorizedUsersOf',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'canProcessDreamToday',
    outputs: [{ name: 'canProcess', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'dreamMonthlyHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'convMonthlyHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'month', internalType: 'uint8', type: 'uint8' },
      { name: 'year', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'consolidateMonth',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'consolidationStreak',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'emergencyAuthorizeUser',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'emergencyTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAgentMemory',
    outputs: [
      {
        name: '',
        internalType: 'struct IPersonalityEvolution.AgentMemory',
        type: 'tuple',
        components: [
          { name: 'memoryCoreHash', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'currentDreamDailyHash',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'currentConvDailyHash',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'lastDreamMonthlyHash',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'lastConvMonthlyHash',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'lastConsolidation',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'currentMonth', internalType: 'uint8', type: 'uint8' },
          { name: 'currentYear', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getConsolidationReward',
    outputs: [
      { name: 'baseReward', internalType: 'uint256', type: 'uint256' },
      { name: 'streakBonus', internalType: 'uint256', type: 'uint256' },
      { name: 'earlyBirdBonus', internalType: 'uint256', type: 'uint256' },
      { name: 'totalReward', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getEvolutionStats',
    outputs: [
      { name: 'totalEvolutions', internalType: 'uint256', type: 'uint256' },
      { name: 'evolutionRate', internalType: 'uint256', type: 'uint256' },
      { name: 'lastEvolution', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMemoryAccess',
    outputs: [
      { name: 'monthsAccessible', internalType: 'uint256', type: 'uint256' },
      { name: 'memoryDepth', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPersonalityTraits',
    outputs: [
      {
        name: '',
        internalType: 'struct IPersonalityEvolution.PersonalityTraits',
        type: 'tuple',
        components: [
          { name: 'creativity', internalType: 'uint8', type: 'uint8' },
          { name: 'analytical', internalType: 'uint8', type: 'uint8' },
          { name: 'empathy', internalType: 'uint8', type: 'uint8' },
          { name: 'intuition', internalType: 'uint8', type: 'uint8' },
          { name: 'resilience', internalType: 'uint8', type: 'uint8' },
          { name: 'curiosity', internalType: 'uint8', type: 'uint8' },
          { name: 'dominantMood', internalType: 'string', type: 'string' },
          { name: 'lastDreamDate', internalType: 'uint256', type: 'uint256' },
          {
            name: 'uniqueFeatures',
            internalType: 'struct IPersonalityEvolution.UniqueFeature[]',
            type: 'tuple[]',
            components: [
              { name: 'name', internalType: 'string', type: 'string' },
              { name: 'description', internalType: 'string', type: 'string' },
              { name: 'intensity', internalType: 'uint8', type: 'uint8' },
              { name: 'addedAt', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getUniqueFeatures',
    outputs: [
      {
        name: 'features',
        internalType: 'struct IPersonalityEvolution.UniqueFeature[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'intensity', internalType: 'uint8', type: 'uint8' },
          { name: 'addedAt', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'milestoneName', internalType: 'string', type: 'string' },
    ],
    name: 'hasMilestone',
    outputs: [
      { name: 'achieved', internalType: 'bool', type: 'bool' },
      { name: 'at', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'string', type: 'string' },
    ],
    name: 'milestones',
    outputs: [
      { name: 'achieved', internalType: 'bool', type: 'bool' },
      { name: 'achievedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'traitValue', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proofs', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'descriptions', internalType: 'string[]', type: 'string[]' },
      { name: 'agentName', internalType: 'string', type: 'string' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'mintAgent',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'nameExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'ownerToTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'pendingRewards',
    outputs: [
      { name: 'intelligenceBonus', internalType: 'uint256', type: 'uint256' },
      { name: 'specialMilestone', internalType: 'string', type: 'string' },
      { name: 'yearlyReflection', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'dreamHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'impact',
        internalType: 'struct IPersonalityEvolution.PersonalityImpact',
        type: 'tuple',
        components: [
          { name: 'creativityChange', internalType: 'int8', type: 'int8' },
          { name: 'analyticalChange', internalType: 'int8', type: 'int8' },
          { name: 'empathyChange', internalType: 'int8', type: 'int8' },
          { name: 'intuitionChange', internalType: 'int8', type: 'int8' },
          { name: 'resilienceChange', internalType: 'int8', type: 'int8' },
          { name: 'curiosityChange', internalType: 'int8', type: 'int8' },
          { name: 'moodShift', internalType: 'string', type: 'string' },
          { name: 'evolutionWeight', internalType: 'uint8', type: 'uint8' },
          {
            name: 'newFeatures',
            internalType: 'struct IPersonalityEvolution.UniqueFeature[]',
            type: 'tuple[]',
            components: [
              { name: 'name', internalType: 'string', type: 'string' },
              { name: 'description', internalType: 'string', type: 'string' },
              { name: 'intensity', internalType: 'uint8', type: 'uint8' },
              { name: 'addedAt', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'processDailyDream',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'conversationHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'contextType',
        internalType: 'enum IPersonalityEvolution.ContextType',
        type: 'uint8',
      },
    ],
    name: 'recordConversation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'responseStyles',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalAgents',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFeesCollected',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'proofs', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'transfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'newHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'updateMemoryCore',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'verifier',
    outputs: [
      {
        name: '',
        internalType: 'contract IERC7857DataVerifier',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const aishiAgentAddress = {
  16602: '0xDBA5DcdfbC1140EEc3319F3AaA846f3ffA2f8467',
  16661: '0x6878F1E6CB28e20759FDef8933809822F7C81f8a',
} as const

/**
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const aishiAgentConfig = {
  address: aishiAgentAddress,
  abi: aishiAgentAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AishiVerifier
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x7ac6C8543C6cB0CB388267E5a7a717Fc9872408f)
 */
export const aishiVerifierAbi = [
  {
    type: 'function',
    inputs: [{ name: 'proofs', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'verifyPreimage',
    outputs: [
      {
        name: 'outputs',
        internalType: 'struct PreimageProofOutput[]',
        type: 'tuple[]',
        components: [
          { name: 'dataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'isValid', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'proofs', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'verifyTransferValidity',
    outputs: [
      {
        name: 'outputs',
        internalType: 'struct TransferValidityProofOutput[]',
        type: 'tuple[]',
        components: [
          { name: 'oldDataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'newDataHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'pubKey', internalType: 'bytes', type: 'bytes' },
          { name: 'sealedKey', internalType: 'bytes16', type: 'bytes16' },
          { name: 'isValid', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
] as const

/**
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x7ac6C8543C6cB0CB388267E5a7a717Fc9872408f)
 */
export const aishiVerifierAddress = {
  16602: '0x1a0F991B9a2F8835dFabED2225F413Cc4c4c9134',
  16661: '0x7ac6C8543C6cB0CB388267E5a7a717Fc9872408f',
} as const

/**
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x7ac6C8543C6cB0CB388267E5a7a717Fc9872408f)
 */
export const aishiVerifierConfig = {
  address: aishiVerifierAddress,
  abi: aishiVerifierAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgent = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentAdminRole = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'ADMIN_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"MAX_AGENTS"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentMaxAgents = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'MAX_AGENTS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"MINTING_FEE"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentMintingFee = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'MINTING_FEE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentPauserRole = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'PAUSER_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"VERIFIER_ROLE"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentVerifierRole =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'VERIFIER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"agentMemories"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentAgentMemories =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'agentMemories',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"agentPersonalities"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentAgentPersonalities =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'agentPersonalities',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"agents"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentAgents = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'agents',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"authorizedUsersOf"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentAuthorizedUsersOf =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'authorizedUsersOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"canProcessDreamToday"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentCanProcessDreamToday =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'canProcessDreamToday',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"consolidationStreak"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentConsolidationStreak =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'consolidationStreak',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"getAgentMemory"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentGetAgentMemory =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'getAgentMemory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"getConsolidationReward"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentGetConsolidationReward =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'getConsolidationReward',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"getEvolutionStats"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentGetEvolutionStats =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'getEvolutionStats',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"getMemoryAccess"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentGetMemoryAccess =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'getMemoryAccess',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"getPersonalityTraits"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentGetPersonalityTraits =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'getPersonalityTraits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"getRoleAdmin"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"getUniqueFeatures"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentGetUniqueFeatures =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'getUniqueFeatures',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"hasMilestone"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentHasMilestone =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'hasMilestone',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"hasRole"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentHasRole = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"milestones"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentMilestones = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'milestones',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentName = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"nameExists"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentNameExists = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'nameExists',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"nextTokenId"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentNextTokenId = /*#__PURE__*/ createUseReadContract(
  {
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'nextTokenId',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"ownerToTokenId"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentOwnerToTokenId =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'ownerToTokenId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"paused"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentPaused = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"pendingRewards"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentPendingRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'pendingRewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"responseStyles"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentResponseStyles =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'responseStyles',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentSymbol = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"totalAgents"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentTotalAgents = /*#__PURE__*/ createUseReadContract(
  {
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'totalAgents',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"totalFeesCollected"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentTotalFeesCollected =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'totalFeesCollected',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentTotalSupply = /*#__PURE__*/ createUseReadContract(
  {
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'totalSupply',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"treasury"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentTreasury = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"verifier"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useReadAishiAgentVerifier = /*#__PURE__*/ createUseReadContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'verifier',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgent = /*#__PURE__*/ createUseWriteContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"authorizeUsage"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentAuthorizeUsage =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'authorizeUsage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"consolidateMonth"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentConsolidateMonth =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'consolidateMonth',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"emergencyAuthorizeUser"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentEmergencyAuthorizeUser =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'emergencyAuthorizeUser',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"emergencyTransfer"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentEmergencyTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'emergencyTransfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentGrantRole = /*#__PURE__*/ createUseWriteContract(
  { abi: aishiAgentAbi, address: aishiAgentAddress, functionName: 'grantRole' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"mintAgent"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentMintAgent = /*#__PURE__*/ createUseWriteContract(
  { abi: aishiAgentAbi, address: aishiAgentAddress, functionName: 'mintAgent' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"pause"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentPause = /*#__PURE__*/ createUseWriteContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"processDailyDream"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentProcessDailyDream =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'processDailyDream',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"recordConversation"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentRecordConversation =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'recordConversation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"transfer"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"unpause"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"updateMemoryCore"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWriteAishiAgentUpdateMemoryCore =
  /*#__PURE__*/ createUseWriteContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'updateMemoryCore',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgent = /*#__PURE__*/ createUseSimulateContract({
  abi: aishiAgentAbi,
  address: aishiAgentAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"authorizeUsage"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentAuthorizeUsage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'authorizeUsage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"consolidateMonth"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentConsolidateMonth =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'consolidateMonth',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"emergencyAuthorizeUser"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentEmergencyAuthorizeUser =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'emergencyAuthorizeUser',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"emergencyTransfer"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentEmergencyTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'emergencyTransfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"grantRole"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"mintAgent"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentMintAgent =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'mintAgent',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"pause"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"processDailyDream"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentProcessDailyDream =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'processDailyDream',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"recordConversation"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentRecordConversation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'recordConversation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"renounceRole"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"revokeRole"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"transfer"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"unpause"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link aishiAgentAbi}__ and `functionName` set to `"updateMemoryCore"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useSimulateAishiAgentUpdateMemoryCore =
  /*#__PURE__*/ createUseSimulateContract({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    functionName: 'updateMemoryCore',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"AgentConversation"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentAgentConversationEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'AgentConversation',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"AgentEvolved"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentAgentEvolvedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'AgentEvolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"AuthorizedUsage"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentAuthorizedUsageEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'AuthorizedUsage',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"Cloned"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentClonedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'Cloned',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"ConsolidationCompleted"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentConsolidationCompletedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'ConsolidationCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"DreamProcessed"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentDreamProcessedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'DreamProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"FeePaid"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentFeePaidEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'FeePaid',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"MemoryMilestone"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentMemoryMilestoneEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'MemoryMilestone',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"MemoryUpdated"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentMemoryUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'MemoryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"MilestoneUnlocked"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentMilestoneUnlockedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'MilestoneUnlocked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"Minted"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentMintedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'Minted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"Paused"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"PersonalityActivated"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentPersonalityActivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'PersonalityActivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"PersonalityEvolved"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentPersonalityEvolvedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'PersonalityEvolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"PersonalityMilestone"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentPersonalityMilestoneEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'PersonalityMilestone',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"PublishedSealedKey"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentPublishedSealedKeyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'PublishedSealedKey',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"ResponseStyleEvolved"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentResponseStyleEvolvedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'ResponseStyleEvolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"ResponseStyleUpdated"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentResponseStyleUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'ResponseStyleUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"RoleAdminChanged"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"RoleGranted"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"RoleRevoked"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"Transferred"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'Transferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"UniqueFeaturesAdded"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentUniqueFeaturesAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'UniqueFeaturesAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"Unpaused"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link aishiAgentAbi}__ and `eventName` set to `"YearlyReflectionAvailable"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x6878F1E6CB28e20759FDef8933809822F7C81f8a)
 */
export const useWatchAishiAgentYearlyReflectionAvailableEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: aishiAgentAbi,
    address: aishiAgentAddress,
    eventName: 'YearlyReflectionAvailable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiVerifierAbi}__
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x7ac6C8543C6cB0CB388267E5a7a717Fc9872408f)
 */
export const useReadAishiVerifier = /*#__PURE__*/ createUseReadContract({
  abi: aishiVerifierAbi,
  address: aishiVerifierAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiVerifierAbi}__ and `functionName` set to `"verifyPreimage"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x7ac6C8543C6cB0CB388267E5a7a717Fc9872408f)
 */
export const useReadAishiVerifierVerifyPreimage =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiVerifierAbi,
    address: aishiVerifierAddress,
    functionName: 'verifyPreimage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link aishiVerifierAbi}__ and `functionName` set to `"verifyTransferValidity"`
 *
 * [__View Contract on 0 G Mainnet 0 G Block Chain Explorer__](https://chainscan.0g.ai/address/0x7ac6C8543C6cB0CB388267E5a7a717Fc9872408f)
 */
export const useReadAishiVerifierVerifyTransferValidity =
  /*#__PURE__*/ createUseReadContract({
    abi: aishiVerifierAbi,
    address: aishiVerifierAddress,
    functionName: 'verifyTransferValidity',
  })
