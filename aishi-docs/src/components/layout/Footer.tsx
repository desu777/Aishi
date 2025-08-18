import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background-main">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-tertiary text-sm">
            © 2025 Aishi. All rights reserved.
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