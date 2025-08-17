import { ReactNode } from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

interface CardProps {
  title: string
  description?: string
  href?: string
  icon?: ReactNode
  children?: ReactNode
  variant?: 'default' | 'gradient' | 'outline'
}

export default function Card({
  title,
  description,
  href,
  icon,
  children,
  variant = 'default',
}: CardProps) {
  const cardClasses = {
    default: 'bg-background-card border border-border hover:border-accent-primary/50',
    gradient: 'bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/20',
    outline: 'bg-transparent border-2 border-border hover:border-accent-primary',
  }

  const content = (
    <>
      {icon && (
        <div className="mb-4 p-3 bg-accent-primary/10 rounded-lg inline-block">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-grotesk font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-text-secondary text-sm mb-3">
          {description}
        </p>
      )}
      
      {children}
      
      {href && (
        <div className="mt-4 flex items-center text-accent-primary text-sm font-medium">
          Learn more
          <FiArrowRight className="ml-1" size={14} />
        </div>
      )}
    </>
  )

  const baseClasses = `
    rounded-lg p-6 transition-all duration-200
    ${cardClasses[variant]}
    ${href ? 'hover:shadow-lg hover:shadow-accent-primary/10 cursor-pointer' : ''}
  `

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  )
}