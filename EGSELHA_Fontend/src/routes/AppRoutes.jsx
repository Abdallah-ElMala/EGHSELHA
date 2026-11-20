import { Routes, Route, Navigate } from 'react-router-dom'
import { TechnicianProvider } from '../context/TechnicianContext'
import { CustomerProvider } from '../context/CustomerContext'
import { AdminProvider } from '../context/AdminContext'
import ProtectedRoute from './ProtectedRoute'

// Public Landing & Auth Pages
import LandingHome from '../pages/LandingHome'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

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

// Admin Layout & Pages
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminBookings from '../pages/admin/AdminBookings'
import AdminTechnicians from '../pages/admin/AdminTechnicians'
import AdminCustomers from '../pages/admin/AdminCustomers'
import AdminCatalogZones from '../pages/admin/AdminCatalogZones'
import AdminDisputes from '../pages/admin/AdminDisputes'
import AdminPayouts from '../pages/admin/AdminPayouts'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Portal (Protected: Customer or Admin) */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
            <CustomerProvider>
              <CustomerLayout />
            </CustomerProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerHome />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="vehicles" element={<CustomerVehicles />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="book" element={<CustomerBookWash />} />
        <Route path="bookings" element={<CustomerBookings />} />
      </Route>

      {/* Technician Portal (Protected: Technician or Admin) */}
      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={['Technician', 'Admin']}>
            <TechnicianProvider>
              <TechnicianLayout />
            </TechnicianProvider>
          </ProtectedRoute>
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

      {/* Admin Portal (Protected: Admin Only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="technicians" element={<AdminTechnicians />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="catalog" element={<AdminCatalogZones />} />
        <Route path="disputes" element={<AdminDisputes />} />
        <Route path="payouts" element={<AdminPayouts />} />
      </Route>

      {/* Public Landing Page */}
      <Route path="/" element={<LandingHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
