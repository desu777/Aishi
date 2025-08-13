'use client';

import React, { useState, useEffect } from 'react';
import { GlassTerminal } from './GlassTerminal';

interface TerminalProps {
  darkMode?: boolean;
  title?: string;
  width?: string;
  height?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  darkMode = true,
  title,
  width = '100%',
  height = '600px',
  className = '',
  isOpen: externalIsOpen,
  onClose: externalOnClose
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <GlassTerminal 
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
};