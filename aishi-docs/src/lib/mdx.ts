import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'

const docsDirectory = path.join(process.cwd(), 'src/content/docs')

export interface DocMeta {
  title: string
  description?: string
  category?: string
  order?: number
  slug: string[]
}

export interface Doc {
  meta: DocMeta
  content: string
  source?: any
}

/**
 * Get all documentation file paths recursively
 */
export function getDocsPaths(dir: string = docsDirectory): string[] {
  const files: string[] = []
  
  try {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...getDocsPaths(fullPath))
      } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.error('Error reading docs directory:', error)
  }
  
  return files
}

/**
 * Get all documentation slugs for static generation
 */
export function getAllDocSlugs(): string[][] {
  const paths = getDocsPaths()
  
  return paths.map(filePath => {
    const relativePath = path.relative(docsDirectory, filePath)
    const slug = relativePath
      .replace(/\.(mdx|md)$/, '')
      .split(path.sep)
    
    return slug
  })
}

/**
 * Get a single document by slug
 */
export async function getDocBySlug(slug: string[]): Promise<Doc | null> {
  const filePath = path.join(docsDirectory, ...slug) + '.mdx'
  const fallbackPath = path.join(docsDirectory, ...slug) + '.md'
  
  let fullPath = ''
  
  if (fs.existsSync(filePath)) {
    fullPath = filePath
  } else if (fs.existsSync(fallbackPath)) {
    fullPath = fallbackPath
  } else {
    // Try index file in directory
    const indexPath = path.join(docsDirectory, ...slug, 'index.mdx')
    const indexFallback = path.join(docsDirectory, ...slug, 'index.md')
    
    if (fs.existsSync(indexPath)) {
      fullPath = indexPath
    } else if (fs.existsSync(indexFallback)) {
      fullPath = indexFallback
    } else {
      return null
    }
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  const source = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [],
    },
  })
  
  return {
    meta: {
      ...data,
      slug,
    } as DocMeta,
    content,
    source,
  }
}

/**
 * Get navigation structure from docs
 */
export function getDocsNavigation() {
  const slugs = getAllDocSlugs()
  const navigation: any = {}
  
  slugs.forEach(slug => {
    const category = slug[0] || 'general'
    if (!navigation[category]) {
      navigation[category] = []
    }
    
    navigation[category].push({
      slug,
      title: slug[slug.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
    })
  })
  
  return navigation
}