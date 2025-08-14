/**
 * @fileoverview Virtual Broker State Machine
 * @description Manages virtual broker state, balance, and funding operations using XState actor model
 */

import { setup, assign, fromPromise } from 'xstate';

// Debug logging function
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
    console.log(`[BrokerMachine] ${message}`, data || '');
  }
};

interface BrokerContext {
  status: 'uninitialized' | 'initialized' | 'loading' | 'error';
  balance: number;
  walletAddress: string | null;
  errorMessage: string | null;
}

type BrokerEvent =
  | { type: 'INITIALIZE'; walletAddress: string }
  | { type: 'FUND'; amount: number }
  | { type: 'UPDATE_BALANCE'; balance: number }
  | { type: 'REFRESH' }
  | { type: 'RETRY' };

// API service actors
const fetchBrokerStatus = fromPromise(async ({ input }: { input: { walletAddress: string } }) => {
  const API_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
  
  debugLog('Fetching broker status', { walletAddress: input.walletAddress });
  
  try {
    const response = await fetch(`${API_URL}/balance/${input.walletAddress}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    debugLog('Balance API response', { status: response.status, ok: response.ok });
    
    if (!response.ok) {
      // If broker doesn't exist, return uninitialized state
      if (response.status === 404) {
        debugLog('Broker not found, returning uninitialized state');
        return { exists: false, balance: 0 };
      }
      throw new Error(`Failed to fetch broker status: ${response.statusText}`);
    }
    
    const data = await response.json();
    debugLog('Balance data received', data);
    
    // Check if broker exists based on response
    if (data.success && data.data) {
      return {
        exists: true,
        balance: data.data.balance || 0
      };
    } else {
      return { exists: false, balance: 0 };
    }
  } catch (error) {
    debugLog('Error fetching broker status', error);
    throw error;
  }
});

const createBroker = fromPromise(async ({ input }: { input: { walletAddress: string } }) => {
  const API_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
  
  debugLog('Creating broker', { walletAddress: input.walletAddress });
  
  const response = await fetch(`${API_URL}/create-broker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: input.walletAddress })
  });
  
  debugLog('Create broker response', { status: response.status, ok: response.ok });
  
  if (!response.ok) {
    const errorText = await response.text();
    debugLog('Create broker error', errorText);
    throw new Error(`Failed to create broker: ${response.statusText}`);
  }
  
  const data = await response.json();
  debugLog('Broker created', data);
  
  return {
    balance: data.data?.balance || 0
  };
});

const fundBroker = fromPromise(async ({ input }: { input: { walletAddress: string; amount: number } }) => {
  const API_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
  
  debugLog('Funding broker', { walletAddress: input.walletAddress, amount: input.amount });
  
  const response = await fetch(`${API_URL}/fund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: input.walletAddress,
      amount: input.amount,
      txHash: undefined // Optional, can be added later if needed
    })
  });
  
  debugLog('Fund broker response', { status: response.status, ok: response.ok });
  
  if (!response.ok) {
    const errorText = await response.text();
    debugLog('Fund broker error', errorText);
    throw new Error(`Failed to fund broker: ${response.statusText}`);
  }
  
  const data = await response.json();
  debugLog('Broker funded', data);
  
  return {
    balance: data.data?.balance || 0
  };
});

export const brokerMachine = setup({
  types: {} as {
    context: BrokerContext;
    events: BrokerEvent;
  },
  actors: {
    fetchBrokerStatus,
    createBroker,
    fundBroker
  },
  actions: {
    setWalletAddress: assign({
      walletAddress: ({ event }) => {
        if (event.type === 'INITIALIZE') {
          return event.walletAddress;
        }
        return null;
      }
    }),
    
    updateBalance: assign({
      balance: ({ event }) => {
        if (event.type === 'UPDATE_BALANCE') {
          return event.balance;
        }
        return 0;
      }
    }),
    
    setBalanceFromResponse: assign({
      balance: ({ event }) => {
        if (event.type === 'xstate.done.actor.fetchBrokerStatus') {
          return event.output.balance;
        }
        if (event.type === 'xstate.done.actor.createBroker') {
          return event.output.balance;
        }
        if (event.type === 'xstate.done.actor.fundBroker') {
          return event.output.balance;
        }
        return 0;
      }
    }),
    
    setError: assign({
      errorMessage: ({ event }) => {
        if (event.type === 'xstate.error.actor.fetchBrokerStatus' ||
            event.type === 'xstate.error.actor.createBroker' ||
            event.type === 'xstate.error.actor.fundBroker') {
          return event.error?.message || 'Unknown error occurred';
        }
        return null;
      },
      status: 'error' as const
    }),
    
    clearError: assign({
      errorMessage: null
    })
  },
  guards: {
    brokerExists: ({ event }) => {
      if (event.type === 'xstate.done.actor.fetchBrokerStatus') {
        return event.output.exists === true;
      }
      return false;
    },
    
    hasWalletAddress: ({ context }) => {
      return context.walletAddress !== null;
    }
  }
}).createMachine({
  id: 'broker',
  initial: 'uninitialized',
  context: {
    status: 'uninitialized',
    balance: 0,
    walletAddress: null,
    errorMessage: null
  },
  
  states: {
    uninitialized: {
      entry: assign({ status: 'uninitialized' as const }),
      on: {
        INITIALIZE: {
          target: 'checking',
          actions: 'setWalletAddress'
        }
      }
    },
    
    checking: {
      entry: assign({ status: 'loading' as const }),
      invoke: {
        id: 'fetchBrokerStatus',
        src: 'fetchBrokerStatus',
        input: ({ context }) => ({ walletAddress: context.walletAddress! }),
        onDone: [
          {
            target: 'initialized',
            guard: 'brokerExists',
            actions: 'setBalanceFromResponse'
          },
          {
            target: 'creating'
          }
        ],
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    
    creating: {
      entry: assign({ status: 'loading' as const }),
      invoke: {
        id: 'createBroker',
        src: 'createBroker',
        input: ({ context }) => ({ walletAddress: context.walletAddress! }),
        onDone: {
          target: 'initialized',
          actions: 'setBalanceFromResponse'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    
    initialized: {
      entry: assign({ status: 'initialized' as const }),
      on: {
        FUND: 'funding',
        UPDATE_BALANCE: {
          actions: 'updateBalance'
        },
        REFRESH: {
          target: 'checking',
          guard: 'hasWalletAddress'
        }
      }
    },
    
    funding: {
      entry: assign({ status: 'loading' as const }),
      invoke: {
        id: 'fundBroker',
        src: 'fundBroker',
        input: ({ context, event }) => ({
          walletAddress: context.walletAddress!,
          amount: event.type === 'FUND' ? event.amount : 0.01
        }),
        onDone: {
          target: 'initialized',
          actions: 'setBalanceFromResponse'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    
    error: {
      entry: assign({ status: 'error' as const }),
      on: {
        RETRY: {
          target: 'checking',
          guard: 'hasWalletAddress',
          actions: 'clearError'
        },
        INITIALIZE: {
          target: 'checking',
          actions: ['setWalletAddress', 'clearError']
        }
      }
    }
  }
});