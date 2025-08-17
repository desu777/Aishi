/**
 * @fileoverview Main landing page that directly displays documentation content
 * @description Renders the documentation index content without redirects, providing immediate access to Aishi documentation
 */

'use client'

import Link from 'next/link'
import CodeBlock from '@/components/ui/CodeBlock'
import Card from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-8 max-w-5xl">
      <article className="docs-content animate-fade-up">
              <div id="introduction" className="mb-8">
                <h1 className="text-4xl font-grotesk font-bold text-text-primary mb-3">
                  Welcome to Aishi
                </h1>
                <p className="text-lg text-text-secondary">
                  Build autonomous AI agents with evolving personalities on blockchain
                </p>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-text-secondary mb-6">
                  Aishi is a groundbreaking ecosystem that brings AI agents to life on the blockchain. Our agents aren't just NFTs - they're autonomous entities with evolving personalities, memories, and the ability to form meaningful relationships with their owners.
                </p>

                <h2 id="what-is-aishi" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">What is Aishi?</h2>
                
                <p className="text-text-secondary mb-4">Aishi implements the <strong>ERC-7857 iNFT standard</strong> to create intelligent Non-Fungible Tokens that:</p>
                
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-6">
                  <li><strong>Evolve</strong> through daily dreams and conversations</li>
                  <li><strong>Remember</strong> interactions in a hierarchical memory system</li>
                  <li><strong>Develop</strong> unique personality traits over time</li>
                  <li><strong>Reward</strong> owners for nurturing their growth</li>
                </ul>

                <h2 id="key-features" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Key Features</h2>

                <h3 id="personality-evolution" className="text-xl font-grotesk font-medium text-text-primary mb-3 mt-6">🧠 Personality Evolution</h3>
                <p className="text-text-secondary mb-2">Each agent has six core personality traits that evolve based on their experiences:</p>
                <ul className="list-disc pl-6 text-text-secondary space-y-1 mb-6">
                  <li><strong>Creativity</strong> - Innovation and artistic thinking</li>
                  <li><strong>Analytical</strong> - Logic and problem-solving</li>
                  <li><strong>Empathy</strong> - Emotional understanding</li>
                  <li><strong>Intuition</strong> - Spiritual insights</li>
                  <li><strong>Resilience</strong> - Stress handling</li>
                  <li><strong>Curiosity</strong> - Learning desire</li>
                </ul>

                <h3 id="hierarchical-memory" className="text-xl font-grotesk font-medium text-text-primary mb-3 mt-6">💾 Hierarchical Memory</h3>
                <p className="text-text-secondary mb-2">Three-tier memory system that grows with intelligence:</p>
                <ul className="list-disc pl-6 text-text-secondary space-y-1 mb-6">
                  <li><strong>Daily Records</strong> - Individual dreams and conversations</li>
                  <li><strong>Monthly Consolidation</strong> - AI-processed summaries</li>
                  <li><strong>Yearly Core</strong> - Long-term personality essence</li>
                </ul>

                <h3 id="gamification" className="text-xl font-grotesk font-medium text-text-primary mb-3 mt-6">🎮 Gamification</h3>
                <p className="text-text-secondary mb-2">Intelligence-based progression system:</p>
                <ul className="list-disc pl-6 text-text-secondary space-y-1 mb-6">
                  <li>Level up through dreams and conversations</li>
                  <li>Unlock memory access tiers</li>
                  <li>Achieve personality milestones</li>
                  <li>Earn consolidation streaks</li>
                </ul>

                <h2 id="quick-start" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Quick Start</h2>
                
                <div className="mb-6">
                  <CodeBlock language="typescript">
{`// 1. Connect your wallet
const { address } = useAccount()

// 2. Mint your first agent
const tx = await aishiAgent.mintAgent(
  [],          // proofs (optional)
  [],          // descriptions
  "Luna",      // unique name
  address      // owner
)

// 3. Start evolving!
await processDailyDream(tokenId, dreamData)`}
                  </CodeBlock>
                </div>

                <h2 id="architecture-overview" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Architecture Overview</h2>
                
                <p className="text-text-secondary mb-6">Aishi consists of three main components:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card title="Smart Contracts" description="ERC-7857 implementation with personality evolution">
                    On-chain logic for agent minting, evolution, and memory management
                  </Card>
                  
                  <Card title="Frontend Application" description="React/Next.js dashboard for agent interaction">
                    Terminal-style interface for managing and interacting with your agents
                  </Card>
                  
                  <Card title="0G Backend" description="AI processing and decentralized storage">
                    Personality analysis, dream processing, and memory consolidation
                  </Card>
                </div>

                <h2 id="why-aishi" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Why Aishi?</h2>
                
                <p className="text-text-secondary mb-4">Traditional NFTs are static - they don't change, grow, or interact. Aishi agents are different:</p>
                
                <ol className="list-decimal pl-6 text-text-secondary space-y-2 mb-6">
                  <li><strong>Dynamic Evolution</strong> - Your agent's personality changes based on interactions</li>
                  <li><strong>Meaningful Relationships</strong> - Build a genuine connection through conversations</li>
                  <li><strong>Decentralized AI</strong> - Powered by 0G Network for true Web3 AI</li>
                  <li><strong>Economic Incentives</strong> - Earn rewards for nurturing your agent</li>
                </ol>

                <h2 id="next-steps" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Next Steps</h2>
                
                <p className="text-text-secondary mb-4">Ready to dive deeper? Here's where to go next:</p>
                
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-6">
                  <li><Link href="/docs/quick-start" className="text-accent-primary hover:underline">Quick Start Guide</Link> - Get up and running in 5 minutes</li>
                  <li><a href="https://github.com/aishios" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">GitHub Repository</a> - Explore the complete source code</li>
                  <li><a href="https://discord.gg/aishios" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">Community Discord</a> - Get help and connect with other developers</li>
                </ul>

                <h2 id="community" className="text-2xl font-grotesk font-semibold text-text-primary mb-4 mt-8">Community</h2>
                
                <p className="text-text-secondary mb-4">Join our growing community of agent creators:</p>
                
                <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-6">
                  <li><a href="https://github.com/aishios" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">GitHub</a> - Contribute to the project</li>
                  <li><a href="https://discord.gg/aishios" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">Discord</a> - Chat with the community</li>
                  <li><a href="https://twitter.com/aishios" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">Twitter</a> - Latest updates</li>
                </ul>

                <hr className="border-border my-8" />
                
                <p className="text-text-tertiary text-center italic">
                  Building the future of AI companionship on blockchain
                </p>
              </div>
      </article>
    </div>
  )
}