import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, NutritionPlan } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  nutritionPlan: NutritionPlan | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  const fetchNutritionPlan = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching nutrition plan:', error);
        return null;
      }

      setNutritionPlan(data);
      return data;
    } catch (err) {
      console.error('Unexpected error fetching nutrition plan:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      await fetchNutritionPlan(user.id);
    }
  }, [user, fetchProfile, fetchNutritionPlan]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchNutritionPlan(session.user.id),
        ]).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchNutritionPlan(session.user.id),
        ]).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setNutritionPlan(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchNutritionPlan]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return { error: 'Error al iniciar sesión' };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return { error: 'Error al crear la cuenta' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setNutritionPlan(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        nutritionPlan,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
