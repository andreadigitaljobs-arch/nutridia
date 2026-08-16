import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailIcon, ChevronLeftIcon, CheckIcon } from '@/components/Icons'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }

    setLoading(true)
    const { error: supaError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    })
    setLoading(false)

    if (supaError) {
      setError('Ocurrió un error. Intenta de nuevo.')
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center bg-cream px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 flex-1">
        <img src="/brand/logo-compact.png" alt="NutriDía" className="h-12 w-auto" />

        <div className="w-full flex flex-col gap-2">
          <h1 className="font-heading font-semibold text-2xl text-carbon text-center">
            Recuperar contraseña
          </h1>
          <p className="text-carbon/50 text-center text-sm leading-relaxed">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {submitted ? (
          <div className="w-full flex flex-col items-center gap-6 py-8">
            <div className="h-20 w-20 rounded-full bg-sage/10 flex items-center justify-center">
              <CheckIcon className="h-10 w-10 text-sage" />
            </div>
            <p className="text-carbon/70 text-center text-sm leading-relaxed max-w-xs">
              Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link
              to="/login"
              className="mt-4 text-sage font-semibold text-sm hover:underline flex items-center gap-1"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {error && (
              <div className="bg-coral/10 text-coral text-sm rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div className="relative">
              <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-carbon/30" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white border border-carbon/10 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-coral text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-coral/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              ) : (
                'Enviar enlace'
              )}
            </button>
          </form>
        )}

        {!submitted && (
          <Link
            to="/login"
            className="text-carbon/50 text-sm font-medium hover:text-carbon flex items-center gap-1"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        )}
      </div>
    </div>
  )
}
