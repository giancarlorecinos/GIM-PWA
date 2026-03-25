import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { AuthGate } from './components/AuthGate'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import IncidentsPage from './pages/IncidentsPage'
import IncidentDetailPage from './pages/IncidentDetailPage'
import MaintenancePage from './pages/MaintenancePage'
import MaintenanceDetailPage from './pages/MaintenanceDetailPage'
import UsersPage from './pages/UsersPage'
import UserDetailPage from './pages/UserDetailPage'
import TicketsPage from './pages/TicketsPage'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketDetailPage from './pages/TicketDetailPage'
import AgentQueuePage from './pages/AgentQueuePage'
import AgentAssignedPage from './pages/AgentAssignedPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import DispatchDashboardPage from './pages/DispatchDashboardPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AuthGate>
          <Routes>
            <Route element={<AppShell />}>
              {/* Admin + Agent only */}
              <Route path="/" element={
                <ProtectedRoute allowed={['admin', 'agent']}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/incidents" element={
                <ProtectedRoute allowed={['admin', 'agent']}>
                  <IncidentsPage />
                </ProtectedRoute>
              } />
              <Route path="/incidents/:id" element={
                <ProtectedRoute allowed={['admin', 'agent']}>
                  <IncidentDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/maintenance" element={
                <ProtectedRoute allowed={['admin', 'agent']}>
                  <MaintenancePage />
                </ProtectedRoute>
              } />
              <Route path="/maintenance/:id" element={
                <ProtectedRoute allowed={['admin', 'agent']}>
                  <MaintenanceDetailPage />
                </ProtectedRoute>
              } />

              {/* Admin only */}
              <Route path="/users" element={
                <ProtectedRoute allowed={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/users/:id" element={
                <ProtectedRoute allowed={['admin']}>
                  <UserDetailPage />
                </ProtectedRoute>
              } />

              {/* Admin only */}
              <Route path="/admin/users" element={
                <ProtectedRoute allowed={['admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowed={['admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowed={['admin']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/dispatch" element={
                <ProtectedRoute allowed={['admin', 'agent']}>
                  <DispatchDashboardPage />
                </ProtectedRoute>
              } />

              {/* Agent only */}
              <Route path="/agent/queue" element={
                <ProtectedRoute allowed={['agent']}>
                  <AgentQueuePage />
                </ProtectedRoute>
              } />
              <Route path="/agent/assigned" element={
                <ProtectedRoute allowed={['agent']}>
                  <AgentAssignedPage />
                </ProtectedRoute>
              } />

              {/* All authenticated users */}
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/new" element={<CreateTicketPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
            </Route>
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
