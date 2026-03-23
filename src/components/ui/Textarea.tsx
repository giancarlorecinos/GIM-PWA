import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none',
          error ? 'border-red-500' : 'border-slate-700',
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)

Textarea.displayName = 'Textarea'
