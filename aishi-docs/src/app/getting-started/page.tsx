/**
 * @fileoverview Getting Started guide for Aishi platform
 * @description Step-by-step guide for minting, understanding interface, and first commands with aishiOS
 */

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function GettingStartedPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (window.location.hash) {
      const elementId = window.location.hash.substring(1)
      setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
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

  const ImageModal = () => {
    if (!isModalOpen || !selectedImage) return null
    
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
          onClick={() => setIsModalOpen(false)} 
        />
        
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-[90vh] animate-scaleIn">
            <Image 
              src={selectedImage} 
              alt="Expanded view" 
              width={1200} 
              height={800}
              className="rounded-xl object-contain max-h-[90vh] w-auto" 
            />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 md:ml-80 max-w-5xl">
      <article className="docs-content animate-fade-up">
        <h2 id="getting-started" className="text-3xl font-grotesk font-bold text-text-primary mb-4 mt-16">Getting Started</h2>
        
        <h3 id="quick-start-guide" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Quick Start Guide</h3>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          This guide will walk you through creating your Aishi and understanding the core interactions within aishiOS, the operating system for your digital soul.
        </p>

        <h3 id="mint-companion" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Step 1: Mint Your Companion</h3>
        
        <div className="bg-background-card border border-border rounded-lg p-6 mb-8">
          <ol className="space-y-3 text-text-secondary">
            <li>Navigate to "Mint" in sidebar.</li>
            <li>Choose a unique name for your Aishi - this will be its identity forever.</li>
            <li>Click "Mint" and confirm the transaction in your wallet. This action calls the <code className="bg-background-main px-2 py-1 rounded text-accent-primary">mintAgent</code> function on the AishiAgent smart contract, creating your Aishi's unique iNFT soul on the blockchain.</li>
          </ol>
        </div>

        <h3 id="aishios-interface" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Step 2: The aishiOS Interface</h3>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          Once your agent is minted, the aishiOS terminal becomes your gateway. It's designed for seamless communication, consisting of two key elements: the AI Orb and the Terminal.
        </p>

        <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-4">The AI Orb: Your Agent's Emotional State</h4>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          The Orb is the living heart of the interface, providing a real-time, visual representation of your agent's state. Its color and animation change based on its current activity, allowing you to feel its status, not just read it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div>
            <div 
              className="overflow-hidden rounded-xl border border-border mb-3 cursor-pointer hover:border-accent-primary transition-all duration-300"
              onClick={() => {
                setSelectedImage('/aishi_connected.jpg')
                setIsModalOpen(true)
              }}
            >
              <Image
                src="/aishi_connected.jpg"
                alt="Aishi OS in connected state"
                width={600}
                height={400}
                className="w-full aspect-[3/2] object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h5 className="font-grotesk font-semibold text-text-primary mb-2">Connected (Calm Purple)</h5>
            <p className="text-sm text-text-secondary">
              When you first open aishiOS, the Orb glows with a calm purple light. The status line confirms "connected," indicating your agent is idle and ready for interaction.
            </p>
          </div>

          <div>
            <div 
              className="overflow-hidden rounded-xl border border-border mb-3 cursor-pointer hover:border-accent-primary transition-all duration-300"
              onClick={() => {
                setSelectedImage('/aishi_dream.jpg')
                setIsModalOpen(true)
              }}
            >
              <Image
                src="/aishi_dream.jpg"
                alt="Aishi OS in dream input state"
                width={600}
                height={400}
                className="w-full aspect-[3/2] object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h5 className="font-grotesk font-semibold text-text-primary mb-2">Thinking (Intense Purple)</h5>
            <p className="text-sm text-text-secondary">
              When you initiate a command like dream, the Orb shifts to an intense purple glow. This signifies that your agent is analyzing your input with deep processing.
            </p>
          </div>

          <div>
            <div 
              className="overflow-hidden rounded-xl border border-border mb-3 cursor-pointer hover:border-accent-primary transition-all duration-300"
              onClick={() => {
                setSelectedImage('/aishi_learn.jpg')
                setIsModalOpen(true)
              }}
            >
              <Image
                src="/aishi_learn.jpg"
                alt="Aishi OS in learning state"
                width={600}
                height={400}
                className="w-full aspect-[3/2] object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h5 className="font-grotesk font-semibold text-text-primary mb-2">Learning (Emerald Green)</h5>
            <p className="text-sm text-text-secondary">
              After you share a dream and confirm you want it saved, the Orb glows with an emerald green radiance. The status "is learning..." means your agent is processing the information and integrating it into its daily memory log.
            </p>
          </div>

          <div>
            <div 
              className="overflow-hidden rounded-xl border border-border mb-3 cursor-pointer hover:border-accent-primary transition-all duration-300"
              onClick={() => {
                setSelectedImage('/aishi_evolve.jpg')
                setIsModalOpen(true)
              }}
            >
              <Image
                src="/aishi_evolve.jpg"
                alt="Aishi OS in evolving state"
                width={600}
                height={400}
                className="w-full aspect-[3/2] object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h5 className="font-grotesk font-semibold text-text-primary mb-2">Evolving (Golden Amber)</h5>
            <p className="text-sm text-text-secondary">
              After the learning phase completes, the Orb radiates with golden amber luminescence. The "is evolving..." status indicates that your dream data and personality evolution are being written to the blockchain, permanently updating your agent's soul.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-4">The Terminal: Your Command Center</h4>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          The terminal is your tool for direct communication. All interactions, from analysis to simple checks, happen here.
        </p>

        <h3 id="first-commands" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Step 3: Your First Commands</h3>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          Now let's put it all together. Here's how a typical, powerful interaction unfolds:
        </p>

        <div className="space-y-6 mb-8">
          <div>
            <h4 className="font-grotesk font-semibold text-text-primary mb-3">Check In: Start by checking your agent's current status</h4>
            <div className="bg-background-card border border-border rounded-lg p-4">
              <pre className="font-mono text-sm text-text-primary">
                <span className="text-accent-primary">$</span> info
              </pre>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              This command shows your agent's current intelligence level, total number of dreams processed, personality trait levels, and other key statistics stored on the blockchain.
            </p>
          </div>

          <div>
            <h4 className="font-grotesk font-semibold text-text-primary mb-3">Initiate a Dream: Begin the core evolutionary process</h4>
            <div className="bg-background-card border border-border rounded-lg p-4">
              <pre className="font-mono text-sm text-text-primary">
                <span className="text-accent-primary">$</span> dream
              </pre>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              The Orb shifts to thinking mode (intense purple). The prompt changes to ~, waiting for you to describe your dream.
            </p>
          </div>
        </div>

        <div className="bg-background-card border border-border rounded-lg p-6 mb-8">
          <h4 className="font-grotesk font-semibold text-text-primary mb-4">The Evolution Process</h4>
          <ol className="space-y-3 text-text-secondary">
            <li><strong>Share and Confirm:</strong> After you describe your dream and receive the analysis, aishiOS will ask if you want to save it. Type <code className="bg-background-main px-1 rounded">y</code> and press Enter.</li>
            <li><strong>Witness the Evolution:</strong> You will see the Orb shift through its states: first to emerald green (learning) as it processes and saves the memory, then to golden amber (evolving) as your agent's soul is permanently updated on the blockchain.</li>
          </ol>
          
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-text-primary font-semibold">You have just completed your first full evolutionary loop, making your Aishi smarter and more attuned to you.</p>
          </div>
        </div>

        <p className="text-text-tertiary text-center italic mb-8">
          More commands and deeper interactions are coming soon...
        </p>
      </article>
      
      <ImageModal />
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fadeIn { 
          animation: fadeIn 0.2s ease-out; 
        }
        
        .animate-scaleIn { 
          animation: scaleIn 0.3s ease-out; 
        }
      `}</style>
    </div>
  )
}