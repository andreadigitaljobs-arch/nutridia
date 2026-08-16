import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { getMealTypeLabel } from '@/lib/constants'
import FoodAlternatives from '@/components/FoodAlternatives'
import {
  ChevronLeftIcon,
  HeartIcon,
  FlameIcon,
  SunIcon,
  MoonIcon,
  BowlIcon,
  EggIcon,
  WheatIcon,
  StrawberryIcon,
  CheckIcon,
  RefreshIcon,
  BookmarkIcon,
  LeafIcon,
  PlantIcon,
} from '@/components/Icons'

interface MealOptionItem {
  food_name: string
  category: string
  amount: string
  unit: string
}

interface MealOptionDetail {
  id: string
  name: string
  meal_type_id: string | null
  estimated_calories: number | null
  description: string | null
  preparation: string | null
  meal_option_items: MealOptionItem[]
}

function getCategoryIcon(category: string) {
  const lower = category.toLowerCase()
  if (lower.includes('prote')) return EggIcon
  if (lower.includes('carbo') || lower.includes('cereal') || lower.includes('grano')) return WheatIcon
  if (lower.includes('fruta')) return StrawberryIcon
  return BowlIcon
}

function getCategoryCircleClass(category: string) {
  const lower = category.toLowerCase()
  if (lower.includes('prote')) return 'bg-cream-dark text-sage'
  if (lower.includes('carbo') || lower.includes('cereal') || lower.includes('grano')) return 'bg-maize/30 text-amber-700'
  if (lower.includes('fruta')) return 'bg-coral/15 text-coral'
  return 'bg-sage/10 text-sage'
}

function getMealTypeIcon(mealType: string | null) {
  if (!mealType) return SunIcon
  const lower = mealType.toLowerCase()
  if (lower === 'desayuno' || lower === 'breakfast') return SunIcon
  if (lower === 'almuerzo' || lower === 'lunch') return BowlIcon
  if (lower === 'cena' || lower === 'dinner') return MoonIcon
  if (lower === 'merienda' || lower === 'snack') return PlantIcon
  return SunIcon
}

