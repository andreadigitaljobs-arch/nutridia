import { useNavigate } from 'react-router-dom'
import { BowlIcon, WaterDropIcon, ScaleIcon, ClipboardIcon } from '@/components/Icons'

const buttons = [
  {
    label: 'Que comi hoy?',
    to: '/quick-meals',
    icon: BowlIcon,
    bg: 'bg-sage/10',
    color: 'text-sage',
  },
  {
    label: 'Agua',
    to: '/water',
    icon: WaterDropIcon,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
  {
    label: 'Mi peso',
    to: '/progress',
    icon: ScaleIcon,
    bg: 'bg-amber-100',
    color: 'text-amber-700',
  },
  {
    label: 'Mi plan',
    to: '/weekly-plan',
    icon: ClipboardIcon,
    bg: 'bg-coral/10',
    color: 'text-coral',
  },
]

export default function EasyMode() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 animate-fade-in">
      <img src="/brand/logo-horizontal.png" alt="Nutri Dia" className="w-32 mb-12" />

      <div className="w-full max-w-sm space-y-4">
        {buttons.map((btn) => {
          const Icon = btn.icon
          return (
            <button
              key={btn.to}
              onClick={() => navigate(btn.to)}
              className="w-full bg-white rounded-2xl border border-card-border p-6 flex items-center gap-5 text-left active:scale-[0.98] transition-transform shadow-sm"
            >
              <div className={`w-16 h-16 rounded-2xl ${btn.bg} flex items-center justify-center shrink-0`}>
                <Icon className={btn.color} size={32} />
              </div>
              <p className="font-heading text-2xl font-bold text-carbon">{btn.label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
