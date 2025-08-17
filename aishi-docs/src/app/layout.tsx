import type { Metadata } from 'next'
import './globals.css'
import { ClientProviders } from '@/providers/ClientProviders'

export const metadata: Metadata = {
  title: 'Aishi Documentation',
  description: 'Official documentation for the Aishi ecosystem - AI agents with evolving personalities on blockchain',
  keywords: 'aishiOS, documentation, AI agents, blockchain, NFT, personality evolution',
  authors: [{ name: 'Aishi Team' }],
  openGraph: {
    title: 'Aishi Documentation',
    description: 'Official documentation for the Aishi ecosystem',
    type: 'website',
  },
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