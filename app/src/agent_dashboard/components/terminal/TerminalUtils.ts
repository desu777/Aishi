import { CommandProcessor } from '../../commands/CommandProcessor';

// Terminal color definitions
export const terminalColors = {
  dark: {
    bg: '#1e1e1e',
    text: '#ffffff',
    prompt: '', // Will be set by theme
    system: '#8a8a8a',
    border: '#3a3a3a'
  },
  light: {
    bg: '#ffffff',
    text: '#000000', 
    prompt: '', // Will be set by theme
    system: '#6a6a6a',
    border: '#d1d1d1'
  }
};

// Get terminal colors based on dark mode and theme
export const getTerminalColors = (darkMode: boolean, themeAccentPrimary: string) => {
  const colors = darkMode ? terminalColors.dark : terminalColors.light;
  return {
    ...colors,
    prompt: themeAccentPrimary
  };
};

// Validate command in real-time
export const validateCommand = (input: string, commandProcessor: CommandProcessor): boolean => {
  const trimmed = input.trim();
  if (!trimmed) return false;
  
  // System commands
  if (['clear', 'help'].includes(trimmed.toLowerCase())) return true;
  
  // Regular commands
  const parts = trimmed.split(' ');
  const commandName = parts[0].toLowerCase();
  
  return commandProcessor.getAvailableCommands().some(cmd => cmd.name === commandName);
};

// Generate dots for loading animation
export const generateDots = (pattern: number): string => {
  const patterns = ['.', '..', '...', ''];
  return patterns[pattern];
};

// Check if device is mobile
export const checkIfMobile = (): boolean => {
  return window.innerWidth < 480;
};