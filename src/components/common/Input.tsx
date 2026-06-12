import React from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full bg-neutral-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 transition-all duration-200',
          error
            ? 'border-red-800 focus:border-red-600 focus:ring-red-950/50'
            : 'border-neutral-800 focus:border-indigo-500 focus:ring-indigo-950/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
