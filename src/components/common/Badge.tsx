import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border'

  const variants = {
    success: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30',
    warning: 'bg-amber-950/40 text-amber-400 border-amber-800/30',
    danger: 'bg-red-950/40 text-red-400 border-red-800/30',
    info: 'bg-sky-950/40 text-sky-400 border-sky-800/30',
    neutral: 'bg-neutral-900 text-neutral-400 border-neutral-800',
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)}>
      {children}
    </span>
  )
}
