import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import App from './App'
import { HttpErrorPage } from './pages/HttpErrorPage'
import { LandingPage } from './pages/LandingPage'
import { SecurityPage } from './pages/SecurityPage'

/** Route table only — wrap with BrowserRouter or MemoryRouter in tests. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/practice" element={<App />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/404" element={<HttpErrorPage code={404} />} />
      <Route path="/500" element={<HttpErrorPage code={500} />} />
      <Route path="/502" element={<HttpErrorPage code={502} />} />
      <Route path="/not-found" element={<Navigate to="/404" replace />} />
      <Route path="*" element={<HttpErrorPage code={404} />} />
    </Routes>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppErrorBoundary>
          <AppRoutes />
        </AppErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
