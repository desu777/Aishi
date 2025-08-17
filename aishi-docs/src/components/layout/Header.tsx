'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { FiMenu, FiX, FiGithub, FiSearch } from 'react-icons/fi'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface HeaderProps {
  onMenuToggle?: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background-main/95 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="mr-4 p-2 text-text-secondary hover:text-text-primary md:hidden"
          aria-label="Toggle menu"
        >
          <FiMenu size={20} />
        </button>

        {/* Logo and brand */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src={mounted ? (theme === 'dark' ? '/logo_white.png' : '/logo_black.png') : '/logo_white.png'}
            alt="Aishi Logo"
            width={32}
            height={32}
            className="rounded-lg transition-all duration-300"
          />
          <span className="font-grotesk text-xl font-semibold text-text-primary">
            Aishi
          </span>
        </Link>


        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>
            
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-64 md:w-80">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full px-4 py-2 bg-background-card border border-border rounded-lg focus:outline-none focus:border-accent-primary text-text-primary placeholder-text-tertiary"
                  autoFocus
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                />
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* GitHub */}
          <a
            href="https://github.com/aishios"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="GitHub"
          >
            <FiGithub size={20} />
          </a>

          {/* Version badge */}
          <div className="hidden md:flex items-center px-3 py-1 bg-background-card rounded-full border border-border">
            <span className="text-xs text-text-secondary">v0.1.0</span>
          </div>
        </div>
      </div>
    </header>
  )
}