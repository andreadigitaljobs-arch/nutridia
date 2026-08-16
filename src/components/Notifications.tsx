import { useState, useEffect, useRef, useCallback } from 'react'
import { BellIcon, SettingsIcon, XIcon, CheckIcon, WaterDropIcon, SunIcon, BowlIcon, MoonIcon, PlantIcon } from '@/components/Icons'

interface ReminderSetting {
  id: string
  label: string
  time: string
  enabled: boolean
  icon: typeof SunIcon
  color: string
  bg: string
}

const DEFAULT_SETTINGS: ReminderSetting[] = [
  { id: 'breakfast', label: 'Desayuno', time: '07:00', enabled: true, icon: SunIcon, color: 'text-coral', bg: 'bg-cream-dark' },
  { id: 'lunch', label: 'Almuerzo', time: '12:00', enabled: true, icon: BowlIcon, color: 'text-sage', bg: 'bg-mint-light' },
  { id: 'snack', label: 'Merienda', time: '15:30', enabled: true, icon: PlantIcon, color: 'text-sage', bg: 'bg-mint-light' },
  { id: 'dinner', label: 'Cena', time: '19:00', enabled: true, icon: MoonIcon, color: 'text-[#C4930A]', bg: 'bg-[#FFF3D6]' },
  { id: 'water', label: 'Agua', time: 'hourly', enabled: true, icon: WaterDropIcon, color: 'text-sage', bg: 'bg-mint-light' },
]

const STORAGE_KEY = 'nutridia_reminder_settings'
const LAST_FIRED_KEY = 'nutridia_reminder_last_fired'

function loadSettings(): ReminderSetting[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return DEFAULT_SETTINGS.map(ds => {
        const saved = parsed.find((s: ReminderSetting) => s.id === ds.id)
        return { ...ds, enabled: saved?.enabled ?? ds.enabled }
      })
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS
}

function saveSettings(settings: ReminderSetting[]) {
  const toStore = settings.map(({ id, enabled }) => ({ id, enabled }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
}

function getLastFired(): Record<string, string> {
  try {
    const stored = localStorage.getItem(LAST_FIRED_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return {}
}

function setLastFired(data: Record<string, string>) {
  localStorage.setItem(LAST_FIRED_KEY, JSON.stringify(data))
}

function sendNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/brand/icon.png',
      badge: '/brand/icon.png',
      tag: `nutridia-${title}`,
    })
  }
}

export default function Notifications() {
  const [settings, setSettings] = useState<ReminderSetting[]>(loadSettings)
  const [showPanel, setShowPanel] = useState(false)
  const lastFiredRef = useRef<Record<string, string>>(getLastFired())

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const checkAndFire = useCallback(() => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hours}:${minutes}`
    const today = now.toISOString().slice(0, 10)
    const lastFired = lastFiredRef.current

    settings.forEach(setting => {
      if (!setting.enabled) return

      if (setting.time === 'hourly') {
        const key = `water-${today}-${hours}`
        if (lastFired[key]) return
        sendNotification('Hora del agua', 'Recuerda hidratarte. Bebe un vaso de agua.')
        lastFired[key] = currentTime
      } else {
        if (lastFired[setting.id] === currentTime) return
        if (currentTime === setting.time) {
          sendNotification(`Hora de ${setting.label}`, `Es hora de tu ${setting.label.toLowerCase()}.`)
          lastFired[setting.id] = currentTime
        }
      }
    })

    lastFiredRef.current = lastFired
    setLastFired(lastFired)
  }, [settings])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    checkAndFire()
    const interval = setInterval(checkAndFire, 30000)
    return () => clearInterval(interval)
  }, [checkAndFire])

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="w-10 h-10 rounded-full bg-maize/30 flex items-center justify-center text-[#B8860B] relative"
      >
        <BellIcon size={20} />
        {settings.some(s => s.enabled) && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-coral rounded-full border-2 border-white" />
        )}
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0 bg-carbon/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-maize/30 flex items-center justify-center text-[#B8860B]">
                  <SettingsIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-carbon">Recordatorios</h3>
                  <p className="text-xs text-carbon/45">Configura tus alarmas</p>
                </div>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1.5 rounded-lg hover:bg-carbon/5 text-carbon/40 hover:text-carbon transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {settings.map(setting => {
                const IconComponent = setting.icon
                return (
                  <button
                    key={setting.id}
                    onClick={() => toggleSetting(setting.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-cream"
                  >
                    <div className={`w-10 h-10 rounded-xl ${setting.bg} flex items-center justify-center ${setting.color} shrink-0`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-carbon">{setting.label}</p>
                      <p className="text-xs text-carbon/40">
                        {setting.time === 'hourly' ? 'Cada hora' : setting.time}
                      </p>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${
                      setting.enabled ? 'bg-sage' : 'bg-carbon/15'
                    }`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        setting.enabled ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`} />
                      {setting.enabled && (
                        <CheckIcon size={12} className="absolute left-2.5 top-1.5 text-white" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 bg-cream rounded-xl p-3">
              <p className="text-xs text-carbon/50 text-center">
                Activa las notificaciones del navegador para recibir recordatorios.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
