import { useEffect, useState } from 'react'
import { Check, BriefcaseBusiness, UserRound, Wallet, Star } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useTech } from '../../context/TechnicianContext'
import { technicianApi } from '../../services/technicianApi'

// Map iconType string from API to actual lucide-react icon component
const iconMap = {
  BriefcaseBusiness,
  UserRound,
  Wallet,
  Star,
}

export default function Notifications() {
  const { notify } = useTech()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await technicianApi.getNotifications()
        setItems(data)
      } catch (error) {
        console.error('Notifications API Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await technicianApi.markAllNotificationsRead()
      setItems((prev) => prev.map((n) => ({ ...n, isUnread: false })))
      notify('All notifications marked as read.')
    } catch (error) {
      console.error('Mark all read error:', error)
      notify('Failed to mark notifications as read.')
    }
  }

  if (loading) {
    return <div className="empty-state"><p>Loading notifications…</p></div>
  }

  return (
    <>
      <PageTitle
        eyebrow="UPDATES"
        title="Notifications"
        desc="Stay up to date with your bookings and account activity."
        action={
          <button className="btn outline" onClick={handleMarkAllRead}>
            <Check size={16} /> Mark all as read
          </button>
        }
      />
      <div className="panel notification-list">
        {items.map((n) => {
          const Icon = iconMap[n.iconType] ?? BriefcaseBusiness
          return (
            <div className="notification-item" key={n.id}>
              <div className="notification-icon"><Icon size={19} /></div>
              <div><b>{n.title}</b><p>{n.desc}</p><small>{n.time}</small></div>
              {n.isUnread && <i className="unread-dot" />}
            </div>
          )
        })}
      </div>
    </>
  )
}
