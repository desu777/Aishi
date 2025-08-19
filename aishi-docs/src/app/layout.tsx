import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClientProviders } from '@/providers/ClientProviders'

export const metadata: Metadata = {
  metadataBase: new URL('https://aishi.app'),
  title: 'Aishi Docs',
  description: 'Transform your dreams into consciousness evolution. Create AI agents with evolving personalities on blockchain. Your subconscious speaks, Aishi translates.',
  keywords: 'aishiOS, AI agents, blockchain, NFT, personality evolution, digital soul, dream analysis, consciousness, iNFT, ERC-7857, 0G Network, Web3 AI',
  authors: [{ name: 'Aishi Team' }],
  icons: {
    icon: '/logo_white.png',
    shortcut: '/logo_white.png',
    apple: '/logo_white.png',
  },
  openGraph: {
    title: 'Aishi Docs',
    description: 'Transform your dreams into consciousness evolution. AI agents with evolving personalities, powered by blockchain technology.',
    url: 'https://aishi.app',
    siteName: 'Aishi Docs',
    images: [{
      url: '/logo_white.png',
      width: 1200,
      height: 630,
      alt: 'Aishi - AI Agents with Evolving Personalities',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aishi Docs',
    description: 'Transform your dreams into consciousness evolution. Your subconscious speaks, Aishi translates.',
    creator: '@aishios',
    images: ['/logo_white.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B5CF6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-background-main text-text-primary">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}