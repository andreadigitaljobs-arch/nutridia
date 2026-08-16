import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && <div className="mb-4 text-sage/40">{icon}</div>}
      <h3 className="text-lg font-heading font-semibold text-carbon mb-2">{title}</h3>
      <p className="text-sm text-carbon/50 max-w-[260px]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
