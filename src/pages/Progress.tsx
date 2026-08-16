import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import {
  BellIcon,
  PlusIcon,
  TrendingUpIcon,
  ScaleIcon,
  RulerIcon,
  WaterDropIcon,
  LeafIcon,
  LineChartIcon,
} from '@/components/Icons'
import Select from '@/components/Select'
import type { WeightHistory, HydrationLog, BodyAssessment } from '@/types/database'

const svgWidth = 340
const svgHeight = 200
const paddingLeft = 36
const paddingRight = 16
const paddingTop = 16
const paddingBottom = 28
const chartW = svgWidth - paddingLeft - paddingRight
const chartH = svgHeight - paddingTop - paddingBottom

export default function Progress() {
  const { user, nutritionPlan } = useAuth()
  const [weightEntries, setWeightEntries] = useState<WeightHistory[]>([])
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([])
  const [bodyAssessments, setBodyAssessments] = useState<BodyAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(30)

  useEffect(() => {
    if (!user) return
    setLoading(true)

    async function fetchAll() {
      setError(null)
      try {
        const [weightRes, waterRes, bodyRes] = await Promise.all([
          supabase
            .from('weight_history')
            .select('*')
            .eq('user_id', user!.id)
            .order('date', { ascending: true }),
          supabase
            .from('hydration_logs')
            .select('*')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('body_assessments')
            .select('*')
            .eq('user_id', user!.id)
            .order('date', { ascending: true }),
        ])

        if (weightRes.error) console.error('Error fetching weight:', weightRes.error)
        if (waterRes.error) console.error('Error fetching hydration:', waterRes.error)
        if (bodyRes.error) console.error('Error fetching body assessments:', bodyRes.error)

        if (weightRes.error || waterRes.error || bodyRes.error) {
          setError('No se pudieron cargar los datos de progreso.')
          setLoading(false)
          return
        }

        setWeightEntries((weightRes.data as WeightHistory[]) ?? [])
        setHydrationLogs((waterRes.data as HydrationLog[]) ?? [])
        setBodyAssessments((bodyRes.data as BodyAssessment[]) ?? [])
      } catch (err) {
        console.error('Unexpected error fetching progress:', err)
        setError('Ocurrió un error inesperado.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [user])

  const currentWeight =
    weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight_kg : null

  const filteredEntries = weightEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - timeRange)
    return entryDate >= cutoff
  })

  const firstWeight = weightEntries.length > 0 ? weightEntries[0].weight_kg : null

  const latestBody =
    bodyAssessments.length > 0 ? bodyAssessments[bodyAssessments.length - 1] : null

  const firstBody =
    bodyAssessments.length > 0 ? bodyAssessments[0] : null

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayWaterMl = hydrationLogs
    .filter((l) => l.date === todayStr)
    .reduce((sum, l) => sum + (l.amount_ml ?? 0), 0)
  const targetWater = nutritionPlan?.daily_water_target_ml ? nutritionPlan.daily_water_target_ml / 1000 : 2.6

  const weightDiff =
    currentWeight != null && firstWeight != null
      ? (currentWeight - firstWeight).toFixed(1)
      : null

  const bodyFat = latestBody?.body_fat_pct ?? null
  const firstBodyFat = firstBody?.body_fat_pct ?? null
  const bodyFatDiff =
    bodyFat != null && firstBodyFat != null
      ? (bodyFat - firstBodyFat).toFixed(1)
      : null

  const waterLiters = (todayWaterMl / 1000).toFixed(1)
  const waterPct = Math.min(100, Math.round((todayWaterMl / 1000 / targetWater) * 100))

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pb-4 px-4 pt-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-carbon/10 rounded" />
          <div className="h-64 bg-carbon/10 rounded-2xl" />
          <div className="h-40 bg-carbon/10 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream pb-4 px-4 pt-12 flex flex-col items-center justify-center">
        <p className="text-sm text-coral font-medium text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-sage text-white rounded-lg text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-4 animate-fade-in">
      <div className="px-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <img src="/brand/logo-horizontal.png" alt="Nutri Dia" className="w-32" />
          <div className="relative cursor-pointer" onClick={() => alert('Proximamente')}>
            <BellIcon size={24} className="text-carbon/60" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </div>
        </div>

        <h1 className="text-3xl font-heading font-bold text-carbon">Progreso</h1>
        <p className="text-sm text-carbon/50 mt-1">
          Tu constancia, tu transformación.
        </p>

        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              const w = prompt('Peso actual (kg):')
              if (w) {
                supabase
                  .from('weight_history')
                  .insert({ user_id: user!.id, weight_kg: Number(w), date: new Date().toISOString().split('T')[0] })
                  .then(() => window.location.reload())
              }
            }}
            className="flex items-center gap-1.5 bg-sage text-white rounded-full px-4 py-2 text-sm font-medium"
          >
            <PlusIcon size={16} />
            Registrar peso
          </button>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LineChartIcon size={20} className="text-carbon/60" />
              <span className="font-heading font-semibold text-carbon">Peso (kg)</span>
            </div>
            <Select
              value={String(timeRange)}
              onChange={(val) => setTimeRange(Number(val))}
              options={[
                { value: '7', label: 'Últimos 7 días' },
                { value: '30', label: 'Últimos 30 días' },
                { value: '90', label: 'Últimos 3 meses' },
                { value: '365', label: 'Último año' },
              ]}
              className="text-xs text-carbon/50 bg-transparent border border-carbon/10 rounded-lg px-2 py-1 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-sage" />
            <span className="text-xs text-carbon/50">Peso</span>
          </div>

          {(() => {
            const recentEntries = filteredEntries
              .slice(-6)
              .filter((e) => typeof e.weight_kg === 'number' && !isNaN(e.weight_kg))
            if (recentEntries.length < 2) {
              return (
                <div className="flex items-center justify-center h-40 text-sm text-carbon/40">
                  Registra tu peso para ver el grafico
                </div>
              )
            }

            const weights = recentEntries.map((e) => e.weight_kg)
            const minW = Math.min(...weights)
            const maxW = Math.max(...weights)
            const range = maxW - minW || 1
            const minV = minW - range * 0.15
            const maxV = maxW + range * 0.15
            const vRange = maxV - minV || 1

            function toX(i: number) {
              return paddingLeft + (i / (recentEntries.length - 1)) * chartW
            }

            function toY(val: number) {
              return paddingTop + ((maxV - (val || 0)) / vRange) * chartH
            }

            const step = Math.ceil(vRange / 4) || 1
            const yLabels = Array.from(
              { length: 5 },
              (_, i) => Math.round(minV + step * i)
            )

            const pathD = recentEntries
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i) || 0} ${toY(p.weight_kg) || 0}`)
              .join(' ')

            const last = recentEntries.length - 1
            const bottom = paddingTop + chartH
            const areaD = recentEntries.length > 0
              ? `${pathD} L ${toX(last) || 0} ${bottom} L ${toX(0) || 0} ${bottom} Z`
              : ''

            const fmtDate = (d: string) => {
              const dt = new Date(d + 'T00:00:00')
              return dt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
            }

            return (
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B8F71" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6B8F71" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {yLabels.map((val) => (
                  <g key={val}>
                    <line
                      x1={paddingLeft}
                      y1={toY(val)}
                      x2={svgWidth - paddingRight}
                      y2={toY(val)}
                      stroke="#2B2F2E"
                      strokeOpacity={0.06}
                      strokeWidth={1}
                    />
                    <text
                      x={paddingLeft - 6}
                      y={toY(val) + 4}
                      textAnchor="end"
                      fontSize={10}
                      fill="#2B2F2E"
                      opacity={0.4}
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {areaD && <path d={areaD} fill="url(#greenGrad)" />}

                <path d={pathD} fill="none" stroke="#6B8F71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

                {recentEntries.map((p, i) => (
                  <circle key={i} cx={toX(i) || 0} cy={toY(p.weight_kg) || 0} r={4} fill="#6B8F71" />
                ))}

                <text
                  x={toX(0) || 0}
                  y={(toY(recentEntries[0].weight_kg) || 0) - 10}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="bold"
                  fill="#6B8F71"
                >
                  {recentEntries[0].weight_kg}
                </text>
                <text
                  x={toX(last) || 0}
                  y={(toY(recentEntries[last].weight_kg) || 0) - 10}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="bold"
                  fill="#6B8F71"
                >
                  {recentEntries[last].weight_kg}
                </text>

                {recentEntries.map((p, i) => (
                  <text
                    key={`lbl-${i}`}
                    x={toX(i) || 0}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#2B2F2E"
                    opacity={0.4}
                  >
                    {fmtDate(p.date)}
                  </text>
                ))}
              </svg>
            )
          })()}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <ScaleIcon size={20} className="text-sage" />
            </div>
            <div>
              <p className="text-xs text-carbon/50">Peso actual</p>
              <p className="text-2xl font-heading font-bold text-carbon">
                {currentWeight != null ? `${currentWeight} kg` : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUpIcon size={14} className="text-sage" />
            <span className="text-sm text-sage">
              {weightDiff != null ? `${weightDiff} kg desde el inicio` : 'Sin datos suficientes'}
            </span>
          </div>
          {weightDiff != null && parseFloat(weightDiff) < 0 && (
            <span className="inline-flex items-center gap-1 bg-sage/10 text-sage text-xs font-medium px-3 py-1 rounded-full">
              <TrendingUpIcon size={12} />
              Vas muy bien!
            </span>
          )}
          {weightDiff == null && (
            <span className="inline-flex items-center gap-1 bg-sage/10 text-sage text-xs font-medium px-3 py-1 rounded-full">
              Comienza a registrar tu peso
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <RulerIcon size={20} className="text-amber-700" />
            </div>
            <div>
              <p className="text-xs text-carbon/50">Grasa corporal</p>
              <p className="text-2xl font-heading font-bold text-carbon">
                {bodyFat != null ? `${bodyFat} %` : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUpIcon size={14} className="text-sage" />
            <span className="text-sm text-sage">
              {bodyFatDiff != null
                ? `${bodyFatDiff} % desde el inicio`
                : 'Sin datos suficientes'}
            </span>
          </div>
          <div className="relative h-3 bg-carbon/5 rounded-full overflow-hidden mb-1">
            <div className="absolute left-0 top-0 h-full bg-sage rounded-full" style={{ width: `${Math.min(100, ((bodyFat ?? 25) / 30) * 100)}%` }} />
            <div className="absolute left-[66.6%] top-0 h-full w-px bg-carbon/20" />
          </div>
          <p className="text-xs text-carbon/40">Rango saludable 20% - 30%</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
              <WaterDropIcon size={20} className="text-sage" />
            </div>
            <div>
              <p className="text-xs text-carbon/50">Hidratación diaria</p>
              <p className="text-2xl font-heading font-bold text-carbon">
                {waterLiters} / {targetWater} L
              </p>
            </div>
          </div>
          <p className="text-sm text-sage mb-2">{waterPct}% del objetivo</p>
          <div className="relative h-2.5 bg-carbon/5 rounded-full overflow-hidden mb-2">
            <div
              className="absolute left-0 top-0 h-full bg-sage rounded-full transition-all"
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <span className="inline-flex items-center gap-1 bg-sage/10 text-sage text-xs font-medium px-3 py-1 rounded-full">
            <WaterDropIcon size={12} />
            Sigue asi!
          </span>
        </div>
      </div>

      <div className="px-4 mt-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
            <LeafIcon size={20} className="text-sage" />
          </div>
          <p className="text-sm text-carbon/60 leading-relaxed">
            Pequeños pasos cada día{' '}
            <span className="text-carbon font-bold">grandes cambios para siempre.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
