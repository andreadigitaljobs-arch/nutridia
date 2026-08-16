import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, LeafIcon } from '@/components/Icons'

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Completa todos los campos.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const result = await signUp(email.trim(), password, name.trim())
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      navigate('/onboarding', { replace: true })
    }
  }

  const anim = (delay: number) => ({ animation: `slideUp 0.6s ease-out ${delay}s both` })

  return (
    <div className="relative min-h-dvh">
      <img src="/brand/bg-register.png" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ animation: 'fadeIn 1.2s ease-out both' }} />

      <div className="relative z-10 flex flex-col px-7 pt-14 pb-8">
        <div className="flex justify-center" style={anim(0.2)}>
          <img src="/brand/logo-horizontal.png" alt="NutriDía" className="w-44" />
        </div>

        <div className="flex flex-col items-center mt-4">
          <div style={anim(0.4)}>
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-3">
              <UserIcon size={32} className="text-sage" />
            </div>
          </div>

          <h1 className="font-heading text-3xl font-bold text-carbon text-center" style={anim(0.5)}>
            Crea tu cuenta
          </h1>

          <p className="text-sm text-carbon/50 text-center mt-1 mb-5 max-w-xs leading-relaxed" style={anim(0.6)}>
            Únete a NutriDía y comienza hoy tu camino hacia una vida más saludable.
          </p>

          {error && (
            <div className="w-full bg-coral/10 text-coral text-sm rounded-xl px-4 py-3 text-center mb-3" style={anim(0)}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <div className="relative" style={anim(0.7)}>
              <UserIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50" />
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/70 border border-sage/20 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage/40 transition-all"
              />
            </div>

            <div className="relative" style={anim(0.8)}>
              <MailIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/70 border border-sage/20 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage/40 transition-all"
              />
            </div>

            <div className="relative" style={anim(0.9)}>
              <LockIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/70 border border-sage/20 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sage/40 hover:text-sage/70 transition-colors"
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            <div className="relative" style={anim(1.0)}>
              <LockIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/70 border border-sage/20 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sage/40 hover:text-sage/70 transition-colors"
              >
                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-coral text-white font-heading font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-coral/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={anim(1.2)}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Crear cuenta
                  <ArrowRightIcon size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-carbon/50 text-center mt-6">
            ¿Ya tienes una cuenta?
          </p>

          <Link
            to="/login"
            className="w-full h-12 rounded-2xl border-2 border-sage/30 text-sage font-heading font-semibold text-sm flex items-center justify-center gap-2 hover:bg-sage/5 active:bg-sage/10 transition-colors mt-2"
            style={anim(1.5)}
          >
            Ya tengo una cuenta
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
