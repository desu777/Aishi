import { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  external?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  external,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-accent-primary text-white hover:bg-accent-secondary focus:ring-2 focus:ring-accent-primary/50',
    secondary: 'bg-background-card text-text-primary border border-border hover:border-accent-primary focus:ring-2 focus:ring-border/50',
    outline: 'bg-transparent text-accent-primary border-2 border-accent-primary hover:bg-accent-primary hover:text-white focus:ring-2 focus:ring-accent-primary/50',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-background-card',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  const content = (
    <>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  )
  
  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {content}
        </a>
      )
    }
    
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }
  
  return (
    <button className={classes} {...props}>
      {content}
    </button>
  )
}