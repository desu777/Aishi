import React from 'react';
import { Terminal } from '../../../terminal-xstate/components/Terminal';

interface TerminalModalProps {
  isTerminalOpen: boolean;
  setIsTerminalOpen: (open: boolean) => void;
  darkMode: boolean;
  isMobile: boolean;
  theme: any;
  selectedModel?: string;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ 
  isTerminalOpen, 
  setIsTerminalOpen, 
  darkMode, 
  isMobile, 
  theme,
  selectedModel 
}) => {
  // The new Terminal component now handles its own modal display
  // TODO: In future, pass selectedModel to Terminal for AI queries
  return (
    <Terminal 
      darkMode={darkMode}
      isOpen={isTerminalOpen}
      onClose={() => setIsTerminalOpen(false)}
    />
  );
};