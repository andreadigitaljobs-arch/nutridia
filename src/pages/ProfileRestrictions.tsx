import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, AlertTriangleIcon, CheckCircleIcon, AlertCircleIcon } from '@/components/Icons'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import Skeleton from '@/components/Skeleton'
import type { UserFoodPreference } from '@/types/database'

interface RestrictionWithJoin extends UserFoodPreference {
  foods: { name: string } | null
}

const preferenceConfig: Record<string, { icon: typeof AlertTriangleIcon; color: string; bg: string; label: string }> = {
  dislike: { icon: AlertTriangleIcon, color: 'text-coral', bg: 'bg-coral/10', label: 'No me gusta' },
  love: { icon: CheckCircleIcon, color: 'text-sage', bg: 'bg-sage/10', label: 'Me encanta' },
  later: { icon: AlertCircleIcon, color: 'text-maize', bg: 'bg-maize/20', label: 'Tal vez después' },
  ok: { icon: CheckCircleIcon, color: 'text-sage', bg: 'bg-sage/10', label: 'Ok' },
}

export default function ProfileRestrictions() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [restrictions, setRestrictions] = useState<RestrictionWithJoin[]>([])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('user_food_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'prohibited')

    setRestrictions((data as RestrictionWithJoin[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
          <h1 className="text-2xl font-heading font-bold text-carbon">Restricciones</h1>
          <p className="text-sm text-carbon/50 mt-0.5">Tus alimentos restringidos</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : restrictions.length === 0 ? (
        <Card className="items-center py-8 text-center">
          <CheckCircleIcon className="h-10 w-10 text-sage mb-3" />
          <p className="font-heading font-semibold text-carbon">Sin restricciones</p>
          <p className="text-sm text-carbon/50 mt-1">No tienes restricciones alimentarias registradas.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {restrictions.map((r) => {
            const config = preferenceConfig[r.preference ?? 'ok'] ?? preferenceConfig.ok
            const Icon = config.icon
            return (
              <Card key={r.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-carbon text-sm">{r.foods?.name ?? 'Alimento'}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
