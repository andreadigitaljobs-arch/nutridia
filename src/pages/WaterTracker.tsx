import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getToday } from '@/utils/date'
import { WaterDropIcon, ChevronLeftIcon, CheckCircleIcon } from '@/components/Icons'
import type { HydrationLog } from '@/types/database'
import { useNavigate } from 'react-router-dom'

const TARGET_ML = 4000
const QUICK_ADD_OPTIONS = [
  { label: '+250 ml', amount: 250 },
  { label: '+500 ml', amount: 500 },
  { label: '+1 vaso', amount: 250 },
]

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function WaterTracker() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const today = getToday()

  const [logs, setLogs] = useState<HydrationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [justReachedGoal, setJustReachedGoal] = useState(false)

  const consumed = logs.reduce((sum, l) => sum + l.amount_ml, 0)
  const pct = Math.min(Math.round((consumed / TARGET_ML) * 100), 100)
  const goalReached = consumed >= TARGET_ML

  const fetchLogs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true })
    if (!error && data) setLogs(data as HydrationLog[])
    setLoading(false)
  }, [user, today])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const addWater = async (amount: number) => {
    if (!user || adding) return
    const wasUnderGoal = consumed < TARGET_ML
    setAdding(true)

    const { data, error } = await supabase
      .from('hydration_logs')
      .insert({ user_id: user.id, date: today, amount_ml: amount })
      .select()
      .single()

    if (!error && data) {
      setLogs((prev) => [...prev, data as HydrationLog])
      if (wasUnderGoal && consumed + amount >= TARGET_ML) {
        setJustReachedGoal(true)
      }
    }
    setAdding(false)
  }

  const removeLog = async (id: string) => {
    const { error } = await supabase.from('hydration_logs').delete().eq('id', id)
    if (!error) setLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const radius = 90
  const stroke = 12
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * pct) / 100
  const waterLevel = Math.min(pct, 100)

  return (
    <div className="min-h-screen bg-cream pb-24 animate-fade-in">
      <div className="px-4 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-carbon/60 mb-4"
        >
          <ChevronLeftIcon size={20} />
          <span className="text-sm font-medium">Volver</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
            <WaterDropIcon size={20} className="text-sage" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-carbon">Hidratación</h1>
            <p className="text-sm text-carbon/50">Registra tu consumo de agua</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="#E8F0E8"
              strokeWidth={stroke}
            />
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={goalReached ? '#6B8F71' : '#93C9A1'}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <clipPath id="circleClip">
                <circle cx="110" cy="110" r={radius - stroke / 2} />
              </clipPath>
            </defs>
            <g clipPath="url(#circleClip)">
              <rect
                x="0"
                y={220 - (220 * waterLevel) / 100}
                width="220"
                height={(220 * waterLevel) / 100}
                className="transition-all duration-700 ease-out"
                fill="url(#waveGrad)"
              />
              <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93C9A1" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#6B8F71" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              {waterLevel > 3 && (
                <g className="animate-wave">
                  <path
                    d={`M0 ${220 - (220 * waterLevel) / 100} Q55 ${220 - (220 * waterLevel) / 100 - 6} 110 ${220 - (220 * waterLevel) / 100} T220 ${220 - (220 * waterLevel) / 100} V220 H0 Z`}
                    fill="#6B8F71"
                    opacity={0.25}
                  />
                </g>
              )}
            </g>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-heading font-bold text-carbon">
              {consumed}
            </p>
            <p className="text-sm text-carbon/50 mt-0.5">
              de {TARGET_ML} ml
            </p>
            <p className="text-xs text-sage font-semibold mt-1">
              {pct}%
            </p>
          </div>
        </div>
      </div>

      {goalReached && (
        <div className="mx-4 mt-4 bg-sage/10 border border-sage/20 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircleIcon size={28} className="text-sage shrink-0" />
          <div>
            <p className="font-heading font-semibold text-sm text-carbon">¡Meta alcanzada!</p>
            <p className="text-xs text-carbon/60 mt-0.5">
              {justReachedGoal
                ? '¡Excelente! Ya cumpliste tu objetivo de hidratación diaria.'
               : 'Hoy cumpliste tu objetivo de hidratación. ¡Sigue así!'}
            </p>
          </div>
        </div>
      )}

      {!goalReached && (
        <div className="mx-4 mt-4 bg-sage/5 rounded-2xl p-4">
          <p className="text-sm text-carbon/60 text-center">
            Te faltan <span className="font-bold text-sage">{TARGET_ML - consumed} ml</span> para
            alcanzar tu meta
          </p>
        </div>
      )}

      <div className="px-4 mt-6">
        <h2 className="font-heading font-semibold text-carbon mb-3">Agregar agua</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ADD_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => addWater(opt.amount)}
              disabled={adding}
              className="bg-white border border-card-border rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-[0.95] transition-transform disabled:opacity-40"
            >
              <WaterDropIcon size={24} className="text-sage" />
              <span className="font-heading font-semibold text-sm text-carbon">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-carbon">Registro de hoy</h2>
          <span className="text-xs text-carbon/40">{logs.length} registros</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center">
            <WaterDropIcon size={32} className="text-carbon/15 mx-auto mb-2" />
            <p className="text-sm text-carbon/40">Aún no has registrado agua hoy</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-card-border rounded-2xl px-4 py-3 flex items-center justify-between animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
                    <WaterDropIcon size={16} className="text-sage" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-carbon">
                      {log.amount_ml} ml
                    </p>
                    <p className="text-[11px] text-carbon/40">
                      {formatTime(log.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeLog(log.id)}
                  className="text-carbon/25 hover:text-coral transition-colors p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
