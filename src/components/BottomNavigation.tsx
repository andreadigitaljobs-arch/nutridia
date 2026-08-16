import { useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, BookmarkIcon, BarChartIcon, UserIcon } from '@/components/Icons'

const tabs = [
  { path: '/today', label: 'Hoy', icon: HomeIcon },
  { path: '/collection', label: 'Colección', icon: BookmarkIcon },
  { path: '/progress', label: 'Progreso', icon: BarChartIcon },
  { path: '/profile', label: 'Perfil', icon: UserIcon },
]

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white/80 backdrop-blur-xl border-t border-card-border/50 px-2 pt-2 pb-2">
        <div className="flex items-center justify-around max-w-lg mx-auto relative">
          {tabs.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1 min-w-[64px] py-1.5 px-3 outline-none relative z-10 group"
              >
                <div
                  className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all duration-500 ease-out ${
                    isActive
                      ? 'bg-sage/10'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon
                    size={22}
                    className={`transition-all duration-500 ease-out ${
                      isActive ? 'text-sage scale-110' : 'text-carbon/30 group-hover:text-carbon/50'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] tracking-wide transition-all duration-500 ease-out ${
                    isActive
                      ? 'text-sage font-semibold'
                      : 'text-carbon/35 font-medium group-hover:text-carbon/55'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
