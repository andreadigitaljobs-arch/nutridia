import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, UserPlusIcon } from '@/components/Icons'
import { useAuth } from '@/providers/AuthProvider'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos.')
      return
    }

    setLoading(true)
    const result = await signIn(email.trim(), password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      navigate('/today', { replace: true })
    }
  }

  const anim = (delay: number) => ({ animation: `slideUp 0.6s ease-out ${delay}s both` })

  return (
    <div className="relative min-h-dvh">
      <img src="/brand/bg-login.png" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ animation: 'fadeIn 1.2s ease-out both' }} />

      <div className="relative z-10 flex flex-col px-7 pt-16">
        <div className="flex justify-center" style={anim(0.2)}>
          <img src="/brand/logo-primary.png" alt="NutriDía" className="w-60" />
        </div>

        <div className="mt-4">
          <h1 className="font-heading text-3xl font-bold text-carbon text-center" style={anim(0.4)}>
            Inicia sesión
          </h1>
          <p className="text-carbon/50 text-sm text-center mt-1 mb-5" style={anim(0.5)}>
            Nos alegra verte de nuevo.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            {error && (
              <p className="text-coral text-sm text-center" style={anim(0)}>{error}</p>
            )}

            <div className="flex flex-col gap-1.5" style={anim(0.6)}>
              <label htmlFor="email" className="text-sm font-medium text-sage">
                Correo electrónico
              </label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sage/60" />
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/70 border border-sage/20 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage/40 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5" style={anim(0.7)}>
              <label htmlFor="password" className="text-sm font-medium text-sage">
                Contraseña
              </label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sage/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/70 border border-sage/20 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sage/40 hover:text-sage/70 transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-coral text-white font-heading font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-coral/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={anim(0.9)}
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Entrar
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>

            <div style={anim(1.0)}>
              <Link
                to="/register"
                className="w-full h-14 rounded-2xl border-2 border-sage/30 text-sage font-heading font-semibold text-base flex items-center justify-center gap-2 hover:bg-sage/5 active:bg-sage/10 transition-colors"
              >
                <UserPlusIcon className="h-5 w-5" />
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
