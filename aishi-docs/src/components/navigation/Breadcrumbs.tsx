/**
 * @fileoverview Breadcrumbs navigation component
 * @description Shows navigation path: Home > Section > Current Page
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getBreadcrumbs } from '@/lib/navigation'
import { FiHome, FiChevronRight } from 'react-icons/fi'

export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  if (pathname === '/') {
    return null
  }

  return (
    <nav className="bg-background-main border-b border-border py-3 px-4 md:px-8 md:pl-72">
      <div className="flex items-center space-x-2 text-sm text-text-secondary">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center space-x-2">
            {index > 0 && (
              <FiChevronRight 
                size={14} 
                className="text-text-tertiary" 
              />
            )}
            
            {crumb.path ? (
              <Link
                href={crumb.path}
                className="flex items-center space-x-1 hover:text-accent-primary transition-colors"
              >
                {index === 0 && (
                  <FiHome size={14} className="mr-1" />
                )}
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-1 text-text-primary">
                {index === 0 && (
                  <FiHome size={14} className="mr-1" />
                )}
                <span>{crumb.label}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}