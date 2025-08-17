import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllDocSlugs, getDocBySlug } from '@/lib/mdx'
import CodeBlock from '@/components/ui/CodeBlock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import remarkGfm from 'remark-gfm'

const components = {
  pre: ({ children, ...props }: any) => {
    const language = props.className?.replace('language-', '') || 'typescript'
    return <CodeBlock language={language}>{children.props.children}</CodeBlock>
  },
  Card,
  Button,
}

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function DocPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || ['index']
  const doc = await getDocBySlug(slug)
  
  if (!doc) {
    notFound()
  }
  
  return (
    <article className="docs-content animate-fade-up">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-text-secondary">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/docs" className="hover:text-accent-primary transition-colors">
              Docs
            </a>
          </li>
          {slug.map((part, index) => (
            <li key={index} className="flex items-center">
              <span className="mx-2">/</span>
              <span className={index === slug.length - 1 ? 'text-text-primary' : ''}>
                {part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </li>
          ))}
        </ol>
      </nav>
      
      {/* Title and description */}
      {doc.meta.title && (
        <div className="mb-8">
          <h1 className="text-4xl font-grotesk font-bold text-text-primary mb-3">
            {doc.meta.title}
          </h1>
          {doc.meta.description && (
            <p className="text-lg text-text-secondary">
              {doc.meta.description}
            </p>
          )}
        </div>
      )}
      
      {/* MDX Content */}
      <div className="prose prose-invert max-w-none">
        <MDXRemote
          source={doc.content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
        />
      </div>
      
      {/* Navigation footer */}
      <div className="mt-12 pt-8 border-t border-border flex justify-between">
        <Button variant="ghost" size="sm">
          Previous
        </Button>
        <Button variant="ghost" size="sm">
          Next
        </Button>
      </div>
    </article>
  )
}