import { createContext, useContext, useState, useEffect } from 'react'
import { customerApi } from '../services/customerApi'

const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState(null)

  const notify = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const refreshData = async () => {
    try {
      const [profData, vehData, bookData] = await Promise.all([
        customerApi.getProfile().catch(() => null),
        customerApi.getVehicles().catch(() => []),
        customerApi.getBookings().catch(() => [])
      ])

      if (profData) setProfile(profData)

      const safeVehicles = Array.isArray(vehData)
        ? vehData
        : Array.isArray(vehData?.value)
        ? vehData.value
        : []
      setVehicles(safeVehicles)

      const safeBookings = Array.isArray(bookData)
        ? bookData
        : Array.isArray(bookData?.value)
        ? bookData.value
        : []
      setBookings(safeBookings)
    } catch (e) {
      console.error('Customer data fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) {
        refreshData()
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <CustomerContext.Provider value={{
      profile,
      vehicles,
      bookings,
      loading,
      notify,
      refreshData,
      toastMessage
    }}>
      {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => useContext(CustomerContext)
