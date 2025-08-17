'use client'

import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { Highlight, themes, Language } from 'prism-react-renderer'

interface CodeBlockProps {
  children: string
  language?: Language
  filename?: string
  showLineNumbers?: boolean
}

export default function CodeBlock({
  children,
  language = 'typescript',
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border">
      {filename && (
        <div className="bg-background-card px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-text-secondary text-sm font-mono">{filename}</span>
          <span className="text-text-tertiary text-xs uppercase">{language}</span>
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 bg-background-panel rounded-md text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Copy code"
        >
          {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
        </button>
        
        <Highlight
          theme={{
            ...themes.nightOwl,
            plain: {
              color: '#E6E6E6',
              backgroundColor: '#121218',
            },
          }}
          code={children.trim()}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} p-4 overflow-x-auto`}
              style={{ ...style, background: '#121218' }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {showLineNumbers && (
                    <span className="inline-block w-8 text-text-tertiary text-sm select-none">
                      {i + 1}
                    </span>
                  )}
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  )
}