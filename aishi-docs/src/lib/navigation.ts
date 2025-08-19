/**
 * @fileoverview Navigation utilities for managing page order and breadcrumbs
 * @description Provides functions for previous/next navigation and breadcrumb generation
 */

export interface PageInfo {
  path: string
  title: string
  section: string
}

export interface BreadcrumbItem {
  label: string
  path?: string
}

export const PAGE_ORDER: PageInfo[] = [
  { path: '/introduction', title: 'Introduction', section: 'INTRODUCTION' },
  { path: '/getting-started', title: 'Getting Started', section: 'GETTING STARTED' },
  { path: '/aishi-core', title: 'Aishi Core', section: 'AISHI CORE' },
  { path: '/aishi-soul', title: 'The Aishi Soul', section: 'THE AISHI SOUL' },
  { path: '/living-memory', title: 'The Living Memory', section: 'THE LIVING MEMORY' },
  { path: '/roadmap-vision', title: 'Roadmap & Vision', section: 'ROADMAP & VISION' }
]

/**
 * Get the previous page in the navigation order
 */
export function getPreviousPage(currentPath: string): PageInfo | null {
  const currentIndex = PAGE_ORDER.findIndex(page => page.path === currentPath)
  if (currentIndex <= 0) return null
  return PAGE_ORDER[currentIndex - 1]
}

/**
 * Get the next page in the navigation order  
 */
export function getNextPage(currentPath: string): PageInfo | null {
  const currentIndex = PAGE_ORDER.findIndex(page => page.path === currentPath)
  if (currentIndex === -1 || currentIndex === PAGE_ORDER.length - 1) return null
  return PAGE_ORDER[currentIndex + 1]
}

/**
 * Get the current page info
 */
export function getCurrentPage(currentPath: string): PageInfo | null {
  return PAGE_ORDER.find(page => page.path === currentPath) || null
}

/**
 * Generate breadcrumb items for the current path
 */
export function getBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' }
  ]

  const currentPage = getCurrentPage(currentPath)
  if (currentPage) {
    // Add section if it's different from page title
    if (currentPage.section !== currentPage.title.toUpperCase()) {
      breadcrumbs.push({ label: currentPage.section })
    }
    breadcrumbs.push({ label: currentPage.title })
  }

  return breadcrumbs
}

/**
 * Check if a path has navigation (not home page)
 */
export function hasNavigation(currentPath: string): boolean {
  return currentPath !== '/' && PAGE_ORDER.some(page => page.path === currentPath)
}