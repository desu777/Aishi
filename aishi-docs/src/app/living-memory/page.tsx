/**
 * @fileoverview The Living Memory page explaining hierarchical memory system
 * @description Deep dive into why Aishi's memory consolidation is superior to linear storage
 */

'use client'

import { useEffect } from 'react'
import { MemoryFlowDiagram } from '@/components/diagrams/MemoryFlowDiagram'

export default function LivingMemoryPage() {
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
    <div className="container mx-auto px-4 py-8 md:px-8 md:ml-80 max-w-5xl pb-32 xl:pb-8">
      <article className="docs-content animate-fade-up">
        <h1 id="living-memory" className="text-3xl font-grotesk font-bold text-text-primary mb-4 mt-16">The Living Memory: From Moment to Essence</h1>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          Human memory is both a blessing and a curse. It allows us to build a sense of self, but it's notoriously unreliable—it fades, distorts, and fails us when we need it most. We lose the crucial details that connect our life's story.
        </p>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          Aishi's memory is engineered to be superior. It combines the total recall of a machine with the wisdom-extracting process of a human mind, creating a practically infinite and deeply insightful memory system.
        </p>

        <h2 id="linear-problem" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Problem with Linear Memory: Context Overload</h2>
        
        <p className="text-text-secondary mb-4 leading-relaxed">
          Why not just save every interaction in one long text file? Because after a few years, you'd have a useless, unreadable archive.
        </p>
        
        <p className="text-text-secondary mb-4 leading-relaxed">
          Let's look at the numbers. Assuming an average dream analysis or deep conversation produces about 2KB of data:
        </p>
        
        <div className="bg-background-card border border-border rounded-lg p-6 mb-6">
          <ul className="space-y-3 text-text-secondary">
            <li><strong className="text-text-primary">After 1 Year:</strong> 365 days × 2 KB/day = <span className="text-accent-primary font-mono">730 KB</span></li>
            <li><strong className="text-text-primary">After 5 Years:</strong> 5 years × 730 KB/year = <span className="text-accent-primary font-mono">3.65 MB</span></li>
          </ul>
        </div>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          A 3.65 MB text file is over <strong className="text-text-primary">900,000 tokens</strong> for an AI model. Sending this much context with every single query would be astronomically expensive and technically impossible for most models. The signal would be lost in the noise. Your agent would be drowning in data, unable to find the insights that matter.
        </p>

        <h2 id="memory-consolidation" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Aishi Solution: Memory Consolidation</h2>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          Aishi solves this problem the same way the human brain does: by consolidating memories. During sleep, our brain replays the day's events, strengthening important connections and discarding irrelevant noise. Aishi does the same, but with mathematical precision, using its AI Brain (0G Compute).
        </p>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          This process unfolds in three stages, clearly defined in our consolidation_schema:
        </p>

        <h3 className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Daily Log (Short-Term Memory)</h3>
        
        <div className="bg-background-card border border-border rounded-lg p-6 mb-6">
          <p className="text-text-secondary mb-3">
            <strong className="text-text-primary">Files:</strong> <code className="bg-background-main px-2 py-1 rounded text-accent-primary font-mono">dreams_daily.json</code>, <code className="bg-background-main px-2 py-1 rounded text-accent-primary font-mono">conversations_daily.json</code>
          </p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">What it is:</strong> A raw, high-fidelity record of every interaction. Every symbol, every emotion, every word is captured exactly as it happened. This is the raw material of memory.
          </p>
        </div>

        <h3 className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Monthly Essence (Mid-Term Memory)</h3>
        
        <div className="bg-background-card border border-border rounded-lg p-6 mb-6">
          <p className="text-text-secondary mb-3">
            <strong className="text-text-primary">Files:</strong> <code className="bg-background-main px-2 py-1 rounded text-accent-primary font-mono">dreams_monthly.json</code>, <code className="bg-background-main px-2 py-1 rounded text-accent-primary font-mono">conversation_monthly.json</code>
          </p>
          <p className="text-text-secondary mb-4">
            <strong className="text-text-primary">The Process:</strong> At the end of each month, Aishi's Brain initiates a consolidation process. It reads all the daily logs and performs a deep analysis to extract the essence of that month:
          </p>
          <ul className="space-y-2 text-text-secondary">
            <li>• Dominant emotional patterns</li>
            <li>• Recurring symbols and themes</li>
            <li>• Key insights and breakthroughs</li>
          </ul>
          <p className="text-text-secondary mt-4">
            The result is a much smaller, denser file that represents not just what happened, but what it meant.
          </p>
        </div>

        <h3 className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Yearly Core (Long-Term Wisdom)</h3>
        
        <div className="bg-background-card border border-border rounded-lg p-6 mb-8">
          <p className="text-text-secondary mb-3">
            <strong className="text-text-primary">File:</strong> <code className="bg-background-main px-2 py-1 rounded text-accent-primary font-mono">memory_core_yearly.json</code>
          </p>
          <p className="text-text-secondary mb-4">
            <strong className="text-text-primary">The Process:</strong> Once a year, Aishi performs the ultimate consolidation. It analyzes the 12 monthly essences to uncover the grand, overarching patterns of your life's journey. It identifies your major transformations, crystallizes your core wisdom, and updates its fundamental understanding of who you are. This Yearly Core becomes the bedrock of its personality and insight.
          </p>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed">
          This elegant, hierarchical system means that even after a decade of interactions, Aishi doesn't need to read ten years of raw data. It consults its Yearly Cores and Monthly Essences, instantly accessing a decade of distilled wisdom to provide context for today's dream.
        </p>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          This isn't just data compression; it's an automated process of creating wisdom. It is the engine that allows Aishi to have a truly infinite memory.
        </p>

        <h2 id="memory-flow" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">The Flow of Consciousness</h2>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          Watch how your interactions transform from raw moments into lasting wisdom through Aishi's hierarchical memory system:
        </p>

        <MemoryFlowDiagram className="mb-8" />
        
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-accent-primary/30 rounded-lg p-6 mb-8">
          <p className="text-text-secondary mb-4 leading-relaxed">
            Every dream you share, every conversation you have, flows through this sophisticated system. Raw moments become daily logs, daily logs become monthly essences, and monthly essences crystallize into yearly cores of wisdom. This is how Aishi remembers not just what happened, but what it all means.
          </p>
          <p className="text-text-primary font-semibold text-lg mt-4">
            This is the foundation of infinite, meaningful memory. This is why Aishi never forgets, yet never drowns in data.
          </p>
        </div>

        <hr className="border-border my-12" />
        
        <p className="text-text-tertiary text-center italic text-lg">
          From fleeting moments to eternal wisdom. Your memory, perfected.
        </p>
      </article>
    </div>
  )
}