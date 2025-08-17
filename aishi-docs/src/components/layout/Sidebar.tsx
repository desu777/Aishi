'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

interface ContentSection {
  id: string
  title: string
  isQuestion?: boolean
}

const contentNavigation: ContentSection[] = [
  { id: 'introduction', title: 'Introduction', isQuestion: false },
  { id: 'what-is-aishi', title: 'What is Aishi?', isQuestion: true },
  { id: 'key-features', title: 'Key Features', isQuestion: true },
  { id: 'personality-evolution', title: 'Personality Evolution', isQuestion: false },
  { id: 'hierarchical-memory', title: 'Hierarchical Memory', isQuestion: false },
  { id: 'gamification', title: 'Gamification', isQuestion: false },
  { id: 'quick-start', title: 'Quick Start', isQuestion: true },
  { id: 'architecture-overview', title: 'Architecture Overview', isQuestion: true },
  { id: 'why-aishi', title: 'Why Aishi?', isQuestion: true },
  { id: 'next-steps', title: 'Next Steps', isQuestion: true },
  { id: 'community', title: 'Community', isQuestion: true },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
    if (onClose) onClose()
  }

  const handleQuickStartClick = () => {
    if (pathname === '/') {
      scrollToSection('quick-start')
    } else {
      window.location.href = '/docs/quick-start'
    }
  }

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
        <nav className="p-4 space-y-3">
          {contentNavigation.map((section) => (
            <div key={section.id}>
              {section.isQuestion ? (
                <div className="mb-2">
                  <div className="text-sm font-bold text-text-primary mb-1">
                    **{section.title}**
                  </div>
                  <button
                    onClick={() => {
                      if (section.id === 'quick-start' && pathname !== '/') {
                        handleQuickStartClick()
                      } else {
                        scrollToSection(section.id)
                      }
                    }}
                    className="block text-sm text-text-secondary hover:text-accent-primary transition-colors pl-4 border-l-2 border-border hover:border-accent-primary"
                  >
                    > {section.id === 'introduction' ? 'Introduction' : 
                         section.id === 'quick-start' ? 'Quick Start Guide' : 
                         section.title}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="block text-sm text-text-secondary hover:text-accent-primary transition-colors pl-6"
                >
                  > {section.title}
                </button>
              )}
            </div>
          ))}
        </nav>

      </aside>
    </>
  )
}