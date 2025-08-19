/**
 * @fileoverview Main layout wrapper component for the application
 * @description Provides consistent layout structure with header, sidebar, and footer
 */

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const showSidebar = pathname !== '/'
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
        
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}