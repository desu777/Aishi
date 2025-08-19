/**
 * @fileoverview Introduction page showcasing Aishi philosophy and core concepts
 * @description Explains Aishi's vision, digital soul concept, personality system, trust model, and evolution journey
 */

'use client'

import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'

export default function IntroductionPage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 md:ml-80 max-w-5xl">
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
        </div>
      </article>
    </div>
  )
}