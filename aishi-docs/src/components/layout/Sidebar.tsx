'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

interface NavigationSection {
  id: string
  title: string
}

interface NavigationItem {
  title: string
  slug?: string
  isExpanded?: boolean
  sections: NavigationSection[]
}

const navigationData: NavigationItem[] = [
  {
    title: 'INTRODUCTION',
    sections: [
      { id: 'introduction', title: 'Welcome to Aishi' },
      { id: 'philosophy', title: 'The Philosophy: Your Digital Soul' },
      { id: 'personality', title: 'Unique Personality: A Reflection of You' },
      { id: 'why-aishi', title: 'Why Aishi?: Trust in a Digital Age' },
      { id: 'evolution-journey', title: 'The Evolution Journey: Day 1 to Year 5' },
    ]
  }
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'INTRODUCTION': true // Domyślnie rozwinięte
  })

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

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
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
          transition-transform duration-300 ease-in-out will-change-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <nav className="p-4 space-y-2">
          {navigationData.map((item) => (
            <div key={item.title} className="space-y-1">
              {/* Main Section Header */}
              <button
                onClick={() => toggleSection(item.title)}
                className="w-full flex items-center justify-between py-2 px-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-background-card"
              >
                <span className="text-xs font-bold tracking-wider uppercase">
                  {item.title}
                </span>
                {expandedSections[item.title] ? (
                  <FiChevronDown 
                    size={16} 
                    className="text-text-tertiary transition-transform duration-200" 
                  />
                ) : (
                  <FiChevronRight 
                    size={16} 
                    className="text-text-tertiary transition-transform duration-200" 
                  />
                )}
              </button>

              {/* Subsections */}
              {expandedSections[item.title] && (
                <div className="ml-4 space-y-1 border-l-2 border-border pl-3">
                  {item.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="block w-full text-left py-1.5 px-2 text-sm text-text-secondary hover:text-accent-primary hover:bg-background-card transition-colors rounded-md"
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

      </aside>
    </>
  )
}