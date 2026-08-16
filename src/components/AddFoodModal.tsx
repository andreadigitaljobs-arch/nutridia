import { useState } from 'react'
import Modal from './Modal'
import { PlusIcon, LoaderIcon, CheckIcon } from './Icons'
import { estimateNutrition, type NutritionEstimate } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import { FOOD_CATEGORIES } from '@/lib/constants'

interface AddFoodModalProps {
  isOpen: boolean
  onClose: () => void
  onFoodAdded: () => void
}

export default function AddFoodModal({ isOpen, onClose, onFoodAdded }: AddFoodModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [estimating, setEstimating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [estimate, setEstimate] = useState<NutritionEstimate | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleEstimate() {
    if (!name.trim()) return
    setEstimating(true)
    setError('')
    try {
      const result = await estimateNutrition(name.trim())
      if (result) {
        setEstimate(result)
        if (!category) {
          const matched = FOOD_CATEGORIES.find(c =>
            result.name.toLowerCase().includes(c.name) ||
            c.display_name.toLowerCase().includes(result.name.toLowerCase())
          )
          if (matched) setCategory(matched.name)
        }
      } else {
        setError('No se pudo estimar. Intenta con otro nombre.')
      }
    } catch {
      setError('Error al conectar con la IA.')
    } finally {
      setEstimating(false)
    }
  }

  async function handleSave() {
    if (!estimate) return
    setSaving(true)
    setError('')
    try {
      const { error: insertError } = await supabase.from('foods').insert({
        name: estimate.name || name.trim(),
        category_id: FOOD_CATEGORIES.find(c => c.name === category)?.id || null,
        default_unit: estimate.default_unit || 'g',
        calories_per_100g: estimate.calories,
        protein_per_100g: estimate.protein,
        carbs_per_100g: estimate.carbs,
        fat_per_100g: estimate.fat,
      })
      if (insertError) throw insertError
      setSuccess(true)
      setTimeout(() => {
        onFoodAdded()
        handleClose()
      }, 1200)
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setName('')
    setCategory('')
    setEstimate(null)
    setError('')
    setSuccess(false)
    setEstimating(false)
    setSaving(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-5">
        {success ? (
          <div className="flex flex-col items-center py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <CheckIcon className="text-sage" size={32} />
            </div>
            <p className="text-lg font-heading font-semibold text-carbon">Alimento guardado</p>
            <p className="text-sm text-carbon/50 mt-1">{estimate?.name || name}</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-heading font-bold text-carbon mb-4">Agregar alimento</h2>

            <label className="block text-sm font-medium text-carbon/70 mb-1.5">Nombre del alimento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setEstimate(null) }}
              placeholder="Ej: Quinoa, Tofu, Aguacate..."
              className="w-full bg-white border border-card-border rounded-xl px-4 py-3 text-sm text-carbon placeholder:text-carbon/30 focus:outline-none focus:border-sage transition-colors"
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim() && !estimate) handleEstimate() }}
            />

            <label className="block text-sm font-medium text-carbon/70 mb-1.5 mt-4">Categoria</label>
            <div className="grid grid-cols-3 gap-1.5">
              {FOOD_CATEGORIES.map(c => (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name)}
                  className={`py-2 text-[11px] font-medium rounded-xl transition-all ${
                    category === c.name
                      ? 'bg-sage text-white'
                      : 'bg-cream-dark text-carbon/50 border border-card-border'
                  }`}
                >
                  {c.display_name}
                </button>
              ))}
            </div>

            {!estimate ? (
              <button
                onClick={handleEstimate}
                disabled={!name.trim() || estimating}
                className="w-full mt-5 bg-sage text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {estimating ? (
                  <><LoaderIcon size={18} className="animate-spin" /> Calculando...</>
                ) : (
                  <><PlusIcon size={18} /> Calcular con IA</>
                )}
              </button>
            ) : (
              <div className="mt-5 animate-slide-up">
                <div className="bg-cream rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-carbon">{estimate.name}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-coral">{estimate.calories}</p>
                      <p className="text-[10px] text-carbon/50">kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-sage">{estimate.protein}g</p>
                      <p className="text-[10px] text-carbon/50">Proteina</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-maize">{estimate.carbs}g</p>
                      <p className="text-[10px] text-carbon/50">Carbos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-coral">{estimate.fat}g</p>
                      <p className="text-[10px] text-carbon/50">Grasa</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-carbon/40">Valores por 100{estimate.default_unit || 'g'}</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-3 bg-sage text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  {saving ? (
                    <><LoaderIcon size={18} className="animate-spin" /> Guardando...</>
                  ) : (
                    'Guardar alimento'
                  )}
                </button>

                <button
                  onClick={() => setEstimate(null)}
                  className="w-full mt-2 text-sm text-carbon/50 py-2"
                >
                  Modificar
                </button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 mt-3 text-center">{error}</p>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
