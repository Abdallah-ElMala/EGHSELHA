import { NavLink, useNavigate } from 'react-router-dom'
import { X, HelpCircle, ChevronRight, LogOut, LayoutDashboard, BriefcaseBusiness, UserRound, Wallet, Settings, ArrowRightLeft } from 'lucide-react'
import { useTech } from '../context/TechnicianContext'
import BrandLogo from './BrandLogo'

const navItems = [
  { label: 'Dashboard', to: '/technician', icon: LayoutDashboard, end: true },
  { label: 'My Jobs', to: '/technician/jobs', icon: BriefcaseBusiness },
  { label: 'Profile', to: '/technician/profile', icon: UserRound },
  { label: 'Earnings', to: '/technician/earnings', icon: Wallet },
  { label: 'Settings', to: '/technician/settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { notify, offers } = useTech()

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <BrandLogo size={40} variant="blue" />
        <div><b>EGHSELHA</b><small>Car Wash at Your Doorstep</small></div>
        <button className="close-mobile" onClick={onClose}><X /></button>
      </div>

      <div className="side-label">WORKSPACE</div>
      <nav>
        {navItems.map(({ label, to, icon: Icon, end, badge }) => {
          const dynamicBadge = label === 'My Jobs' && offers?.length > 0 ? offers.length : badge
          return (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {dynamicBadge && <em>{dynamicBadge}</em>}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          onClick={() => {
            onClose?.()
            navigate('/customer')
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            marginBottom: '8px',
            borderRadius: '10px',
            background: 'rgba(8, 124, 240, 0.15)',
            border: '1px solid rgba(8, 124, 240, 0.3)',
            color: '#60b4ff',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowRightLeft size={14} />
          <span>Switch to Customer Portal</span>
        </button>

        <button
          onClick={() => {
            onClose?.()
            navigate('/admin')
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            marginBottom: '12px',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.16)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            color: '#c4b5fd',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowRightLeft size={14} />
          <span>Admin Control Portal</span>
        </button>

        <div className="help-card">
          <div className="help-icon"><HelpCircle size={18} /></div>
          <b>Need help?</b>
          <p>Contact our support team anytime.</p>
          <button onClick={() => notify('Support: support@eghselha.com')}>
            Get support <ChevronRight size={14} />
          </button>
        </div>
        <button className="nav-item logout" onClick={() => notify('Demo mode active.')}>
          <LogOut size={18} /><span>Log out</span>
        </button>
        <div className="side-version">EGHSELHA TECH PORTAL <span>v1.0.0</span></div>
      </div>
    </aside>
  )
}
