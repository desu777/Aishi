'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { getSupportedChains } from './chains';

// Centralized wagmi config used across app & services
// Avoids direct window.ethereum access and keeps a single wallet source of truth
export const wagmiConfig = getDefaultConfig({
  appName: 'Aishi – Your inner AI companion',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '34121ad34d9bc22e1afc6f45f72b3fdd',
  chains: getSupportedChains() as any,
  ssr: false,
});

export default wagmiConfig;

