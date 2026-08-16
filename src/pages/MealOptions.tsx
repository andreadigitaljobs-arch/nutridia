import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getMealTypeLabel } from '@/lib/constants'
import { suggestMeals, type MealSuggestion } from '@/lib/ai'
import type { MealType } from '@/types/database'
import AddFoodModal from '@/components/AddFoodModal'
import {
  ChevronLeftIcon,
  LeafIcon,
  BowlIcon,
  EggIcon,
  WheatIcon,
  StrawberryIcon,
  HomeIcon,
  BookmarkIcon,
  BarChartIcon,
  UserIcon,
} from '@/components/Icons'

interface MealOptionItem {
  id: string
  name: string
  amount: string
  category: string
  emoji: string
}

interface MealOption {
  id: string
  name: string
  meal_type: string
  description: string
  estimated_calories: number
  preparation: string
  sort_order: number
  is_favorite: boolean
  meal_option_items: MealOptionItem[]
}

const CATEGORY_ICON: Record<string, typeof EggIcon> = {
  'Proteína': EggIcon,
  protein: EggIcon,
  'Carbohidrato': WheatIcon,
  carb: WheatIcon,
  'Fruta': StrawberryIcon,
  fruit: StrawberryIcon,
  'Grasa saludable': LeafIcon,
  fat: LeafIcon,
  'Verdura': LeafIcon,
  vegetable: LeafIcon,
  'Legumbre': WheatIcon,
  'Lácteo': LeafIcon,
  'Fruto seco': WheatIcon,
  'Endulzante': StrawberryIcon,
  'Especia': LeafIcon,
}

function getCategoryIcon(category: string) {
  return CATEGORY_ICON[category] ?? LeafIcon
}

