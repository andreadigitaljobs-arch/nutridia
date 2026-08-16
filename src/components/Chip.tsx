import { type ReactNode } from 'react'

type ChipVariant = 'default' | 'success' | 'warning' | 'danger'

interface ChipProps {
  children: ReactNode
  variant?: ChipVariant
  className?: string
}

const variantClasses: Record<ChipVariant, string> = {
  default: 'bg-mint/50 text-sage',
  success: 'bg-sage/10 text-sage',
  warning: 'bg-maize/50 text-carbon',
  danger: 'bg-coral/10 text-coral',
}

export default function Chip({ children, variant = 'default', className = '' }: ChipProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
