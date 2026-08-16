import { Outlet } from 'react-router-dom'
import BottomNavigation from '@/components/BottomNavigation'
import Notifications from '@/components/Notifications'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-cream max-w-lg mx-auto relative overflow-x-hidden">
      <div className="pb-20">
        <Outlet />
      </div>
      <Notifications />
      <BottomNavigation />
    </div>
  )
}
