import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { MEAL_TYPES } from '@/lib/constants'
import { getToday } from '@/utils/date'
import { logMeal } from '@/services/mealLogService'
import { BookmarkIcon, SunIcon, BowlIcon, MoonIcon, PlantIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ZapIcon } from '@/components/Icons'

interface FrequentMeal {
  id: string
  name: string
  meal_type: string
  foods: Record<string, { name: string; calories: number; protein?: number; carbs?: number; fat?: number }>
  estimated_calories: number
}

const DEFAULT_MEALS: FrequentMeal[] = [
  {
    id: 'default-breakfast',
    name: 'Desayuno rápido',
    meal_type: 'breakfast',
    foods: {
      huevos: { name: '2 huevos', calories: 140, protein: 12 },
      pan: { name: '1 pan integral', calories: 80, carbs: 15 },
      naranja: { name: '1 naranja', calories: 60, carbs: 15 },
    },
    estimated_calories: 280,
  },
  {
    id: 'default-lunch',
    name: 'Almuerzo completo',
    meal_type: 'lunch',
    foods: {
      pollo: { name: '4 porciones pollo', calories: 200, protein: 35 },
      arroz: { name: '1 arroz', calories: 150, carbs: 30 },
      aguacate: { name: 'Aguacate', calories: 120, fat: 10 },
    },
    estimated_calories: 470,
  },
  {
    id: 'default-snack',
    name: 'Merienda ligera',
    meal_type: 'snack',
    foods: {
      requeson: { name: '2 requeson', calories: 140, protein: 14 },
      galleta: { name: '1 galleta arroz', calories: 35, carbs: 7 },
    },
    estimated_calories: 175,
  },
  {
    id: 'default-dinner',
    name: 'Cena ligera',
    meal_type: 'dinner',
    foods: {
      pescado: { name: '4 porciones pescado', calories: 180, protein: 30 },
      ensalada: { name: 'Ensalada', calories: 40, carbs: 8 },
    },
    estimated_calories: 220,
  },
]

const STORAGE_KEY = 'nutridia_frequent_meals'

const mealIconMap: Record<string, typeof SunIcon> = {
  breakfast: SunIcon,
  lunch: BowlIcon,
  snack: PlantIcon,
  dinner: MoonIcon,
}

const mealBgMap: Record<string, string> = {
  breakfast: 'bg-cream-dark',
  lunch: 'bg-mint-light',
  snack: 'bg-mint-light',
  dinner: 'bg-[#FFF3D6]',
}

const mealColorMap: Record<string, string> = {
  breakfast: 'text-coral',
  lunch: 'text-sage',
  snack: 'text-sage',
  dinner: 'text-[#C4930A]',
}

function getStoredMeals(): FrequentMeal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return DEFAULT_MEALS
}

function saveStoredMeals(meals: FrequentMeal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals))
}

