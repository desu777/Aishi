import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'aishiOS Documentation',
  description: 'Official documentation for the aishiOS ecosystem - AI agents with evolving personalities on blockchain',
  keywords: 'aishiOS, documentation, AI agents, blockchain, NFT, personality evolution',
  authors: [{ name: 'aishiOS Team' }],
  openGraph: {
    title: 'aishiOS Documentation',
    description: 'Official documentation for the aishiOS ecosystem',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background-main text-text-primary">
        {children}
      </body>
    </html>
  )
}