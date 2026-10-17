import { Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import LandingPage from '../pages/public/LandingPage'
import LoginPage from '../pages/public/LoginPage'
import NotFoundPage from '../pages/public/NotFoundPage'
import UserRoutes from '../routes/UserRoutes'
import AdminRoutes from '../routes/AdminRoutes'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route path="/app/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}