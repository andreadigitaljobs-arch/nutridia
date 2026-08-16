import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, SmartphoneIcon } from '@/components/Icons'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Skeleton from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { format } from 'date-fns'
import type { BodyAssessment } from '@/types/database'

export default function ProfileAssessments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [assessments, setAssessments] = useState<BodyAssessment[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    device: '',
    weight: '',
    bmi: '',
    body_fat_pct: '',
    muscle_mass_kg: '',
    visceral_fat: '',
    bone_mass_kg: '',
    water_pct: '',
    metabolic_age: '',
  })

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('body_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    setAssessments((data as BodyAssessment[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)

    await supabase.from('body_assessments').insert({
      user_id: user.id,
      date: form.date,
      device: form.device || null,
      weight_kg: form.weight ? parseFloat(form.weight) : null,
      bmi: form.bmi ? parseFloat(form.bmi) : null,
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      muscle_mass_kg: form.muscle_mass_kg ? parseFloat(form.muscle_mass_kg) : null,
      visceral_fat: form.visceral_fat ? parseFloat(form.visceral_fat) : null,
      bone_mass_kg: form.bone_mass_kg ? parseFloat(form.bone_mass_kg) : null,
      water_pct: form.water_pct ? parseFloat(form.water_pct) : null,
      metabolic_age: form.metabolic_age ? parseInt(form.metabolic_age) : null,
    })

    setModalOpen(false)
    setForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      device: '', weight: '', bmi: '', body_fat_pct: '',
      muscle_mass_kg: '', visceral_fat: '', bone_mass_kg: '',
      water_pct: '', metabolic_age: '',
    })
    fetchData()
    setSaving(false)
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id)
  }

  const detailFields = [
    { key: 'weight_kg', label: 'Peso', unit: 'kg' },
    { key: 'bmi', label: 'IMC', unit: '' },
    { key: 'body_fat_pct', label: 'Grasa corporal', unit: '%' },
    { key: 'muscle_mass_kg', label: 'Masa muscular', unit: 'kg' },
    { key: 'visceral_fat', label: 'Grasa visceral', unit: '' },
    { key: 'bone_mass_kg', label: 'Masa ósea', unit: 'kg' },
    { key: 'water_pct', label: 'Agua corporal', unit: '%' },
    { key: 'metabolic_age', label: 'Edad metabólica', unit: 'años' },
  ]

  return (
    <div className="min-h-screen bg-cream pb-6 px-4 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"
        >
          <ChevronLeftIcon className="h-5 w-5 text-carbon" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-carbon">Evaluaciones</h1>
          <p className="text-sm text-carbon/50 mt-0.5">Historial de evaluaciones corporales</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-10 h-10 rounded-xl bg-sage text-white flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <EmptyState
          title="Sin evaluaciones"
          description="Registra tu primera evaluación corporal para hacer seguimiento."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <PlusIcon className="h-4 w-4" /> Nueva evaluación
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <Card key={a.id}>
              <button
                onClick={() => toggleExpand(a.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-mint/40 flex items-center justify-center shrink-0">
                  <SmartphoneIcon className="h-5 w-5 text-sage" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-carbon">
                    {format(new Date(a.date), 'dd MMM yyyy')}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {a.weight_kg && (
                      <span className="text-xs text-carbon/50">{a.weight_kg} kg</span>
                    )}
                    {a.bmi && (
                      <span className="text-xs text-carbon/50">IMC {a.bmi}</span>
                    )}
                    {a.body_fat_pct && (
                      <span className="text-xs text-carbon/50">{a.body_fat_pct}% grasa</span>
                    )}
                  </div>
                </div>
                {expandedId === a.id ? (
                  <ChevronUpIcon className="h-4 w-4 text-carbon/30" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-carbon/30" />
                )}
              </button>

              {expandedId === a.id && (
                <div className="mt-4 pt-4 border-t border-mint/30 grid grid-cols-2 gap-3">
                  {a.device && (
                    <div className="col-span-2">
                      <p className="text-xs text-carbon/40">Dispositivo</p>
                      <p className="text-sm text-carbon">{a.device}</p>
                    </div>
                  )}
                  {detailFields.map(({ key, label, unit }) => {
                    const val = a[key as keyof BodyAssessment]
                    if (val === null || val === undefined) return null
                    return (
                      <div key={key}>
                        <p className="text-xs text-carbon/40">{label}</p>
                        <p className="text-sm font-medium text-carbon">
                          {String(val)} {unit}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva evaluación"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => updateForm('date', e.target.value)}
          />
          <Input
            label="Dispositivo"
            value={form.device}
            onChange={(e) => updateForm('device', e.target.value)}
            placeholder="Ej: Xiaomi Smart Scale"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Peso (kg)"
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => updateForm('weight', e.target.value)}
            />
            <Input
              label="IMC"
              type="number"
              step="0.1"
              value={form.bmi}
              onChange={(e) => updateForm('bmi', e.target.value)}
            />
            <Input
              label="Grasa corporal (%)"
              type="number"
              step="0.1"
              value={form.body_fat_pct}
              onChange={(e) => updateForm('body_fat_pct', e.target.value)}
            />
            <Input
              label="Masa muscular (kg)"
              type="number"
              step="0.1"
              value={form.muscle_mass_kg}
              onChange={(e) => updateForm('muscle_mass_kg', e.target.value)}
            />
            <Input
              label="Grasa visceral"
              type="number"
              value={form.visceral_fat}
              onChange={(e) => updateForm('visceral_fat', e.target.value)}
            />
            <Input
              label="Masa ósea (kg)"
              type="number"
              step="0.1"
              value={form.bone_mass_kg}
              onChange={(e) => updateForm('bone_mass_kg', e.target.value)}
            />
            <Input
              label="Agua corporal (%)"
              type="number"
              step="0.1"
              value={form.water_pct}
              onChange={(e) => updateForm('water_pct', e.target.value)}
            />
            <Input
              label="Edad metabólica"
              type="number"
              value={form.metabolic_age}
              onChange={(e) => updateForm('metabolic_age', e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSave} loading={saving} className="mt-4 w-full">
          Guardar evaluación
        </Button>
      </Modal>
    </div>
  )
}
