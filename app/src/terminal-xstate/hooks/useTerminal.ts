import { useMachine } from '@xstate/react';
import { terminalMachine } from '../machines/terminalMachine';
import { useEffect } from 'react';

export function useTerminal() {
  const [state, send] = useMachine(terminalMachine);

  // Initialize terminal on mount
  useEffect(() => {
    if (!state.context.isInitialized) {
      send({ type: 'INITIALIZE' });
    }
  }, []);

  // Load command history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('dreamscape-terminal-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        if (Array.isArray(history)) {
          // We'll handle this in a future update to the machine
        }
      } catch (error) {
        console.error('Failed to load command history:', error);
      }
    }
  }, []);

  // Save command history to localStorage
  useEffect(() => {
    if (state.context.commandHistory.length > 0) {
      try {
        localStorage.setItem(
          'dreamscape-terminal-history',
          JSON.stringify(state.context.commandHistory)
        );
      } catch (error) {
        console.error('Failed to save command history:', error);
      }
    }
  }, [state.context.commandHistory]);

  return {
    state,
    send,
    context: state.context,
    isProcessing: state.matches('processing'),
    isDreamActive: state.context.isDreamActive,
    dreamStatus: state.context.dreamStatus,
    isInitialized: state.context.isInitialized,
    brokerRef: state.context.brokerRef,
    modelRef: state.context.modelRef,
    agentRef: state.context.agentRef,
    dreamRef: state.context.dreamRef
  };
}