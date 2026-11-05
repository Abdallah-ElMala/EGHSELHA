import { NavLink } from 'react-router-dom'
import { CarFront, X, HelpCircle, ChevronRight, LogOut, LayoutDashboard, BriefcaseBusiness, UserRound, Wallet, Settings } from 'lucide-react'
import { useTech } from '../context/TechnicianContext'

const navItems = [
  { label: 'Dashboard', to: '/technician', icon: LayoutDashboard, end: true },
  { label: 'My Jobs', to: '/technician/jobs', icon: BriefcaseBusiness, badge: 3 },
  { label: 'Profile', to: '/technician/profile', icon: UserRound },
  { label: 'Earnings', to: '/technician/earnings', icon: Wallet },
  { label: 'Settings', to: '/technician/settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const { notify } = useTech()

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-icon"><CarFront size={25} /></div>
        <div><b>EGHSELHA</b><small>Car Wash at Your Doorstep</small></div>
        <button className="close-mobile" onClick={onClose}><X /></button>
      </div>

      <div className="side-label">WORKSPACE</div>
      <nav>
        {navItems.map(({ label, to, icon: Icon, end, badge }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {badge && <em>{badge}</em>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon"><HelpCircle size={18} /></div>
          <b>Need help?</b>
          <p>Contact our support team anytime.</p>
          <button onClick={() => notify('Support: support@eghselha.com')}>
            Get support <ChevronRight size={14} />
          </button>
        </div>
        <button className="nav-item logout" onClick={() => notify('You have been logged out (demo).')}>
          <LogOut size={18} /><span>Log out</span>
        </button>
        <div className="side-version">EGHSELHA TECH PORTAL <span>v1.0.0</span></div>
      </div>
    </aside>
  )
}
