import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, ChevronRight, Bell, Sun, Moon, LogOut } from 'lucide-react'
import { useTech } from '../context/TechnicianContext'
import { useAuth } from '../context/AuthContext'

const titles = {
  '/technician': 'Dashboard',
  '/technician/jobs': 'My Jobs',
  '/technician/profile': 'Profile',
  '/technician/earnings': 'Earnings',
  '/technician/settings': 'Settings',
  '/technician/notifications': 'Notifications',
}

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { dark, setDark, profile, unreadCount } = useTech()
  const { user, role, logout, hasRole } = useAuth()

  const title = titles[pathname] ?? (pathname.startsWith('/technician/jobs/') ? 'Job Details' : 'Dashboard')
  const techName = user?.fullName || profile?.name || 'Mostafa Ali'
  const initials = techName.split(' ').map((x) => x[0]).join('').slice(0, 2)

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenu}><Menu /></button>
      <div className="breadcrumb">Workspace <ChevronRight size={14} /> <b>{title}</b></div>
      <div className="top-actions">
        <button className="icon-btn" onClick={() => navigate('/technician/notifications')} aria-label="Notifications">
          <Bell size={19} />{unreadCount > 0 && <i />}
        </button>
        <button className="avatar" onClick={() => navigate('/technician/profile')}>{initials}</button>
        <div className="user-mini">
          <b>{techName}</b>
          <small>{role || 'Technician'}</small>
        </div>
        <button
          className="btn outline"
          style={{ fontSize: '11px', padding: '6px 10px', borderColor: '#ef4444', color: '#ef4444' }}
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
          title="تسجيل الخروج"
        >
          <LogOut size={13} style={{ marginRight: '4px' }} />
          خروج
        </button>
        <button className="more-btn" onClick={() => setDark(!dark)} title="Toggle theme">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  )
}
