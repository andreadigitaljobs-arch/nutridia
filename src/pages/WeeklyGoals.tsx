import { useState, useEffect } from 'react'
import { TargetIcon, CheckIcon, RefreshIcon } from '@/components/Icons'

interface Goal {
  id: string
  text: string
  completed: boolean
}

interface WeekData {
  weekStart: string
  goals: Goal[]
}

const STORAGE_KEY = 'nutridia_weekly_goals'

const defaultGoals: Goal[] = [
  { id: '1', text: 'Bajar 0.5 kg', completed: false },
  { id: '2', text: 'Beber 4L de agua 5/7 dias', completed: false },
  { id: '3', text: 'Registrar todas las comidas', completed: false },
  { id: '4', text: 'Ejercicio 3 veces', completed: false },
]

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return monday.toISOString().split('T')[0]
}

function loadGoals(): WeekData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data: WeekData = JSON.parse(raw)
      if (data.weekStart === getWeekStart()) {
        return data
      }
    }
  } catch { /* ignore */ }
  return { weekStart: getWeekStart(), goals: [...defaultGoals] }
}

function saveGoals(data: WeekData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export default function WeeklyGoals() {
  const [data, setData] = useState<WeekData>(loadGoals)
  const [weekLabel] = useState(() => {
    const start = new Date(getWeekStart())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    return `${fmt(start)} - ${fmt(end)}`
  })

  useEffect(() => {
    saveGoals(data)
  }, [data])

  const completedCount = data.goals.filter((g) => g.completed).length
  const total = data.goals.length
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const toggleGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)),
    }))
  }

  const resetWeek = () => {
    setData({ weekStart: getWeekStart(), goals: [...defaultGoals] })
  }

  return (
    <div className="min-h-screen bg-cream pb-4 px-4 pt-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <img src="/brand/logo-horizontal.png" alt="Nutri Dia" className="w-32" />
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
          <TargetIcon className="text-sage" size={22} />
        </div>
      </div>

      <h1 className="text-3xl font-heading font-bold text-carbon">Metas Semanales</h1>
      <p className="text-sm text-carbon/50 mt-1">{weekLabel}</p>

      <div className="bg-white rounded-2xl p-5 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-heading font-semibold text-carbon">Progreso</p>
          <span className="text-sm font-bold text-sage">{completedCount}/{total}</span>
        </div>
        <div className="relative h-3 bg-carbon/5 rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-full bg-sage rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-carbon/40">{progressPct}% completado</p>
      </div>

      <div className="mt-6 space-y-3 animate-stagger">
        {data.goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm transition-all active:scale-[0.98] ${
              goal.completed ? 'border border-sage/30' : 'border border-card-border'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                goal.completed ? 'bg-sage text-white' : 'bg-cream-dark text-carbon/30'
              }`}
            >
              {goal.completed ? <CheckIcon size={20} /> : <div className="w-4 h-4 rounded-full border-2 border-carbon/20" />}
            </div>
            <p
              className={`font-heading text-sm font-medium transition-colors ${
                goal.completed ? 'text-sage line-through' : 'text-carbon'
              }`}
            >
              {goal.text}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={resetWeek}
          className="w-full flex items-center justify-center gap-2 bg-white border border-card-border rounded-2xl py-3 text-sm font-medium text-carbon/60 active:scale-[0.98] transition-transform"
        >
          <RefreshIcon size={16} />
          Reiniciar semana
        </button>
      </div>
    </div>
  )
}
