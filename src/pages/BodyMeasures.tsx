import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/Modal'
import { PlusIcon, ScaleIcon } from '@/components/Icons'
import type { BodyAssessment } from '@/types'

const svgWidth = 340
const svgHeight = 180
const paddingLeft = 36
const paddingRight = 16
const paddingTop = 16
const paddingBottom = 28
const chartW = svgWidth - paddingLeft - paddingRight
const chartH = svgHeight - paddingTop - paddingBottom

interface FormData {
  weight_kg: string
  body_fat_pct: string
  visceral_fat: string
  muscle_mass_kg: string
  water_pct: string
  metabolic_age: string
}

const emptyForm: FormData = {
  weight_kg: '',
  body_fat_pct: '',
  visceral_fat: '',
  muscle_mass_kg: '',
  water_pct: '',
  metabolic_age: '',
}

export default function BodyMeasures() {
  const { user } = useAuth()
  const [measures, setMeasures] = useState<BodyAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('body_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .then(({ data }) => {
        setMeasures((data as BodyAssessment[]) ?? [])
        setLoading(false)
      })
  }, [user])

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('body_assessments').insert({
      user_id: user.id,
      date: today,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      body_fat_pct: form.body_fat_pct ? Number(form.body_fat_pct) : null,
      visceral_fat: form.visceral_fat ? Number(form.visceral_fat) : null,
      muscle_mass_kg: form.muscle_mass_kg ? Number(form.muscle_mass_kg) : null,
      water_pct: form.water_pct ? Number(form.water_pct) : null,
      metabolic_age: form.metabolic_age ? Number(form.metabolic_age) : null,
    })
    const { data } = await supabase
      .from('body_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    setMeasures((data as BodyAssessment[]) ?? [])
    setForm(emptyForm)
    setShowModal(false)
    setSaving(false)
  }

  const weightData = measures
    .filter((m) => typeof m.weight_kg === 'number' && m.weight_kg !== null)
    .slice(-10)

  return (
    <div className="min-h-screen bg-cream pb-4 px-4 pt-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <img src="/brand/logo-horizontal.png" alt="Nutri Dia" className="w-32" />
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
          <ScaleIcon className="text-sage" size={22} />
        </div>
      </div>

      <h1 className="text-3xl font-heading font-bold text-carbon">Medidas Corporales</h1>
      <p className="text-sm text-carbon/50 mt-1">Tu historial de composicion corporal.</p>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-sage text-white rounded-full px-4 py-2 text-sm font-medium"
        >
          <PlusIcon size={16} />
          Agregar medida
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mt-6">
        <p className="font-heading font-semibold text-carbon mb-3">Peso (kg)</p>
        {weightData.length < 2 ? (
          <div className="flex items-center justify-center h-40 text-sm text-carbon/40">
            Registra al menos 2 medidas para ver el grafico
          </div>
        ) : (() => {
          const weights = weightData.map((m) => m.weight_kg as number)
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
            .map((m, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(m.weight_kg as number)}`)
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
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
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
              <path d={areaD} fill="url(#weightGrad)" />
              <path d={pathD} fill="none" stroke="#6B8F71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {weightData.map((m, i) => (
                <circle key={i} cx={toX(i)} cy={toY(m.weight_kg as number)} r={4} fill="#6B8F71" />
              ))}
              {weightData.map((m, i) => (
                <text key={`lbl-${i}`} x={toX(i)} y={svgHeight - 6} textAnchor="middle" fontSize={9} fill="#2B2F2E" opacity={0.4}>{fmtDate(m.date)}</text>
              ))}
            </svg>
          )
        })()}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : measures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-carbon/40">No hay medidas registradas aun</p>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {[...measures].reverse().map((m) => (
              <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-heading font-semibold text-sm text-carbon">{m.date}</p>
                  {m.weight_kg != null && (
                    <span className="text-sm font-bold text-sage">{m.weight_kg} kg</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.body_fat_pct != null && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-coral/10 text-coral">Grasa: {m.body_fat_pct}%</span>
                  )}
                  {m.visceral_fat != null && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700">Visceral: {m.visceral_fat}</span>
                  )}
                  {m.muscle_mass_kg != null && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sage/10 text-sage">Musculo: {m.muscle_mass_kg} kg</span>
                  )}
                  {m.water_pct != null && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-600">Agua: {m.water_pct}%</span>
                  )}
                  {m.metabolic_age != null && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-maize/20 text-[#B8860B]">Edad metab.: {m.metabolic_age}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva medida">
        <div className="space-y-4">
          {[
            { key: 'weight_kg' as const, label: 'Peso (kg)', placeholder: '70.5' },
            { key: 'body_fat_pct' as const, label: 'Grasa corporal (%)', placeholder: '22.5' },
            { key: 'visceral_fat' as const, label: 'Grasa visceral', placeholder: '8' },
            { key: 'muscle_mass_kg' as const, label: 'Masa muscular (kg)', placeholder: '32.0' },
            { key: 'water_pct' as const, label: 'Agua corporal (%)', placeholder: '55.0' },
            { key: 'metabolic_age' as const, label: 'Edad metabolica', placeholder: '28' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-carbon/60 mb-1">{field.label}</label>
              <input
                type="number"
                step="any"
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-card-border rounded-xl px-3 py-2.5 text-sm text-carbon bg-cream outline-none focus:border-sage"
              />
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-sage text-white rounded-xl py-3 text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </Modal>
    </div>
  )
}
