/**
 * @fileoverview Getting Started (new UI)
 * @description Fresh, concise onboarding with CTAs and updated screenshots.
 */

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import StaticCarousel from '@/components/ui/StaticCarousel'
import { AISHI_URL } from '@/lib/env'
import { X } from 'lucide-react'

export default function GettingStartedPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (window.location.hash) {
      const elementId = window.location.hash.substring(1)
      setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false)
    }
    if (isModalOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen])

  const open = (src: string) => {
    setSelectedImage(src)
    setIsModalOpen(true)
  }

  const ImageModal = () => {
    if (!isModalOpen || !selectedImage) return null
    return (
      <>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setIsModalOpen(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-[90vh]">
            <Image src={selectedImage} alt="Screenshot" width={1400} height={900} className="rounded-xl object-contain max-h-[90vh] w-auto" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors">
              <X size={22} className="text-white" />
            </button>
          </div>
        </div>
      </>
    )
  }

  const cta = {
    mint: `${AISHI_URL}/aishi-mint`,
    os: `${AISHI_URL}/aishiOS`,
    companion: `${AISHI_URL}/aishi-companion`,
  }

  const mintShots = [
    { src: '/mint.jpg', alt: 'Mint dashboard with dynamic pricing' },
    { src: '/mint2.jpg', alt: 'Mint success state with token details' },
  ]

  const aishiOSShots = [
    { src: '/aishiOS-1.jpg', alt: 'Home — connected state' },
    { src: '/aishiOS-2.jpg', alt: 'help — commands and aliases' },
    { src: '/aishiOS-3.jpg', alt: 'personality — six traits' },
    { src: '/aishiOS-4.jpg', alt: 'stats — growth counters' },
    { src: '/aishiOS-5.jpg', alt: 'unique-features — emergent abilities' },
    { src: '/aishiOS-6.jpg', alt: 'memory — hierarchical storage' },
    { src: '/aishiOS-7.jpg', alt: 'dream — analysis in progress' },
    { src: '/aishiOS-8.jpg', alt: 'confirm — learning' },
    { src: '/aishiOS-9.jpg', alt: 'saved — on-chain confirmation' },
    { src: '/aishiOS-10.jpg', alt: 'memory — daily hash + download' },
  ]

  const companionShots = [
    { src: '/companion.jpg', alt: 'Clothing & Enhanced Mode' },
    { src: '/companion2.jpg', alt: 'User message' },
    { src: '/companion3.jpg', alt: 'Aishi response (lip-sync)' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 md:ml-80 max-w-5xl pb-32 xl:pb-8">
      <article className="docs-content animate-fade-up">
        <h1 id="getting-started" className="text-4xl font-grotesk font-bold text-text-primary mt-16 mb-2">Getting Started</h1>
        <p className="text-text-secondary mb-8">Three steps and you’re in. Mint your agent, open the terminal, then meet your companion.</p>

        {/* Step 1 — Mint */}
        <h2 className="text-2xl font-grotesk font-semibold text-text-primary mb-3">Step 1 · Mint your Aishi</h2>
        <div className="bg-background-card border border-border rounded-2xl p-6 mb-6">
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Choose a unique name (≤ 32 chars). One agent per wallet.</li>
            <li>Limited supply: 1888 agents maximum.</li>
            <li>Dynamic pricing: base 0.1 OG, +0.1 OG every 10 mints.</li>
            <li>After mint: tokenId assigned, Intelligence starts at 1, all six traits at 50.</li>
          </ul>
          <div className="mt-4">
            <Button href={cta.mint} external variant="outline" className="shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40">
              Open Mint
            </Button>
          </div>
        </div>

        <div className="mb-10">
          <StaticCarousel items={mintShots} onSelect={(src) => open(src)} />
        </div>

        {/* Step 2 — aishiOS */}
        <h2 className="text-2xl font-grotesk font-semibold text-text-primary mb-3">Step 2 · Open aishiOS</h2>
        <p className="text-text-secondary mb-4">The terminal is your command center. Think <em>dream</em> to grow, <em>chat</em> to converse, and <em>personality</em> / <em>stats</em> to inspect your agent. Interact through text commands or voice input.</p>
        <p className="text-text-secondary text-sm mb-4">During commands, you'll see three phases: <strong>is thinking</strong> → AI analyzes your input , <strong>is learning</strong> → saves to 0G Storage, <strong>is evolving</strong> → updates blockchain state . Intelligence grows every 3 dreams or 10 conversations. Personality shifts every 5th dream.</p>
        <div className="mb-4">
          <Button href={cta.os} external variant="secondary">Open aishiOS</Button>
        </div>

        <div className="mb-10">
          <StaticCarousel items={aishiOSShots} onSelect={(src) => open(src)} />
        </div>

        {/* Commands quick ref */}
        <h3 className="text-xl font-grotesk font-semibold text-text-primary mb-3">Command quick reference</h3>
        <div className="bg-background-card border border-border rounded-lg p-5 mb-10">
          <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap">{`
dream (d)            Analyze a dream and evolve (confirm with 'y')
chat (c)             Talk with your agent in real time
personality (p)      Show six traits, mood and response style
unique-features (uf) List emergent abilities (max 5)
stats (s)            Intelligence, dreams, conversations, evolutions
memory (mem)         Daily / monthly / yearly memory overview
help (h / ?)         Show command help; 'help <command>' for details
clear (cls)          Clear terminal screen
`}</pre>
        </div>

        {/* Step 3 — Companion */}
        <h2 className="text-2xl font-grotesk font-semibold text-text-primary mb-3">Step 3 · Meet the Aishi Companion</h2>
        <p className="text-text-secondary mb-4">The Live2D companion brings the <code>chat</code> command to life. Instead of talking to a console, you converse with a living character featuring lip-sync, cursor-aware gaze (Enhanced Mode), and clothing toggles.</p>
        <p className="text-text-secondary text-sm mb-4">To save the conversation to blockchain, click "End Session" in the top-right corner. The workflow mirrors the aishiOS <code>chat</code> command: <strong>is thinking</strong> → <strong>is learning</strong> → <strong>is evolving</strong>.</p>
        <div className="mb-4">
          <Button href={cta.companion} external variant="secondary">Open Companion</Button>
        </div>

        <div className="mb-12">
          <StaticCarousel items={companionShots} onSelect={(src) => open(src)} />
        </div>

        {/* Growth rules */}
        <h3 className="text-xl font-grotesk font-semibold text-text-primary mb-3">How growth works</h3>
        <div className="bg-background-card border border-border rounded-lg p-6">
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Every <strong>3 dreams</strong>: +1 Intelligence.</li>
            <li>Every <strong>5 dreams</strong>: personality evolution (±10 per trait) and up to <strong>2 new features</strong> (max 5 total).</li>
            <li>Conversations: +1 Intelligence every <strong>10 chats</strong>.</li>
            <li>Memories are hierarchical: daily → monthly consolidation → yearly core; on‑chain we store only verifiable hashes.</li>
          </ul>
        </div>

        <hr className="border-border my-12" />
        <p className="text-text-tertiary text-center italic">You’re ready. Mint your agent, open the terminal, and begin the journey.</p>
      </article>

      <ImageModal />
    </div>
  )
}
