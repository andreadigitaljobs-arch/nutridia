import { type HTMLAttributes, type ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className = '', onClick, ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-white shadow-sm p-4
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
