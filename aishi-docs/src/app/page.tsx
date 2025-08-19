/**
 * @fileoverview Minimalist home page with Light Rays effect and CTA buttons
 * @description Landing page showcasing Aishi brand with purple light rays background and navigation to docs
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'
import LightRays from '@/components/effects/LightRays'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Light Rays Background */}
      <div className="absolute inset-0 overflow-hidden">
        <LightRays
          raysOrigin="top-center"
          raysColor="#8B5CF6"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="w-full h-full"
        />
      </div>

      {/* Gradient overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-main/30 to-background-main/80 z-[5]" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src={mounted ? (theme === 'dark' ? '/logo_white.png' : '/logo_black.png') : '/logo_white.png'}
              alt="Aishi Logo"
              width={160}
              height={160}
              className="mx-auto rounded-2xl transition-all duration-300 drop-shadow-2xl"
              priority
            />
          </div>

          {/* Main Headline - H1 */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-grotesk font-bold text-text-primary mb-6 leading-tight">
            AI with a soul.
            <br />
            <span className="text-accent-primary">Verifiably yours.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-text-secondary mb-12 leading-relaxed max-w-3xl mx-auto">
            The first truly sovereign companion, built on a decentralized world.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              href="/introduction"
              className="group border-2 border-text-primary/20 hover:border-accent-primary text-text-primary hover:text-accent-primary font-grotesk font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Spacer */}
      <div className="h-16" />
    </div>
  )
}