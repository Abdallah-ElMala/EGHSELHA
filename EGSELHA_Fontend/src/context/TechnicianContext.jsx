import { createContext, useContext, useState, useEffect } from 'react'
import { technicianApi } from '../services/technicianApi.js' // استيراد الملف السابق

const TechnicianContext = createContext(null)
export const useTech = () => useContext(TechnicianContext)

const initialProfile = {
  name: 'Mostafa Ali',
  email: 'mostafa.ali@email.com',
  phone: '+20 100 123 4567',
  area: 'Nasr City, Cairo',
  bio: 'Professional car care technician with 3+ years of experience.',
  rating: 4.9,
  reviewCount: 128,
  jobsDone: 246,
  isVerified: true
}

export function TechnicianProvider({ children }) {
  const [jobs, setJobs] = useState([])
  const [offers, setOffers] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [dark, setDark] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')

  const notify = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2600)
  }

  const refreshData = async () => {
    try {
      const [jobsData, profileData, offersData, notifData] = await Promise.all([
        technicianApi.getJobs().catch(() => []),
        technicianApi.getProfile().catch(() => null),
        technicianApi.getJobOffers().catch(() => []),
        technicianApi.getNotifications().catch(() => [])
      ])
      if (Array.isArray(jobsData)) setJobs(jobsData)
      if (profileData) setProfile(profileData)
      if (Array.isArray(offersData)) setOffers(offersData)
      if (Array.isArray(notifData)) {
        setUnreadCount(notifData.filter((n) => n.isUnread).length)
      }
    } catch (err) {
      console.error('Failed to connect to API:', err)
    }
  }

  // تحميل الحجوزات والملف الشخصي عند فتح التطبيق + مزامنة تلقائية
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)
      await refreshData()
      setLoading(false)
    }

    loadInitialData()
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) {
        refreshData()
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // قبول أو رفض عرض عمل وربطه بالـ API وتحديث قائمة الوظائف
  const acceptOffer = async (offerId) => {
    const res = await technicianApi.respondToJobOffer(offerId, true)
    await refreshData()
    return res
  }

  const passOffer = async (offerId) => {
    const res = await technicianApi.respondToJobOffer(offerId, false)
    setOffers((prev) => prev.filter((o) => o.id !== offerId))
    return res
  }

  // دالة تحديث الحالة وربطها بالـ API
  const updateStatus = async (id, status) => {
    try {
      await technicianApi.updateJobStatus(id, status)
      const statusToEnum = {
        'Upcoming': 'DISPATCHED',
        'On The Way': 'ON_THE_WAY',
        'Arrived': 'ARRIVED',
        'In Progress': 'WASHING',
        'Completed': 'COMPLETED'
      }
      // تحديث الحالة محلياً في الواجهة
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? { ...j, status, bookingStatus: statusToEnum[status] || j.bookingStatus, isAccepted: true }
            : j
        )
      )
      notify(`Booking ${id} marked as ${status}.`)
      return true
    } catch (err) {
      notify(err?.message || 'Failed to update status.')
      return false
    }
  }

  // دالة تحديث الملف الشخصي وربطها بالـ API
  const updateProfile = async (newProfileData) => {
    try {
      await technicianApi.updateProfile(newProfileData)
      setProfile(newProfileData)
      notify('Profile changes saved successfully.')
      return true
    } catch (err) {
      console.error('Profile update error:', err)
      notify('Failed to save profile changes.')
      return false
    }
  }

  return (
    <TechnicianContext.Provider
      value={{
        jobs,
        setJobs,
        offers,
        setOffers,
        unreadCount,
        setUnreadCount,
        acceptOffer,
        passOffer,
        refreshData,
        updateStatus,
        updateProfile,
        notice,
        notify,
        dark,
        setDark,
        profile,
        setProfile,
        photoPreview,
        setPhotoPreview,
        loading
      }}
    >
      {children}
    </TechnicianContext.Provider>
  )
}