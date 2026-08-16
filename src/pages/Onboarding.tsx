import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  PlusIcon,
  XIcon,
  CheckIcon,
  ZapIcon,
  LoaderIcon,
  SearchIcon,
} from '@/components/Icons'
import Select from '@/components/Select'

const MEAL_CATEGORIES = ['protein', 'carb', 'fruit', 'fat', 'salad', 'vegetable'] as const

const MEAL_CATEGORY_LABELS: Record<string, string> = {
  protein: 'Proteína',
  carb: 'Carbohidrato',
  fruit: 'Fruta',
  fat: 'Grasa',
  salad: 'Ensalada',
  vegetable: 'Vegetal',
}

const COMMON_RESTRICTIONS = [
  'Sin lácteos',
  'Sin gluten',
  'Sin mariscos',
  'Sin frutos secos',
  'Vegetariano',
  'Vegano',
]

const COMMON_FOODS_FALLBACK = [
  'Pollo', 'Res', 'Cerdo', 'Pescado', 'Tofu', 'Huevo',
  'Arroz', 'Pasta', 'Pan', 'Papa', 'Camote', 'Avena',
  'Manzana', 'Plátano', 'Naranja', 'Fresa', 'Mango', 'Uva',
  'Aguacate', 'Aceite de oliva', 'Nuez', 'Almendra', 'Mantequilla',
  'Lechuga', 'Tomate', 'Pepino', 'Brócoli', 'Zanahoria', 'Espinaca',
  'Leche', 'Yogurt', 'Queso', 'Atún', 'Frijol', 'Lenteja',
]

interface OnboardingData {
  name: string
  date_of_birth: string
  gender: string
  height_cm: string
  current_weight_kg: string
  has_plan: boolean | null
  daily_calorie_target: string
  daily_water_target_ml: string
  number_of_meals: string
  meal_names: string[]
  meal_rules: Array<{ meal: string; category: string; required_servings: string }>
  allowed_foods: string[]
  prohibited_foods: string[]
  limited_foods: string[]
  portions: Array<{ food: string; amount: string; unit: string; servings: string }>
  allergies: string
  restrictions: string[]
  custom_restriction: string
}

const YAJAIRA_PRESET: OnboardingData = {
  name: 'Yajaira Barreto',
  date_of_birth: '1986-03-15',
  gender: 'Mujer',
  height_cm: '161',
  current_weight_kg: '68.5',
  has_plan: true,
  daily_calorie_target: '1327',
  daily_water_target_ml: '4000',
  number_of_meals: '4',
  meal_names: ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'],
  meal_rules: [
    { meal: 'Desayuno', category: 'protein', required_servings: '3' },
    { meal: 'Desayuno', category: 'carb', required_servings: '1' },
    { meal: 'Desayuno', category: 'fruit', required_servings: '1' },
    { meal: 'Almuerzo', category: 'protein', required_servings: '4' },
    { meal: 'Almuerzo', category: 'carb', required_servings: '1' },
    { meal: 'Almuerzo', category: 'fat', required_servings: '1' },
    { meal: 'Merienda', category: 'protein', required_servings: '2' },
    { meal: 'Cena', category: 'protein', required_servings: '4' },
    { meal: 'Cena', category: 'salad', required_servings: '1' },
  ],
  allowed_foods: ['Pollo', 'Res', 'Pescado', 'Huevo', 'Atún', 'Tofu', 'Arroz', 'Papa', 'Camote', 'Avena', 'Plátano', 'Manzana', 'Naranja', 'Fresa', 'Lechuga', 'Tomate', 'Pepino', 'Brócoli', 'Zanahoria', 'Espinaca'],
  prohibited_foods: ['Leche', 'Yogurt', 'Queso', 'Mantequilla', 'Nuez', 'Almendra'],
  limited_foods: ['Aguacate', 'Aceite de oliva'],
  portions: [
    { food: 'Pollo', amount: '120', unit: 'g', servings: '1' },
    { food: 'Res', amount: '120', unit: 'g', servings: '1' },
    { food: 'Pescado', amount: '120', unit: 'g', servings: '1' },
    { food: 'Huevo', amount: '50', unit: 'g', servings: '1' },
    { food: 'Atún', amount: '80', unit: 'g', servings: '1' },
    { food: 'Tofu', amount: '100', unit: 'g', servings: '1' },
    { food: 'Arroz', amount: '60', unit: 'g', servings: '1' },
    { food: 'Papa', amount: '100', unit: 'g', servings: '1' },
    { food: 'Camote', amount: '100', unit: 'g', servings: '1' },
    { food: 'Avena', amount: '40', unit: 'g', servings: '1' },
    { food: 'Plátano', amount: '100', unit: 'g', servings: '1' },
    { food: 'Manzana', amount: '100', unit: 'g', servings: '1' },
    { food: 'Naranja', amount: '100', unit: 'g', servings: '1' },
    { food: 'Fresa', amount: '100', unit: 'g', servings: '1' },
    { food: 'Lechuga', amount: '50', unit: 'g', servings: '1' },
    { food: 'Tomate', amount: '50', unit: 'g', servings: '1' },
    { food: 'Pepino', amount: '50', unit: 'g', servings: '1' },
    { food: 'Brócoli', amount: '50', unit: 'g', servings: '1' },
    { food: 'Zanahoria', amount: '50', unit: 'g', servings: '1' },
    { food: 'Espinaca', amount: '50', unit: 'g', servings: '1' },
    { food: 'Aguacate', amount: '0', unit: 'g', servings: '1' },
    { food: 'Aceite de oliva', amount: '0', unit: 'ml', servings: '1' },
  ],
  allergies: '',
  restrictions: ['Sin lácteos'],
  custom_restriction: '',
}

