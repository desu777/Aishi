import Link from 'next/link'
import { FiGithub, FiTwitter, FiGlobe, FiMail } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background-main">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-grotesk text-xl font-semibold text-text-primary">
                aishiOS
              </span>
            </div>
            <p className="text-text-secondary text-sm">
              Building autonomous AI agents with evolving personalities on blockchain.
            </p>
          </div>

          {/* Documentation */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Documentation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link href="/docs/concepts/architecture" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  Architecture
                </Link>
              </li>
              <li>
                <Link href="/docs/api/contracts" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/docs/guides/first-agent" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs/resources/faq" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/docs/resources/glossary" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  Glossary
                </Link>
              </li>
              <li>
                <Link href="/docs/resources/troubleshooting" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  Troubleshooting
                </Link>
              </li>
              <li>
                <a href="https://github.com/aishios/aishios" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-primary transition-colors text-sm">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Community</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/aishios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-primary transition-colors"
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
              <a
                href="https://twitter.com/aishios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-primary transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://aishios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-primary transition-colors"
                aria-label="Website"
              >
                <FiGlobe size={20} />
              </a>
              <a
                href="mailto:contact@aishios.com"
                className="text-text-secondary hover:text-accent-primary transition-colors"
                aria-label="Email"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-tertiary text-sm">
            © 2025 aishiOS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}