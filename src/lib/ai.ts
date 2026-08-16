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

export interface NutritionEstimate {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  default_unit: string
}

export async function estimateNutrition(foodName: string): Promise<NutritionEstimate | null> {
  const prompt = `Estima los valores nutricionales por 100g de este alimento: "${foodName}".
Responde SOLO en JSON valido: {"name":"...","calories":0,"protein":0,"carbs":0,"fat":0,"default_unit":"g"}
Sin texto adicional. Usa valores aproximados pero realistas.`

  const content = await groqChat([
    { role: 'system', content: 'Eres un nutricionista experto. Responde siempre en JSON valido.' },
    { role: 'user', content: prompt },
  ], 'llama-3.1-8b-instant')

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch {
    return null
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

export interface WeeklyMealPlan {
  days: {
    day: string
    meals: {
      type: string
      name: string
      foods: { name: string; amount: string; grams: number }[]
      calories: number
    }[]
  }[]
}

export async function generateWeeklyMealPlan(
  calorieTarget: number,
  allowedFoods: string[],
  restrictions: string[] = []
): Promise<WeeklyMealPlan | null> {
  const prompt = `Genera un plan de comidas semanal para una persona con ${calorieTarget} kcal/dia.
Alimentos permitidos: ${allowedFoods.slice(0, 30).join(', ')}
${restrictions.length > 0 ? `Restricciones: ${restrictions.join(', ')}` : ''}

Cada dia tiene: Desayuno (3 proteinas + 1 fruta + 1 carbohidrato), Almuerzo (4 proteinas + 1 carbohidrato + 1 aguacate), Merienda (2 proteinas), Cena (4 proteinas + 1 ensalada).
1 racion de proteina = 30g. 1 racion de carbohidrato = la porcion indicada en la lista.

Responde SOLO en JSON valido: {"days":[{"day":"Lunes","meals":[{"type":"Desayuno","name":"...","foods":[{"name":"...","amount":"...","grams":0}],"calories":0}]}]}
Sin texto adicional.`

  const content = await groqChat([
    { role: 'system', content: 'Eres un nutricionista experto en planes de dieta. Responde siempre en JSON valido.' },
    { role: 'user', content: prompt },
  ])

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch {
    return null
  }
}

export interface FoodAlternative {
  original: string
  alternative: string
  reason: string
  calories: number
  protein: number
}

export async function findFoodAlternatives(
  foodName: string,
  allowedFoods: string[]
): Promise<FoodAlternative[]> {
  const prompt = `El usuario quiere un alimento similar a "${foodName}" pero no lo tiene disponible.
Alimentos que si tiene: ${allowedFoods.slice(0, 20).join(', ')}
Sugiere 3 alternativas similares en propiedades nutricionales.
Responde SOLO en JSON: [{"original":"${foodName}","alternative":"...","reason":"...","calories":0,"protein":0}]
Sin texto adicional.`

  const content = await groqChat([
    { role: 'system', content: 'Eres un nutricionista. Responde siempre en JSON valido.' },
    { role: 'user', content: prompt },
  ])

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    return []
  }
}

export interface ShoppingItem {
  name: string
  category: string
  amount: string
}

export async function generateShoppingList(
  weeklyPlan: WeeklyMealPlan
): Promise<ShoppingItem[]> {
  const mealsStr = weeklyPlan.days.flatMap(d => d.meals.map(m => `${m.name}: ${m.foods.map(f => `${f.name} ${f.amount}`).join(', ')}`)).join('\n')

  const prompt = `Basado en este plan semanal, genera una lista de compras agrupada por categoria:
${mealsStr}

Responde SOLO en JSON: [{"name":"...","category":"...","amount":"..."}]
Categorias: Proteinas, Carbohidratos, Frutas, Vegetales, Lacteos, Grasas, Otros.
Sin texto adicional.`

  const content = await groqChat([
    { role: 'system', content: 'Eres un asistente de compras. Responde siempre en JSON valido.' },
    { role: 'user', content: prompt },
  ])

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    return []
  }
}
