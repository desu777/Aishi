import { ThemeProvider } from '../contexts/ThemeContext';
import { WalletProvider } from '../providers/WalletProvider';
import '../styles/globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dreamscape - AI Dream Agent',
  description: 'The world\'s first intelligent NFT that learns and evolves with your dreams',
}

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 