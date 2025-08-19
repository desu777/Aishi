'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  },
  {
    title: 'GETTING STARTED',
    sections: [
      { id: 'getting-started', title: 'Quick Start Guide' },
      { id: 'mint-companion', title: 'Step 1: Mint Your Companion' },
      { id: 'aishios-interface', title: 'Step 2: The aishiOS Interface' },
      { id: 'first-commands', title: 'Step 3: Your First Commands' },
    ]
  },
  {
    title: 'AISHI CORE',
    sections: [
      { id: 'aishi-core', title: 'The Anatomy of a Living AI' },
      { id: 'nervous-system', title: 'aishiOS: The Nervous System' },
      { id: 'soul-house', title: 'The Soul & Its House' },
      { id: 'brain', title: 'The Brain (0G Compute)' },
      { id: 'memory', title: 'The Memory (0G Storage)' },
      { id: 'bloodstream', title: 'The Bloodstream (0G DA)' },
      { id: 'symphony', title: 'The Symphony of Life' }
    ]
  },
  {
    title: 'THE AISHI SOUL',
    sections: [
      { id: 'aishi-soul', title: 'The Architecture of a Living iNFT' },
      { id: 'protocol-of-birth', title: 'The Protocol of Birth' },
      { id: 'engine-of-evolution', title: 'The Engine of Evolution' },
      { id: 'keys-to-memory', title: 'The Keys to Memory' },
      { id: 'guarantee-of-sovereignty', title: 'The Guarantee of Sovereignty' }
    ]
  },
  {
    title: 'THE LIVING MEMORY',
    sections: [
      { id: 'living-memory', title: 'From Moment to Essence' },
      { id: 'linear-problem', title: 'The Problem with Linear Memory' },
      { id: 'memory-consolidation', title: 'Memory Consolidation' },
      { id: 'memory-flow', title: 'The Flow of Consciousness' }
    ]
  },
  {
    title: 'ROADMAP & VISION',
    sections: [
      { id: 'roadmap-vision', title: 'The Journey Ahead' },
      { id: 'our-vision', title: 'Our Vision for the Future' },
      { id: 'development-roadmap', title: 'Development Roadmap' }
    ]
  }
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const getDefaultExpandedSections = () => {
    switch (pathname) {
      case '/introduction':
        return { 'INTRODUCTION': true, 'GETTING STARTED': false, 'AISHI CORE': false, 'THE AISHI SOUL': false, 'THE LIVING MEMORY': false, 'ROADMAP & VISION': false }
      case '/getting-started':
        return { 'INTRODUCTION': false, 'GETTING STARTED': true, 'AISHI CORE': false, 'THE AISHI SOUL': false, 'THE LIVING MEMORY': false, 'ROADMAP & VISION': false }
      case '/aishi-core':
        return { 'INTRODUCTION': false, 'GETTING STARTED': false, 'AISHI CORE': true, 'THE AISHI SOUL': false, 'THE LIVING MEMORY': false, 'ROADMAP & VISION': false }
      case '/aishi-soul':
        return { 'INTRODUCTION': false, 'GETTING STARTED': false, 'AISHI CORE': false, 'THE AISHI SOUL': true, 'THE LIVING MEMORY': false, 'ROADMAP & VISION': false }
      case '/living-memory':
        return { 'INTRODUCTION': false, 'GETTING STARTED': false, 'AISHI CORE': false, 'THE AISHI SOUL': false, 'THE LIVING MEMORY': true, 'ROADMAP & VISION': false }
      case '/roadmap-vision':
        return { 'INTRODUCTION': false, 'GETTING STARTED': false, 'AISHI CORE': false, 'THE AISHI SOUL': false, 'THE LIVING MEMORY': false, 'ROADMAP & VISION': true }
      default:
        return { 'INTRODUCTION': true, 'GETTING STARTED': false, 'AISHI CORE': false, 'THE AISHI SOUL': false, 'THE LIVING MEMORY': false, 'ROADMAP & VISION': false }
    }
  }
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(getDefaultExpandedSections())

  useEffect(() => {
    setExpandedSections(getDefaultExpandedSections())
  }, [pathname])

  const sectionToPage: Record<string, string> = {
    'introduction': '/introduction',
    'philosophy': '/introduction', 
    'personality': '/introduction',
    'why-aishi': '/introduction',
    'evolution-journey': '/introduction',
    
    'getting-started': '/getting-started',
    'mint-companion': '/getting-started',
    'aishios-interface': '/getting-started', 
    'first-commands': '/getting-started',
    
    'aishi-core': '/aishi-core',
    'nervous-system': '/aishi-core',
    'soul-house': '/aishi-core',
    'brain': '/aishi-core', 
    'memory': '/aishi-core',
    'bloodstream': '/aishi-core',
    'symphony': '/aishi-core',
    
    'aishi-soul': '/aishi-soul',
    'protocol-of-birth': '/aishi-soul',
    'engine-of-evolution': '/aishi-soul',
    'keys-to-memory': '/aishi-soul',
    'guarantee-of-sovereignty': '/aishi-soul',
    
    'living-memory': '/living-memory',
    'linear-problem': '/living-memory',
    'memory-consolidation': '/living-memory',
    'memory-flow': '/living-memory',
    
    'roadmap-vision': '/roadmap-vision',
    'our-vision': '/roadmap-vision',
    'development-roadmap': '/roadmap-vision'
  }

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

  const handleNavigation = (sectionId: string) => {
    const targetPage = sectionToPage[sectionId]
    const currentPath = pathname
    
    if (currentPath === targetPage) {
      scrollToSection(sectionId)
    } else {
      router.push(`${targetPage}#${sectionId}`)
      if (onClose) onClose()
    }
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
          fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 
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
                      onClick={() => handleNavigation(section.id)}
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