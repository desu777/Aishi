import Link from 'next/link'
import { FiArrowRight, FiBook, FiCode, FiLayers, FiCpu } from 'react-icons/fi'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-grotesk font-bold text-text-primary mb-6 animate-fade-up">
              aishiOS <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 animate-fade-up animation-delay-100">
              Build autonomous AI agents with evolving personalities on blockchain.
              Complete guides, API references, and examples to get you started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-200">
              <Link href="/docs" className="btn btn-primary inline-flex items-center justify-center">
                Get Started
                <FiArrowRight className="ml-2" />
              </Link>
              <Link href="/docs/quick-start" className="btn btn-secondary inline-flex items-center justify-center">
                Quick Start Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/docs/concepts/architecture" className="card group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-accent-primary/10 rounded-lg group-hover:bg-accent-primary/20 transition-colors">
                <FiLayers className="text-accent-primary" size={24} />
              </div>
              <h3 className="font-grotesk font-semibold text-text-primary">Architecture</h3>
            </div>
            <p className="text-text-secondary text-sm">
              Understand the multi-layer architecture of aishiOS ecosystem
            </p>
          </Link>

          <Link href="/docs/contracts/aishi-agent" className="card group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-accent-primary/10 rounded-lg group-hover:bg-accent-primary/20 transition-colors">
                <FiCode className="text-accent-primary" size={24} />
              </div>
              <h3 className="font-grotesk font-semibold text-text-primary">Smart Contracts</h3>
            </div>
            <p className="text-text-secondary text-sm">
              Deep dive into AishiAgent contract and ERC-7857 implementation
            </p>
          </Link>

          <Link href="/docs/frontend/dashboard" className="card group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-accent-primary/10 rounded-lg group-hover:bg-accent-primary/20 transition-colors">
                <FiBook className="text-accent-primary" size={24} />
              </div>
              <h3 className="font-grotesk font-semibold text-text-primary">Frontend Guide</h3>
            </div>
            <p className="text-text-secondary text-sm">
              Build interactive agent dashboards with React and Next.js
            </p>
          </Link>

          <Link href="/docs/backend/ai" className="card group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-accent-primary/10 rounded-lg group-hover:bg-accent-primary/20 transition-colors">
                <FiCpu className="text-accent-primary" size={24} />
              </div>
              <h3 className="font-grotesk font-semibold text-text-primary">AI Processing</h3>
            </div>
            <p className="text-text-secondary text-sm">
              Learn about personality evolution and dream processing
            </p>
          </Link>
        </div>
      </section>

      {/* Code Example */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-grotesk font-bold text-text-primary mb-8 text-center">
          Quick Example
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="code-block">
            <pre className="language-javascript">
              <code>{`// Mint your first AI agent
const tx = await aishiAgent.mintAgent(
  [],           // proofs (optional)
  [],           // descriptions
  "Luna",       // unique agent name
  userAddress   // owner address
);

// Process a dream to evolve personality
await aishiAgent.processDailyDream(
  tokenId,
  dreamHash,
  {
    creativityChange: 5,
    analyticalChange: -2,
    empathyChange: 3,
    // ... other trait changes
  }
);`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-grotesk font-bold text-text-primary mb-4">
            Ready to Build?
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Start creating AI agents with unique personalities that evolve through dreams and conversations.
          </p>
          <Link href="/docs" className="btn btn-primary inline-flex items-center">
            Start Building
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}