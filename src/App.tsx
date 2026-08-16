import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'
import AppLayout from '@/layouts/AppLayout'
import Welcome from '@/pages/Welcome'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import Onboarding from '@/pages/Onboarding'
import Today from '@/pages/Today'
import MealOptions from '@/pages/MealOptions'
import MealDetail from '@/pages/MealDetail'
import Collection from '@/pages/Collection'
import Progress from '@/pages/Progress'
import Profile from '@/pages/Profile'
import ProfilePlan from '@/pages/ProfilePlan'
import ProfileFoods from '@/pages/ProfileFoods'
import ProfileRestrictions from '@/pages/ProfileRestrictions'
import ProfileAssessments from '@/pages/ProfileAssessments'
import History from '@/pages/History'
import Skeleton from '@/components/Skeleton'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    )
  }
  if (user && profile?.has_completed_onboarding) return <Navigate to="/today" replace />
  if (user && !profile?.has_completed_onboarding) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/today" element={<Today />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/meal/:mealType" element={<ProtectedRoute><MealOptions /></ProtectedRoute>} />
      <Route path="/meal-option/:id" element={<ProtectedRoute><MealDetail /></ProtectedRoute>} />
      <Route path="/profile/plan" element={<ProtectedRoute><ProfilePlan /></ProtectedRoute>} />
      <Route path="/profile/foods" element={<ProtectedRoute><ProfileFoods /></ProtectedRoute>} />
      <Route path="/profile/restrictions" element={<ProtectedRoute><ProfileRestrictions /></ProtectedRoute>} />
      <Route path="/profile/assessments" element={<ProtectedRoute><ProfileAssessments /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