export default function MealOptions() {
  const { mealType } = useParams<{ mealType: string }>()
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<MealOption[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<MealSuggestion[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAddFood, setShowAddFood] = useState(false)
  const type = (mealType as MealType) ?? 'breakfast'
  const today = new Date().toISOString().split('T')[0]

  const fetchOptions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const { data: menu } = await supabase
        .from('daily_menus')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (menu) {
        const { data: options } = await supabase
          .from('daily_menu_options')
          .select('*, meal_option_items(*)')
          .eq('menu_id', menu.id)
          .order('sort_order')
        if (options && options.length > 0) {
          setOptions(options as MealOption[])
          setLoading(false)
          return
        }
      }

      setOptions(generateMealOptions(type))
    } catch (err) {
      console.error('Unexpected error fetching options:', err)
      setError('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }, [user, type, today])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  async function handleSelect(option: MealOption) {
    let optionId = option.id

    if (option.id.startsWith('gen-')) {
      const { data: inserted } = await supabase
        .from('daily_menu_options')
        .insert({
          menu_id: null,
          meal_type_id: null,
          name: option.name,
          estimated_calories: option.estimated_calories,
          is_selected: false,
        })
        .select('id')
        .single()

      if (inserted) {
        optionId = inserted.id
        if (option.meal_option_items?.length > 0) {
          await supabase.from('meal_option_items').insert(
            option.meal_option_items.map((item) => ({
              option_id: inserted.id,
              food_name: item.name,
              category: item.category,
              amount: String(item.amount || ''),
              unit: 'porcion',
              servings: 1,
            }))
          )
        }
      }
    }

    navigate(`/meal-option/${optionId}`)
  }

  async function handleAISuggest() {
    setLoadingAI(true)
    setAiError(null)
    try {
      const results = await suggestMeals(type, 500, [], [])
      setAiSuggestions(results)
    } catch (err) {
      console.error('Error getting AI suggestions:', err)
      setAiError('No se pudieron generar sugerencias. Intenta de nuevo.')
    } finally {
      setLoadingAI(false)
    }
  }

  function getOptionTitle(option: MealOption) {
    return option.name
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream pb-24 flex flex-col items-center justify-center px-4">
        <p className="text-sm text-coral font-medium text-center">{error}</p>
        <button
          onClick={() => fetchOptions()}
          className="mt-4 px-4 py-2 bg-sage text-white rounded-lg text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pb-24">
        <header className="px-4 pt-10 pb-4 flex items-center justify-between">
          <div className="w-10 h-10" />
          <div className="w-28 h-8 bg-card-border rounded animate-pulse" />
          <div className="w-10" />
        </header>
        <main className="px-4 space-y-4">
          <div className="space-y-2 mb-6">
            <div className="w-24 h-4 bg-card-border rounded animate-pulse" />
            <div className="w-40 h-8 bg-card-border rounded animate-pulse" />
            <div className="w-32 h-4 bg-card-border rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-elevated flex gap-4 p-4 animate-pulse">
              <div className="w-28 h-28 bg-card-border rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="w-7 h-7 bg-card-border rounded-full" />
                <div className="w-3/4 h-5 bg-card-border rounded" />
                <div className="space-y-2">
                  <div className="w-full h-3 bg-card-border rounded" />
                  <div className="w-2/3 h-3 bg-card-border rounded" />
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-24 animate-slide-in-right">
      <header className="px-4 pt-10 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/today')}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ChevronLeftIcon size={24} className="text-carbon" />
        </button>
        <img
          src="/brand/logo-horizontal.png"
          alt="NutriDia"
          className="w-28"
        />
        <div className="w-10" />
      </header>

      <main className="px-4">
        <div className="flex justify-end mb-1">
          <p className="text-sm text-carbon/60">
            {profile?.name ?? 'Nutri'}
          </p>
        </div>

        <h1 className="font-heading text-3xl font-bold text-carbon">
          {getMealTypeLabel(type)}
        </h1>
        <p className="text-sm text-sage mt-1">
          Elige 1 de 4 opciones
        </p>

        <div className="mt-4">
          <button
            onClick={handleAISuggest}
            disabled={loadingAI}
            className="w-full bg-sage/10 border-2 border-dashed border-sage/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-sage font-medium text-sm active:scale-[0.98] transition-transform hover:bg-sage/15 disabled:opacity-50"
          >
            {loadingAI ? (
              <>
                <div className="w-5 h-5 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                Generando sugerencias...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Sugerir con IA
              </>
            )}
          </button>
          {aiError && (
            <p className="text-xs text-coral mt-2 text-center">{aiError}</p>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={() => setShowAddFood(true)}
            className="w-full bg-white border-2 border-dashed border-card-border rounded-2xl p-4 flex items-center justify-center gap-3 text-carbon/50 font-medium text-sm active:scale-[0.98] transition-transform hover:border-sage/30 hover:text-sage"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            Agregar alimento
          </button>
        </div>

        {aiSuggestions.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-heading text-sm font-semibold text-sage flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Sugerencias de IA
            </h3>
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-sage/20 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-sage">{idx + 1}</span>
                      </div>
                      <h4 className="font-heading font-semibold text-sm text-carbon">{suggestion.name}</h4>
                    </div>
                    <p className="text-xs text-carbon/50 mt-1 ml-8">{suggestion.description}</p>
                  </div>
                  <span className="text-sm font-bold text-sage shrink-0 ml-2">{suggestion.calories} kcal</span>
                </div>
                <div className="ml-8 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {suggestion.ingredients.map((ing, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-mint-light text-sage">
                        {ing}
                      </span>
                    ))}
                  </div>
                  {suggestion.preparation && (
                    <p className="text-[11px] text-carbon/40 leading-relaxed">{suggestion.preparation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 mt-6 animate-stagger">
          {options.map((option, idx) => {
            const items = option.meal_option_items ?? []
            const proteinIng = items.find(
              (ing) => ing.category === 'Proteína' || ing.category === 'protein'
            )
            const carbIng = items.find(
              (ing) => ing.category === 'Carbohidrato' || ing.category === 'carb'
            )
            const fruitIng = items.find(
              (ing) => ing.category === 'Fruta' || ing.category === 'fruit'
            )

            return (
              <div key={option.id} className="card-elevated flex gap-4 p-4">
                <div className="w-28 h-28 rounded-xl bg-cream-dark flex items-center justify-center shrink-0">
                  <BowlIcon size={40} className="text-sage/60" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-sage text-white flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>

                  <h3 className="font-heading font-semibold text-base text-carbon leading-tight">
                    {getOptionTitle(option)}
                  </h3>

                  <div className="space-y-1">
                    {proteinIng && (
                      <div className="flex items-center gap-1.5">
                        <EggIcon size={12} className="text-sage shrink-0" />
                        <span className="text-xs text-carbon/60 truncate">
                          {proteinIng.amount} {proteinIng.name}
                        </span>
                      </div>
                    )}
                    {carbIng && (
                      <div className="flex items-center gap-1.5">
                        <WheatIcon size={12} className="text-sage shrink-0" />
                        <span className="text-xs text-carbon/60 truncate">
                          {carbIng.amount} {carbIng.name}
                        </span>
                      </div>
                    )}
                    {fruitIng && (
                      <div className="flex items-center gap-1.5">
                        <StrawberryIcon size={12} className="text-sage shrink-0" />
                        <span className="text-xs text-carbon/60 truncate">
                          {fruitIng.amount} {fruitIng.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-sage">
                        {option.estimated_calories} kcal
                      </span>
                      <p className="text-[10px] text-carbon/40">aproX.</p>
                    </div>
                    <button
                      onClick={() => handleSelect(option)}
                      className="bg-sage text-white rounded-lg px-4 py-2 text-sm font-semibold"
                    >
                      Elegir esta
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 mb-8">
          <div className="card-elevated flex items-start gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
              <LeafIcon size={20} className="text-sage" />
            </div>
            <div>
              <p className="text-sm font-bold text-carbon">
                Las otras opciones se guardaran en Coleccion
              </p>
              <p className="text-sm text-carbon/60 mt-0.5">
                Podras usarlas en los proximos dias.
              </p>
            </div>
          </div>
        </div>
      </main>

      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-20">
        <div className="flex items-center justify-around px-4 py-2">
          <button
            onClick={() => navigate('/today')}
            className="flex flex-col items-center gap-1 text-sage"
          >
            <HomeIcon size={22} />
            <span className="text-[10px] font-medium">Hoy</span>
          </button>
          <button
            onClick={() => navigate('/collection')}
            className="flex flex-col items-center gap-1 text-carbon/40"
          >
            <BookmarkIcon size={22} />
            <span className="text-[10px] font-medium">Coleccion</span>
          </button>
          <button
            onClick={() => navigate('/progress')}
            className="flex flex-col items-center gap-1 text-carbon/40"
          >
            <BarChartIcon size={22} />
            <span className="text-[10px] font-medium">Progreso</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-carbon/40"
          >
            <UserIcon size={22} />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        </div>
      </nav>

      <AddFoodModal
        isOpen={showAddFood}
        onClose={() => setShowAddFood(false)}
        onFoodAdded={() => { fetchOptions() }}
      />
    </div>
  )
}

function generateMealOptions(type: MealType): MealOption[] {
  const now = Date.now()
  const templates: Record<MealType, MealOption[]> = {
    breakfast: [
      {
        id: `gen-b1-${now}`, name: 'Avena con frutas', meal_type: 'breakfast',
        description: 'Avena cocida con leche, banana y fresas', estimated_calories: 350,
        preparation: 'Cocinar la avena con leche. Servir con frutas picadas.',
        sort_order: 0, is_favorite: false, meal_option_items: [
          { id: `gi-b1-1-${now}`, name: 'Avena', amount: '60g', category: 'Carbohidrato', emoji: '' },
          { id: `gi-b1-2-${now}`, name: 'Leche', amount: '200ml', category: 'Lácteo', emoji: '' },
          { id: `gi-b1-3-${now}`, name: 'Banana', amount: '1', category: 'Fruta', emoji: '' },
          { id: `gi-b1-4-${now}`, name: 'Fresas', amount: '100g', category: 'Fruta', emoji: '' },
        ],
      },
      {
        id: `gen-b2-${now}`, name: 'Huevos revueltos con aguacate', meal_type: 'breakfast',
        description: 'Huevos revueltos con aguacate y pan integral', estimated_calories: 420,
        preparation: 'Revolver los huevos con un poco de aceite. Servir con aguacate machacado y pan tostado.',
        sort_order: 1, is_favorite: false, meal_option_items: [
          { id: `gi-b2-1-${now}`, name: 'Huevos', amount: '2 und', category: 'Proteína', emoji: '' },
          { id: `gi-b2-2-${now}`, name: 'Aguacate', amount: '1/2 und', category: 'Grasa saludable', emoji: '' },
          { id: `gi-b2-3-${now}`, name: 'Pan integral', amount: '2 rebanadas', category: 'Carbohidrato', emoji: '' },
        ],
      },
      {
        id: `gen-b3-${now}`, name: 'Yogurt con granola', meal_type: 'breakfast',
        description: 'Yogurt griego con granola casera y miel', estimated_calories: 310,
        preparation: 'Servir el yogurt en un bowl. Agregar granola y miel al gusto.',
        sort_order: 2, is_favorite: false, meal_option_items: [
          { id: `gi-b3-1-${now}`, name: 'Yogurt griego', amount: '200g', category: 'Lácteo', emoji: '' },
          { id: `gi-b3-2-${now}`, name: 'Granola', amount: '40g', category: 'Carbohidrato', emoji: '' },
          { id: `gi-b3-3-${now}`, name: 'Miel', amount: '1 cdta', category: 'Endulzante', emoji: '' },
        ],
      },
      {
        id: `gen-b4-${now}`, name: 'Tostadas con huevo y espinaca', meal_type: 'breakfast',
        description: 'Tostadas de centeno con huevo pochado y espinaca salteada', estimated_calories: 380,
        preparation: 'Saltear espinaca. Pochar huevo. Montar sobre tostada.',
        sort_order: 3, is_favorite: false, meal_option_items: [
          { id: `gi-b4-1-${now}`, name: 'Pan de centeno', amount: '2 rebanadas', category: 'Carbohidrato', emoji: '' },
          { id: `gi-b4-2-${now}`, name: 'Huevo', amount: '2 und', category: 'Proteína', emoji: '' },
          { id: `gi-b4-3-${now}`, name: 'Espinaca', amount: '100g', category: 'Verdura', emoji: '' },
        ],
      },
    ],
    lunch: [
      {
        id: `gen-l1-${now}`, name: 'Pechuga de pollo con arroz y ensalada', meal_type: 'lunch',
        description: 'Pechuga a la plancha, arroz integral y ensalada verde', estimated_calories: 520,
        preparation: 'Cocinar el pollo a la plancha. Preparar arroz integral. Mezclar ensalada.',
        sort_order: 0, is_favorite: false, meal_option_items: [
          { id: `gi-l1-1-${now}`, name: 'Pechuga de pollo', amount: '150g', category: 'Proteína', emoji: '' },
          { id: `gi-l1-2-${now}`, name: 'Arroz integral', amount: '100g', category: 'Carbohidrato', emoji: '' },
          { id: `gi-l1-3-${now}`, name: 'Lechuga', amount: '100g', category: 'Verdura', emoji: '' },
          { id: `gi-l1-4-${now}`, name: 'Tomate', amount: '1 und', category: 'Verdura', emoji: '' },
        ],
      },
      {
        id: `gen-l2-${now}`, name: 'Salmón al horno con quinoa', meal_type: 'lunch',
        description: 'Salmón al horno con quinoa y verduras asadas', estimated_calories: 480,
        preparation: 'Hornear salmon a 180 por 15 min. Cocinar quinoa. Asar verduras.',
        sort_order: 1, is_favorite: false, meal_option_items: [
          { id: `gi-l2-1-${now}`, name: 'Salmón', amount: '150g', category: 'Proteína', emoji: '' },
          { id: `gi-l2-2-${now}`, name: 'Quinoa', amount: '80g', category: 'Carbohidrato', emoji: '' },
          { id: `gi-l2-3-${now}`, name: 'Brócoli', amount: '100g', category: 'Verdura', emoji: '' },
        ],
      },
      {
        id: `gen-l3-${now}`, name: 'Bowl de lentejas', meal_type: 'lunch',
        description: 'Bowl de lentejas con verduras, aguacate y huevo', estimated_calories: 490,
        preparation: 'Cocinar lentejas. Saltear verduras. Montar bowl con aguacate y huevo.',
        sort_order: 2, is_favorite: false, meal_option_items: [
          { id: `gi-l3-1-${now}`, name: 'Lentejas', amount: '120g', category: 'Legumbre', emoji: '' },
          { id: `gi-l3-2-${now}`, name: 'Aguacate', amount: '1/2 und', category: 'Grasa saludable', emoji: '' },
          { id: `gi-l3-3-${now}`, name: 'Huevo', amount: '1 und', category: 'Proteína', emoji: '' },
          { id: `gi-l3-4-${now}`, name: 'Pimiento', amount: '1 und', category: 'Verdura', emoji: '' },
        ],
      },
      {
        id: `gen-l4-${now}`, name: 'Pasta integral con atún', meal_type: 'lunch',
        description: 'Pasta integral con atún, tomate y albahaca', estimated_calories: 510,
        preparation: 'Cocinar pasta. Mezclar con atún escurrido, tomate cherry y albahaca.',
        sort_order: 3, is_favorite: false, meal_option_items: [
          { id: `gi-l4-1-${now}`, name: 'Pasta integral', amount: '100g', category: 'Carbohidrato', emoji: '' },
          { id: `gi-l4-2-${now}`, name: 'Atún', amount: '1 lata', category: 'Proteína', emoji: '' },
          { id: `gi-l4-3-${now}`, name: 'Tomate cherry', amount: '100g', category: 'Verdura', emoji: '' },
        ],
      },
    ],
    snack: [
      {
        id: `gen-s1-${now}`, name: 'Fruta con crema de maní', meal_type: 'snack',
        description: 'Manzana con crema de mani natural', estimated_calories: 220,
        preparation: 'Cortar la manzana en rodajas. Untar crema de mani.',
        sort_order: 0, is_favorite: false, meal_option_items: [
          { id: `gi-s1-1-${now}`, name: 'Manzana', amount: '1 und', category: 'Fruta', emoji: '' },
          { id: `gi-s1-2-${now}`, name: 'Crema de maní', amount: '2 cdas', category: 'Grasa saludable', emoji: '' },
        ],
      },
      {
        id: `gen-s2-${now}`, name: 'Smoothie verde', meal_type: 'snack',
        description: 'Smoothie de espinaca, banana y jengibre', estimated_calories: 180,
        preparation: 'Licuar todos los ingredientes hasta obtener una mezcla homogenea.',
        sort_order: 1, is_favorite: false, meal_option_items: [
          { id: `gi-s2-1-${now}`, name: 'Espinaca', amount: '50g', category: 'Verdura', emoji: '' },
          { id: `gi-s2-2-${now}`, name: 'Banana', amount: '1 und', category: 'Fruta', emoji: '' },
          { id: `gi-s2-3-${now}`, name: 'Jengibre', amount: '1 cdta', category: 'Especia', emoji: '' },
        ],
      },
      {
        id: `gen-s3-${now}`, name: 'Nueces y fruta seca', meal_type: 'snack',
        description: 'Mix de nueces, almendras y arándanos', estimated_calories: 250,
        preparation: 'Mezclar nueces, almendras y arándanos en un snack bowl.',
        sort_order: 2, is_favorite: false, meal_option_items: [
          { id: `gi-s3-1-${now}`, name: 'Nueces', amount: '30g', category: 'Fruto seco', emoji: '' },
          { id: `gi-s3-2-${now}`, name: 'Almendras', amount: '20g', category: 'Fruto seco', emoji: '' },
          { id: `gi-s3-3-${now}`, name: 'Arándanos', amount: '30g', category: 'Fruta', emoji: '' },
        ],
      },
      {
        id: `gen-s4-${now}`, name: 'Hummus con vegetales', meal_type: 'snack',
        description: 'Hummus casero con palitos de zanahoria y pepino', estimated_calories: 190,
        preparation: 'Servir hummus en un plato. Cortar vegetales en bastones.',
        sort_order: 3, is_favorite: false, meal_option_items: [
          { id: `gi-s4-1-${now}`, name: 'Hummus', amount: '80g', category: 'Legumbre', emoji: '' },
          { id: `gi-s4-2-${now}`, name: 'Zanahoria', amount: '1 und', category: 'Verdura', emoji: '' },
          { id: `gi-s4-3-${now}`, name: 'Pepino', amount: '1/2 und', category: 'Verdura', emoji: '' },
        ],
      },
    ],
    dinner: [
      {
        id: `gen-d1-${now}`, name: 'Sopa de verduras con pollo', meal_type: 'dinner',
        description: 'Sopa casera con pollo desmenuzado y verduras variadas', estimated_calories: 320,
        preparation: 'Cocinar verduras en caldo. Agregar pollo desmenuzado al final.',
        sort_order: 0, is_favorite: false, meal_option_items: [
          { id: `gi-d1-1-${now}`, name: 'Pollo', amount: '100g', category: 'Proteína', emoji: '' },
          { id: `gi-d1-2-${now}`, name: 'Zanahoria', amount: '1 und', category: 'Verdura', emoji: '' },
          { id: `gi-d1-3-${now}`, name: 'Papa', amount: '1 und', category: 'Carbohidrato', emoji: '' },
          { id: `gi-d1-4-${now}`, name: 'Apio', amount: '1 tallo', category: 'Verdura', emoji: '' },
        ],
      },
      {
        id: `gen-d2-${now}`, name: 'Pescado a la plancha con ensalada', meal_type: 'dinner',
        description: 'Filete de pescado a la plancha con ensalada mixta', estimated_calories: 350,
        preparation: 'Sazonar pescado y cocinar a la plancha. Preparar ensalada.',
        sort_order: 1, is_favorite: false, meal_option_items: [
          { id: `gi-d2-1-${now}`, name: 'Pescado blanco', amount: '150g', category: 'Proteína', emoji: '' },
          { id: `gi-d2-2-${now}`, name: 'Lechuga', amount: '100g', category: 'Verdura', emoji: '' },
          { id: `gi-d2-3-${now}`, name: 'Tomate', amount: '1 und', category: 'Verdura', emoji: '' },
          { id: `gi-d2-4-${now}`, name: 'Aceite de oliva', amount: '1 cda', category: 'Grasa saludable', emoji: '' },
        ],
      },
      {
        id: `gen-d3-${now}`, name: 'Tortilla de claras con verduras', meal_type: 'dinner',
        description: 'Tortilla de claras con espinaca, champiñón y pimiento', estimated_calories: 280,
        preparation: 'Saltear verduras. Batir claras y agregar. Cocinar tortilla.',
        sort_order: 2, is_favorite: false, meal_option_items: [
          { id: `gi-d3-1-${now}`, name: 'Claras de huevo', amount: '4 und', category: 'Proteína', emoji: '' },
          { id: `gi-d3-2-${now}`, name: 'Espinaca', amount: '80g', category: 'Verdura', emoji: '' },
          { id: `gi-d3-3-${now}`, name: 'Champiñón', amount: '50g', category: 'Verdura', emoji: '' },
        ],
      },
      {
        id: `gen-d4-${now}`, name: 'Ensalada tibia de garbanzos', meal_type: 'dinner',
        description: 'Ensalada tibia de garbanzos, aguacate y queso feta', estimated_calories: 380,
        preparation: 'Calentar garbanzos. Mezclar con aguacate, feta y aderezo.',
        sort_order: 3, is_favorite: false, meal_option_items: [
          { id: `gi-d4-1-${now}`, name: 'Garbanzos', amount: '150g', category: 'Legumbre', emoji: '' },
          { id: `gi-d4-2-${now}`, name: 'Aguacate', amount: '1/2 und', category: 'Grasa saludable', emoji: '' },
          { id: `gi-d4-3-${now}`, name: 'Queso feta', amount: '40g', category: 'Lácteo', emoji: '' },
        ],
      },
    ],
  }

  return templates[type] ?? templates.breakfast
}
