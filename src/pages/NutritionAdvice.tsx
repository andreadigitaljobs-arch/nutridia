import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { getNutritionAdvice } from '@/lib/ai'
import { LeafIcon, SendIcon } from '@/components/Icons'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const quickQuestions = [
  'Que puedo comer hoy?',
  'Alternativa para almuerzo',
  'Cuantas proteinas necesito?',
]

export default function NutritionAdvice() {
  const { profile, nutritionPlan } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const answer = await getNutritionAdvice(text, {
        name: profile?.name || 'Usuario',
        weight: profile?.current_weight_kg ?? undefined,
        height: profile?.height_cm ?? undefined,
        calories: nutritionPlan?.daily_calorie_target ?? undefined,
      })
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Lo siento, hubo un error. Intenta de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col animate-fade-in">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-3xl font-heading font-bold text-carbon">Asesoria Nutricional</h1>
        <p className="text-sm text-carbon/50 mt-1">Preguntale a NutriDIA</p>
      </div>

      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
            <LeafIcon className="text-sage" size={32} />
          </div>
          <p className="text-sm text-carbon/50 text-center mb-6">
            Elige una pregunta rapida o escribe la tuya
          </p>
          <div className="space-y-2 w-full max-w-sm">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="w-full bg-white rounded-2xl px-4 py-3 text-sm font-medium text-carbon border border-card-border text-left active:scale-[0.98] transition-transform hover:border-sage/30"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sage text-white rounded-br-md'
                  : 'bg-white text-carbon border border-card-border rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-card-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-carbon/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-carbon/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-carbon/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4">
        <div className="bg-white rounded-2xl border border-card-border flex items-center gap-2 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send(input)
            }}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-3 py-2 text-sm text-carbon outline-none bg-transparent"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-white disabled:opacity-40 shrink-0"
          >
            <SendIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
