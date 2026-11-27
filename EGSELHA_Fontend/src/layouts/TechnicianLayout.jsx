import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Bell,
  LogOut,
  Menu,
  X,
  Check,
  BriefcaseBusiness,
  UserRound,
  Wallet,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import EghselhaLogo from '../component/EghselhaLogo'
import Toast from '../component/Toast'
import { useTech } from '../context/TechnicianContext'
import { useAuth } from '../context/AuthContext'
import { technicianApi } from '../services/technicianApi'

const notifIconMap = {
  BriefcaseBusiness,
  UserRound,
  Wallet,
  Star,
  CheckCircle2,
  AlertCircle
}

export default function TechnicianLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile, offers, unreadCount, setUnreadCount, notify } = useTech()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifItems, setNotifItems] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const notifContainerRef = useRef(null)
  const navRefs = useRef({})
  const [navPill, setNavPill] = useState({ left: 0, width: 0, ready: false })

  // Close notification pop-up on outside click or Escape key
  useEffect(() => {
    if (!notifOpen) return
    const handleClickOutside = (e) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [notifOpen])

  const toggleNotifPopover = async () => {
    const next = !notifOpen
    setNotifOpen(next)
    if (next) {
      setLoadingNotifs(true)
      try {
        const data = await technicianApi.getNotifications()
        setNotifItems(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        setLoadingNotifs(false)
      }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await technicianApi.markAllNotificationsRead()
      setNotifItems((prev) => prev.map((n) => ({ ...n, isUnread: false })))
      setUnreadCount(0)
      notify('All notifications marked as read.')
    } catch (err) {
      console.error(err)
    }
  }

  const techName = user?.fullName || profile?.name || 'Technician'
  const initials = techName.split(' ').filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase()

  const navItems = [
    { label: 'Dashboard', to: '/technician', end: true },
    { label: 'My jobs', to: '/technician/jobs', badge: offers?.length > 0 ? offers.length : null },
    { label: 'Earnings', to: '/technician/earnings' },
    { label: 'Profile', to: '/technician/profile' }
  ]

  const activeNavKey =
    navItems.find((item) =>
      item.end
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(`${item.to}/`)
    )?.to || '/technician'

  useEffect(() => {
    const syncPill = () => {
      const el = navRefs.current[activeNavKey]
      if (el) {
        setNavPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
      }
    }
    syncPill()
    window.addEventListener('resize', syncPill)
    return () => window.removeEventListener('resize', syncPill)
  }, [activeNavKey, offers?.length])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--alabaster)',
        color: 'var(--ink-primary)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* FLOATING OBSIDIAN TOP NAVIGATION WITH GLIDING PILL */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(14, 14, 16, 0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid var(--hairline-dark)',
          color: 'var(--ivory)'
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '0 32px',
            height: '62px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          {/* Left: Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="portal-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{ color: 'var(--ivory)' }}
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
            <Link to="/technician" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <EghselhaLogo size={30} showText={true} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--bronze-dark)',
                  background: 'rgba(198, 146, 73, 0.14)',
                  border: '1px solid rgba(198, 146, 73, 0.28)',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}
              >
                Tech
              </span>
            </Link>
          </div>

          {/* Center: Horizontal Nav with Smooth Gliding Pill */}
          <nav
            className="landing-nav"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              borderRadius: '999px'
            }}
          >
            {navPill.ready && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '4px',
                  bottom: '4px',
                  left: 0,
                  width: `${navPill.width}px`,
                  transform: `translateX(${navPill.left}px)`,
                  borderRadius: '999px',
                  background: 'rgba(245, 243, 238, 0.12)',
                  border: '1px solid rgba(198, 146, 73, 0.42)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 4px 16px rgba(0, 0, 0, 0.28)',
                  transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), width 360ms cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />
            )}

            {navItems.map((item) => {
              const isActive = activeNavKey === item.to
              return (
                <NavLink
                  key={item.to}
                  ref={(el) => { navRefs.current[item.to] = el }}
                  to={item.to}
                  end={item.end}
                  className={`lx-topbar-link ${isActive ? 'is-active' : ''}`}
                  style={{ gap: '7px' }}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className="mono-num"
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        background: 'var(--bronze-dark)',
                        color: '#0e0e10',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        lineHeight: 1.3
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Right: Notifications Pop-up, Avatar, Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div ref={notifContainerRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={toggleNotifPopover}
                aria-label="Notifications"
                title="Notifications"
                style={{
                  position: 'relative',
                  width: '36px',
                  height: '36px',
                  borderRadius: '999px',
                  background: notifOpen ? 'rgba(198, 146, 73, 0.18)' : 'rgba(245, 243, 238, 0.08)',
                  border: notifOpen ? '1px solid rgba(198, 146, 73, 0.5)' : '1px solid rgba(245, 243, 238, 0.14)',
                  color: notifOpen ? 'var(--bronze-dark)' : 'var(--ivory)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 200ms var(--ease-luxury)'
                }}
              >
                <Bell size={16} strokeWidth={1.7} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '7px',
                      right: '8px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '999px',
                      background: 'var(--bronze-dark)',
                      border: '1.5px solid #0e0e10'
                    }}
                  />
                )}
              </button>

              {/* Smooth Animated Notification Pop-Up */}
              {notifOpen && (
                <div
                  className="lx-popover"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '370px',
                    maxWidth: 'calc(100vw - 32px)',
                    background: 'var(--alabaster)',
                    color: 'var(--ink-primary)',
                    borderRadius: '18px',
                    border: '1px solid rgba(24, 24, 27, 0.14)',
                    boxShadow: '0 22px 54px rgba(14, 14, 16, 0.28)',
                    overflow: 'hidden',
                    zIndex: 80
                  }}
                >
                  <div
                    style={{
                      padding: '15px 18px 12px',
                      borderBottom: '1px solid var(--hairline-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--ink-primary)', lineHeight: 1.05 }}>
                        Notifications
                      </h4>
                    </div>
                    {notifItems.some((n) => n.isUnread) && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--bronze)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0
                        }}
                      >
                        <Check size={13} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
                    {loadingNotifs ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-muted)' }}>
                        Loading updates…
                      </div>
                    ) : notifItems.length === 0 ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-muted)' }}>
                        You're all caught up.
                      </div>
                    ) : (
                      notifItems.slice(0, 8).map((n) => {
                        const Icon = notifIconMap[n.iconType] ?? BriefcaseBusiness
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotifOpen(false)
                              navigate('/technician/jobs')
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '11px',
                              padding: '11px 12px',
                              borderRadius: '12px',
                              background: n.isUnread ? '#ffffff' : 'transparent',
                              border: n.isUnread ? '1px solid var(--hairline-light)' : '1px solid transparent',
                              marginBottom: '4px',
                              cursor: 'pointer',
                              transition: 'background-color 160ms var(--ease-luxury)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = n.isUnread ? '#ffffff' : 'transparent' }}
                          >
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '10px',
                                background: n.isUnread ? 'var(--bronze-soft)' : 'var(--alabaster-raised)',
                                color: n.isUnread ? 'var(--bronze)' : 'var(--ink-secondary)',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Icon size={16} strokeWidth={1.7} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <b style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                                {n.title}
                              </b>
                              <p style={{ margin: '2px 0 4px', fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.45 }}>
                                {n.desc}
                              </p>
                              <small style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{n.time}</small>
                            </div>
                            {n.isUnread && (
                              <span
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '999px',
                                  background: 'var(--bronze)',
                                  marginTop: '6px',
                                  flexShrink: 0
                                }}
                              />
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      borderTop: '1px solid var(--hairline-light)',
                      background: 'var(--alabaster-raised)',
                      textAlign: 'center'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false)
                        navigate('/technician/notifications')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ink-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/technician/profile')}
              title={techName}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(245, 243, 238, 0.08)',
                border: '1px solid rgba(245, 243, 238, 0.14)',
                color: 'var(--ivory)',
                padding: '4px 12px 4px 5px',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '999px',
                  background: 'var(--ivory)',
                  color: '#0e0e10',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                {initials}
              </span>
              <span style={{ fontSize: '12.5px', fontWeight: 500 }}>{techName.split(' ')[0]}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                background: 'transparent',
                border: '1px solid rgba(245, 243, 238, 0.14)',
                color: 'rgba(245, 243, 238, 0.72)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(10, 10, 12, 0.72)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '270px',
              height: '100%',
              background: 'var(--obsidian)',
              color: 'var(--ivory)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <EghselhaLogo size={28} showText={true} />
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ivory-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--ivory)' : 'var(--ivory-secondary)',
                    background: isActive ? 'rgba(245, 243, 238, 0.08)' : 'transparent',
                    textDecoration: 'none'
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginTop: 'auto',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.24)',
                color: '#fca5a5',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* CENTERED WARM ALABASTER WORKSPACE */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '24px 28px 56px',
          boxSizing: 'border-box'
        }}
      >
        <Outlet />
      </main>

      <Toast />
    </div>
  )
}
