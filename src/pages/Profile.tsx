import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import {
  BellIcon,
  LeafIcon,
  ChevronRightIcon,
  TargetIcon,
  UserIcon,
  EditIcon,
  ScaleIcon,
} from '@/components/Icons'

interface FoodRule {
  id: string
  food_id: string
  status: 'allowed' | 'prohibited' | 'allowed_limited'
  notes: string | null
}

export default function Profile() {
  const { profile, nutritionPlan, signOut } = useAuth()
  const navigate = useNavigate()
  const [allowedFoods, setAllowedFoods] = useState<FoodRule[]>([])
  const [restrictions, setRestrictions] = useState<FoodRule[]>([])
  const [loadingFoodRules, setLoadingFoodRules] = useState(true)

  const age = profile?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(profile.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  const waterLiters = nutritionPlan?.daily_water_target_ml
    ? (nutritionPlan.daily_water_target_ml / 1000).toFixed(1)
    : null

  useEffect(() => {
    if (!profile?.user_id) return

    const fetchFoodRules = async () => {
      setLoadingFoodRules(true)
      try {
        const { data, error } = await supabase
          .from('user_food_rules')
          .select('id, food_id, status, notes')
          .eq('user_id', profile.user_id)

        if (error) console.error('Error fetching food rules:', error)

        if (data) {
          setAllowedFoods(
            data.filter((r) => r.status === 'allowed').slice(0, 4)
          )
          setRestrictions(
            data.filter((r) => r.status === 'prohibited' || r.status === 'allowed_limited')
          )
        }
      } catch (err) {
        console.error('Unexpected error fetching food rules:', err)
      } finally {
        setLoadingFoodRules(false)
      }
    }

    fetchFoodRules()
  }, [profile?.user_id])

  return (
    <div className="min-h-screen bg-cream pb-4 px-4 pt-4 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <img src="/brand/logo-horizontal.png" alt="Nutri Dia" className="w-32" />
        <div className="relative cursor-pointer" onClick={() => alert('Proximamente')}>
          <BellIcon className="text-carbon" size={24} />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-coral rounded-full border-2 border-cream" />
        </div>
      </div>

      <h1 className="text-3xl font-bold font-heading text-carbon">Mi plan</h1>
      <p className="text-sm text-carbon/50 mt-1">Tu plan, tu menú, tu progreso.</p>

      <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
            <UserIcon className="text-sage" size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-heading font-semibold text-carbon truncate">
              {profile?.name ?? 'Usuario'}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-sage/10 text-sage text-xs font-medium">
              <LeafIcon size={12} />
              Plan activo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-5">
          <div className="text-center">
            <p className="text-xs text-carbon/50">Edad</p>
            <p className="text-sm font-heading font-semibold text-carbon mt-1">
              {age != null ? `${age} años` : '--'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-carbon/50">Estatura</p>
            <p className="text-sm font-heading font-semibold text-carbon mt-1">
              {profile?.height_cm != null ? `${profile.height_cm} cm` : '--'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-carbon/50">Objetivo</p>
            <p className="text-sm font-heading font-semibold text-carbon mt-1">
              {nutritionPlan?.daily_calorie_target != null
                ? `${nutritionPlan.daily_calorie_target} kcal/día`
                : '--'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-carbon/50">Agua</p>
            <p className="text-sm font-heading font-semibold text-carbon mt-1">
              {waterLiters != null ? `${waterLiters} L/día` : '--'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile/plan')}>
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sage">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-carbon">Reglas por comida</p>
          <p className="text-sm text-carbon/50 mt-0.5">
            Organiza tus comidas y porciones para alcanzar tu objetivo.
          </p>
        </div>
        <ChevronRightIcon className="text-carbon/30 shrink-0" size={20} />
      </div>

      <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile/foods')}>
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
          <LeafIcon className="text-sage" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sage">Permitidos</p>
          <p className="text-sm text-carbon/50 mt-0.5">
            Alimentos que puedes incluir en tu plan sin restricciones.
          </p>
        </div>
          <div className="flex items-center gap-1 shrink-0">
          {loadingFoodRules ? (
            <div className="w-6 h-4 bg-card-border rounded animate-pulse" />
          ) : allowedFoods.length > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sage/10 text-sage text-xs font-medium">
              +{allowedFoods.length}
            </span>
          ) : null}
          <ChevronRightIcon className="text-carbon/30" size={20} />
        </div>
      </div>

      <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile/restrictions')}>
        <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
          <TargetIcon className="text-coral" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-coral">Restricciones</p>
          <p className="text-sm text-carbon/50 mt-0.5">
            Alimentos que debes limitar o evitar en tu plan.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {loadingFoodRules ? (
              <div className="flex gap-1.5">
                <div className="w-16 h-4 bg-card-border rounded animate-pulse" />
                <div className="w-20 h-4 bg-card-border rounded animate-pulse" />
              </div>
            ) : restrictions.length > 0 ? (
              restrictions.slice(0, 3).map((r) => (
                <span
                  key={r.id}
                  className="inline-block px-2 py-0.5 rounded-full bg-coral/5 text-coral text-[10px] font-medium"
                >
                  {r.notes || (r.status === 'prohibited' ? 'Sin este alimento' : 'Limitado')}
                </span>
              ))
            ) : null}
          </div>
        </div>
        <ChevronRightIcon className="text-carbon/30 shrink-0" size={20} />
      </div>

      <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile/assessments')}>
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
          <ScaleIcon className="text-sage" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-carbon">Evaluaciones corporales</p>
          <p className="text-sm text-carbon/50 mt-0.5">
            Historial de medidas y composicion corporal.
          </p>
        </div>
        <ChevronRightIcon className="text-carbon/30 shrink-0" size={20} />
      </div>

      <button onClick={() => navigate('/profile/plan')} className="w-full mt-6 h-14 flex items-center justify-center gap-2 border border-sage text-sage font-medium rounded-xl hover:bg-sage/5 transition-colors">
        <EditIcon size={18} />
        Editar plan
      </button>

      <button onClick={async () => { await signOut(); navigate('/login', { replace: true }) }} className="w-full mt-3 h-12 flex items-center justify-center gap-2 text-coral font-medium text-sm rounded-xl hover:bg-coral/5 transition-colors">
        Cerrar sesión
      </button>
    </div>
  )
}
