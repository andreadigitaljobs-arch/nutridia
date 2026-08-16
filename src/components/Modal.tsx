import { type ReactNode, useEffect } from 'react'
import { XIcon } from './Icons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-carbon/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-heading font-semibold text-carbon">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-carbon/5 text-carbon/40 hover:text-carbon transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
