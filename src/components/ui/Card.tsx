import { cn } from '../../lib/utils'
import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-slate-900 border border-slate-800 rounded-xl p-4', className)}
      {...props}
    />
  )
}
