import { ThemeProvider } from '../contexts/ThemeContext';
import { WalletProvider } from '../providers/WalletProvider';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Dreamscape - AI Dream Agent',
  description: 'The world\'s first intelligent NFT that learns and evolves with your dreams',
  icons: {
    icon: '/logo_clean.png',
    shortcut: '/logo_clean.png',
    apple: '/logo_clean.png',
  },
}

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Load Cubism Core for Live2D models */}
        <Script 
          src="/cubism/live2dcubismcore.min.js" 
          strategy="beforeInteractive"
        />
      </head>
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