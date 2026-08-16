import { useState, useRef, useEffect } from 'react'
import { ChevronRightIcon } from './Icons'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export default function Select({ value, onChange, options, placeholder = 'Seleccionar', className = '' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-12 px-4 rounded-xl border bg-white text-left flex items-center justify-between transition-all text-sm ${
          open ? 'border-sage ring-2 ring-sage/20' : 'border-card-border'
        } ${selected ? 'text-carbon' : 'text-carbon/30'}`}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <ChevronRightIcon
          size={16}
          className={`text-carbon/30 transition-transform shrink-0 ml-2 ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-card-border shadow-lg overflow-hidden animate-scale-in">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false) }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                option.value === value
                  ? 'bg-sage/10 text-sage font-medium'
                  : 'text-carbon hover:bg-cream'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
