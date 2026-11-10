import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, ChevronRight, Bell, Sun, Moon } from 'lucide-react'
import { useTech } from '../context/TechnicianContext'

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

  const title = titles[pathname] ?? (pathname.startsWith('/technician/jobs/') ? 'Job Details' : 'Dashboard')
  const techName = profile?.name || 'Mostafa Ali'
  const initials = techName.split(' ').map((x) => x[0]).join('').slice(0, 2)

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenu}><Menu /></button>
      <div className="breadcrumb">Workspace <ChevronRight size={14} /> <b>{title}</b></div>
      <div className="top-actions">
        <button
          className="btn outline"
          style={{ fontSize: '11px', padding: '6px 12px', borderColor: '#087cf0', color: '#087cf0' }}
          onClick={() => navigate('/customer')}
        >
          Switch to Customer Portal
        </button>
        <button
          className="btn outline"
          style={{ fontSize: '11px', padding: '6px 12px', borderColor: '#7c3aed', color: '#7c3aed' }}
          onClick={() => navigate('/admin')}
        >
          Admin Portal
        </button>
        <button className="icon-btn" onClick={() => navigate('/technician/notifications')} aria-label="Notifications">
          <Bell size={19} />{unreadCount > 0 && <i />}
        </button>
        <button className="avatar" onClick={() => navigate('/technician/profile')}>{initials}</button>
        <div className="user-mini"><b>{techName}</b><small>Technician</small></div>
        <button className="more-btn" onClick={() => setDark(!dark)} title="Toggle theme">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  )
}
