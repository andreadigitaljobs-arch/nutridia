const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function groqChat(messages: GroqMessage[], model = 'llama-3.1-8b-instant'): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    throw new Error('Error en la API de IA')
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

export interface FoodAnalysis {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  description: string
}

export async function analyzeFoodFromImage(base64Image: string): Promise<FoodAnalysis[]> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analiza esta imagen de comida. Identifica cada alimento visible y estima: nombre, calorias, proteinas (g), carbohidratos (g), grasa (g). Responde SOLO en JSON valido como array: [{"name":"...","calories":0,"protein":0,"carbs":0,"fat":0,"description":"..."}]. Sin texto adicional.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) throw new Error('Error al analizar la imagen')

  const data = await response.json()
  const content = data.choices[0]?.message?.content || '[]'

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    return []
  }
}

export interface MealSuggestion {
  name: string
  description: string
  calories: number
  ingredients: string[]
  preparation: string
}

export async function suggestMeals(
  mealType: string,
  calorieTarget: number,
  restrictions: string[] = [],
  allowedFoods: string[] = []
): Promise<MealSuggestion[]> {
  const prompt = `Eres un nutricionista. Sugiere 3 opciones de ${mealType} para una persona con meta de ${calorieTarget} calorias.
${restrictions.length > 0 ? `Restricciones: ${restrictions.join(', ')}` : ''}
${allowedFoods.length > 0 ? `Alimentos preferidos: ${allowedFoods.slice(0, 10).join(', ')}` : ''}

Responde SOLO en JSON valido como array:
[{"name":"...","description":"...","calories":0,"ingredients":["..."],"preparation":"..."}]
Sin texto adicional.`

  const content = await groqChat([
    { role: 'system', content: 'Eres un asistente nutricional. Siempre responde en JSON valido.' },
    { role: 'user', content: prompt },
  ])

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    return []
  }
}

export async function getNutritionAdvice(
  question: string,
  userProfile: { name: string; weight?: number; height?: number; calories?: number }
): Promise<string> {
  const content = await groqChat([
    {
      role: 'system',
      content: `Eres NutriDIA, un asistente nutricional amigable. Responde en español, se conciso y util. Usuario: ${userProfile.name}${userProfile.weight ? `, peso: ${userProfile.weight}kg` : ''}${userProfile.height ? `, altura: ${userProfile.height}cm` : ''}${userProfile.calories ? `, meta: ${userProfile.calories} kcal/dia` : ''}.`,
    },
    { role: 'user', content: question },
  ])

  return content
}
