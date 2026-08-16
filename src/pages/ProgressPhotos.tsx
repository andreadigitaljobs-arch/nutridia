import { useState, useEffect, useRef } from 'react'
import { CameraIcon, ArrowLeftRightIcon } from '@/components/Icons'

interface Photo {
  id: string
  base64: string
  date: string
  notes: string
}

const STORAGE_KEY = 'nutridia_progress_photos'

function loadPhotos(): Photo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePhotos(photos: Photo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
}

export default function ProgressPhotos() {
  const [photos, setPhotos] = useState<Photo[]>(loadPhotos)
  const [showCompare, setShowCompare] = useState(false)
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    savePhotos(photos)
  }, [photos])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const newPhoto: Photo = {
        id: Date.now().toString(),
        base64,
        date: new Date().toISOString().split('T')[0],
        notes,
      }
      setPhotos((prev) => [newPhoto, ...prev])
      setNotes('')
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

  const firstPhoto = photos.length > 0 ? photos[photos.length - 1] : null
  const latestPhoto = photos.length > 0 ? photos[0] : null

  return (
    <div className="min-h-screen bg-cream pb-4 px-4 pt-12 animate-fade-in">
      <h1 className="text-3xl font-heading font-bold text-carbon">Fotos de Progreso</h1>
      <p className="text-sm text-carbon/50 mt-1">Documenta tu transformacion.</p>

      <div className="mt-4 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-sage text-white rounded-2xl py-3 flex items-center justify-center gap-2 text-sm font-medium active:scale-[0.98] transition-transform"
        >
          <CameraIcon size={20} />
          Tomar o subir foto
        </button>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Nota opcional (ej: dia 15)"
          className="w-full border border-card-border rounded-xl px-3 py-2.5 text-sm text-carbon bg-white outline-none focus:border-sage"
        />
      </div>

      {photos.length >= 2 && (
        <button
          onClick={() => setShowCompare(true)}
          className="mt-4 w-full bg-white rounded-2xl border border-card-border py-3 flex items-center justify-center gap-2 text-sm font-medium text-carbon active:scale-[0.98] transition-transform"
        >
          <ArrowLeftRightIcon size={18} />
          Comparar antes y despues
        </button>
      )}

      <div className="mt-6">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
              <CameraIcon className="text-sage" size={28} />
            </div>
            <p className="text-sm text-carbon/40">No hay fotos aun</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-stagger">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <img src={photo.base64} alt="Progreso" className="w-full aspect-[3/4] object-cover" />
                <div className="p-3">
                  <p className="text-xs text-carbon/50">{formatDate(photo.date)}</p>
                  {photo.notes && (
                    <p className="text-xs text-carbon mt-1 truncate">{photo.notes}</p>
                  )}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="text-[10px] text-coral mt-2 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCompare && firstPhoto && latestPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCompare(false)}
        >
          <div className="absolute inset-0 bg-carbon/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-carbon">Comparacion</h3>
              <button onClick={() => setShowCompare(false)} className="text-carbon/40 text-sm">
                Cerrar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-center text-carbon/50 mb-2 font-medium">Primera foto</p>
                <img src={firstPhoto.base64} alt="Antes" className="w-full rounded-xl aspect-[3/4] object-cover" />
                <p className="text-[10px] text-center text-carbon/40 mt-1">{formatDate(firstPhoto.date)}</p>
              </div>
              <div>
                <p className="text-xs text-center text-carbon/50 mb-2 font-medium">Ultima foto</p>
                <img src={latestPhoto.base64} alt="Despues" className="w-full rounded-xl aspect-[3/4] object-cover" />
                <p className="text-[10px] text-center text-carbon/40 mt-1">{formatDate(latestPhoto.date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
