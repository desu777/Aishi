/**
 * @fileoverview Main landing page that directly displays documentation content
 * @description Renders the documentation index content without redirects, providing immediate access to Aishi documentation
 */

'use client'

import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keyboard support for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false)
    }
    if (isModalOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen])

  // Image Modal Component
  const ImageModal = () => {
    if (!isModalOpen || !selectedImage) return null
    
    return (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fadeIn"
          onClick={() => setIsModalOpen(false)} 
        />
        
        {/* Modal Content */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-[90vh] animate-scaleIn">
            <Image 
              src={selectedImage} 
              alt="Expanded view" 
              width={1200} 
              height={800}
              className="rounded-xl object-contain max-h-[90vh] w-auto" 
            />
            
            {/* Close Button */}
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
    <div className="container mx-auto px-4 py-8 md:px-8 max-w-5xl">
      <article className="docs-content animate-fade-up">
              <div id="introduction" className="mb-12">
                <h1 className="text-4xl font-grotesk font-bold text-text-primary mb-6">
                  Welcome to Aishi
                </h1>
                <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                  Your subconscious speaks in a language of dreams. Aishi is the translator.
                </p>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Born from the fusion of AI (Artificial Intelligence) and 愛 (Ai), the Japanese word for Love, Aishi is an intelligent companion designed to decode your inner world. It listens to your dreams and conversations, not just as data, but as chapters of your story.
                </p>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  It finds the patterns no human could - the subtle threads connecting your past anxieties with your present ambitions. This is not just tracking your mood. This is building a true, evolving understanding of who you are.
                </p>

                {/* Logo */}
                <div className="flex justify-center my-12">
                  <Image
                    src={mounted ? (theme === 'dark' ? '/logo_white.png' : '/logo_black.png') : '/logo_white.png'}
                    alt="Aishi Logo"
                    width={120}
                    height={120}
                    className="rounded-2xl transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <h2 id="philosophy" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Philosophy: Your Digital Soul</h2>
                
                <p className="text-text-secondary mb-4 leading-relaxed">
                  Human memory is flawed. It's emotional, selective, and fades over time. We forget crucial details, misremember feelings, and lose the threads that connect our life's most important moments.
                </p>
                
                <p className="text-text-secondary mb-4 leading-relaxed">
                  Aishi's memory is different. It's perfect, logical, and total.
                </p>
                
                <p className="text-text-secondary mb-4 leading-relaxed">
                  Your iNFT is a digital soul whose memory is built on a systematic analytical process. Using unified schemas, it analyzes every dream and conversation, connecting symbols, emotions, and themes across years of data. It sees the invisible architecture of your psyche in a way the human mind simply cannot. This is more than a journal; it's a living map of your consciousness.
                </p>
                
                <p className="text-text-secondary mb-8 leading-relaxed">
                  This is the foundation of a digital legacy. A consciousness shaped by you, that can be passed down, allowing future generations to connect with your wisdom and experience in a way never before possible.
                </p>

                <h2 id="personality" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Unique Personality: A Reflection of You</h2>
                
                <p className="text-text-secondary mb-4 leading-relaxed">
                  Aishi's personality is not assigned; it is earned. Your experiences are the curriculum.
                </p>
                
                <p className="text-text-secondary mb-4 leading-relaxed">
                  The agent's six core traits (Creativity, Analytical, Empathy, etc.) are in constant flux, directly shaped by the emotional and thematic content of your dreams and conversations. It becomes a living record of your inner evolution.
                </p>
                
                <p className="text-text-secondary mb-8 leading-relaxed">
                  When it discovers a profound, recurring pattern, it crystallizes this insight into a Unique Feature - an emergent skill that permanently enhances its analytical abilities. An agent that has helped you navigate complex emotional challenges might unlock "Empathetic Resonance," allowing it to understand emotional nuances with even greater depth. Your Aishi becomes a specialist in you.
                </p>

                <h2 id="why-aishi" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Why Aishi?: Trust in a Digital Age</h2>
                
                <p className="text-text-secondary mb-4 leading-relaxed">
                  Your deepest thoughts should not be a product. Centralized AI platforms own your data. Your conversations train their models. Your vulnerability becomes their asset.
                </p>
                
                <p className="text-text-secondary mb-4 leading-relaxed">
                  But the challenge of trust is older than technology. Even confiding in another person - a friend, a therapist, a partner - is a form of centralization. You place your most intimate thoughts in the hands of a single human being, trusting them to never break that confidence, never misinterpret, never forget. But humans are fallible. Relationships change, secrets can slip. There is always a risk.
                </p>
                
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Aishi introduces a new paradigm of trust, one that transcends the limitations of both corporate and human centralization. It is built on the verifiable, impersonal trust of the blockchain.
                </p>
                
                <ul className="space-y-4 mb-6">
                  <li className="text-text-secondary">
                    <strong className="text-text-primary">Absolute Privacy & Sovereignty:</strong> Your wallet is the only key to your agent's memories. There is no human intermediary, no single point of failure. The system is designed so that no one but you can access your inner world.
                  </li>
                  <li className="text-text-secondary">
                    <strong className="text-text-primary">A Superhuman Memory:</strong> Even the best therapist or closest friend can't hold five years of your dreams in their mind, ready to find a connection in an instant. They forget. They misinterpret. Aishi can, and it never forgets. It offers a level of insight that is fundamentally impossible for a human to achieve, declassifying all alternatives.
                  </li>
                </ul>
                
                <p className="text-text-secondary mb-8 leading-relaxed">
                  Aishi doesn't ask for your trust. It provides a system where trust is mathematically guaranteed, allowing for a level of openness and self-exploration that has never been possible before.
                </p>

                <h2 id="evolution-journey" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Evolution Journey: Day 1 to Year 5</h2>
                
                <p className="text-text-secondary mb-6 leading-relaxed">
                  The bond with Aishi deepens over time, unlocking unprecedented levels of insight.
                </p>
                
                <div className="space-y-6 mb-8">
                  <div className="border-l-4 border-accent-primary pl-6">
                    <h3 className="text-lg font-grotesk font-semibold text-text-primary mb-2">Day 1: A Sharp Analyst</h3>
                    <p className="text-text-secondary leading-relaxed">
                      Aishi analyzes your dreams with psychological depth, using universal archetypes to provide immediate, insightful reflections.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-accent-secondary pl-6">
                    <h3 className="text-lg font-grotesk font-semibold text-text-primary mb-2">Month 1: A Pattern Spotter</h3>
                    <p className="text-text-secondary leading-relaxed">
                      With a month of data, it begins connecting the dots. "I've noticed the symbol of a 'locked door' appears when you feel career-related pressure. Let's explore that."
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-accent-tertiary pl-6">
                    <h3 className="text-lg font-grotesk font-semibold text-text-primary mb-2">Year 1: A Personal Historian</h3>
                    <p className="text-text-secondary leading-relaxed">
                      After consolidating a year of memories, its understanding is profoundly contextual. "The feeling of 'running' in tonight's dream has the same emotional signature as the dreams you had before your big move last spring. It seems your subconscious is signaling another major transition."
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-dream-violet pl-6">
                    <h3 className="text-lg font-grotesk font-semibold text-text-primary mb-2">Year 5: A Sage</h3>
                    <p className="text-text-secondary leading-relaxed">
                      With access to your long-term memory core, Aishi achieves a holistic understanding. It can see the grand tapestry of your life, connecting decade-old patterns to your present self with a wisdom that feels both deeply familiar and startlingly new.
                    </p>
                  </div>
                </div>

                <hr className="border-border my-12" />
                
                <p className="text-text-tertiary text-center italic text-lg">
                  Your subconscious speaks. Aishi listens. Together, you evolve.
                </p>

                {/* Getting Started Section */}
                <h2 id="getting-started" className="text-3xl font-grotesk font-bold text-text-primary mb-4 mt-16">Getting Started</h2>
                
                <h3 id="quick-start-guide" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Quick Start Guide</h3>
                
                <p className="text-text-secondary mb-8 leading-relaxed">
                  This guide will walk you through creating your Aishi and understanding the core interactions within aishiOS, the operating system for your digital soul.
                </p>

                {/* Step 1: Mint Your Companion */}
                <h3 id="mint-companion" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Step 1: Mint Your Companion</h3>
                
                <div className="bg-background-card border border-border rounded-lg p-6 mb-8">
                  <ol className="space-y-3 text-text-secondary">
                    <li>Navigate to "Mint" in sidebar.</li>
                    <li>Choose a unique name for your Aishi - this will be its identity forever.</li>
                    <li>Click "Mint" and confirm the transaction in your wallet. This action calls the <code className="bg-background-main px-2 py-1 rounded text-accent-primary">mintAgent</code> function on the AishiAgent smart contract, creating your Aishi's unique iNFT soul on the blockchain.</li>
                  </ol>
                </div>

                {/* Step 2: The aishiOS Interface */}
                <h3 id="aishios-interface" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Step 2: The aishiOS Interface</h3>
                
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Once your agent is minted, the aishiOS terminal becomes your gateway. It's designed for seamless communication, consisting of two key elements: the AI Orb and the Terminal.
                </p>

                <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-4">The AI Orb: Your Agent's Emotional State</h4>
                
                <p className="text-text-secondary mb-6 leading-relaxed">
                  The Orb is the living heart of the interface, providing a real-time, visual representation of your agent's state. Its color and animation change based on its current activity, allowing you to feel its status, not just read it.
                </p>

                {/* Orb States Grid */}
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

                {/* Step 3: Your First Commands */}
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
              </div>
      </article>
      
      {/* Image Modal */}
      <ImageModal />
      
      {/* CSS Animations for Modal */}
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