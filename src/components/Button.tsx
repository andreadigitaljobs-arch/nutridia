import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { LoaderIcon } from './Icons'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-sage text-white hover:bg-sage/90 active:bg-sage/80 shadow-sm',
  secondary: 'border-2 border-sage text-sage bg-transparent hover:bg-sage/5 active:bg-sage/10',
  danger: 'bg-coral text-white hover:bg-coral/90 active:bg-coral/80 shadow-sm',
  ghost: 'bg-transparent text-carbon hover:bg-carbon/5 active:bg-carbon/10',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-base',
  lg: 'h-14 px-6 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-colors duration-150 min-h-12 select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <LoaderIcon className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  )
}
