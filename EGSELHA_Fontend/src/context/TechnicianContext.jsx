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
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [dark, setDark] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')

  const notify = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2600)
  }

  // تحميل الحجوزات والملف الشخصي عند فتح التطبيق
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        const [jobsData, profileData] = await Promise.all([
          technicianApi.getJobs(),
          technicianApi.getProfile()
        ])
        setJobs(jobsData)
        setProfile(profileData)
      } catch (err) {
        console.error('Failed to connect to API:', err)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // دالة تحديث الحالة وربطها بالـ API
  const updateStatus = async (id, status) => {
    try {
      await technicianApi.updateJobStatus(id, status)
      // تحديث الحالة محلياً في الواجهة
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)))
      notify(`Booking ${id} marked as ${status}.`)
    } catch (err) {
      notify('Failed to update status.')
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