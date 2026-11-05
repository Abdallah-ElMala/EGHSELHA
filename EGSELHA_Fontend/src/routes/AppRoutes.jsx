import { Routes, Route, Navigate } from 'react-router-dom'
import { TechnicianProvider } from '../context/TechnicianContext'
import TechnicianLayout from '../layouts/TechnicianLayout'
import Dashboard from '../pages/technician/Dashboard'
import Jobs from '../pages/technician/Jobs'
import JobDetails from '../pages/technician/JobDetails'
import Profile from '../pages/technician/Profile'
import Earnings from '../pages/technician/Earnings'
import SettingsPage from '../pages/technician/SettingsPage'
import Notifications from '../pages/technician/Notifications'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/technician" replace />} />

      {/* لما تضيفي Login: لفي الـ Route ده بـ ProtectedRoute allowedRole="Technician" */}
      <Route
        path="/technician"
        element={
          <TechnicianProvider>
            <TechnicianLayout />
          </TechnicianProvider>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/technician" replace />} />
    </Routes>
  )
}
