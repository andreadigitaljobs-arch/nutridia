import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookmarkIcon, HeartIcon, CheckIcon, XIcon, ChevronRightIcon, UserIcon, BowlIcon, PlusIcon } from '@/components/Icons'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import AddFoodModal from '@/components/AddFoodModal'

interface CollectionEntry {
  id: string
  user_id: string
  option_id: string
  status: 'to_try' | 'favorite' | 'eaten' | 'disliked'
  created_at: string
  option?: { id: string; name: string; estimated_calories: number | null } | null
}

const tabs = [
  { id: 'to_try', label: 'Nuevas', icon: BookmarkIcon },
  { id: 'favorite', label: 'Favoritas', icon: HeartIcon },
  { id: 'eaten', label: 'Comidas', icon: CheckIcon },
  { id: 'disliked', label: 'Descartadas', icon: XIcon },
]

export default function Collection() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('to_try')
  const [items, setItems] = useState<CollectionEntry[]>([])
  const [showAddFood, setShowAddFood] = useState(false)

  async function fetchData() {
    if (!user) return
    setLoading(true)
    const { data: items } = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const optionIds = (items ?? []).map(i => i.option_id).filter(Boolean)
    const { data: options } = await supabase
      .from('daily_menu_options')
      .select('id, name, estimated_calories')
      .in('id', optionIds)

    const itemsWithNames = (items ?? []).map(item => ({
      ...item,
      option: options?.find(o => o.id === item.option_id) ?? null
    })) as CollectionEntry[]

    setItems(itemsWithNames)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  function filterItems(status: string) {
    return items.filter((i) => i.status === status)
  }

  function getRelativeDate(dateStr: string) {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es })
    } catch {
      return ''
    }
  }

  const filtered = filterItems(activeTab)

  return (
    <div className="min-h-screen bg-cream pb-4 px-4 pt-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <img src="/brand/logo-horizontal.png" alt="Nutri Dia" className="w-32" />
        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
          <UserIcon className="text-sage" size={22} />
        </div>
      </div>

      <h1 className="text-3xl font-heading font-bold text-carbon">Colección</h1>
      <p className="text-sm text-carbon/50 mt-1">
        Tus opciones guardadas para más adelante.
      </p>

      <div className="mt-4">
        <button
          onClick={() => setShowAddFood(true)}
          className="w-full bg-white border-2 border-dashed border-card-border rounded-2xl p-4 flex items-center justify-center gap-3 text-carbon/50 font-medium text-sm active:scale-[0.98] transition-transform hover:border-sage/30 hover:text-sage"
        >
          <PlusIcon size={20} />
          Agregar alimento personalizado
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all rounded-xl ${
                isActive
                  ? 'bg-sage text-white shadow-sm'
                  : 'bg-white text-carbon/60 border border-card-border hover:border-sage/30'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <BookmarkIcon className="text-sage" size={28} />
            </div>
            <p className="text-carbon/50 text-sm font-medium">
              No hay opciones guardadas aun
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/meal-option/${item.option_id}`)}
                className="w-full bg-white card-elevated rounded-2xl p-3 flex items-center gap-3 text-left"
              >
                <div className="w-24 h-24 rounded-xl bg-cream-dark flex items-center justify-center shrink-0">
                  <BowlIcon className="text-sage/40" size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-carbon text-sm truncate">
                    {item.option?.name ?? 'Opcion guardada'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {item.option?.estimated_calories != null && (
                      <span className="bg-cream-dark text-carbon/60 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {item.option.estimated_calories} kcal
                      </span>
                    )}
                    {item.status === 'to_try' && (
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Por probar
                      </span>
                    )}
                    {item.status === 'favorite' && (
                      <span className="bg-rose-50 text-rose-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Favorito
                      </span>
                    )}
                    {item.status === 'eaten' && (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Probada
                      </span>
                    )}
                    {item.status === 'disliked' && (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        No me gusta
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-carbon/40 mt-1.5">
                    Guardada {getRelativeDate(item.created_at)}
                  </p>
                </div>
                <ChevronRightIcon className="text-carbon/30 shrink-0" size={20} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-sage/5 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
            <BookmarkIcon className="text-sage" size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-carbon">
              Las opciones que descartas se guardan aquí
            </p>
            <p className="text-xs text-carbon/50 mt-1 leading-relaxed">
              Si una sugerencia no te convence ahora, la guardamos en tu colección para que puedas revisarla cuando quieras.
            </p>
            <p className="text-xs text-sage font-semibold mt-2">
              Nada se pierde, todo cuenta para tu progreso.
            </p>
          </div>
        </div>
      </div>

      <AddFoodModal
        isOpen={showAddFood}
        onClose={() => setShowAddFood(false)}
        onFoodAdded={() => { fetchData() }}
      />
    </div>
  )
}
