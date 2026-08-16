import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-carbon mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage/60 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border border-sage/30 bg-white px-4 py-3
              text-carbon placeholder:text-carbon/40
              focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20
              transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-coral focus:border-coral focus:ring-coral/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-coral">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
