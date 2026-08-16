import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { PrinterIcon, ScaleIcon } from '@/components/Icons'
import type { NutritionPlan, WeightHistory, BodyAssessment } from '@/types'

const svgWidth = 500
const svgHeight = 180
const paddingLeft = 40
const paddingRight = 16
const paddingTop = 16
const paddingBottom = 28
const chartW = svgWidth - paddingLeft - paddingRight
const chartH = svgHeight - paddingTop - paddingBottom

export default function NutritionistReport() {
  const { user, profile, nutritionPlan } = useAuth()
  const [weightEntries, setWeightEntries] = useState<WeightHistory[]>([])
  const [bodyAssessments, setBodyAssessments] = useState<BodyAssessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchAll() {
      const [weightRes, bodyRes] = await Promise.all([
        supabase
          .from('weight_history')
          .select('*')
          .eq('user_id', user!.id)
          .order('date', { ascending: true }),
        supabase
          .from('body_assessments')
          .select('*')
          .eq('user_id', user!.id)
          .order('date', { ascending: true }),
      ])
      setWeightEntries((weightRes.data as WeightHistory[]) ?? [])
      setBodyAssessments((bodyRes.data as BodyAssessment[]) ?? [])
      setLoading(false)
    }
    fetchAll()
  }, [user])

  const weightData = weightEntries
    .filter((e) => typeof e.weight_kg === 'number')
    .slice(-12)

  const latestBody = bodyAssessments.length > 0 ? bodyAssessments[bodyAssessments.length - 1] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pb-4 px-4 pt-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-carbon/10 rounded" />
          <div className="h-48 bg-carbon/10 rounded-2xl" />
          <div className="h-32 bg-carbon/10 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-4 px-4 pt-12 animate-fade-in print:bg-white">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex items-center justify-between mb-6 no-print">
        <h1 className="text-3xl font-heading font-bold text-carbon">Reporte Nutricional</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-sage text-white rounded-full px-4 py-2 text-sm font-medium"
        >
          <PrinterIcon size={16} />
          Imprimir
        </button>
      </div>

      <div className="print-area space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-carbon mb-3">Perfil</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-carbon/50">Nombre</p>
              <p className="font-medium text-carbon">{profile?.name || '—'}</p>
            </div>
            <div>
              <p className="text-carbon/50">Peso actual</p>
              <p className="font-medium text-carbon">{profile?.current_weight_kg ? `${profile.current_weight_kg} kg` : '—'}</p>
            </div>
            <div>
              <p className="text-carbon/50">Altura</p>
              <p className="font-medium text-carbon">{profile?.height_cm ? `${profile.height_cm} cm` : '—'}</p>
            </div>
            <div>
              <p className="text-carbon/50">Genero</p>
              <p className="font-medium text-carbon">{profile?.gender || '—'}</p>
            </div>
          </div>
        </div>

        {nutritionPlan && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-carbon mb-3">Plan Activo</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-carbon/50">Nombre</p>
                <p className="font-medium text-carbon">{nutritionPlan.name}</p>
              </div>
              <div>
                <p className="text-carbon/50">Calorias diarias</p>
                <p className="font-medium text-carbon">{nutritionPlan.daily_calorie_target ?? '—'} kcal</p>
              </div>
              <div>
                <p className="text-carbon/50">Agua diaria</p>
                <p className="font-medium text-carbon">{nutritionPlan.daily_water_target_ml ? `${nutritionPlan.daily_water_target_ml / 1000} L` : '—'}</p>
              </div>
              <div>
                <p className="text-carbon/50">Estado</p>
                <p className="font-medium text-carbon capitalize">{nutritionPlan.status}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-carbon mb-3">Historial de Peso</h2>
          {weightData.length < 2 ? (
            <p className="text-sm text-carbon/40 py-4 text-center">No hay datos suficientes</p>
          ) : (() => {
            const weights = weightData.map((e) => e.weight_kg)
            const minW = Math.min(...weights)
            const maxW = Math.max(...weights)
            const range = maxW - minW || 1
            const minV = minW - range * 0.15
            const maxV = maxW + range * 0.15
            const vRange = maxV - minV || 1

            function toX(i: number) {
              return paddingLeft + (i / (weightData.length - 1)) * chartW
            }
            function toY(val: number) {
              return paddingTop + ((maxV - val) / vRange) * chartH
            }

            const pathD = weightData
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.weight_kg)}`)
              .join(' ')

            const last = weightData.length - 1
            const bottom = paddingTop + chartH
            const areaD = `${pathD} L ${toX(last)} ${bottom} L ${toX(0)} ${bottom} Z`

            const fmtDate = (d: string) =>
              new Date(d + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

            const step = Math.ceil(vRange / 4) || 1
            const yLabels = Array.from({ length: 5 }, (_, i) => Math.round(minV + step * i))

            return (
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full">
                <defs>
                  <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B8F71" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6B8F71" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {yLabels.map((val) => (
                  <g key={val}>
                    <line x1={paddingLeft} y1={toY(val)} x2={svgWidth - paddingRight} y2={toY(val)} stroke="#2B2F2E" strokeOpacity={0.06} strokeWidth={1} />
                    <text x={paddingLeft - 6} y={toY(val) + 4} textAnchor="end" fontSize={10} fill="#2B2F2E" opacity={0.4}>{val}</text>
                  </g>
                ))}
                <path d={areaD} fill="url(#reportGrad)" />
                <path d={pathD} fill="none" stroke="#6B8F71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {weightData.map((p, i) => (
                  <circle key={i} cx={toX(i)} cy={toY(p.weight_kg)} r={3.5} fill="#6B8F71" />
                ))}
                <text x={toX(0)} y={toY(weightData[0].weight_kg) - 10} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#6B8F71">{weightData[0].weight_kg}</text>
                <text x={toX(last)} y={toY(weightData[last].weight_kg) - 10} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#6B8F71">{weightData[last].weight_kg}</text>
                {weightData.map((p, i) => (
                  <text key={`lbl-${i}`} x={toX(i)} y={svgHeight - 6} textAnchor="middle" fontSize={9} fill="#2B2F2E" opacity={0.4}>{fmtDate(p.date)}</text>
                ))}
              </svg>
            )
          })()}
        </div>

        {bodyAssessments.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-carbon mb-3">Medidas Corporales</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-carbon/50 text-xs">
                    <th className="pb-2 pr-4">Fecha</th>
                    <th className="pb-2 pr-4">Peso</th>
                    <th className="pb-2 pr-4">Grasa %</th>
                    <th className="pb-2 pr-4">Musculo</th>
                    <th className="pb-2">Agua %</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyAssessments.map((b) => (
                    <tr key={b.id} className="border-t border-card-border">
                      <td className="py-2 pr-4 text-carbon">{b.date}</td>
                      <td className="py-2 pr-4 text-carbon">{b.weight_kg ?? '—'} kg</td>
                      <td className="py-2 pr-4 text-carbon">{b.body_fat_pct ?? '—'}%</td>
                      <td className="py-2 pr-4 text-carbon">{b.muscle_mass_kg ?? '—'} kg</td>
                      <td className="py-2 text-carbon">{b.water_pct ?? '—'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-carbon/30 py-4">
          Reporte generado el {new Date().toLocaleDateString('es-MX')} - NutriDIA
        </div>
      </div>
    </div>
  )
}