export default function MealDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [option, setOption] = useState<MealOptionDetail | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [selectedAlternative, setSelectedAlternative] = useState<{ foodName: string; alternative: string } | null>(null)

  const fetchOption = useCallback(async () => {
    if (!id) return
    setLoading(true)

    const { data } = await supabase
      .from('daily_menu_options')
      .select('*, meal_option_items(*)')
      .eq('id', id)
      .single()

    if (data) {
      setOption(data as MealOptionDetail)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchOption()
  }, [fetchOption])

  function showFeedback(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2000)
  }

  async function toggleFavorite() {
    if (!id || !option) return
    // Feature coming soon
  }

  async function handleChoose() {
    if (!option || !user) return
    const today = new Date().toISOString().split('T')[0]

    await supabase.from('meal_logs').insert({
      user_id: user.id,
      option_id: option.id,
      date: today,
      foods: option.meal_option_items,
      estimated_calories: option.estimated_calories,
      meal_type_id: null,
    })

    showFeedback('Comida registrada')
    setTimeout(() => navigate('/today'), 800)
  }

  async function handleSave() {
    if (!option || !user) return
    await supabase.from('collection_items').insert({
      user_id: user.id,
      option_id: option.id,
      status: 'to_try',
    })
    showFeedback('Guardado en tu colección')
  }

  async function handleDiscard() {
    if (!option || !user) return
    await supabase.from('meal_logs').insert({
      user_id: user.id,
      option_id: option.id,
      date: new Date().toISOString().split('T')[0],
      foods: option.meal_option_items,
      estimated_calories: option.estimated_calories,
      meal_type_id: null,
    })
    showFeedback('Opcion descartada')
  }

  if (loading || !option) {
    return (
      <div className="min-h-screen bg-cream pb-6">
        <div className="h-56 bg-cream-dark flex items-center justify-center">
          <BowlIcon className="text-sage/30" size={80} />
        </div>
        <div className="px-4 pt-4 space-y-4">
          <div className="h-6 w-24 bg-sage/10 rounded-full animate-pulse" />
          <div className="h-8 w-64 bg-carbon/5 rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-carbon/5 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-carbon/5 rounded animate-pulse" />
          <div className="h-24 bg-carbon/5 rounded-xl animate-pulse" />
          <div className="h-40 bg-carbon/5 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const TypeIcon = getMealTypeIcon(option.meal_type_id)

  return (
    <div className="min-h-screen bg-cream pb-32 animate-slide-in-right">
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-sage text-white px-5 py-3 rounded-xl font-medium text-sm shadow-lg">
          {feedback}
        </div>
      )}

      <div className="h-56 bg-cream-dark flex items-center justify-center relative rounded-b-2xl overflow-hidden">
        <div className="absolute top-12 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ChevronLeftIcon className="text-carbon" size={22} />
          </button>
          <img src="/brand/logo-horizontal.png" alt="NutriDia" className="w-28" />
          <button
            onClick={toggleFavorite}
            className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center"
          >
            <HeartIcon
              size={22}
              className="text-carbon/40"
            />
          </button>
        </div>
        <BowlIcon className="text-sage/20" size={100} />
      </div>

      <div className="px-4 -mt-4 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/10 text-sage text-xs font-medium mb-3">
          <TypeIcon size={14} />
          {getMealTypeLabel(option.meal_type_id)}
        </div>

        <h1 className="text-2xl font-bold text-carbon" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {option.name}
        </h1>

        <p className="text-sm text-carbon/60 mt-2 leading-relaxed">
          {option.description || 'Comida balanceada y deliciosa para tu día.'}
        </p>

        <div className="mt-4 flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
            <FlameIcon className="text-sage" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-carbon/50">Calorías estimadas</p>
            <p className="text-xl font-bold text-sage">{option.estimated_calories} kcal</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-carbon mt-6 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Ingredientes y porciones
        </h2>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {option.meal_option_items?.map((item: MealOptionItem, i: number) => {
            const IconComponent = getCategoryIcon(item.category)
            const circleClass = getCategoryCircleClass(item.category)
            const replaced = selectedAlternative?.foodName === item.food_name
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < (option.meal_option_items?.length ?? 0) - 1 ? 'border-b border-card-border' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${circleClass}`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-carbon">{item.category}</p>
                  <p className="text-xs text-carbon/50">{item.amount} {item.unit}</p>
                </div>
                {replaced ? (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-carbon/40 line-through">{item.food_name}</span>
                    <span className="text-sm font-semibold text-sage">{selectedAlternative.alternative}</span>
                  </div>
                ) : (
                  <p className="text-sm text-carbon/70 truncate">{item.food_name}</p>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => setShowAlternatives(true)}
          className="w-full mt-4 py-3 border-2 border-dashed border-sage/40 rounded-xl text-sage text-sm font-medium flex items-center justify-center gap-2 hover:bg-sage/5 transition-colors"
        >
          <LeafIcon size={18} />
          No tengo este alimento
        </button>

        <h2 className="text-lg font-semibold text-carbon mt-6 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Preparacion
        </h2>

        <div className="bg-sage/5 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-sage/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BowlIcon className="text-sage" size={20} />
          </div>
          <p className="text-sm text-carbon/70 leading-relaxed flex-1">
            {option.preparation}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-cream px-4 pt-3 pb-6 border-t border-card-border">
        <button
          onClick={handleChoose}
          className="w-full h-14 bg-sage text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <CheckIcon size={20} />
          Elegir esta
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full h-12 mt-2 border border-sage text-sage rounded-xl font-medium flex items-center justify-center gap-2 bg-transparent"
        >
          <RefreshIcon size={18} />
          Cambiar {option.meal_type_id === 'desayuno' ? 'carbohidrato' : 'opciones'}
        </button>

        <button
          onClick={handleSave}
          className="w-full h-12 mt-2 border border-sage text-sage rounded-xl font-medium flex items-center justify-center gap-2 bg-transparent"
        >
          <BookmarkIcon size={18} />
          Guardar
        </button>

        <button
          onClick={handleDiscard}
          className="w-full text-center text-coral text-sm font-medium py-2 mt-1"
        >
          No me provoca
        </button>
      {option.meal_option_items?.[0] && (
        <FoodAlternatives
          foodName={selectedAlternative?.foodName ?? option.meal_option_items[0].food_name}
          isOpen={showAlternatives}
          onClose={() => setShowAlternatives(false)}
          onSelect={(alt) => setSelectedAlternative({ foodName: option.meal_option_items![0].food_name, alternative: alt.alternative })}
        />
      )}
      </div>
    </div>
  )
}
