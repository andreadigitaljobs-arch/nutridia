import { useNavigate } from 'react-router-dom'
import { HeartIcon, ArrowRightIcon, ShieldCheckIcon } from '@/components/Icons'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex flex-col items-center relative overflow-hidden">
      <img
        src="/brand/bg-welcome.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ animation: 'fadeIn 1.5s ease-out both' }}
      />

      <div className="relative z-10 flex flex-col min-h-dvh w-full px-8">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <img
            src="/brand/logo-secondary.png"
            alt="NutriDía"
            className="w-44 drop-shadow-[0_8px_24px_rgba(107,143,113,0.35)]"
            style={{ animation: 'floatLogo 3s ease-in-out infinite' }}
          />
          <p
            className="text-coral font-heading font-semibold text-base text-center"
            style={{ animation: 'slideUp 0.7s ease-out 0.4s both' }}
          >
            Tu plan, tu menú, tu progreso
          </p>
        </div>

        <div className="flex flex-col items-center pb-10 gap-4">
          <div
            style={{ animation: 'slideUp 0.6s ease-out 0.8s both' }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sage/15">
              <HeartIcon className="text-sage" size={20} />
            </div>
          </div>

          <p
            className="text-carbon text-sm text-center leading-relaxed font-medium"
            style={{ animation: 'slideUp 0.6s ease-out 1s both' }}
          >
            Pequeñas decisiones,<br />
            grandes cambios.
          </p>

          <button
            onClick={() => navigate('/onboarding')}
            className="w-full h-14 rounded-2xl bg-coral text-white font-heading font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-coral/30 active:scale-[0.98] transition-transform"
            style={{ animation: 'slideUp 0.6s ease-out 1.2s both, pulse 2s ease-in-out 2s infinite' }}
          >
            Comenzar
            <ArrowRightIcon className="text-white" size={20} />
          </button>

          <div
            className="flex flex-col items-center gap-1"
            style={{ animation: 'slideUp 0.6s ease-out 1.4s both' }}
          >
            <ShieldCheckIcon className="text-sage/60" size={16} />
            <p className="text-carbon/40 text-xs text-center">
              Seguro · Confiable · Hecho para ti
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
