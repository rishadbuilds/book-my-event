import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import AccountPage from '@/features/account/pages/AccountPage'
import Home from '@/features/home/components/Home'
import ServicesPage from '@/features/services/pages/ServicesPage'
import ServiceDetailPage from '@/features/services/pages/ServiceDetailPage'
import MyBookingsPage from '@/features/bookings/pages/MyBookingsPage'
import ProviderDashboardPage from '@/features/provider/pages/ProviderDashboardPage'
import { SiteLayout } from '@/shared/components/SiteLayout'
import { GuestRoute } from './routes/GuestRoute'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { RoleRoute } from './routes/RoleRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<AccountPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />

              <Route element={<RoleRoute roles={['provider', 'admin']} />}>
                <Route path="/dashboard" element={<ProviderDashboardPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
