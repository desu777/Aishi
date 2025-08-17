'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

interface NavItem {
  title: string
  href?: string
  items?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Documentation',
    items: [
      { title: 'Introduction', href: '/' },
      { title: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Documentation'])

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 
          bg-background-main border-r border-border overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <nav className="p-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors"
              >
                <span>{section.title}</span>
                {section.items && (
                  expandedSections.includes(section.title) ? (
                    <FiChevronDown size={16} />
                  ) : (
                    <FiChevronRight size={16} />
                  )
                )}
              </button>

              {section.items && expandedSections.includes(section.title) && (
                <ul className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href || '#'}
                        onClick={onClose}
                        className={`
                          block px-3 py-2 text-sm rounded-md transition-all duration-200
                          ${isActive(item.href || '')
                            ? 'bg-accent-primary/10 text-accent-primary font-medium'
                            : 'text-text-secondary hover:text-text-primary hover:bg-background-card'
                          }
                        `}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 mt-8 border-t border-border">
          <div className="text-xs text-text-tertiary space-y-1">
            <p>Built with Next.js {process.env.NEXT_PUBLIC_NEXT_VERSION || '15.3.4'}</p>
            <p>© 2025 aishiOS Team</p>
          </div>
        </div>
      </aside>
    </>
  )
}