/**
 * @fileoverview Client-side providers wrapper for Next.js App Router
 * @description Wraps all client-side context providers and layout to work with server components
 */

'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { MainLayout } from '@/components/layout/MainLayout'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </ThemeProvider>
  )
}