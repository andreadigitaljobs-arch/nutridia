import { useState, useEffect } from 'react'
import { findFoodAlternatives, type FoodAlternative } from '@/lib/ai'
import { useAuth } from '@/providers/AuthProvider'
import Modal from '@/components/Modal'

interface FoodAlternativesProps {
  foodName: string
  isOpen: boolean
  onClose: () => void
  onSelect: (alt: FoodAlternative) => void
}

export default function FoodAlternatives({ foodName, isOpen, onClose, onSelect }: FoodAlternativesProps) {
  const { profile } = useAuth()
  const [alternatives, setAlternatives] = useState<FoodAlternative[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !foodName) return
    setLoading(true)
    setAlternatives([])

    const allowedFoods = profile?.name ? [] : []
    findFoodAlternatives(foodName, allowedFoods)
      .then((alts) => setAlternatives(alts))
      .catch(() => setAlternatives([]))
      .finally(() => setLoading(false))
  }, [isOpen, foodName, profile])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Alternativas para ${foodName}`}>
      <div className="space-y-3">
        {loading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-carbon/50 mt-3">Buscando alternativas...</p>
          </div>
        ) : alternatives.length === 0 ? (
          <p className="text-sm text-carbon/50 text-center py-4">No se encontraron alternativas</p>
        ) : (
          alternatives.map((alt, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(alt)
                onClose()
              }}
              className="w-full bg-cream rounded-xl p-4 text-left active:scale-[0.98] transition-transform hover:bg-cream-dark"
            >
              <p className="font-heading font-semibold text-sm text-carbon">{alt.alternative}</p>
              <p className="text-xs text-carbon/50 mt-1">{alt.reason}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sage/10 text-sage">
                  {alt.calories} kcal
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-coral/10 text-coral">
                  P: {alt.protein}g
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </Modal>
  )
}