const initialState: OnboardingData = {
  name: '',
  date_of_birth: '',
  gender: '',
  height_cm: '',
  current_weight_kg: '',
  has_plan: null,
  daily_calorie_target: '',
  daily_water_target_ml: '',
  number_of_meals: '3',
  meal_names: ['Desayuno', 'Comida', 'Cena'],
  meal_rules: [],
  allowed_foods: [],
  prohibited_foods: [],
  limited_foods: [],
  portions: [],
  allergies: '',
  restrictions: [],
  custom_restriction: '',
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialState)
  const [loading, setLoading] = useState(false)

  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }))

  const [stepKey, setStepKey] = useState(0)
  const next = () => { setStep((s) => Math.min(s + 1, 7)); setStepKey(k => k + 1) }
  const prev = () => { setStep((s) => Math.max(s - 1, 1)); setStepKey(k => k + 1) }

  const [dbFoods, setDbFoods] = useState<string[]>([])
  useEffect(() => {
    supabase.from('foods').select('name').order('name').then(({ data: foods }) => {
      if (foods && foods.length > 0) {
        const names = foods.map(f => f.name)
        setDbFoods(names)
        setData(d => d.allowed_foods.length === 0 ? { ...d, allowed_foods: names } : d)
      }
    })
  }, [])

  const totalMeals = Number(data.number_of_meals) || 3

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)

    try {
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: user.id,
        user_id: user.id,
        name: data.name,
        date_of_birth: data.date_of_birth ? data.date_of_birth.split('/').reverse().join('-') : null,
        gender: data.gender || null,
        height_cm: data.height_cm ? Number(data.height_cm) : null,
        current_weight_kg: data.current_weight_kg ? Number(data.current_weight_kg) : null,
        has_completed_onboarding: true,
      })
      if (profileErr) console.error('Profile save error:', profileErr)
    } catch (e) {
      console.error('Profile save exception:', e)
    }

    try {
      const { error: planErr } = await supabase.from('nutrition_plans').upsert({
        user_id: user.id,
        name: 'Plan Personal',
        status: 'active',
        daily_calorie_target: data.daily_calorie_target ? Number(data.daily_calorie_target) : null,
        daily_water_target_ml: data.daily_water_target_ml ? Number(data.daily_water_target_ml) : null,
      })
      if (planErr) console.error('Nutrition plan save error:', planErr)
    } catch (e) {
      console.error('Nutrition plan save exception:', e)
    }

    // Save meal rules
    try {
      if (data.meal_rules.length > 0) {
        const { data: plan } = await supabase
          .from('nutrition_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (plan) {
          const { data: mealTypes } = await supabase.from('meal_types').select('id, name, display_name')
          await supabase.from('meal_rules').delete().eq('plan_id', plan.id)
          const { error: rulesErr } = await supabase.from('meal_rules').insert(
            data.meal_rules.map(rule => {
              const mealType = mealTypes?.find(mt => mt.name === rule.meal || mt.display_name === rule.meal)
              return {
                plan_id: plan.id,
                meal_type_id: mealType?.id || null,
                category: rule.category,
                required_servings: Number(rule.required_servings) || 1,
              }
            })
          )
          if (rulesErr) console.error('Meal rules save error:', rulesErr)
        }
      }
    } catch (e) {
      console.error('Meal rules save exception:', e)
    }

    // Save food rules
    try {
      const { data: foods } = await supabase.from('foods').select('id, name')
      const findFoodId = (name: string) => foods?.find(f => f.name === name)?.id || null

      await supabase.from('user_food_rules').delete().eq('user_id', user.id)
      const foodRules = [
        ...data.allowed_foods.map(food => ({ user_id: user.id, food_id: findFoodId(food), status: 'allowed' as const })),
        ...data.prohibited_foods.map(food => ({ user_id: user.id, food_id: findFoodId(food), status: 'prohibited' as const })),
        ...data.limited_foods.map(food => ({ user_id: user.id, food_id: findFoodId(food), status: 'allowed_limited' as const })),
      ].filter(r => r.food_id !== null)
      if (foodRules.length > 0) {
        const { error: foodErr } = await supabase.from('user_food_rules').insert(foodRules)
        if (foodErr) console.error('Food rules save error:', foodErr)
      }
    } catch (e) {
      console.error('Food rules save exception:', e)
    }

    // Save portions
    try {
      const { data: foods } = await supabase.from('foods').select('id, name')
      const findFoodId = (name: string) => foods?.find(f => f.name === name)?.id || null

      await supabase.from('food_portions').delete().eq('user_id', user.id)
      const portions = data.portions.filter(p => p.food && findFoodId(p.food))
      if (portions.length > 0) {
        const { error: portionsErr } = await supabase.from('food_portions').insert(
          portions.map(p => ({
            user_id: user.id,
            food_id: findFoodId(p.food),
            amount: Number(p.amount) || 0,
            unit: p.unit,
            servings: Number(p.servings) || 1,
          }))
        )
        if (portionsErr) console.error('Portions save error:', portionsErr)
      }
    } catch (e) {
      console.error('Portions save exception:', e)
    }

    setLoading(false)
    navigate('/today', { replace: true })
  }

  const progress = (step / 7) * 100

  const addMealRule = () => {
    update({
      meal_rules: [
        ...data.meal_rules,
        { meal: data.meal_names[0] || 'Comida', category: MEAL_CATEGORIES[0], required_servings: '1' },
      ],
    })
  }

  const updateMealRule = (i: number, patch: Partial<(typeof data.meal_rules)[0]>) => {
    const copy = [...data.meal_rules]
    copy[i] = { ...copy[i], ...patch }
    update({ meal_rules: copy })
  }

  const removeMealRule = (i: number) => {
    update({ meal_rules: data.meal_rules.filter((_, idx) => idx !== i) })
  }

  const addFood = (list: 'allowed_foods' | 'prohibited_foods' | 'limited_foods', food: string) => {
    if (!food.trim()) return
    if (data[list].includes(food.trim())) return
    update({ [list]: [...data[list], food.trim()] })
  }

  const removeFood = (list: 'allowed_foods' | 'prohibited_foods' | 'limited_foods', idx: number) => {
    update({ [list]: data[list].filter((_, i) => i !== idx) })
  }

  const addPortion = () => {
    update({
      portions: [...data.portions, { food: '', amount: '', unit: 'g', servings: '1' }],
    })
  }

  const updatePortion = (i: number, patch: Partial<(typeof data.portions)[0]>) => {
    const copy = [...data.portions]
    copy[i] = { ...copy[i], ...patch }
    update({ portions: copy })
  }

  const removePortion = (i: number) => {
    update({ portions: data.portions.filter((_, idx) => idx !== i) })
  }

  const toggleRestriction = (r: string) => {
    update({
      restrictions: data.restrictions.includes(r)
        ? data.restrictions.filter((x) => x !== r)
        : [...data.restrictions, r],
    })
  }

  const inputClass = 'h-12 rounded-xl border border-card-border bg-white px-4 text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all w-full'
  const labelClass = 'text-sm font-medium text-carbon/60'
  const anim = (delay: number) => ({ animation: `slideUp 0.5s ease-out ${delay}s both` })

  return (
    <div className="min-h-dvh flex flex-col relative">
      <img
        src="/brand/bg-onboarding.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <div className="px-6 pt-6">
          <p className="text-sage text-sm font-semibold mb-2" style={{ animation: 'fadeIn 0.4s ease-out both' }}>
            Paso {step} de 7
          </p>
          <div className="w-full h-2 bg-sage/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 pb-28" key={stepKey}>
        {step === 1 && (
          <div className="flex flex-col gap-4 pt-6" style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <h2 className="font-heading text-2xl font-bold text-carbon">
              Cuéntanos sobre ti
            </h2>

            <button
              onClick={() => setData(YAJAIRA_PRESET)}
              className="h-12 rounded-xl bg-maize/30 border border-maize text-carbon font-medium text-sm flex items-center justify-center gap-2 hover:bg-maize/50 transition-colors"
            >
              <ZapIcon className="h-4 w-4" />
              Datos Yajaira
            </button>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Fecha de nacimiento</label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={data.date_of_birth}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '')
                  if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2)
                  if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5, 9)
                  update({ date_of_birth: val })
                }}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Género</label>
              <Select
                value={data.gender}
                onChange={(val) => update({ gender: val })}
                options={[
                  { value: '', label: 'Seleccionar' },
                  { value: 'Hombre', label: 'Hombre' },
                  { value: 'Mujer', label: 'Mujer' },
                  { value: 'Otro', label: 'Otro' },
                  { value: 'No especificar', label: 'No especificar' },
                ]}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className={labelClass}>Altura (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={data.height_cm}
                  onChange={(e) => update({ height_cm: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className={labelClass}>Peso actual (kg)</label>
                <input
                  type="number"
                  placeholder="70"
                  value={data.current_weight_kg}
                  onChange={(e) => update({ current_weight_kg: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5 pt-6" style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <h2 className="font-heading text-2xl font-bold text-carbon">
              ¿Tienes un plan nutricional?
            </h2>

            <div className="flex gap-3">
              <button
                onClick={() => update({ has_plan: true })}
                className={`flex-1 p-5 rounded-2xl border-2 text-center font-medium transition-all ${
                  data.has_plan === true
                    ? 'border-sage bg-sage/10 text-sage'
                    : 'border-carbon/10 bg-white text-carbon/50'
                }`}
              >
                Sí, ya tengo plan
              </button>
              <button
                onClick={() => update({ has_plan: false })}
                className={`flex-1 p-5 rounded-2xl border-2 text-center font-medium transition-all ${
                  data.has_plan === false
                    ? 'border-coral bg-coral/10 text-coral'
                    : 'border-carbon/10 bg-white text-carbon/50'
                }`}
              >
                No, aún no tengo plan
              </button>
            </div>

            {data.has_plan === true && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Calorías diarias</label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={data.daily_calorie_target}
                    onChange={(e) => update({ daily_calorie_target: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Agua diaria (ml)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={data.daily_water_target_ml}
                    onChange={(e) => update({ daily_water_target_ml: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Número de comidas</label>
                  <Select
                    value={data.number_of_meals}
                    onChange={(val) => {
                      const n = Number(val)
                      const names = [...data.meal_names]
                      while (names.length < n) names.push(`Comida ${names.length + 1}`)
                      update({ number_of_meals: val, meal_names: names })
                    }}
                    options={[
                      { value: '3', label: '3 comidas' },
                      { value: '4', label: '4 comidas' },
                      { value: '5', label: '5 comidas' },
                      { value: '6', label: '6 comidas' },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Nombres de las comidas</label>
                  {data.meal_names.slice(0, totalMeals).map((name, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Comida ${i + 1}`}
                      value={name}
                      onChange={(e) => {
                        const copy = [...data.meal_names]
                        copy[i] = e.target.value
                        update({ meal_names: copy })
                      }}
                      className={inputClass}
                    />
                  ))}
                </div>
              </div>
            )}

            {data.has_plan === false && (
              <p className="text-carbon/50 text-sm text-center py-4">
                Podrás configurar tu plan más adelante.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5 pt-6" style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <h2 className="font-heading text-2xl font-bold text-carbon">
              Define tus reglas por comida
            </h2>

            {data.meal_rules.map((rule, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-card-border flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Select
                    value={rule.meal}
                    onChange={(val) => updateMealRule(i, { meal: val })}
                    options={data.meal_names.slice(0, totalMeals).map((m) => ({ value: m, label: m }))}
                    className="flex-1"
                  />
                  <button onClick={() => removeMealRule(i)} className="text-carbon/30 hover:text-coral transition-colors shrink-0">
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <Select
                    value={rule.category}
                    onChange={(val) => updateMealRule(i, { category: val })}
                    options={MEAL_CATEGORIES.map((c) => ({ value: c, label: MEAL_CATEGORY_LABELS[c] }))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Porciones"
                    value={rule.required_servings}
                    onChange={(e) => updateMealRule(i, { required_servings: e.target.value })}
                    className="w-24 h-12 px-3 rounded-xl border border-card-border bg-white text-carbon text-sm placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addMealRule}
              className="h-12 rounded-xl border-2 border-dashed border-sage/40 text-sage font-medium text-sm flex items-center justify-center gap-2 hover:bg-sage/5 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar regla
            </button>
          </div>
        )}

        {step === 4 && (
          <FoodTabStep data={data} addFood={addFood} removeFood={removeFood} dbFoods={dbFoods} />
        )}

        {step === 5 && (
          <div className="flex flex-col gap-5 pt-6" style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <h2 className="font-heading text-2xl font-bold text-carbon">
              Porciones y equivalencias
            </h2>

            {data.portions.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-card-border flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Alimento"
                    value={p.food}
                    onChange={(e) => updatePortion(i, { food: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg bg-cream border border-card-border text-carbon text-sm placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all"
                  />
                  <button onClick={() => removePortion(i)} className="text-carbon/30 hover:text-coral transition-colors">
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={p.amount}
                    onChange={(e) => updatePortion(i, { amount: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-lg bg-cream border border-card-border text-carbon text-sm placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all"
                  />
                  <Select
                    value={p.unit}
                    onChange={(val) => updatePortion(i, { unit: val })}
                    options={[
                      { value: 'g', label: 'g' },
                      { value: 'ml', label: 'ml' },
                      { value: 'unidad', label: 'ud' },
                    ]}
                    className="w-20"
                  />
                  <input
                    type="number"
                    placeholder="Porciones"
                    value={p.servings}
                    onChange={(e) => updatePortion(i, { servings: e.target.value })}
                    className="w-20 h-10 px-3 rounded-lg bg-cream border border-card-border text-carbon text-sm placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addPortion}
              className="h-12 rounded-xl border-2 border-dashed border-sage/40 text-sage font-medium text-sm flex items-center justify-center gap-2 hover:bg-sage/5 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar porción
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-5 pt-6" style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <h2 className="font-heading text-2xl font-bold text-carbon">
              Restricciones y preferencias
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Alergias</label>
              <textarea
                placeholder="Describe tus alergias alimentarias..."
                value={data.allergies}
                onChange={(e) => update({ allergies: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Restricciones comunes</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_RESTRICTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => toggleRestriction(r)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      data.restrictions.includes(r)
                        ? 'bg-sage text-white border-sage'
                        : 'bg-white text-carbon/60 border-card-border hover:border-sage/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Otra restricción</label>
              <input
                type="text"
                placeholder="Escribe una restricción..."
                value={data.custom_restriction}
                onChange={(e) => update({ custom_restriction: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-col gap-5 pt-6" style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <h2 className="font-heading text-2xl font-bold text-carbon">
              Todo listo
            </h2>

            <div className="bg-white rounded-2xl p-5 border border-card-border flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-sage mb-1">Datos personales</h3>
                <p className="text-sm text-carbon/60">
                  {data.name || 'Sin nombre'} · {data.gender || 'Sin género'} · {data.height_cm ? `${data.height_cm} cm` : ''} {data.current_weight_kg ? `${data.current_weight_kg} kg` : ''}
                </p>
              </div>

              {data.has_plan && (
                <div>
                  <h3 className="text-sm font-semibold text-sage mb-1">Plan</h3>
                  <p className="text-sm text-carbon/60">
                    {data.daily_calorie_target ? `${data.daily_calorie_target} kcal/día` : ''}{' '}
                    {data.daily_water_target_ml ? `· ${data.daily_water_target_ml} ml agua` : ''}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-sage mb-1">Comidas</h3>
                <p className="text-sm text-carbon/60">{totalMeals} comidas al día</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-sage mb-1">Restricciones</h3>
                <p className="text-sm text-carbon/60">
                  {[...data.restrictions, data.allergies, data.custom_restriction].filter(Boolean).join(', ') || 'Ninguna'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-sage mb-1">Reglas</h3>
                <p className="text-sm text-carbon/60">{data.meal_rules.length} reglas definidas</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-sage mb-1">Alimentos</h3>
                <p className="text-sm text-carbon/60">
                  {data.allowed_foods.length} permitidos · {data.prohibited_foods.length} prohibidos · {data.limited_foods.length} limitados
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 px-6 py-4 bg-cream z-50">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={prev}
              className="h-12 px-6 rounded-xl border-2 border-carbon/10 text-carbon font-medium text-sm flex items-center gap-2 hover:bg-carbon/5 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Atrás
            </button>
          )}
          {step < 7 ? (
            <button
              onClick={next}
              className="flex-1 h-12 rounded-xl bg-sage text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              Siguiente
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-coral text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-coral/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoaderIcon className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Activar mi plan
                  <CheckIcon className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

function FoodTabStep({
  data,
  addFood,
  removeFood,
  dbFoods,
}: {
  data: OnboardingData
  addFood: (list: 'allowed_foods' | 'prohibited_foods' | 'limited_foods', food: string) => void
  removeFood: (list: 'allowed_foods' | 'prohibited_foods' | 'limited_foods', idx: number) => void
  dbFoods: string[]
}) {
  const [tab, setTab] = useState<'allowed' | 'prohibited' | 'limited'>('allowed')
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')

  const tabs = [
    { key: 'allowed' as const, label: 'Permitidos', list: 'allowed_foods' as const, activeBg: 'bg-sage text-white', inactiveBg: 'text-carbon/40' },
    { key: 'prohibited' as const, label: 'Prohibidos', list: 'prohibited_foods' as const, activeBg: 'bg-coral text-white', inactiveBg: 'text-carbon/40' },
    { key: 'limited' as const, label: 'Limitados', list: 'limited_foods' as const, activeBg: 'bg-maize text-carbon', inactiveBg: 'text-carbon/40' },
  ]

  const currentTab = tabs.find((t) => t.key === tab)!
  const currentList = data[currentTab.list]

  const allFoods = dbFoods.length > 0 ? dbFoods : COMMON_FOODS_FALLBACK
  const filteredFoods = allFoods.filter(
    (f) =>
      f.toLowerCase().includes(search.toLowerCase()) &&
      !currentList.includes(f)
  )

  const handleAdd = (food: string) => {
    addFood(currentTab.list, food)
    setInput('')
    setSearch('')
  }

  const chipBg = {
    allowed: 'bg-sage/10 text-sage',
    prohibited: 'bg-coral/10 text-coral',
    limited: 'bg-maize/20 text-carbon',
  }

  return (
    <div className="flex flex-col gap-4 pt-6" style={{ animation: 'slideUp 0.5s ease-out both' }}>
      <h2 className="font-heading text-2xl font-bold text-carbon">Alimentos</h2>

      <div className="flex gap-2 bg-white rounded-xl p-1 border border-card-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setInput(''); setSearch('') }}
            className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? t.activeBg
                : t.inactiveBg
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-carbon/30" />
          <input
            type="text"
            placeholder="Buscar o escribir alimento..."
            value={search || input}
            onChange={(e) => {
              setInput(e.target.value)
              setSearch(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                e.preventDefault()
                handleAdd(input.trim())
              }
            }}
            className="h-12 w-full pl-10 pr-4 rounded-xl border border-card-border bg-white text-carbon placeholder:text-carbon/30 focus:outline-none focus:ring-2 focus:ring-sage/50 transition-all"
          />
        </div>
        <button
          onClick={() => input.trim() && handleAdd(input.trim())}
          className="h-12 px-4 rounded-xl bg-sage text-white font-medium text-sm flex items-center gap-1 active:scale-[0.97] transition-all"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {search && filteredFoods.length > 0 && (
        <div className="bg-white rounded-xl border border-card-border max-h-48 overflow-y-auto">
          {filteredFoods.map((f) => (
            <button
              key={f}
              onClick={() => handleAdd(f)}
              className="w-full px-4 py-3 text-left text-sm text-carbon hover:bg-cream transition-colors border-b border-carbon/5 last:border-0 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4 text-sage" />
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentList.map((food, i) => (
          <span
            key={food}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${chipBg[tab]}`}
          >
            {food}
            <button onClick={() => removeFood(currentTab.list, i)} className="hover:opacity-70">
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {currentList.length === 0 && (
          <p className="text-sm text-carbon/30 py-2">No hay alimentos agregados aún.</p>
        )}
      </div>
    </div>
  )
}
