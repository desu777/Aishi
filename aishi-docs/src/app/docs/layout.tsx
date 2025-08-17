'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 w-full">
          <div className="container mx-auto px-4 py-8 md:px-8 max-w-5xl">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}