import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, ChevronRight, Bell, Sun, Moon } from 'lucide-react'
import { useTech } from '../context/TechnicianContext'
import { useAuth } from '../context/AuthContext'

const titles = {
  '/technician': 'Dashboard',
  '/technician/jobs': 'My jobs',
  '/technician/profile': 'Profile',
  '/technician/earnings': 'Earnings',
  '/technician/settings': 'Settings',
  '/technician/notifications': 'Notifications',
}

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { dark, setDark, profile, unreadCount } = useTech()
  const { user, role } = useAuth()

  const title = titles[pathname] ?? (pathname.startsWith('/technician/jobs/') ? 'Job details' : 'Dashboard')
  const techName = user?.fullName || profile?.name || 'Technician'
  const initials = techName.split(' ').filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenu} aria-label="Open menu">
        <Menu size={18} strokeWidth={1.6} />
      </button>
      <div className="breadcrumb">
        Workspace <ChevronRight size={14} strokeWidth={1.6} /> <b>{title}</b>
      </div>
      <div className="top-actions">
        <button className="icon-btn" onClick={() => navigate('/technician/notifications')} aria-label="Notifications">
          <Bell size={18} strokeWidth={1.6} />
          {unreadCount > 0 && <i />}
        </button>
        <button className="avatar" onClick={() => navigate('/technician/profile')}>{initials}</button>
        <div className="user-mini">
          <b>{techName}</b>
          <small>{role || 'Technician'}</small>
        </div>
        <button className="more-btn" onClick={() => setDark(!dark)} title="Toggle theme" aria-label="Toggle theme">
          {dark ? <Sun size={16} strokeWidth={1.6} /> : <Moon size={16} strokeWidth={1.6} />}
        </button>
      </div>
    </header>
  )
}
