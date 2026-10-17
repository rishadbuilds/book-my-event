import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import UserLayout from '../layouts/UserLayout'
import DashboardPage from '../pages/user/DashboardPage'
import MyBookingsPage from '../pages/user/MyBookingsPage'

export default function UserRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allow={['user', 'admin']} />}>
        <Route element={<UserLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}