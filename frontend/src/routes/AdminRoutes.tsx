import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import ManageEventsPage from '../pages/admin/ManageEventsPage'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allow={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="events" element={<ManageEventsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}