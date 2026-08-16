import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, EditIcon } from '@/components/Icons'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import Chip from '@/components/Chip'
import Skeleton from '@/components/Skeleton'
import type { MealType, MealRule } from '@/types/database'
import { getMealTypeLabel, MEAL_TYPES } from '@/lib/constants'

export default function ProfilePlan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<MealRule[]>([])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: plan } = await supabase
      .from('nutrition_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (plan) {
      const { data: rules } = await supabase
        .from('meal_rules')
        .select('*')
        .eq('plan_id', plan.id)
      setRules((rules as MealRule[]) ?? [])
    } else {
      setRules([])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const groupedRules = rules.reduce<Record<MealType, MealRule[]>>(
    (acc, rule) => {
      const type = (MEAL_TYPES.find(mt => mt.id === rule.meal_type_id)?.name ?? 'breakfast') as MealType
      if (!acc[type]) acc[type] = []
      acc[type].push(rule)
      return acc
    },
    { breakfast: [], lunch: [], snack: [], dinner: [] }
  )

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']

  const categoryEmojis: Record<string, string> = {
    protein: '🥩',
    carb: '🌾',
    fruit: '🍎',
    fat: '🥑',
    salad: '🥗',
    vegetable: '🥦',
  }

  return (
    <div className="min-h-screen bg-cream pb-6 px-4 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"
        >
          <ChevronLeftIcon className="h-5 w-5 text-carbon" />
        </button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-carbon">Reglas por comida</h1>
          <p className="text-sm text-carbon/50 mt-0.5">Configuración de tu plan alimenticio</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {mealTypes.map((type) => (
            <Card key={type}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {type === 'breakfast' && '🌅'}
                    {type === 'lunch' && '☀️'}
                    {type === 'snack' && '🌤️'}
                    {type === 'dinner' && '🌙'}
                  </span>
                  <h3 className="font-heading font-semibold text-carbon">
                    {getMealTypeLabel(type)}
                  </h3>
                </div>
                <button onClick={() => alert('Edicion de proxima version')} className="p-1.5 rounded-lg hover:bg-carbon/5 text-carbon/40">
                  <EditIcon className="h-4 w-4" />
                </button>
              </div>

              {groupedRules[type].length === 0 ? (
                <p className="text-xs text-carbon/40">Sin reglas configuradas</p>
              ) : (
                <div className="space-y-2">
                  {groupedRules[type].map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm">{categoryEmojis[rule.category] ?? '🍽️'}</span>
                      <span className="text-sm text-carbon flex-1">{rule.category}</span>
                      <Chip>{rule.required_servings} porciones</Chip>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
