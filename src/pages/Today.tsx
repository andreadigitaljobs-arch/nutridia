import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { MEAL_TYPES } from '@/lib/constants';
import { getToday } from '@/utils/date';
import { analyzeFoodFromImage, type FoodAnalysis } from '@/lib/ai';
import { logMeal } from '@/services/mealLogService';
import Modal from '@/components/Modal';
import {
  FlameIcon,
  WaterDropIcon,
  SunIcon,
  MoonIcon,
  PlantIcon,
  ChevronRightIcon,
  UserIcon,
  BowlIcon,
  EggIcon,
  HeartIcon,
} from '@/components/Icons';

interface MealStatus {
  hasSelection: boolean;
  calories: number;
}

interface HydrationData {
  consumedMl: number;
}

export default function Today() {
  const { user, profile, nutritionPlan } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [mealStatuses, setMealStatuses] = useState<Record<string, MealStatus>>({});
  const [hydration, setHydration] = useState<HydrationData>({ consumedMl: 0 });

  const [photoAnalysis, setPhotoAnalysis] = useState<FoodAnalysis[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [loggingFood, setLoggingFood] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calorieTarget = nutritionPlan?.daily_calorie_target ?? 2000;
  const waterTargetL = (nutritionPlan?.daily_water_target_ml ?? 2500) / 1000;
  const proteinTarget = 110;
  const today = getToday();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [mealLogsResult, menuOptionsResult, hydrationResult] = await Promise.all([
          supabase
            .from('meal_logs')
            .select('estimated_calories, meal_type_id')
            .eq('user_id', user?.id)
            .eq('date', today),
          supabase
            .from('daily_menus')
            .select('id, daily_menu_options(meal_type_id, is_selected)')
            .eq('user_id', user?.id)
            .eq('date', today)
            .limit(1),
          supabase
            .from('hydration_logs')
            .select('amount_ml')
            .eq('user_id', user?.id)
            .eq('date', today),
        ]);

        if (mealLogsResult.error) console.error('Error fetching meal logs:', mealLogsResult.error);
        if (menuOptionsResult.error) console.error('Error fetching menu options:', menuOptionsResult.error);
        if (hydrationResult.error) console.error('Error fetching hydration:', hydrationResult.error);

        if (mealLogsResult.error || menuOptionsResult.error || hydrationResult.error) {
          setError('No se pudieron cargar los datos. Intenta de nuevo.');
          setLoading(false);
          return;
        }

        let totalCalories = 0;
        const statuses: Record<string, MealStatus> = {};

        MEAL_TYPES.forEach((mt) => {
          statuses[mt.id] = { hasSelection: false, calories: 0 };
        });

        if (mealLogsResult.data) {
          mealLogsResult.data.forEach((log) => {
            if (log.estimated_calories) {
              totalCalories += log.estimated_calories;
            }
            if (log.meal_type_id && statuses[log.meal_type_id]) {
              statuses[log.meal_type_id].calories += log.estimated_calories ?? 0;
            } else {
              // Fallback: add calories to total even if meal_type_id is null
            }
          });
        }

        if (menuOptionsResult.data && menuOptionsResult.data.length > 0) {
          const menu = menuOptionsResult.data[0];
          if (Array.isArray(menu.daily_menu_options)) {
            menu.daily_menu_options.forEach((opt: { meal_type_id: string; is_selected: boolean }) => {
              if (opt.is_selected && statuses[opt.meal_type_id]) {
                statuses[opt.meal_type_id].hasSelection = true;
              }
            });
          }
        }

        let totalWaterMl = 0;
        if (hydrationResult.data) {
          hydrationResult.data.forEach((log) => {
            totalWaterMl += log.amount_ml;
          });
        }

        setCaloriesConsumed(totalCalories);
        setMealStatuses(statuses);
        setHydration({ consumedMl: totalWaterMl });
      } catch (err) {
        console.error('Unexpected error fetching data:', err);
        setError('Ocurrió un error inesperado.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setPhotoError(null);
    setPhotoAnalysis(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const results = await analyzeFoodFromImage(base64);
      setPhotoAnalysis(results);
      setShowPhotoModal(true);
    } catch (err) {
      console.error('Error analyzing photo:', err);
      setPhotoError('No se pudo analizar la imagen. Intenta de nuevo.');
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogAnalyzedFood = async (food: FoodAnalysis, index: number) => {
    if (!user) return;
    setLoggingFood(index);

    try {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      const todayStr = getToday();

      await logMeal(user.id, {
        meal_type_id: MEAL_TYPES[0].id,
        date: todayStr,
        time: timeStr,
        foods: {
          [food.name]: {
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
          },
        },
        estimated_calories: food.calories,
        notes: `Analizado con IA: ${food.description}`,
      });

      setCaloriesConsumed((prev) => prev + food.calories);
      setPhotoAnalysis((prev) => prev ? prev.filter((_, i) => i !== index) : null);

      if (photoAnalysis && photoAnalysis.length <= 1) {
        setShowPhotoModal(false);
      }
    } catch (err) {
      console.error('Error logging food:', err);
    } finally {
      setLoggingFood(null);
    }
  };

  const caloriePercent = Math.min(Math.round((caloriesConsumed / calorieTarget) * 100), 100);
  const waterConsumedL = Number((hydration.consumedMl / 1000).toFixed(1));
  const waterPercent = Math.min(Math.round((waterConsumedL / waterTargetL) * 100), 100);

  const mealIconMap: Record<string, typeof SunIcon> = {
    breakfast: SunIcon,
    lunch: BowlIcon,
    snack: PlantIcon,
    dinner: MoonIcon,
  };

  const mealBgMap: Record<string, string> = {
    breakfast: 'bg-cream-dark',
    lunch: 'bg-mint-light',
    snack: 'bg-mint-light',
    dinner: 'bg-[#FFF3D6]',
  };

  const mealColorMap: Record<string, string> = {
    breakfast: 'text-coral',
    lunch: 'text-sage',
    snack: 'text-sage',
    dinner: 'text-[#C4930A]',
  };

  if (error) {
    return (
      <div className="min-h-screen bg-cream pb-4 flex flex-col items-center justify-center px-4">
        <p className="text-sm text-coral font-medium text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-sage text-white rounded-lg text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pb-4">
        <header className="bg-white border-b border-card-border sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="w-32 h-8 bg-card-border rounded animate-pulse" />
            <div className="w-10 h-10 bg-card-border rounded-full animate-pulse" />
          </div>
        </header>
        <main className="px-4 py-6 space-y-6">
          <div className="space-y-2">
            <div className="w-48 h-8 bg-card-border rounded animate-pulse" />
            <div className="w-32 h-4 bg-card-border rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-elevated h-36 animate-pulse" />
            <div className="card-elevated h-36 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="w-40 h-5 bg-card-border rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card-elevated h-28 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-4 animate-fade-in">
      <header className="bg-white border-b border-card-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <img src="/brand/logo-horizontal.png" alt="NutriDia" className="w-32" />
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-mint-light flex items-center justify-center text-sage"
          >
            <UserIcon size={20} />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-carbon">
            Hola, {profile?.name || 'Usuario'}!
          </h1>
          <p className="text-sm text-carbon/50">Tu plan de hoy</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card-elevated space-y-3">
            <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-coral">
              <FlameIcon size={20} />
            </div>
            <p className="text-xs text-carbon/50 font-medium">Calorías consumidas</p>
            <p className="font-heading font-bold text-lg text-carbon">
              {caloriesConsumed} / {calorieTarget} kcal
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-fill progress-bar-sage"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-carbon/40">{caloriePercent}% del objetivo</p>
          </div>

          <div className="card-elevated space-y-3">
            <div className="w-10 h-10 rounded-full bg-mint-light flex items-center justify-center text-sage">
              <WaterDropIcon size={20} />
            </div>
            <p className="text-xs text-carbon/50 font-medium">Hidratación diaria</p>
            <p className="font-heading font-bold text-lg text-carbon">
              {waterConsumedL} / {waterTargetL} L
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-fill progress-bar-sage"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-carbon/40">{waterPercent}% del objetivo</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-carbon">Tus comidas de hoy</h2>
          <div className="space-y-2.5 animate-stagger">
            {MEAL_TYPES.map((mealType) => {
              const IconComponent = mealIconMap[mealType.name] ?? SunIcon;
              const bg = mealBgMap[mealType.name] ?? 'bg-mint-light';
              const color = mealColorMap[mealType.name] ?? 'text-sage';
              const status = mealStatuses[mealType.id];
              const hasSelection = status?.hasSelection ?? false;

              return (
                <button
                  key={mealType.id}
                  onClick={() => navigate(`/meal/${mealType.name}`)}
                  className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 text-left border border-card-border active:scale-[0.98] transition-transform"
                >
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
                    <IconComponent size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm text-carbon">{mealType.display_name}</p>
                    <p className="text-xs text-carbon/45 mt-0.5">
                      {hasSelection ? 'Tu selección está lista' : 'Toca para elegir tu opción'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${hasSelection ? 'bg-sage/10 text-sage' : 'bg-coral/10 text-coral'}`}>
                      {hasSelection ? 'Elegida' : 'Pendiente'}
                    </span>
                    <ChevronRightIcon size={16} className="text-carbon/25" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-elevated space-y-4">
          <h2 className="font-heading text-base font-semibold text-sage">Tu objetivo de hoy</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center text-center space-y-1">
              <FlameIcon size={20} className="text-coral" />
              <p className="text-xs font-semibold text-carbon">Calorías</p>
              <p className="text-sm font-bold text-carbon">{calorieTarget} kcal</p>
              <p className="text-[10px] text-carbon/40">Meta diaria</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <EggIcon size={20} className="text-coral" />
              <p className="text-xs font-semibold text-carbon">Proteína</p>
              <p className="text-sm font-bold text-carbon">{proteinTarget} g</p>
              <p className="text-[10px] text-carbon/40">Meta diaria</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <WaterDropIcon size={20} className="text-sage" />
              <p className="text-xs font-semibold text-carbon">Hidratación</p>
              <p className="text-sm font-bold text-carbon">{waterTargetL} L</p>
              <p className="text-[10px] text-carbon/40">Meta diaria</p>
            </div>
          </div>
          <div className="bg-mint-light/50 rounded-xl p-4 flex items-start gap-3">
            <HeartIcon size={20} className="text-sage mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-carbon/70">
                Cada elección te acerca a tu mejor versión.
              </p>
              <p className="text-sm font-bold text-sage mt-1">Tú puedes</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="w-full bg-sage/10 border-2 border-dashed border-sage/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-sage font-medium text-sm active:scale-[0.98] transition-transform hover:bg-sage/15 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-sage border-t-transparent rounded-full animate-spin" />
                Analizando comida...
              </>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Analizar comida con IA
              </>
            )}
          </button>
          {photoError && (
            <p className="text-xs text-coral mt-2 text-center">{photoError}</p>
          )}
        </div>
      </main>

      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="Análisis de tu comida"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {photoAnalysis && photoAnalysis.length > 0 ? (
            photoAnalysis.map((food, idx) => (
              <div key={idx} className="bg-cream rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-sm text-carbon">{food.name}</p>
                    <p className="text-xs text-carbon/50 mt-0.5">{food.description}</p>
                  </div>
                  <span className="text-sm font-bold text-sage shrink-0 ml-2">{food.calories} kcal</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sage/10 text-sage">
                    P: {food.protein}g
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-maize/20 text-[#B8860B]">
                    C: {food.carbs}g
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-coral/10 text-coral">
                    G: {food.fat}g
                  </span>
                </div>
                <button
                  onClick={() => handleLogAnalyzedFood(food, idx)}
                  disabled={loggingFood === idx}
                  className="w-full mt-2 bg-sage text-white rounded-lg py-2 text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loggingFood === idx ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Registrar
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-carbon/50 text-center py-4">No se detectaron alimentos en la imagen.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}