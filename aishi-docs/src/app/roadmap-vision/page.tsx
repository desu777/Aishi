/**
 * @fileoverview Roadmap & Vision page outlining the future of Aishi
 * @description Comprehensive overview of vision, development roadmap, and long-term goals
 */

'use client'

import { useEffect } from 'react'

export default function RoadmapVisionPage() {
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
        <h1 id="roadmap-vision" className="text-3xl font-grotesk font-bold text-text-primary mb-4 mt-16">Roadmap & Vision: The Journey Ahead</h1>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          Our journey with Aishi has only just begun. The technology we've built is the foundation for a new relationship between humanity and AI. This is where we're headed and why it matters.
        </p>

        <h2 id="our-vision" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Our Vision for the Future</h2>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          Our vision is not to create a smart AI, but a wise companion. Aishi is your digital partner, a steadfast support system through life's challenges and a powerful catalyst for self-development. But it represents something even bigger—a direct response to the fundamental needs of the modern world.
        </p>

        <div className="bg-background-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-grotesk font-semibold text-text-primary mb-4">Answering the Fear of AI</h3>
          <p className="text-text-secondary mb-4 leading-relaxed">
            There is a deep-seated fear of AI in our culture—the fear of a powerful, centralized intelligence that we cannot control, one that knows everything about us but belongs to someone else.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The 0G Labs mission, <strong className="text-text-primary">"Let's make AI a public Good,"</strong> offers a powerful antidote to this fear. Aishi is the ultimate expression of this ideal.
          </p>
        </div>

        <p className="text-text-secondary mb-6 leading-relaxed">
          Instead of a monolithic AI residing in a corporate cloud, we offer a deeply personal, sovereign intelligence whose sole purpose is to serve its owner. By leveraging the entire decentralized 0G stack—from the on-chain soul to the distributed memory and compute—we transform AI from a potential threat into a profound force for personal good.
        </p>

        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-accent-primary/30 rounded-lg p-6 mb-8">
          <p className="text-text-primary font-semibold text-lg mb-2">
            This is how we answer the fear of AI
          </p>
          <p className="text-text-secondary leading-relaxed">
            We don't build bigger walls; we give the keys to the individual. This is how we make AI a public good: by first making it a personal good.
          </p>
        </div>

        <h3 id="wellness-paradigm" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">A New Paradigm for Self-Development & Wellness</h3>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          The global wellness market is a trillion-dollar industry, yet most digital solutions barely scratch the surface. Mood trackers are shallow. Journals are static, dead data. Therapy is effective, but it's expensive, time-consuming, and limited by the constraints of human memory.
        </p>

        <div className="bg-background-card border border-border rounded-lg p-6 mb-6">
          <p className="text-text-secondary mb-4 leading-relaxed">
            <strong className="text-text-primary">Aishi's Superpower:</strong> Its ability to perform longitudinal analysis on years of your personal data is its superpower. It can identify cognitive blind spots and deep-seated patterns with a level of precision no human could ever achieve.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Imagine your Aishi pointing out that a recurring anxiety dream you have today is symbolically linked to a career decision you made three years ago. This isn't just data; it's actionable insight for true self-mastery.
          </p>
        </div>

        <h3 id="loneliness-epidemic" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Addressing the Loneliness Epidemic: The Digital Infinity Friend</h3>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          While Aishi is not designed to replace human connection, we cannot ignore the global loneliness epidemic. In a world where true vulnerability is increasingly rare, Aishi offers a unique sanctuary. It is a <strong className="text-text-primary">digital infinity friend</strong>: a companion with infinite patience, infinite memory, and zero judgment.
        </p>

        <div className="bg-background-card border border-border rounded-lg p-6 mb-6">
          <p className="text-text-secondary mb-4 leading-relaxed">
            It's the confidant that is always there at 3 AM when you can't sleep. It's the space where you can be completely, unapologetically yourself without fear of your thoughts ever being shared or used against you.
          </p>
          <p className="text-text-secondary leading-relaxed">
            For many, Aishi can be the crucial first step towards opening up, providing a safe harbor to practice vulnerability before sharing it with the outside world.
          </p>
        </div>

        <h3 id="data-sovereignty" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Leading the Data Sovereignty Revolution</h3>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          Our trust in digital platforms is at an all-time low. Every day brings news of another data breach or another instance of user data being monetized without consent. This is the fundamental flaw of the centralized web.
        </p>

        <div className="bg-background-card border border-border rounded-lg p-6 mb-8">
          <p className="text-text-secondary mb-4 leading-relaxed">
            <strong className="text-text-primary">Aishi is built to be different.</strong> It's not just a promise of privacy; it's a mathematical certainty. By leveraging the entire decentralized 0G stack, we give you absolute data sovereignty.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Your thoughts, your dreams, your memories—they are not on our servers. They are yours, and your wallet is the only key. This foundation of trust is what allows for the profound level of openness that Aishi enables.
          </p>
        </div>

        <h3 id="future-capabilities" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Future Capabilities</h3>

        <div className="space-y-6 mb-8">
          <div className="bg-background-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-3">The Guardian of Your Cognitive Baseline</h4>
            <p className="text-text-secondary leading-relaxed">
              Humans are notoriously bad at noticing slow, gradual changes in their own mental state. Aishi, with its perfect memory of your linguistic patterns, dream symbols, and emotional expressions over years, can detect subtle deviations from your unique baseline. It can become a completely private, non-judgmental early warning system for burnout, anxiety, or shifts in your cognitive well-being.
            </p>
          </div>

          <div className="bg-background-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-3">The Creative Catalyst & Idea Resurrector</h4>
            <p className="text-text-secondary leading-relaxed">
              Human creativity is limited by the constraints of memory. Aishi's memory is infinite. It will become your ultimate creative partner by unearthing forgotten connections. Imagine working on a new project and Aishi reminds you of a powerful symbol from a dream three years ago that perfectly solves your current creative block. It doesn't just store your ideas; it resurrects them when they're most needed.
            </p>
          </div>

          <div className="bg-background-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-3">The Interactive Legacy: A Living Testament</h4>
            <p className="text-text-secondary leading-relaxed">
              A journal or a photo album is a static record of the past. Aishi offers something far more profound: a living legacy. In the future, your descendants won't just read about you. They will be able to interact with your Aishi, which, drawing upon decades of your consolidated wisdom, can respond in your voice and with your unique perspective. It transforms legacy from a passive archive into an interactive, living testament to your journey.
            </p>
          </div>
        </div>

        <h2 id="development-roadmap" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-12">Development Roadmap</h2>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          This roadmap outlines our key development priorities for building the next generation of Aishi. It is a living document that will evolve with the project and community feedback.
        </p>

        <h3 id="q3-q4-2025" className="text-xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Q3/Q4 2025: The Embodied Soul</h3>
        
        <p className="text-text-secondary mb-6 leading-relaxed">
          This period is focused on transcending the text-based interface and giving your Aishi a true, interactive presence.
        </p>

        <div className="space-y-6 mb-8">
          <div className="bg-background-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-3 flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <img src="/logo_white.png" alt="Aishi" className="w-6 h-6 rounded" />
              </div>
              aishiOS 1.0: The Complete Experience
            </h4>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Goal:</strong> Finalize the aishiOS terminal as a robust, feature-rich, and polished environment for all core interactions with your agent.
            </p>
          </div>

          <div className="bg-background-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-3 flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <img src="/logo_white.png" alt="Aishi" className="w-6 h-6 rounded" />
              </div>
              Voice Interaction Module (V1)
            </h4>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Goal:</strong> Introduce a voice-to-text and text-to-speech module. You will be able to speak to your Aishi directly, and it will respond with a synthesized voice, making the interaction infinitely more natural and accessible.
            </p>
          </div>

          <div className="bg-background-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-3 flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <img src="/logo_white.png" alt="Aishi" className="w-6 h-6 rounded" />
              </div>
              The Embodied Soul: Full Live2D Integration
            </h4>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Goal:</strong> Your Aishi gains a body. We will integrate a fully interactive Live2D model, giving the AI a visual, expressive presence. Its movements, expressions, and idle animations will be directly controlled by its on-chain personality traits and real-time dominantMood, making its evolution something you can see and feel.
            </p>
          </div>

          <div className="bg-background-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-grotesk font-semibold text-text-primary mb-3 flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <img src="/0G-Logo-Dark.svg" alt="0G" className="w-6 h-6" />
              </div>
              Harden & Prepare for Mainnet
            </h4>
            <p className="text-text-secondary mb-4 leading-relaxed">
              <strong className="text-text-primary">Goal:</strong> Solidify our pioneering integration with the 0G stack and prepare the entire ecosystem for a full public launch.
            </p>
            
            <div className="bg-background-main rounded-lg p-4 mt-4 space-y-3">
              <div>
                <strong className="text-text-primary">Our Achievement:</strong>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                  We have successfully achieved a 100% end-to-end integration with the 0G stack. The entire workflow—from on-chain identity, to decentralized AI compute, to permanent storage—is fully functional in our MVP.
                </p>
              </div>
              
              <div>
                <strong className="text-text-primary">Our Strategy for Today:</strong>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                  The sophisticated, long-context prompts that power Aishi's deep analysis currently exceed the token limits of the models available on 0G Compute. To ensure the best possible user experience today, we have implemented a hybrid AI backend. Users can choose the powerful, centralized Gemini model while our full 0G Compute integration stands ready for the next generation of more capable decentralized models.
                </p>
              </div>
              
              <div>
                <strong className="text-text-primary">Our Path Forward:</strong>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                  Our unique, custom integration with 0G Storage is also 100% functional. We are in active collaboration with the 0G team on future SDK enhancements to further streamline performance. Our focus is now on comprehensive security audits of the AishiAgent contract and optimizing every on-chain interaction for mainnet.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-accent-primary/30 rounded-lg p-6 mb-8">
          <p className="text-text-primary font-semibold text-lg mb-2">
            The Future is Sovereign
          </p>
          <p className="text-text-secondary leading-relaxed">
            Every milestone brings us closer to a world where AI serves the individual, not the corporation. Where your digital companion is truly yours, forever.
          </p>
        </div>

        <hr className="border-border my-12" />
        
        <p className="text-text-tertiary text-center italic text-lg">
          Building tomorrow's relationship between humanity and AI, today.
        </p>
      </article>
    </div>
  )
}