export default function QuickMeals() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [meals, setMeals] = useState<FrequentMeal[]>(getStoredMeals)
  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [newMealName, setNewMealName] = useState('')
  const [selectedMealType, setSelectedMealType] = useState('breakfast')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    saveStoredMeals(meals)
  }, [meals])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleLogMeal = async (meal: FrequentMeal) => {
    if (!user) return
    setLoggingId(meal.id)

    try {
      const now = new Date()
      const timeStr = now.toTimeString().slice(0, 5)
      const todayStr = getToday()
      const mealTypeRecord = MEAL_TYPES.find(mt => mt.name === meal.meal_type)

      await logMeal(user.id, {
        meal_type_id: mealTypeRecord?.id ?? MEAL_TYPES[0].id,
        date: todayStr,
        time: timeStr,
        foods: meal.foods,
        estimated_calories: meal.estimated_calories,
        notes: `Comida rápida: ${meal.name}`,
      })

      showToast(`${meal.name} registrada`)
    } catch (err) {
      console.error('Error logging meal:', err)
      showToast('Error al registrar')
    } finally {
      setLoggingId(null)
    }
  }

  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  const handleSaveMeal = () => {
    if (!newMealName.trim()) return

    const newMeal: FrequentMeal = {
      id: `custom-${Date.now()}`,
      name: newMealName.trim(),
      meal_type: selectedMealType,
      foods: {},
      estimated_calories: 0,
    }

    setMeals(prev => [...prev, newMeal])
    setNewMealName('')
    setShowSaveModal(false)
    showToast('Comida guardada')
  }

  const groupedMeals = MEAL_TYPES.map(mt => ({
    ...mt,
    meals: meals.filter(m => m.meal_type === mt.name),
  }))

  return (
    <div className="min-h-screen bg-cream pb-4 animate-fade-in">
      <header className="bg-white border-b border-card-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-mint-light flex items-center justify-center text-sage shrink-0"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-xl font-bold text-carbon">Comidas Rápidas</h1>
            <p className="text-xs text-carbon/45">Registra en un toque</p>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-sage shrink-0"
          >
            <PlusIcon size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div className="bg-sage/5 rounded-2xl p-4 flex items-start gap-3">
          <BookmarkIcon size={20} className="text-sage mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-carbon">Mis comidas frecuentes</p>
            <p className="text-xs text-carbon/50 mt-0.5">
              Toca para registrar al instante. Guarda tus favoritas.
            </p>
          </div>
        </div>

        {groupedMeals.map(group => {
          const IconComponent = mealIconMap[group.name] ?? SunIcon
          const bg = mealBgMap[group.name] ?? 'bg-mint-light'
          const color = mealColorMap[group.name] ?? 'text-sage'

          if (group.meals.length === 0) return null

          return (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                  <IconComponent size={16} />
                </div>
                <h2 className="font-heading text-sm font-semibold text-carbon">{group.display_name}</h2>
              </div>
              <div className="space-y-2">
                {group.meals.map(meal => {
                  const isLogging = loggingId === meal.id
                  return (
                    <button
                      key={meal.id}
                      onClick={() => handleLogMeal(meal)}
                      disabled={isLogging}
                      className="w-full bg-white rounded-2xl p-4 border border-card-border text-left active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
                          {isLogging ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ZapIcon size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-sm text-carbon">{meal.name}</p>
                          <p className="text-xs text-carbon/45 mt-0.5 truncate">
                            {Object.values(meal.foods).map(f => f.name).join(' + ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-sage">{meal.estimated_calories} kcal</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id) }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-carbon/25 hover:text-coral transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {meals.length === 0 && (
          <div className="text-center py-12">
            <BookmarkIcon size={40} className="text-carbon/15 mx-auto mb-3" />
            <p className="text-sm text-carbon/40">No tienes comidas guardadas</p>
            <p className="text-xs text-carbon/30 mt-1">Usa el + para agregar una</p>
          </div>
        )}
      </main>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowSaveModal(false)}>
          <div className="absolute inset-0 bg-carbon/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-semibold text-carbon mb-4">Nueva comida rápida</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1.5 block">Nombre</label>
                <input
                  type="text"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder="Ej: Mi desayuno favorito"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60 mb-1.5 block">Tipo de comida</label>
                <div className="grid grid-cols-2 gap-2">
                  {MEAL_TYPES.map(mt => (
                    <button
                      key={mt.id}
                      onClick={() => setSelectedMealType(mt.name)}
                      className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        selectedMealType === mt.name
                          ? 'border-sage bg-sage/10 text-sage'
                          : 'border-card-border bg-white text-carbon/60'
                      }`}
                    >
                      {mt.display_name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 h-12 rounded-xl border-2 border-card-border text-carbon/60 font-medium text-sm hover:bg-carbon/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveMeal}
                  disabled={!newMealName.trim()}
                  className="flex-1 h-12 rounded-xl bg-sage text-white font-medium text-sm disabled:opacity-50 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-carbon text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
