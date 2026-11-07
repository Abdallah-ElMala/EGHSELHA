import { Routes, Route, Navigate } from 'react-router-dom'
import { TechnicianProvider } from '../context/TechnicianContext'
import { CustomerProvider } from '../context/CustomerContext'

// Technician Layout & Pages
import TechnicianLayout from '../layouts/TechnicianLayout'
import Dashboard from '../pages/technician/Dashboard'
import Jobs from '../pages/technician/Jobs'
import JobDetails from '../pages/technician/JobDetails'
import Profile from '../pages/technician/Profile'
import Earnings from '../pages/technician/Earnings'
import SettingsPage from '../pages/technician/SettingsPage'
import Notifications from '../pages/technician/Notifications'

// Customer Layout & Pages
import CustomerLayout from '../layouts/CustomerLayout'
import CustomerHome from '../pages/customer/CustomerHome'
import CustomerDashboard from '../pages/customer/CustomerDashboard'
import CustomerProfile from '../pages/customer/CustomerProfile'
import CustomerVehicles from '../pages/customer/CustomerVehicles'
import CustomerBookWash from '../pages/customer/CustomerBookWash'
import CustomerBookings from '../pages/customer/CustomerBookings'
import CustomerReviews from '../pages/customer/CustomerReviews'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default landing page opens Customer Portal */}
      <Route path="/" element={<Navigate to="/customer" replace />} />

      {/* Customer Portal */}
      <Route
        path="/customer"
        element={
          <CustomerProvider>
            <CustomerLayout />
          </CustomerProvider>
        }
      >
        <Route index element={<CustomerHome />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="vehicles" element={<CustomerProfile />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="book" element={<CustomerBookWash />} />
        <Route path="bookings" element={<CustomerBookings />} />
      </Route>

      {/* Technician Portal */}
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

      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  )
}
