import { defineChain } from 'viem';

// 0G Galileo Testnet configuration from environment variables
export const galileoTestnet = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16601'),
  name: process.env.NEXT_PUBLIC_CHAIN_NAME || '0G-Galileo-Testnet',
  network: process.env.NEXT_PUBLIC_NETWORK_NAME || '0g-galileo-testnet',
  nativeCurrency: {
    decimals: parseInt(process.env.NEXT_PUBLIC_CURRENCY_DECIMALS || '18'),
    name: process.env.NEXT_PUBLIC_CURRENCY_NAME || '0G',
    symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'OG',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_HTTP || 'https://evmrpc-testnet.0g.ai'],
      webSocket: [process.env.NEXT_PUBLIC_RPC_WEBSOCKET || 'wss://evmrpc-testnet.0g.ai'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_HTTP || 'https://evmrpc-testnet.0g.ai'],
      webSocket: [process.env.NEXT_PUBLIC_RPC_WEBSOCKET || 'wss://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_NAME || '0G Chain Explorer',
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: process.env.NEXT_PUBLIC_IS_TESTNET === 'true',
});

// Helper function to get chain configuration
export const getChainConfig = () => {
  return {
    id: galileoTestnet.id,
    name: galileoTestnet.name,
    network: galileoTestnet.network,
    currency: galileoTestnet.nativeCurrency,
    rpcUrls: galileoTestnet.rpcUrls,
    blockExplorers: galileoTestnet.blockExplorers,
    isTestnet: galileoTestnet.testnet
  };
}; 