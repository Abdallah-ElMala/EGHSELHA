import { NavLink, useNavigate } from 'react-router-dom'
import { X, LogOut, LayoutDashboard, BriefcaseBusiness, UserRound, Wallet } from 'lucide-react'
import { useTech } from '../context/TechnicianContext'
import { useAuth } from '../context/AuthContext'
import BrandLogo from './BrandLogo'

const navItems = [
  { label: 'Dashboard', to: '/technician', icon: LayoutDashboard, end: true },
  { label: 'My jobs', to: '/technician/jobs', icon: BriefcaseBusiness },
  { label: 'Profile', to: '/technician/profile', icon: UserRound },
  { label: 'Earnings', to: '/technician/earnings', icon: Wallet },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { offers } = useTech()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <BrandLogo size={36} />
        <div>
          <b>EGHSELHA</b>
          <small>Technician workspace</small>
        </div>
        <button className="close-mobile" onClick={onClose} aria-label="Close menu">
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      <div className="side-label">Workspace</div>
      <nav>
        {navItems.map(({ label, to, icon: Icon, end, badge }) => {
          const dynamicBadge = label === 'My jobs' && offers?.length > 0 ? offers.length : badge
          return (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.6} />
              <span>{label}</span>
              {dynamicBadge && <em>{dynamicBadge}</em>}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={1.6} />
          <span>Sign out</span>
        </button>
        <div className="side-version">
          EGHSELHA Tech <span>v1.0</span>
        </div>
      </div>
    </aside>
  )
}
