import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@/components/Icons'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import Skeleton from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import type { UserAvailableFood } from '@/types/database'

interface AllowedFoodWithJoin extends UserAvailableFood {
  foods: { name: string; food_categories: { name: string } | null } | null
}

export default function ProfileFoods() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [foods, setFoods] = useState<AllowedFoodWithJoin[]>([])
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('user_available_foods')
      .select('*, foods(name, food_categories(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    setFoods((data as AllowedFoodWithJoin[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const groupedFoods = foods.reduce<Record<string, AllowedFoodWithJoin[]>>((acc, food) => {
    const cat = food.foods?.food_categories?.name ?? 'Otros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(food)
    return acc
  }, {})

  async function toggleAvailable(food: AllowedFoodWithJoin) {
    if (!user) return
    setSaving(true)
    await supabase
      .from('user_available_foods')
      .update({ available: !food.available })
      .eq('id', food.id)
    setSaving(false)
    fetchData()
  }

  const categoryEmojis: Record<string, string> = {
    'Proteína': '🥩',
    'Carbohidrato': '🌾',
    'Verdura': '🥬',
    'Fruta': '🍎',
    'Lácteo': '🥛',
    'Grasa saludable': '🥑',
    'Legumbre': '🫘',
    'Fruto seco': '🥜',
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
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-carbon">Permitidos</h1>
          <p className="text-sm text-carbon/50 mt-0.5">Alimentos y porciones permitidas</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="Sin alimentos registrados"
          description="Agrega los alimentos que forman parte de tu plan."
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedFoods).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs font-medium text-carbon/40 uppercase mb-2 px-1">
                {categoryEmojis[cat] ?? '🍽️'} {cat}
              </p>
              <div className="space-y-2">
                {items.map((food) => (
                  <Card key={food.id} className="flex items-center gap-3">
                    <span className="text-lg">{categoryEmojis[cat] ?? '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-carbon">{food.foods?.name ?? 'Alimento'}</p>
                    </div>
                    <button
                      onClick={() => toggleAvailable(food)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        food.available ? 'bg-sage/10 text-sage' : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {food.available ? 'Permitido' : 'No permitido'}
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
