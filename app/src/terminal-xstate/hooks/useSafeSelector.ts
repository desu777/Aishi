/**
 * @fileoverview Safe selector hook for XState actors that handles null/undefined references
 * @description Solves React Rules of Hooks violations when working with conditional actors
 */

import { useSelector } from '@xstate/react';

// Dummy actor used as fallback when real actor is null/undefined
// This ensures useSelector is always called with a valid reference
const dummyActor = {
  subscribe: () => ({ unsubscribe: () => {} }),
  getSnapshot: () => ({ 
    context: {
      status: 'uninitialized',
      value: 'dummy'
    },
    value: 'uninitialized'
  }),
  send: () => {},
  id: 'dummy-actor'
};

/**
 * Safe wrapper around useSelector that handles null/undefined actors
 * Ensures Rules of Hooks are never violated while maintaining type safety
 * 
 * @param actor - The actor reference (can be null/undefined)
 * @param selector - Selector function to extract state
 * @param defaultValue - Optional default value when actor is null
 * @returns Selected state or defaultValue/undefined
 */
export function useSafeSelector<TActor, TSelected>(
  actor: TActor | null | undefined,
  selector: (snapshot: any) => TSelected,
  defaultValue?: TSelected
): TSelected | undefined {
  // Always call useSelector to satisfy Rules of Hooks
  // Use dummy actor as fallback when real actor doesn't exist
  const selected = useSelector(
    actor || dummyActor,
    (snapshot) => {
      // If no real actor, return default value
      if (!actor) {
        return defaultValue;
      }
      
      // Apply selector with null safety
      try {
        return selector(snapshot);
      } catch (error) {
        console.warn('[useSafeSelector] Selector error:', error);
        return defaultValue;
      }
    }
  );
  
  return selected;
}

/**
 * Specialized version for getting full actor state
 * Common pattern in the codebase
 */
export function useSafeActorState<TActor>(
  actor: TActor | null | undefined
) {
  return useSafeSelector(
    actor,
    (snapshot) => snapshot,
    null
  );
}