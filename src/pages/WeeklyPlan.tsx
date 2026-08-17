import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { generateWeeklyMealPlan, generateShoppingList, type WeeklyMealPlan, type ShoppingItem } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/Modal'
import {
  FlameIcon,
  SunIcon,
  MoonIcon,
  PlantIcon,
  BowlIcon,
  ClipboardIcon,
  RefreshIcon,
  ChevronRightIcon,
  BellIcon,
} from '@/components/Icons'

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'] as const

const MEAL_ICONS: Record<string, typeof SunIcon> = {
  Desayuno: SunIcon,
  Almuerzo: BowlIcon,
  Merienda: PlantIcon,
  Cena: MoonIcon,
}

const MEAL_BG: Record<string, string> = {
  Desayuno: 'bg-cream-dark',
  Almuerzo: 'bg-mint-light',
  Merienda: 'bg-mint-light',
  Cena: 'bg-[#FFF3D6]',
}

const MEAL_COLOR: Record<string, string> = {
  Desayuno: 'text-coral',
  Almuerzo: 'text-sage',
  Merienda: 'text-sage',
  Cena: 'text-[#C4930A]',
}

const STORAGE_KEY = 'nutridia_weekly_plan'

function loadPlan(): WeeklyMealPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePlan(plan: WeeklyMealPlan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
}

export default function WeeklyPlan() {
  const { user, profile, nutritionPlan } = useAuth()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  const [showShoppingModal, setShowShoppingModal] = useState(false)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [shoppingLoading, setShoppingLoading] = useState(false)

  const calorieTarget = nutritionPlan?.daily_calorie_target ?? 2000

  useEffect(() => {
    const saved = loadPlan()
    if (saved) setPlan(saved)
  }, [])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      let allowedFoods: string[] = []
      if (user) {
        const { data } = await supabase
          .from('preferred_foods')
          .select('food_name')
          .eq('user_id', user.id)
        allowedFoods = (data ?? []).map((f: { food_name: string }) => f.food_name)
      }

      const result = await generateWeeklyMealPlan(calorieTarget, allowedFoods)
      if (result) {
        setPlan(result)
        savePlan(result)
        setSelectedDay(0)
      } else {
        setError('No se pudo generar el plan. Intenta de nuevo.')
      }
    } catch {
      setError('Ocurrió un error al generar el plan.')
    } finally {
      setLoading(false)
    }
  }

  const handleShoppingList = async () => {
    if (!plan) return
    setShoppingLoading(true)
    setShowShoppingModal(true)
    try {
      const items = await generateShoppingList(plan)
      setShoppingList(items)
    } catch {
      setShoppingList([])
    } finally {
      setShoppingLoading(false)
    }
  }

  const selectedDayData = plan?.days[selectedDay] ?? null

  return (
    <div className="min-h-screen bg-cream pb-4 animate-fade-in">
      <header className="bg-cream border-b border-card-border/50 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <img src="/brand/logo-horizontal.png" alt="NutriDia" className="w-32" />
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-sage"
          >
            <BellIcon size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <h1 className="font-heading text-3xl font-bold text-carbon">Plan semanal</h1>
          <p className="text-sm text-carbon/50 mt-1">
            Tu menú personalizado para toda la semana.
          </p>
        </div>

        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-sage text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-3 font-heading font-semibold text-base active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando plan...
              </>
            ) : plan ? (
              <>
                <RefreshIcon size={20} />
                Generar plan semanal
              </>
            ) : (
              <>
                <SunIcon size={20} />
                Generar plan semanal
              </>
            )}
          </button>

          {plan && (
            <button
              onClick={handleShoppingList}
              disabled={shoppingLoading}
              className="w-full bg-white border border-card-border rounded-2xl py-3 px-6 flex items-center justify-center gap-3 text-carbon font-medium text-sm active:scale-[0.98] transition-transform hover:border-sage/30"
            >
              <ClipboardIcon size={18} />
              Lista de compras
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-coral font-medium text-center">{error}</p>
        )}

        {plan && (
          <div className="space-y-5">
            <div
              className="animate-slide-up overflow-x-auto scrollbar-hide"
              style={{ animationDelay: '120ms' }}
              ref={scrollRef}
            >
              <div className="flex gap-2 pb-1">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(i)}
                    className={`shrink-0 w-14 py-3 rounded-xl text-sm font-semibold transition-all ${
                      selectedDay === i
                        ? 'bg-sage text-white shadow-sm'
                        : 'bg-white text-carbon/60 border border-card-border hover:border-sage/30'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {selectedDayData && (
              <div className="space-y-4 animate-slide-up" style={{ animationDelay: '180ms' }}>
                <h2 className="font-heading text-lg font-semibold text-carbon">
                  {selectedDayData.day}
                </h2>
                <div className="space-y-3 animate-stagger">
                  {selectedDayData.meals.map((meal, idx) => {
                    const Icon = MEAL_ICONS[meal.type] ?? SunIcon
                    const bg = MEAL_BG[meal.type] ?? 'bg-mint-light'
                    const color = MEAL_COLOR[meal.type] ?? 'text-sage'

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 border border-card-border"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-semibold text-sm text-carbon">{meal.type}</p>
                            <p className="text-xs text-carbon/50 truncate">{meal.name}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <FlameIcon size={14} className="text-coral" />
                            <span className="text-sm font-bold text-carbon">{meal.calories} kcal</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {meal.foods.map((food, fIdx) => (
                            <div key={fIdx} className="flex items-center justify-between px-2 py-1.5 bg-cream rounded-lg">
                              <div className="flex items-center gap-2 min-w-0">
                                <ChevronRightIcon size={12} className="text-sage shrink-0" />
                                <span className="text-xs text-carbon/70 truncate">{food.name}</span>
                              </div>
                              <span className="text-[10px] text-carbon/40 shrink-0 ml-2">{food.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!plan && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <SunIcon className="text-sage" size={28} />
            </div>
            <p className="text-carbon/50 text-sm font-medium">
              Genera tu primer plan semanal
            </p>
            <p className="text-carbon/40 text-xs mt-1">
              La IA creará un plan personalizado para ti.
            </p>
          </div>
        )}
      </main>

      <Modal
        isOpen={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
        title="Lista de compras"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {shoppingLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-carbon/50">Generando lista...</p>
            </div>
          ) : shoppingList.length > 0 ? (
            Object.entries(
              shoppingList.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
                if (!acc[item.category]) acc[item.category] = []
                acc[item.category].push(item)
                return acc
              }, {})
            ).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-sage uppercase tracking-wide mb-2">{category}</p>
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-cream rounded-xl px-3 py-2">
                      <span className="text-sm text-carbon">{item.name}</span>
                      <span className="text-xs text-carbon/50">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-carbon/50 text-center py-4">No se pudo generar la lista.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
