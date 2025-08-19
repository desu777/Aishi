/**
 * @fileoverview Page navigation component for Previous/Next navigation
 * @description Responsive component: fixed right on desktop, sticky bottom on mobile
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getPreviousPage, getNextPage, hasNavigation } from '@/lib/navigation'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

export function PageNavigation() {
  const pathname = usePathname()
  
  if (!hasNavigation(pathname)) {
    return null
  }

  const previousPage = getPreviousPage(pathname)
  const nextPage = getNextPage(pathname)

  if (!previousPage && !nextPage) {
    return null
  }

  return (
    <>
      {/* Desktop Navigation - Fixed Right */}
      <div className="hidden xl:block fixed right-8 top-1/2 transform -translate-y-1/2 z-30">
        <div className="space-y-4 max-w-64">
          {previousPage && (
            <Link
              href={previousPage.path}
              className="group block bg-background-card border border-border rounded-lg p-4 hover:border-accent-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center text-sm text-text-secondary mb-2">
                <FiArrowLeft size={14} className="mr-1" />
                <span>Previous</span>
              </div>
              <div className="text-text-primary font-medium group-hover:text-accent-primary transition-colors">
                {previousPage.title}
              </div>
            </Link>
          )}
          
          {nextPage && (
            <Link
              href={nextPage.path}
              className="group block bg-background-card border border-border rounded-lg p-4 hover:border-accent-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-end text-sm text-text-secondary mb-2">
                <span>Next</span>
                <FiArrowRight size={14} className="ml-1" />
              </div>
              <div className="text-text-primary font-medium text-right group-hover:text-accent-primary transition-colors">
                {nextPage.title}
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation - Fixed Bottom */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-background-main border-t border-border p-4 z-40">
        <div className="flex justify-between space-x-4">
          {previousPage ? (
            <Link
              href={previousPage.path}
              className="group flex-1 bg-background-card border border-border rounded-lg p-4 hover:border-accent-primary/50 transition-all duration-300"
            >
              <div className="flex items-center text-sm text-text-secondary mb-2">
                <FiArrowLeft size={14} className="mr-1" />
                <span>Previous</span>
              </div>
              <div className="text-text-primary font-medium group-hover:text-accent-primary transition-colors text-sm">
                {previousPage.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
          
          {nextPage ? (
            <Link
              href={nextPage.path}
              className="group flex-1 bg-background-card border border-border rounded-lg p-4 hover:border-accent-primary/50 transition-all duration-300"
            >
              <div className="flex items-center justify-end text-sm text-text-secondary mb-2">
                <span>Next</span>
                <FiArrowRight size={14} className="ml-1" />
              </div>
              <div className="text-text-primary font-medium text-right group-hover:text-accent-primary transition-colors text-sm">
                {nextPage.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
        </div>
      </div>
    </>
  )
}