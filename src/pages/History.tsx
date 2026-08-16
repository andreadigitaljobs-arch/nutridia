import { useEffect, useState, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import BottomNavigation from '@/components/BottomNavigation'
import Card from '@/components/Card'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { MealLog, HydrationLog, WeightHistory } from '@/types/database'

interface DayData {
  date: string
  meals: MealLog[]
  water: HydrationLog[]
  weight: WeightHistory | null
}

export default function History() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayDataMap, setDayDataMap] = useState<Record<string, DayData>>({})
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const startStr = calendarStart.toISOString()
  const endStr = calendarEnd.toISOString()

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const startDate = format(calendarStart, 'yyyy-MM-dd')
    const endDate = format(calendarEnd, 'yyyy-MM-dd')

    const [mealsRes, waterRes, weightRes] = await Promise.all([
      supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate),
    ])

    const meals = (mealsRes.data as MealLog[]) ?? []
    const water = (waterRes.data as HydrationLog[]) ?? []
    const weights = (weightRes.data as WeightHistory[]) ?? []

    const map: Record<string, DayData> = {}
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd')
      map[dateStr] = {
        date: dateStr,
        meals: meals.filter((m) => m.date === dateStr),
        water: water.filter((w) => w.date === dateStr),
        weight: weights.find((w) => w.date === dateStr) ?? null,
      }
    }

    setDayDataMap(map)
    setLoading(false)
  }, [user, startStr, endStr])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function prevMonth() {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  function nextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const selected = selectedDay ? dayDataMap[selectedDay] : null

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

  return (
    <div className="min-h-screen bg-cream pb-24 px-4 pt-12">
      <h1 className="text-2xl font-heading font-bold text-carbon">Historial</h1>
      <p className="text-sm text-carbon/50 mt-1">Tu día a día NutriDía</p>

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-carbon/5">
            <ChevronLeftIcon className="h-5 w-5 text-carbon/60" />
          </button>
          <p className="font-heading font-semibold text-carbon capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-carbon/5">
            <ChevronRightIcon className="h-5 w-5 text-carbon/60" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-carbon/40 py-1">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-mint/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const inMonth = isSameMonth(day, currentMonth)
              const today = isToday(day)
              const data = dayDataMap[dateStr]
              const hasData = data && (data.meals.length > 0 || data.water.length > 0 || data.weight)
              const isSelected = selectedDay === dateStr

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`
                    h-10 rounded-lg flex flex-col items-center justify-center text-xs transition-colors relative
                    ${!inMonth ? 'text-carbon/20' : 'text-carbon'}
                    ${today ? 'bg-sage/10 font-bold' : ''}
                    ${isSelected ? 'bg-sage text-white font-semibold' : ''}
                    ${hasData && !isSelected ? 'bg-mint/30' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {hasData && !isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {data.meals.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-sage" />
                      )}
                      {data.water.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-sage-light" />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </Card>

      {selected && (
        <Card className="mt-4">
          <p className="font-heading font-semibold text-carbon mb-3">
            {format(new Date(selectedDay!), 'dd MMMM yyyy', { locale: es })}
          </p>

          {selected.meals.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-carbon/40 mb-1">Comidas</p>
              {selected.meals.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1.5">
                   <span className="text-sm text-carbon">{m.notes ?? 'Comida'}</span>
                   <span className="text-xs text-carbon/50">{m.estimated_calories} kcal</span>
                </div>
              ))}
            </div>
          )}

          {selected.water.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-carbon/40 mb-1">Hidratación</p>
              <p className="text-sm text-carbon">
                {(selected.water.reduce((s, w) => s + w.amount_ml, 0) / 1000).toFixed(1)} L
              </p>
            </div>
          )}

          {selected.weight && (
            <div>
              <p className="text-xs text-carbon/40 mb-1">Peso</p>
              <p className="text-sm text-carbon">{selected.weight.weight_kg} kg</p>
            </div>
          )}

          {selected.meals.length === 0 && selected.water.length === 0 && !selected.weight && (
            <p className="text-sm text-carbon/40">Sin datos registrados este día.</p>
          )}
        </Card>
      )}

      <BottomNavigation />
    </div>
  )
}
